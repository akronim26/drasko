// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

/*//////////////////////////////////////////////////////////////
                            IMPORTS
//////////////////////////////////////////////////////////////*/
import {IERC20} from "../../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "../../lib/openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "../../lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";
import {IMockAMM} from "./IMockAMM.sol";

/// @title Mock AMM
/// @notice A simple AMM implementation using constant product formula (x * y = k)
/// @dev This is a simplified version for testing purposes
contract MockAMM is IMockAMM, ReentrancyGuard {
    using SafeERC20 for IERC20;

    /*//////////////////////////////////////////////////////////////
                                 ERRORS
    //////////////////////////////////////////////////////////////*/
    error MockAMM__InsufficientLiquidity();
    error MockAMM__InsufficientOutputAmount();
    error MockAMM__InvalidToken();
    error MockAMM__InsufficientETH();
    error MockAMM__TransferFailed();

    /*//////////////////////////////////////////////////////////////
                                CONSTANTS
    //////////////////////////////////////////////////////////////*/
    uint256 private constant FEE_DENOMINATOR = 1000;
    uint256 private constant FEE_NUMERATOR = 3;

    /*//////////////////////////////////////////////////////////////
                                MAPPING
    //////////////////////////////////////////////////////////////*/
    mapping(address => Pool) public pools;
    mapping(address => mapping(address => uint256)) public userLPTokens;

    /*//////////////////////////////////////////////////////////////
                               FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /*//////////////////////////////////////////////////////////////
                           EXTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/
    /// @notice Swaps ETH for tokens
    /// @param tokenOut The address of the token to receive
    /// @param minAmountOut Minimum amount of tokens to receive
    /// @return amountOut The amount of tokens received
    function swapETHForTokens(
        address tokenOut,
        uint256 minAmountOut
    ) external payable nonReentrant returns (uint256 amountOut) {
        if (msg.value == 0) revert MockAMM__InsufficientETH();
        if (tokenOut == address(0)) revert MockAMM__InvalidToken();

        Pool storage pool = pools[tokenOut];
        if (pool.ethReserve == 0 || pool.tokenReserve == 0) {
            revert MockAMM__InsufficientLiquidity();
        }

        uint256 amountInWithFee = msg.value * (FEE_DENOMINATOR - FEE_NUMERATOR);
        uint256 numerator = amountInWithFee * pool.tokenReserve;
        uint256 denominator = (pool.ethReserve * FEE_DENOMINATOR) +
            amountInWithFee;
        amountOut = numerator / denominator;

        if (amountOut < minAmountOut)
            revert MockAMM__InsufficientOutputAmount();
        if (amountOut >= pool.tokenReserve)
            revert MockAMM__InsufficientLiquidity();

        pool.ethReserve += msg.value;
        pool.tokenReserve -= amountOut;

        IERC20(tokenOut).safeTransfer(msg.sender, amountOut);

        emit MockAMM__Swap(
            msg.sender,
            address(0),
            tokenOut,
            msg.value,
            amountOut
        );
    }

    /// @notice Swaps tokens for ETH
    /// @param tokenIn The address of the token to swap
    /// @param amountIn The amount of tokens to swap
    /// @param minAmountOut Minimum amount of ETH to receive
    /// @return amountOut The amount of ETH received
    function swapTokensForETH(
        address tokenIn,
        uint256 amountIn,
        uint256 minAmountOut
    ) external nonReentrant returns (uint256 amountOut) {
        if (amountIn == 0) revert MockAMM__InsufficientETH();
        if (tokenIn == address(0)) revert MockAMM__InvalidToken();

        Pool storage pool = pools[tokenIn];
        if (pool.ethReserve == 0 || pool.tokenReserve == 0) {
            revert MockAMM__InsufficientLiquidity();
        }

        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);

        uint256 amountInWithFee = amountIn * (FEE_DENOMINATOR - FEE_NUMERATOR);
        uint256 numerator = amountInWithFee * pool.ethReserve;
        uint256 denominator = (pool.tokenReserve * FEE_DENOMINATOR) +
            amountInWithFee;
        amountOut = numerator / denominator;

        if (amountOut < minAmountOut)
            revert MockAMM__InsufficientOutputAmount();
        if (amountOut >= pool.ethReserve)
            revert MockAMM__InsufficientLiquidity();

        pool.tokenReserve += amountIn;
        pool.ethReserve -= amountOut;

        (bool success, ) = payable(msg.sender).call{value: amountOut}("");
        if (!success) revert MockAMM__TransferFailed();

        emit MockAMM__Swap(
            msg.sender,
            tokenIn,
            address(0),
            amountIn,
            amountOut
        );
    }

    /// @notice Adds liquidity to a pool
    /// @param token The token address
    /// @param tokenAmount The amount of tokens to add
    /// @return lpTokens The amount of LP tokens minted
    function addLiquidity(
        address token,
        uint256 tokenAmount
    ) external payable nonReentrant returns (uint256 lpTokens) {
        if (msg.value == 0 || tokenAmount == 0)
            revert MockAMM__InsufficientETH();
        if (token == address(0)) revert MockAMM__InvalidToken();

        Pool storage pool = pools[token];

        IERC20(token).safeTransferFrom(msg.sender, address(this), tokenAmount);

        if (pool.totalSupply == 0) {
            lpTokens = sqrt(msg.value * tokenAmount);
            pool.ethReserve = msg.value;
            pool.tokenReserve = tokenAmount;
            pool.totalSupply = lpTokens;
        } else {
            lpTokens = (msg.value * pool.totalSupply) / pool.ethReserve;

            uint256 expectedTokenAmount = (tokenAmount * pool.totalSupply) /
                pool.tokenReserve;
            if (lpTokens > expectedTokenAmount) {
                lpTokens = expectedTokenAmount;
            }

            pool.ethReserve += msg.value;
            pool.tokenReserve += tokenAmount;
            pool.totalSupply += lpTokens;
        }

        userLPTokens[msg.sender][token] += lpTokens;

        emit MockAMM__LiquidityAdded(
            msg.sender,
            token,
            msg.value,
            tokenAmount,
            lpTokens
        );
    }

    /// @notice Removes liquidity from a pool
    /// @param token The token address
    /// @param lpTokens The amount of LP tokens to burn
    /// @return ethAmount The amount of ETH returned
    /// @return tokenAmount The amount of tokens returned
    function removeLiquidity(
        address token,
        uint256 lpTokens
    ) external nonReentrant returns (uint256 ethAmount, uint256 tokenAmount) {
        if (lpTokens == 0) revert MockAMM__InsufficientETH();
        if (token == address(0)) revert MockAMM__InvalidToken();
        Pool storage pool = pools[token];
        if (
            pool.totalSupply == 0 ||
            pool.ethReserve == 0 ||
            pool.tokenReserve == 0
        ) revert MockAMM__InsufficientLiquidity();
        if (userLPTokens[msg.sender][token] < lpTokens)
            revert MockAMM__InsufficientLiquidity();

        ethAmount = (pool.ethReserve * lpTokens) / pool.totalSupply;
        tokenAmount = (pool.tokenReserve * lpTokens) / pool.totalSupply;

        pool.ethReserve -= ethAmount;
        pool.tokenReserve -= tokenAmount;
        pool.totalSupply -= lpTokens;
        userLPTokens[msg.sender][token] -= lpTokens;

        (bool success, ) = payable(msg.sender).call{value: ethAmount}("");
        if (!success) revert MockAMM__TransferFailed();
        IERC20(token).safeTransfer(msg.sender, tokenAmount);

        emit MockAMM__LiquidityRemoved(
            msg.sender,
            token,
            ethAmount,
            tokenAmount,
            lpTokens
        );
    }

    /// @notice Gets the amount of tokens that would be received for a given ETH amount
    /// @param tokenOut The token address
    /// @param ethAmount The amount of ETH
    /// @return amountOut The amount of tokens that would be received
    function getAmountOut(
        address tokenOut,
        uint256 ethAmount
    ) external view returns (uint256 amountOut) {
        if (ethAmount == 0) return 0;
        if (tokenOut == address(0)) return 0;

        Pool storage pool = pools[tokenOut];
        if (pool.ethReserve == 0 || pool.tokenReserve == 0) return 0;

        uint256 amountInWithFee = ethAmount * (FEE_DENOMINATOR - FEE_NUMERATOR);
        uint256 numerator = amountInWithFee * pool.tokenReserve;
        uint256 denominator = (pool.ethReserve * FEE_DENOMINATOR) +
            amountInWithFee;
        amountOut = numerator / denominator;
    }

    /*//////////////////////////////////////////////////////////////
                           INTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/
    /// @notice Calculates the square root of a number
    /// @param x The number to calculate the square root of
    /// @return y The square root
    function sqrt(uint256 x) internal pure returns (uint256 y) {
        uint256 z = (x + 1) / 2;
        y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
    }

    /*//////////////////////////////////////////////////////////////
                            GETTER FUNCTIONS
    //////////////////////////////////////////////////////////////*/
    /// @notice Gets pool information for a token
    /// @param token The token address
    /// @return pool The pool information
    function getPool(address token) external view returns (Pool memory pool) {
        return pools[token];
    }

    /*//////////////////////////////////////////////////////////////
                            RECIEVE & FALLBACK
    //////////////////////////////////////////////////////////////*/
    /// @notice Allows the contract to receive ETH
    receive() external payable {}
}
