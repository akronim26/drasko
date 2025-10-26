// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Test, console} from "forge-std/Test.sol";
import {MockAMM} from "../src/amm/MockAMM.sol";
import {MockDAI} from "../src/mocks/MockDAI.sol";
import {MockMKR} from "../src/mocks/MockMKR.sol";
import {MockWETH} from "../src/mocks/MockWETH.sol";
import {DeployMocks} from "../script/DeployMocks.s.sol";

contract MockAMMTest is Test {
    /*//////////////////////////////////////////////////////////////
                           STATE VARIABLES
    //////////////////////////////////////////////////////////////*/
    MockAMM public mockAMM;
    MockDAI public dai;
    MockMKR public mkr;
    MockWETH public weth;
    DeployMocks public deployer;
    address public user = makeAddr("user");
    address public user2 = makeAddr("user2");

    function setUp() external {
        deployer = new DeployMocks();
        (dai, weth, mkr) = deployer.run();
        mockAMM = new MockAMM();

        dai.mint(user, 1_000_000 ether);
        mkr.mint(user, 1_000_000 ether);
        weth.mint(user, 1_000_000 ether);
        dai.mint(user2, 1_000_000 ether);
        mkr.mint(user2, 1_000_000 ether);
        weth.mint(user2, 1_000_000 ether);

        vm.deal(user, 1_000_000 ether);
        vm.deal(user2, 1_000_000 ether);
    }

    /*//////////////////////////////////////////////////////////////
                           ADD LIQUIDITY TESTS
    //////////////////////////////////////////////////////////////*/
    function testAddLiquidityFirstTime() external {
        vm.startPrank(user);
        dai.approve(address(mockAMM), type(uint256).max);

        uint256 ethAmount = 100 ether;
        uint256 tokenAmount = 1000 ether;

        uint256 lpTokens = mockAMM.addLiquidity{value: ethAmount}(
            address(dai),
            tokenAmount
        );

        uint256 expectedLPTokens = sqrt(ethAmount * tokenAmount);
        assertEq(lpTokens, expectedLPTokens);

        MockAMM.Pool memory pool = mockAMM.getPool(address(dai));
        assertEq(pool.ethReserve, ethAmount);
        assertEq(pool.tokenReserve, tokenAmount);
        assertEq(pool.totalSupply, expectedLPTokens);
        vm.stopPrank();
    }

    function testAddLiquiditySubsequentTimes() external {
        vm.startPrank(user);
        dai.approve(address(mockAMM), type(uint256).max);

        uint256 ethAmount1 = 100 ether;
        uint256 tokenAmount1 = 1000 ether;
        uint256 lpTokens1 = mockAMM.addLiquidity{value: ethAmount1}(
            address(dai),
            tokenAmount1
        );

        uint256 ethAmount2 = 50 ether;
        uint256 tokenAmount2 = 500 ether;
        uint256 lpTokens2 = mockAMM.addLiquidity{value: ethAmount2}(
            address(dai),
            tokenAmount2
        );

        uint256 expectedLPTokens2 = (ethAmount2 * lpTokens1) / ethAmount1;
        assertEq(lpTokens2, expectedLPTokens2);

        MockAMM.Pool memory pool = mockAMM.getPool(address(dai));
        assertEq(pool.ethReserve, ethAmount1 + ethAmount2);
        assertEq(pool.tokenReserve, tokenAmount1 + tokenAmount2);
        assertEq(pool.totalSupply, lpTokens1 + lpTokens2);
        vm.stopPrank();
    }

    function testAddLiquidityWithZeroETH() external {
        vm.startPrank(user);
        dai.approve(address(mockAMM), type(uint256).max);

        vm.expectRevert(MockAMM.MockAMM__InsufficientETH.selector);
        mockAMM.addLiquidity{value: 0}(address(dai), 1000 ether);
        vm.stopPrank();
    }

    function testAddLiquidityWithZeroTokens() external {
        vm.startPrank(user);
        dai.approve(address(mockAMM), type(uint256).max);

        vm.expectRevert(MockAMM.MockAMM__InsufficientETH.selector);
        mockAMM.addLiquidity{value: 100 ether}(address(dai), 0);
        vm.stopPrank();
    }

    function testAddLiquidityWithInvalidToken() external {
        vm.startPrank(user);
        dai.approve(address(mockAMM), type(uint256).max);

        vm.expectRevert(MockAMM.MockAMM__InvalidToken.selector);
        mockAMM.addLiquidity{value: 100 ether}(address(0), 1000 ether);
        vm.stopPrank();
    }

    /*//////////////////////////////////////////////////////////////
                           SWAP ETH FOR TOKENS TESTS
    //////////////////////////////////////////////////////////////*/
    function testSwapETHForTokens() external {
        vm.startPrank(user);
        dai.approve(address(mockAMM), type(uint256).max);

        uint256 ethAmount = 1000 ether;
        uint256 tokenAmount = 10000 ether;
        mockAMM.addLiquidity{value: ethAmount}(address(dai), tokenAmount);

        uint256 swapAmount = 10 ether;
        uint256 expectedOutput = mockAMM.getAmountOut(address(dai), swapAmount);

        uint256 amountOut = mockAMM.swapETHForTokens{value: swapAmount}(
            address(dai),
            0
        );

        assertEq(amountOut, expectedOutput);
        assertGt(amountOut, 0);

        assertEq(
            dai.balanceOf(user),
            1_000_000 ether - tokenAmount + amountOut
        );

        MockAMM.Pool memory pool = mockAMM.getPool(address(dai));
        assertEq(pool.ethReserve, ethAmount + swapAmount);
        assertEq(pool.tokenReserve, tokenAmount - amountOut);
        vm.stopPrank();
    }

    function testSwapETHForTokensWithMinAmountOut() external {
        vm.startPrank(user);
        dai.approve(address(mockAMM), type(uint256).max);

        mockAMM.addLiquidity{value: 1000 ether}(address(dai), 10000 ether);

        uint256 swapAmount = 10 ether;
        uint256 minAmountOut = 10000 ether;

        vm.expectRevert(MockAMM.MockAMM__InsufficientOutputAmount.selector);
        mockAMM.swapETHForTokens{value: swapAmount}(address(dai), minAmountOut);
        vm.stopPrank();
    }

    function testSwapETHForTokensWithZeroETH() external {
        vm.startPrank(user);
        dai.approve(address(mockAMM), type(uint256).max);

        mockAMM.addLiquidity{value: 1000 ether}(address(dai), 10000 ether);

        vm.expectRevert(MockAMM.MockAMM__InsufficientETH.selector);
        mockAMM.swapETHForTokens{value: 0}(address(dai), 0);
        vm.stopPrank();
    }

    function testSwapETHForTokensWithInvalidToken() external {
        vm.startPrank(user);
        dai.approve(address(mockAMM), type(uint256).max);

        mockAMM.addLiquidity{value: 1000 ether}(address(dai), 10000 ether);

        vm.expectRevert(MockAMM.MockAMM__InvalidToken.selector);
        mockAMM.swapETHForTokens{value: 10 ether}(address(0), 0);
        vm.stopPrank();
    }

    function testSwapETHForTokensWithoutLiquidity() external {
        vm.startPrank(user);

        vm.expectRevert(MockAMM.MockAMM__InsufficientLiquidity.selector);
        mockAMM.swapETHForTokens{value: 10 ether}(address(dai), 0);
        vm.stopPrank();
    }

    /*//////////////////////////////////////////////////////////////
                           SWAP TOKENS FOR ETH TESTS
    //////////////////////////////////////////////////////////////*/
    function testSwapTokensForETH() external {
        vm.startPrank(user);
        dai.approve(address(mockAMM), type(uint256).max);

        uint256 ethAmount = 1000 ether;
        uint256 tokenAmount = 10000 ether;
        mockAMM.addLiquidity{value: ethAmount}(address(dai), tokenAmount);

        uint256 swapAmount = 100 ether;
        uint256 amountOut = mockAMM.swapTokensForETH(
            address(dai),
            swapAmount,
            0
        );

        assertGt(amountOut, 0);

        uint256 userBalanceBefore = user.balance;
        assertEq(userBalanceBefore, 1_000_000 ether - ethAmount + amountOut);

        MockAMM.Pool memory pool = mockAMM.getPool(address(dai));
        assertEq(pool.tokenReserve, tokenAmount + swapAmount);
        assertEq(pool.ethReserve, ethAmount - amountOut);
        vm.stopPrank();
    }

    function testSwapTokensForETHWithMinAmountOut() external {
        vm.startPrank(user);
        dai.approve(address(mockAMM), type(uint256).max);

        mockAMM.addLiquidity{value: 1000 ether}(address(dai), 10000 ether);

        uint256 swapAmount = 100 ether;
        uint256 minAmountOut = 1000 ether;

        vm.expectRevert(MockAMM.MockAMM__InsufficientOutputAmount.selector);
        mockAMM.swapTokensForETH(address(dai), swapAmount, minAmountOut);
        vm.stopPrank();
    }

    function testSwapTokensForETHWithZeroAmount() external {
        vm.startPrank(user);
        dai.approve(address(mockAMM), type(uint256).max);

        mockAMM.addLiquidity{value: 1000 ether}(address(dai), 10000 ether);

        vm.expectRevert(MockAMM.MockAMM__InsufficientETH.selector);
        mockAMM.swapTokensForETH(address(dai), 0, 0);
        vm.stopPrank();
    }

    function testSwapTokensForETHWithInvalidToken() external {
        vm.startPrank(user);
        dai.approve(address(mockAMM), type(uint256).max);

        mockAMM.addLiquidity{value: 1000 ether}(address(dai), 10000 ether);

        vm.expectRevert(MockAMM.MockAMM__InvalidToken.selector);
        mockAMM.swapTokensForETH(address(0), 100 ether, 0);
        vm.stopPrank();
    }

    function testSwapTokensForETHWithoutLiquidity() external {
        vm.startPrank(user);
        dai.approve(address(mockAMM), type(uint256).max);

        vm.expectRevert(MockAMM.MockAMM__InsufficientLiquidity.selector);
        mockAMM.swapTokensForETH(address(dai), 100 ether, 0);
        vm.stopPrank();
    }

    /*//////////////////////////////////////////////////////////////
                           GET AMOUNT OUT TESTS
    //////////////////////////////////////////////////////////////*/
    function testGetAmountOut() external {
        vm.startPrank(user);
        dai.approve(address(mockAMM), type(uint256).max);

        mockAMM.addLiquidity{value: 1000 ether}(address(dai), 10000 ether);

        uint256 ethAmount = 10 ether;
        uint256 amountOut = mockAMM.getAmountOut(address(dai), ethAmount);

        assertGt(amountOut, 0);
        assertLt(amountOut, 10000 ether);

        uint256 zeroAmountOut = mockAMM.getAmountOut(address(dai), 0);
        assertEq(zeroAmountOut, 0);

        uint256 invalidTokenAmountOut = mockAMM.getAmountOut(
            address(0),
            ethAmount
        );
        assertEq(invalidTokenAmountOut, 0);

        uint256 noLiquidityAmountOut = mockAMM.getAmountOut(
            address(mkr),
            ethAmount
        );
        assertEq(noLiquidityAmountOut, 0);
        vm.stopPrank();
    }

    /*//////////////////////////////////////////////////////////////
                           GET POOL TESTS
    //////////////////////////////////////////////////////////////*/
    function testGetPool() external {
        vm.startPrank(user);
        dai.approve(address(mockAMM), type(uint256).max);

        MockAMM.Pool memory poolBefore = mockAMM.getPool(address(dai));
        assertEq(poolBefore.ethReserve, 0);
        assertEq(poolBefore.tokenReserve, 0);
        assertEq(poolBefore.totalSupply, 0);

        uint256 ethAmount = 1000 ether;
        uint256 tokenAmount = 10000 ether;
        mockAMM.addLiquidity{value: ethAmount}(address(dai), tokenAmount);

        MockAMM.Pool memory poolAfter = mockAMM.getPool(address(dai));
        assertEq(poolAfter.ethReserve, ethAmount);
        assertEq(poolAfter.tokenReserve, tokenAmount);
        assertGt(poolAfter.totalSupply, 0);
        vm.stopPrank();
    }

    /*//////////////////////////////////////////////////////////////
                           MULTIPLE POOLS TESTS
    //////////////////////////////////////////////////////////////*/
    function testMultiplePools() external {
        vm.startPrank(user);
        dai.approve(address(mockAMM), type(uint256).max);
        mkr.approve(address(mockAMM), type(uint256).max);
        weth.approve(address(mockAMM), type(uint256).max);

        mockAMM.addLiquidity{value: 1000 ether}(address(dai), 10000 ether);
        mockAMM.addLiquidity{value: 500 ether}(address(mkr), 5000 ether);
        mockAMM.addLiquidity{value: 2000 ether}(address(weth), 20000 ether);

        MockAMM.Pool memory daiPool = mockAMM.getPool(address(dai));
        MockAMM.Pool memory mkrPool = mockAMM.getPool(address(mkr));
        MockAMM.Pool memory wethPool = mockAMM.getPool(address(weth));

        assertEq(daiPool.ethReserve, 1000 ether);
        assertEq(mkrPool.ethReserve, 500 ether);
        assertEq(wethPool.ethReserve, 2000 ether);

        uint256 daiAmountOut = mockAMM.swapETHForTokens{value: 10 ether}(
            address(dai),
            0
        );
        uint256 mkrAmountOut = mockAMM.swapETHForTokens{value: 5 ether}(
            address(mkr),
            0
        );
        uint256 wethAmountOut = mockAMM.swapETHForTokens{value: 20 ether}(
            address(weth),
            0
        );

        assertGt(daiAmountOut, 0);
        assertGt(mkrAmountOut, 0);
        assertGt(wethAmountOut, 0);
        vm.stopPrank();
    }

    /*//////////////////////////////////////////////////////////////
                           RECEIVE FUNCTION TESTS
    //////////////////////////////////////////////////////////////*/
    function testReceiveFunction() external {
        vm.startPrank(user);

        uint256 amount = 10 ether;
        (bool success, ) = address(mockAMM).call{value: amount}("");
        assertTrue(success);

        assertEq(address(mockAMM).balance, amount);
        vm.stopPrank();
    }

    /*//////////////////////////////////////////////////////////////
                           REMOVE LIQUIDITY TESTS
    //////////////////////////////////////////////////////////////*/
    function testRemoveLiquidityNormal() external {
        vm.startPrank(user);
        dai.approve(address(mockAMM), type(uint256).max);
        uint256 ethAmount = 100 ether;
        uint256 tokenAmount = 1000 ether;
        uint256 lpTokens = mockAMM.addLiquidity{value: ethAmount}(
            address(dai),
            tokenAmount
        );
        uint256 removeLP = lpTokens / 2;
        (uint256 ethOut, uint256 tokenOut) = mockAMM.removeLiquidity(
            address(dai),
            removeLP
        );
        assertGt(ethOut, 0);
        assertGt(tokenOut, 0);
        assertEq(mockAMM.userLPTokens(user, address(dai)), lpTokens - removeLP);
        vm.stopPrank();
    }

    function testRemoveLiquidityAll() external {
        vm.startPrank(user);
        dai.approve(address(mockAMM), type(uint256).max);
        uint256 ethAmount = 100 ether;
        uint256 tokenAmount = 1000 ether;
        uint256 lpTokens = mockAMM.addLiquidity{value: ethAmount}(
            address(dai),
            tokenAmount
        );
        (uint256 ethOut, uint256 tokenOut) = mockAMM.removeLiquidity(
            address(dai),
            lpTokens
        );
        assertEq(ethOut, ethAmount);
        assertEq(tokenOut, tokenAmount);
        assertEq(mockAMM.userLPTokens(user, address(dai)), 0);
        vm.stopPrank();
    }

    function testRemoveLiquidityZeroLP() external {
        vm.startPrank(user);
        dai.approve(address(mockAMM), type(uint256).max);
        uint256 ethAmount = 100 ether;
        uint256 tokenAmount = 1000 ether;
        mockAMM.addLiquidity{value: ethAmount}(address(dai), tokenAmount);
        vm.expectRevert();
        mockAMM.removeLiquidity(address(dai), 0);
        vm.stopPrank();
    }

    function testRemoveLiquidityTooMuchLP() external {
        vm.startPrank(user);
        dai.approve(address(mockAMM), type(uint256).max);
        uint256 ethAmount = 100 ether;
        uint256 tokenAmount = 1000 ether;
        uint256 lpTokens = mockAMM.addLiquidity{value: ethAmount}(
            address(dai),
            tokenAmount
        );
        vm.expectRevert();
        mockAMM.removeLiquidity(address(dai), lpTokens + 1);
        vm.stopPrank();
    }

    /*//////////////////////////////////////////////////////////////
                           HELPER FUNCTIONS
    //////////////////////////////////////////////////////////////*/
    function sqrt(uint256 x) internal pure returns (uint256 y) {
        uint256 z = (x + 1) / 2;
        y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
    }
}
