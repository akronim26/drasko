// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Test, console} from "forge-std/Test.sol";
import {AgentFactory} from "../src/AgentFactory.sol";
import {Agent} from "../src/Agent.sol";
import {DeployInfrastructure} from "../script/DeployInfrastructure.s.sol";
import {Platform} from "../src/PlatformType.sol";
import {MockDAI} from "../src/mocks/MockDAI.sol";
import {MockMKR} from "../src/mocks/MockMKR.sol";
import {MockWETH} from "../src/mocks/MockWETH.sol";
import {MockAMM} from "../src/amm/MockAMM.sol";
import {IERC20} from "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import {DeployMocks} from "../script/DeployMocks.s.sol";

contract AgentTest is Test {
    /*//////////////////////////////////////////////////////////////
                           STATE VARIABLES
    //////////////////////////////////////////////////////////////*/
    AgentFactory factory;
    Agent agent;
    DeployInfrastructure deployer;
    MockDAI dai;
    MockMKR mkr;
    MockWETH weth;
    MockAMM mockAMM;
    address authorizedSigner;
    address owner = makeAddr("owner");
    address user = makeAddr("user");
    address user2 = makeAddr("user2");
    uint256 constant INITIAL_BALANCE = 1_000_000 ether;
    uint256 private signerPrivateKey;
    Agent.TradeData testTradeData;
    bytes32 private constant EIP712_DOMAIN_TYPEHASH =
        keccak256(
            "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
        );
    bytes32 private constant TYPE_HASH =
        keccak256(
            "TradeData(address tokenOut,uint256 amountIn,uint256 minAmountOut,uint256 deadline,uint256 nonce)"
        );

    function setUp() external {
        signerPrivateKey = 0xA11CE;
        authorizedSigner = vm.addr(signerPrivateKey);

        vm.deal(owner, INITIAL_BALANCE);

        deployer = new DeployInfrastructure();
        (factory, dai, weth, mkr, mockAMM) = deployer.run();

        address[] memory tokenArray = new address[](3);
        tokenArray[0] = address(dai);
        tokenArray[1] = address(weth);
        tokenArray[2] = address(mkr);

        vm.startPrank(owner);
        agent = factory.createAgent{value: 1 ether}(
            tokenArray,
            Platform.Twitter,
            authorizedSigner,
            address(mockAMM)
        );

        uint256 liquidityAmount = block.chainid == 31337
            ? 100_000 ether
            : 0.15 ether;

        dai.mint(address(agent), liquidityAmount);
        mkr.mint(address(agent), liquidityAmount);
        weth.mint(address(agent), liquidityAmount);

        (bool success, ) = address(agent).call{value: liquidityAmount * 3}("");
        require(success, "Failed to transfer liquidity ETH");

        agent.setupPoolsAndLiquidity(tokenArray, liquidityAmount);

        agent.addFunds{value: 1_000 ether}();
        vm.stopPrank();

        dai.mint(owner, INITIAL_BALANCE);
        weth.mint(owner, INITIAL_BALANCE);
        mkr.mint(owner, INITIAL_BALANCE);

        vm.deal(user, 10 ether);
        vm.deal(user2, 10 ether);

        testTradeData = Agent.TradeData({
            tokenOut: address(dai),
            amountIn: 1 ether,
            minAmountOut: 0.9 ether,
            deadline: block.timestamp + 1 hours,
            nonce: 1
        });
    }

    /*//////////////////////////////////////////////////////////////
                         AGENT FACTORY FUNCTIONS
    //////////////////////////////////////////////////////////////*/
    function testCreatedAgent() external view {
        AgentFactory.AgentInfo memory agentInfo = factory.getAgentInfo(
            owner,
            0
        );
        assertEq(agentInfo.agentAddress, address(agent));
        assertEq(agentInfo.owner, owner);
        assertEq(agentInfo.tokens.length, 3);
        assertEq(agentInfo.tokens[0], address(dai));
        assertEq(agentInfo.tokens[1], address(weth));
        assertEq(agentInfo.tokens[2], address(mkr));

        uint256 expectedAmount = 1 ether;
        assertEq(agentInfo.amountInvested, expectedAmount);
        assertEq(uint256(agentInfo.platformType), uint256(Platform.Twitter));
    }

    function testCreateMultipleAgentsWithDifferentPlatformsAndTokens()
        external
    {
        address[] memory newTokens = new address[](2);
        address[] memory newTokenAgain = new address[](1);
        newTokens[0] = address(dai);
        newTokens[1] = address(mkr);
        newTokenAgain[0] = address(mkr);
        vm.startPrank(owner);
        Agent newAgent = factory.createAgent{value: 2 ether}(
            newTokens,
            Platform.Discord,
            authorizedSigner,
            agent.getMockAMM()
        );
        Agent newAgentAgain = factory.createAgent{value: 3 ether}(
            newTokenAgain,
            Platform.Telegram,
            authorizedSigner,
            agent.getMockAMM()
        );
        AgentFactory.AgentInfo memory agentNew = factory.getAgentInfo(owner, 1);
        AgentFactory.AgentInfo memory agentNewAgain = factory.getAgentInfo(
            owner,
            2
        );
        vm.stopPrank();
        assertEq(agentNew.agentAddress, address(newAgent));
        assertEq(agentNew.owner, owner);
        assertEq(agentNew.tokens.length, 2);
        assertEq(agentNew.tokens[0], address(dai));
        assertEq(agentNew.tokens[1], address(mkr));
        assertEq(agentNew.amountInvested, 2 ether);
        assertEq(uint256(agentNew.platformType), uint256(Platform.Discord));
        assertEq(agentNewAgain.agentAddress, address(newAgentAgain));
        assertEq(agentNewAgain.owner, owner);
        assertEq(agentNewAgain.tokens.length, 1);
        assertEq(agentNewAgain.tokens[0], address(mkr));
        assertEq(agentNewAgain.amountInvested, 3 ether);
        assertEq(
            uint256(agentNewAgain.platformType),
            uint256(Platform.Telegram)
        );
    }

    /*//////////////////////////////////////////////////////////////
                            AGENT FUNCTIONS
    //////////////////////////////////////////////////////////////*/
    function testPauseAndResumeAgent() external {
        vm.startPrank(owner);
        agent.pauseAgent();
        assertEq(agent.getPausedState(), true);

        agent.resumeAgent();
        assertEq(agent.getPausedState(), false);
        vm.stopPrank();
    }

    function testOnlyOwnerCanPauseAgent() external {
        address random = makeAddr("random");
        vm.startPrank(random);
        vm.expectRevert();
        agent.pauseAgent();
        vm.stopPrank();
    }

    function testOnlyOwnerCanResumeAgent() external {
        address random = makeAddr("random");
        vm.startPrank(random);
        vm.expectRevert();
        agent.resumeAgent();
        vm.stopPrank();
    }

    function testWithdrawFunds() external {
        uint256 userInitialBalance = owner.balance;
        uint256 agentInitialBalance = address(agent).balance;
        uint256 expectedWithdraw = 1 ether + 1_000 ether;
        vm.startPrank(owner);
        agent.withdrawFunds();
        vm.stopPrank();
        uint256 userFinalBalance = owner.balance;
        uint256 agentFinalBalance = address(agent).balance;
        assertEq(userFinalBalance - userInitialBalance, expectedWithdraw);
        assertEq(agentInitialBalance - agentFinalBalance, expectedWithdraw);
    }

    function testAddFunds() external {
        uint256 userInitialBalance = owner.balance;
        uint256 agentInitialBalance = address(agent).balance;
        vm.startPrank(owner);
        agent.addFunds{value: 2 ether}();
        vm.stopPrank();
        uint256 userFinalBalance = owner.balance;
        uint256 agentFinalBalance = address(agent).balance;
        assertEq(userInitialBalance - userFinalBalance, 2 ether);
        assertEq(agentFinalBalance - agentInitialBalance, 2 ether);
    }

    function testDomainSeparator() external view {
        bytes32 expectedDomainSeparator = keccak256(
            abi.encode(
                EIP712_DOMAIN_TYPEHASH,
                keccak256(bytes("Agent")),
                keccak256(bytes("1")),
                block.chainid,
                address(agent)
            )
        );
        assertEq(agent.getDomainSeparator(), expectedDomainSeparator);
    }

    function testExecuteSwapWithValidSignature() external {
        address token = address(weth);
        uint256 swapAmount = 0.1 ether;

        uint256 initialAgentBalance = address(agent).balance;
        uint256 initialOwnerTokenBalance = weth.balanceOf(owner);

        Agent.TradeData memory trade = Agent.TradeData({
            tokenOut: token,
            amountIn: swapAmount,
            minAmountOut: 0,
            deadline: block.timestamp + 1 hours,
            nonce: 1001
        });

        bytes memory sig = _signTradeData(trade, signerPrivateKey);

        vm.startPrank(authorizedSigner);
        agent.executeSwap(trade, sig);
        vm.stopPrank();

        assertEq(address(agent).balance, initialAgentBalance - swapAmount);
        assertGt(weth.balanceOf(owner), initialOwnerTokenBalance);
        assertTrue(agent.isNonceUsed(1001));
    }

    function testExecuteSwapWithInvalidSignature() external {
        address token = address(weth);
        Agent.TradeData memory trade = Agent.TradeData({
            tokenOut: token,
            amountIn: 0.1 ether,
            minAmountOut: 0,
            deadline: block.timestamp + 1 hours,
            nonce: 1002
        });

        uint256 wrongKey = 0xB0B;
        bytes memory sig = _signTradeData(trade, wrongKey);

        vm.startPrank(authorizedSigner);
        vm.expectRevert(Agent.Agent__IncorrectSignature.selector);
        agent.executeSwap(trade, sig);
        vm.stopPrank();
    }

    function testExecuteSwapWithExpiredDeadline() external {
        address token = address(dai);
        Agent.TradeData memory trade = Agent.TradeData({
            tokenOut: token,
            amountIn: 0.1 ether,
            minAmountOut: 0,
            deadline: block.timestamp - 1,
            nonce: 1003
        });

        bytes memory sig = _signTradeData(trade, signerPrivateKey);

        vm.startPrank(authorizedSigner);
        vm.expectRevert(Agent.Agent__DeadlinePassed.selector);
        agent.executeSwap(trade, sig);
        vm.stopPrank();
    }

    function testExecuteSwapWithInvalidSignatureLength() external {
        address token = address(weth);
        Agent.TradeData memory trade = Agent.TradeData({
            tokenOut: token,
            amountIn: 0.1 ether,
            minAmountOut: 0,
            deadline: block.timestamp + 1 hours,
            nonce: 1004
        });

        bytes memory sig = new bytes(64);

        vm.startPrank(authorizedSigner);
        vm.expectRevert(Agent.Agent__IncorrectSignatureLength.selector);
        agent.executeSwap(trade, sig);
        vm.stopPrank();
    }

    function testExecuteSwapWithUsedNonce() external {
        address token = address(weth);
        Agent.TradeData memory trade = Agent.TradeData({
            tokenOut: token,
            amountIn: 0.1 ether,
            minAmountOut: 0,
            deadline: block.timestamp + 1 hours,
            nonce: 1005
        });

        bytes memory sig = _signTradeData(trade, signerPrivateKey);

        vm.startPrank(authorizedSigner);
        agent.executeSwap(trade, sig);
        vm.expectRevert(Agent.Agent__NonceAlreadyUsed.selector);
        agent.executeSwap(trade, sig);
        vm.stopPrank();
    }

    function testExecuteSwapWithMinAmountOut() external {
        address token = address(dai);
        uint256 swapAmount = 0.1 ether;

        uint256 expectedOutput = mockAMM.getAmountOut(token, swapAmount);
        uint256 minAmountOut = expectedOutput + 1;

        Agent.TradeData memory trade = Agent.TradeData({
            tokenOut: token,
            amountIn: swapAmount,
            minAmountOut: minAmountOut,
            deadline: block.timestamp + 1 hours,
            nonce: 1006
        });

        bytes memory sig = _signTradeData(trade, signerPrivateKey);

        vm.startPrank(authorizedSigner);
        vm.expectRevert();
        agent.executeSwap(trade, sig);
        vm.stopPrank();
    }

    function testExecuteSwapWithValidMinAmountOut() external {
        address token = address(dai);
        uint256 swapAmount = 0.1 ether;

        uint256 expectedOutput = mockAMM.getAmountOut(token, swapAmount);
        uint256 minAmountOut = expectedOutput / 2;

        Agent.TradeData memory trade = Agent.TradeData({
            tokenOut: token,
            amountIn: swapAmount,
            minAmountOut: minAmountOut,
            deadline: block.timestamp + 1 hours,
            nonce: 1007
        });

        bytes memory sig = _signTradeData(trade, signerPrivateKey);

        vm.startPrank(authorizedSigner);
        agent.executeSwap(trade, sig);
        vm.stopPrank();

        assertTrue(agent.isNonceUsed(1007));
    }

    function testExecuteSwapWithAllSupportedTokens() external {
        address[] memory tokens = new address[](3);
        tokens[0] = address(dai);
        tokens[1] = address(weth);
        tokens[2] = address(mkr);

        for (uint256 i = 0; i < tokens.length; i++) {
            uint256 nonce = 2000 + i;
            uint256 swapAmount = 0.1 ether;

            Agent.TradeData memory trade = Agent.TradeData({
                tokenOut: tokens[i],
                amountIn: swapAmount,
                minAmountOut: 0,
                deadline: block.timestamp + 1 hours,
                nonce: nonce
            });

            bytes memory sig = _signTradeData(trade, signerPrivateKey);

            vm.startPrank(authorizedSigner);
            agent.executeSwap(trade, sig);
            vm.stopPrank();

            assertTrue(agent.isNonceUsed(nonce));
        }
    }

    function testExecuteSwapWithLargeAmount() external {
        address token = address(dai);
        uint256 swapAmount = 10 ether;

        if (swapAmount > agent.getUserFunds()) {
            vm.startPrank(owner);
            agent.addFunds{value: swapAmount}();
            vm.stopPrank();
        }

        Agent.TradeData memory trade = Agent.TradeData({
            tokenOut: token,
            amountIn: swapAmount,
            minAmountOut: 0,
            deadline: block.timestamp + 1 hours,
            nonce: 1008
        });

        bytes memory sig = _signTradeData(trade, signerPrivateKey);

        vm.startPrank(authorizedSigner);
        agent.executeSwap(trade, sig);
        vm.stopPrank();

        assertTrue(agent.isNonceUsed(1008));
    }

    function testTokenTransferToOwnerAfterSwap() external {
        address token = address(dai);
        uint256 swapAmount = 1 ether;

        uint256 initialAgentBalance = address(agent).balance;
        uint256 initialOwnerTokenBalance = dai.balanceOf(owner);
        uint256 initialAuthorizedSignerTokenBalance = dai.balanceOf(
            authorizedSigner
        );

        Agent.TradeData memory trade = Agent.TradeData({
            tokenOut: token,
            amountIn: swapAmount,
            minAmountOut: 0,
            deadline: block.timestamp + 1 hours,
            nonce: 1009
        });

        bytes memory sig = _signTradeData(trade, signerPrivateKey);

        vm.startPrank(authorizedSigner);
        agent.executeSwap(trade, sig);
        vm.stopPrank();

        assertEq(address(agent).balance, initialAgentBalance - swapAmount);

        uint256 finalOwnerTokenBalance = dai.balanceOf(owner);
        assertGt(finalOwnerTokenBalance, initialOwnerTokenBalance);

        assertEq(
            dai.balanceOf(authorizedSigner),
            initialAuthorizedSignerTokenBalance
        );

        assertTrue(agent.isNonceUsed(1009));
    }

    function testTokenTransferToOwnerWithAllTokens() external {
        address[] memory tokens = new address[](3);
        tokens[0] = address(dai);
        tokens[1] = address(weth);
        tokens[2] = address(mkr);

        for (uint256 i = 0; i < tokens.length; i++) {
            uint256 nonce = 3000 + i;
            uint256 swapAmount = 0.5 ether;

            uint256 initialOwnerBalance = IERC20(tokens[i]).balanceOf(owner);

            Agent.TradeData memory trade = Agent.TradeData({
                tokenOut: tokens[i],
                amountIn: swapAmount,
                minAmountOut: 0,
                deadline: block.timestamp + 1 hours,
                nonce: nonce
            });

            bytes memory sig = _signTradeData(trade, signerPrivateKey);

            vm.startPrank(authorizedSigner);
            agent.executeSwap(trade, sig);
            vm.stopPrank();

            uint256 finalOwnerBalance = IERC20(tokens[i]).balanceOf(owner);
            assertGt(finalOwnerBalance, initialOwnerBalance);

            assertTrue(agent.isNonceUsed(nonce));
        }
    }

    function testSignTradeDataProducesCorrectDigest() external view {
        address token = address(dai);
        Agent.TradeData memory trade = Agent.TradeData({
            tokenOut: token,
            amountIn: 1,
            minAmountOut: 1,
            deadline: block.timestamp + 1 hours,
            nonce: 12345
        });

        bytes32 structHash = keccak256(
            abi.encode(
                TYPE_HASH,
                trade.tokenOut,
                trade.amountIn,
                trade.minAmountOut,
                trade.deadline,
                trade.nonce
            )
        );
        bytes32 digest = keccak256(
            abi.encodePacked("\x19\x01", agent.getDomainSeparator(), structHash)
        );
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(signerPrivateKey, digest);
        bytes memory expectedSignature = abi.encodePacked(r, s, v);

        bytes memory helperSignature = _signTradeData(trade, signerPrivateKey);

        assertEq(helperSignature, expectedSignature);
    }

    function testExecuteSwapWithInvalidToken() external {
        address invalidToken = makeAddr("invalidToken");
        Agent.TradeData memory trade = Agent.TradeData({
            tokenOut: invalidToken,
            amountIn: 0.1 ether,
            minAmountOut: 0,
            deadline: block.timestamp + 1 hours,
            nonce: 1011
        });

        bytes memory sig = _signTradeData(trade, signerPrivateKey);

        vm.startPrank(authorizedSigner);
        vm.expectRevert(Agent.Agent__InvalidTokens.selector);
        agent.executeSwap(trade, sig);
        vm.stopPrank();
    }

    function testExecuteSwapWithInsufficientFunds() external {
        // Withdraw all agent funds first
        vm.startPrank(owner);
        agent.withdrawFunds();
        vm.stopPrank();

        address token = address(weth);
        Agent.TradeData memory trade = Agent.TradeData({
            tokenOut: token,
            amountIn: 1 ether,
            minAmountOut: 0,
            deadline: block.timestamp + 1 hours,
            nonce: 1012
        });

        bytes memory sig = _signTradeData(trade, signerPrivateKey);

        vm.startPrank(authorizedSigner);
        vm.expectRevert();
        agent.executeSwap(trade, sig);
        vm.stopPrank();
    }

    function testExecuteSwapWithWrongSigner() external {
        address token = address(weth);
        Agent.TradeData memory trade = Agent.TradeData({
            tokenOut: token,
            amountIn: 0.1 ether,
            minAmountOut: 0,
            deadline: block.timestamp + 1 hours,
            nonce: 1013
        });

        bytes memory sig = _signTradeData(trade, signerPrivateKey);
        address wrongSigner = makeAddr("wrongSigner");

        vm.startPrank(wrongSigner);
        vm.expectRevert(Agent.Agent__NotAuthorized.selector);
        agent.executeSwap(trade, sig);
        vm.stopPrank();
    }

    function testAddFundsWithZeroAmount() external {
        vm.startPrank(owner);
        vm.expectRevert(Agent.Agent__AmountIsZero.selector);
        agent.addFunds{value: 0}();
        vm.stopPrank();
    }

    function testMultipleUsersCreateAgents() external {
        address[] memory tokens = new address[](1);
        tokens[0] = address(dai);

        vm.startPrank(user);
        Agent agent1 = factory.createAgent{value: 1 ether}(
            tokens,
            Platform.Twitter,
            authorizedSigner,
            agent.getMockAMM()
        );
        vm.stopPrank();

        vm.startPrank(user2);
        Agent agent2 = factory.createAgent{value: 2 ether}(
            tokens,
            Platform.Telegram,
            authorizedSigner,
            agent.getMockAMM()
        );
        vm.stopPrank();

        AgentFactory.AgentInfo memory agentInfo1 = factory.getAgentInfo(
            user,
            0
        );
        AgentFactory.AgentInfo memory agentInfo2 = factory.getAgentInfo(
            user2,
            0
        );

        assertEq(agentInfo1.agentAddress, address(agent1));
        assertEq(agentInfo2.agentAddress, address(agent2));
        assertEq(agentInfo1.owner, user);
        assertEq(agentInfo2.owner, user2);
        assertEq(agentInfo1.amountInvested, 1 ether);
        assertEq(agentInfo2.amountInvested, 2 ether);
    }

    function testCreateAgentWithLargeValue() external {
        vm.startPrank(owner);
        address[] memory tokens = new address[](1);
        tokens[0] = address(dai);

        uint256 largeValue = 1000 ether;
        vm.deal(owner, largeValue + 1 ether);

        Agent newAgent = factory.createAgent{value: largeValue}(
            tokens,
            Platform.Twitter,
            authorizedSigner,
            agent.getMockAMM()
        );

        AgentFactory.AgentInfo memory agentInfo = factory.getAgentInfo(
            owner,
            1
        );
        assertEq(agentInfo.amountInvested, largeValue);
        assertEq(newAgent.getUserFunds(), largeValue);
        vm.stopPrank();
    }

    /*//////////////////////////////////////////////////////////////
                           HELPER FUNCTIONS
    //////////////////////////////////////////////////////////////*/
    function _signTradeData(
        Agent.TradeData memory data,
        uint256 privateKey
    ) internal view returns (bytes memory) {
        bytes32 structHash = keccak256(
            abi.encode(
                TYPE_HASH,
                data.tokenOut,
                data.amountIn,
                data.minAmountOut,
                data.deadline,
                data.nonce
            )
        );
        bytes32 digest = keccak256(
            abi.encodePacked("\x19\x01", agent.getDomainSeparator(), structHash)
        );
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(privateKey, digest);
        return abi.encodePacked(r, s, v);
    }
}
