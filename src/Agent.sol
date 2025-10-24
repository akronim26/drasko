// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {ReentrancyGuard} from "../lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";
import {ECDSA} from "../lib/openzeppelin-contracts/contracts/utils/cryptography/ECDSA.sol";
import {IERC20} from "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import {Platform} from "./Platform.sol";
import {IMockAMM} from "./interfaces/IMockAMM.sol";

/// @title Agent
/// @notice Represents an individual trading agent that can execute trades based on authorized signatures
contract Agent is ReentrancyGuard {
    using ECDSA for bytes32;

    error Agent__NotOwner();
    error Agent__AgentIsPaused();
    error Agent__AgentIsRunning();
    error Agent__WithdrawalFailed();
    error Agent__DeadlinePassed();
    error Agent__NonceAlreadyUsed();
    error Agent__IncorrectSignature();
    error Agent__IncorrectSignatureLength();
    error Agent__InvalidTokens();
    error Agent__NotAuthorized();
    error Agent__AmountIsZero();
    error Agent__TokenTransferFailed();

    /// @notice Structure to hold trade data for execution
    /// @param tokenOut Address of the output token
    /// @param amountIn Amount of ETH to trade
    /// @param minAmountOut Minimum amount of output token expected
    /// @param deadline Timestamp after which the trade becomes invalid
    /// @param nonce Unique identifier to prevent replay attacks
    struct TradeData {
        address tokenOut;
        uint256 amountIn;
        uint256 minAmountOut;
        uint256 deadline;
        uint256 nonce;
    }

    mapping(uint256 nonce => bool) noncesUsed;
    mapping(address token => bool) public tokensPresent;

    IMockAMM private immutable i_mockAMM;
    Platform private platformType;
    address private owner; // address of the user
    bool private isPaused;
    uint256 userFunds;
    address private immutable authorizedSigner; // address of the psuedo wallet created for the backend which will execute the swap function
    string private constant name = "Agent";
    string private constant version = "1";
    uint256 immutable chainId;
    address private immutable verifyingContract;
    address[] private supportedTokens;
    bytes32 private constant EIP712_DOMAIN_TYPEHASH =
        keccak256(
            "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
        );
    bytes32 private immutable DOMAIN_SEPARATOR;
    bytes32 private constant TYPE_HASH =
        keccak256(
            "TradeData(address tokenOut,uint256 amountIn,uint256 minAmountOut,uint256 deadline,uint256 nonce)"
        );

    event Agent__AgentPaused();
    event Agent__AgentResumed();
    /// @param user The address of the user withdrawing funds
    /// @param amountWithdrawn The amount withdrawn
    event Agent__FundsWithdrawan(address indexed user, uint256 amountWithdrawn);
    /// @param user The address of the user adding funds
    /// @param amountAdded The amount added
    event Agent__FundsAdded(address indexed user, uint256 amountAdded);
    /// @param user The address executing the trade
    /// @param tokenOut The output token address
    /// @param amountIn The input amount
    event Agent__TradeExecuted(
        address indexed user,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut
    );
    /// @param token The token address being transferred
    /// @param amount The amount transferred to owner
    event Agent__TokensTransferredToOwner(
        address indexed token,
        uint256 amount
    );

    /// @notice Restricts function to only the owner
    modifier onlyOwner() {
        if (msg.sender != owner) {
            revert Agent__NotOwner();
        }
        _;
    }

    /// @notice Restricts function to only when agent is paused
    modifier paused() {
        if (!isPaused) {
            revert Agent__AgentIsRunning();
        }
        _;
    }

    /// @notice Restricts function to only the authorized signer
    modifier onlyAuthorized() {
        if (msg.sender != authorizedSigner) {
            revert Agent__NotAuthorized();
        }
        _;
    }

    /// @notice Initializes the agent contract
    /// @param _tokens Array of supported token addresses
    /// @param _platformType The platform type (Twitter, Telegram, Discord)
    /// @param _authorizedSigner The address authorized to execute trades
    /// @param _owner The owner of the agent
    /// @param _mockAMM The address of the MockAMM contract
    constructor(
        address[] memory _tokens,
        Platform _platformType,
        address _authorizedSigner,
        address _owner,
        address _mockAMM
    ) payable {
        for (uint256 i = 0; i < _tokens.length; i++) {
            tokensPresent[_tokens[i]] = true;
        }
        platformType = _platformType;
        owner = _owner;
        authorizedSigner = _authorizedSigner;
        i_mockAMM = IMockAMM(_mockAMM);
        userFunds = msg.value;
        chainId = block.chainid;
        verifyingContract = address(this);
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                EIP712_DOMAIN_TYPEHASH,
                keccak256(bytes(name)),
                keccak256(bytes(version)),
                chainId,
                verifyingContract
            )
        );
        supportedTokens = _tokens;
    }

    /// @notice Sets up pools and adds initial liquidity for all supported tokens
    /// @param _tokens Array of token addresses to create pools for
    /// @param _liquidityAmount Amount of ETH and tokens to add as liquidity
    function setupPoolsAndLiquidity(
        address[] memory _tokens,
        uint256 _liquidityAmount
    ) external onlyOwner {
        for (uint256 i = 0; i < _tokens.length; i++) {
            address token = _tokens[i];

            IERC20(token).approve(address(i_mockAMM), type(uint256).max);

            i_mockAMM.addLiquidity{value: _liquidityAmount}(
                token,
                _liquidityAmount
            );
        }
    }

    /// @notice Pauses the agent
    function pauseAgent() public onlyOwner {
        if (isPaused) {
            revert Agent__AgentIsPaused();
        }
        isPaused = true;
        emit Agent__AgentPaused();
    }

    /// @notice Resumes the agent
    function resumeAgent() public onlyOwner {
        if (!isPaused) {
            revert Agent__AgentIsRunning();
        }
        isPaused = false;
        emit Agent__AgentResumed();
    }

    /// @notice Withdraws all funds from the agent to the owner
    function withdrawFunds() external nonReentrant onlyOwner {
        pauseAgent();
        _withdrawFunds();
        resumeAgent();
    }

    /// @notice Allows user to add funds to the agent
    function addFunds() external payable nonReentrant onlyOwner {
        if (msg.value == 0) {
            revert Agent__AmountIsZero();
        }
        pauseAgent();
        _addFunds(msg.value);
        resumeAgent();
    }

    /// @notice Executes a trade if the signature and parameters are valid
    /// @param data The trade data
    /// @param signature The EIP-712 signature
    function executeSwap(
        TradeData memory data,
        bytes calldata signature
    ) external nonReentrant onlyAuthorized {
        if (block.timestamp > data.deadline) {
            revert Agent__DeadlinePassed();
        }
        if (noncesUsed[data.nonce] == true) {
            revert Agent__NonceAlreadyUsed();
        }

        if (signature.length != 65) {
            revert Agent__IncorrectSignatureLength();
        }

        if (tokensPresent[data.tokenOut] == false) {
            revert Agent__InvalidTokens();
        }

        bool valid = verifySignature(data, signature);
        if (!valid) {
            revert Agent__IncorrectSignature();
        }

        uint256 amountOut = i_mockAMM.swapETHForTokens{value: data.amountIn}(
            data.tokenOut,
            data.minAmountOut
        );

        _transferTokensToOwner(data.tokenOut, amountOut);

        noncesUsed[data.nonce] = true;

        emit Agent__TradeExecuted(
            msg.sender,
            data.tokenOut,
            data.amountIn,
            amountOut
        );
    }

    /// @notice Internal function to withdraw all user funds to the owner
    function _withdrawFunds() internal {
        uint256 balance = userFunds;
        (bool success, ) = payable(owner).call{value: balance}("");
        if (success != true) {
            revert Agent__WithdrawalFailed();
        }
        userFunds = 0;
        emit Agent__FundsWithdrawan(msg.sender, balance);
    }

    /// @notice Internal function to add funds to the user's balance
    /// @param amount The amount to add to userFunds
    function _addFunds(uint256 amount) internal {
        userFunds = userFunds + amount;
        emit Agent__FundsAdded(msg.sender, amount);
    }

    /// @notice Internal function to transfer tokens to the owner
    /// @param token The token address to transfer
    /// @param amount The amount to transfer
    function _transferTokensToOwner(address token, uint256 amount) internal {
        if (amount > 0) {
            IERC20 tokenContract = IERC20(token);
            bool success = tokenContract.transfer(owner, amount);
            if (!success) {
                revert Agent__TokenTransferFailed();
            }
            emit Agent__TokensTransferredToOwner(token, amount);
        }
    }

    /// @notice Hashes the TradeData struct according to EIP-712
    /// @param data The TradeData struct to hash
    /// @return The keccak256 hash of the encoded TradeData
    function hashTradeData(
        TradeData memory data
    ) internal pure returns (bytes32) {
        return
            keccak256(
                abi.encode(
                    TYPE_HASH,
                    data.tokenOut,
                    data.amountIn,
                    data.minAmountOut,
                    data.deadline,
                    data.nonce
                )
            );
    }

    /// @notice Verifies the EIP-712 signature for the given TradeData
    /// @param data The TradeData struct to verify
    /// @param signature The signature to verify
    /// @return True if the signature is valid and signed by the authorized signer, false otherwise
    function verifySignature(
        TradeData memory data,
        bytes calldata signature
    ) internal view returns (bool) {
        bytes32 digest = calculateDigest(data);
        address signer = digest.recover(signature);
        return signer == authorizedSigner;
    }

    /// @notice Calculates the EIP-712 digest for the given TradeData
    /// @param data The TradeData struct to hash
    /// @return The EIP-712 digest as bytes32
    function calculateDigest(
        TradeData memory data
    ) internal view returns (bytes32) {
        return
            keccak256(
                abi.encodePacked(
                    "\x19\x01",
                    DOMAIN_SEPARATOR,
                    hashTradeData(data)
                )
            );
    }

    /// @notice Returns the authorized signer address
    function getAuthorizedSigner() external view returns (address) {
        return authorizedSigner;
    }

    /// @notice Returns the owner address
    function getOwner() external view returns (address) {
        return owner;
    }

    /// @notice Returns the user funds
    function getUserFunds() external view returns (uint256) {
        return userFunds;
    }

    /// @notice Returns whether a nonce has been used
    function isNonceUsed(uint256 nonce) external view returns (bool) {
        return noncesUsed[nonce];
    }

    /// @notice Returns the paused state
    function getPausedState() external view returns (bool) {
        return isPaused;
    }

    /// @notice Returns the EIP-712 domain separator
    function getDomainSeparator() external view returns (bytes32) {
        return DOMAIN_SEPARATOR;
    }

    /// @notice Returns the MockAMM address
    function getMockAMM() external view returns (address) {
        return address(i_mockAMM);
    }

    /// @notice Returns the array of supported token addresses
    function getSupportedTokens() external view returns (address[] memory) {
        return supportedTokens;
    }

    /// @notice Allows the contract to receive ETH
    receive() external payable {}
}