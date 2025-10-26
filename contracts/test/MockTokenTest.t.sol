// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Test} from "forge-std/Test.sol";
import {MockDAI} from "../src/mocks/MockDAI.sol";
import {MockWETH} from "../src/mocks/MockWETH.sol";
import {MockMKR} from "../src/mocks/MockMKR.sol";
import {DeployMocks} from "../script/DeployMocks.s.sol";

contract MockTokenTest is Test {
    /*//////////////////////////////////////////////////////////////
                            STATE VARIABLES
    //////////////////////////////////////////////////////////////*/
    MockMKR mkr;
    MockDAI dai;
    MockWETH weth;
    DeployMocks deployer;
    address user = makeAddr("user");
    address recipient = makeAddr("recipient");

    function setUp() external {
        deployer = new DeployMocks();
        (dai, weth, mkr) = deployer.run();
    }

    /*//////////////////////////////////////////////////////////////
                            MOCKDAI TESTS
    //////////////////////////////////////////////////////////////*/
    function testDAIMintTransferAndBurn() external {
        uint256 mintAmount = 1000 ether;
        dai.mint(user, mintAmount);
        assertEq(dai.balanceOf(user), mintAmount);

        vm.startPrank(user);
        dai.transfer(recipient, 500 ether);
        vm.stopPrank();

        assertEq(dai.balanceOf(user), 500 ether);
        assertEq(dai.balanceOf(recipient), 500 ether);

        vm.startPrank(user);
        dai.burn(user, 200 ether);
        vm.stopPrank();

        assertEq(dai.balanceOf(user), 300 ether);
        assertEq(dai.totalSupply(), 800 ether);
    }

    function testDAITokenMetadata() external view {
        assertEq(dai.name(), "DAI");
        assertEq(dai.symbol(), "DAI");
        assertEq(dai.decimals(), 18);
    }

    /*//////////////////////////////////////////////////////////////
                            MOCKWETH TESTS
    //////////////////////////////////////////////////////////////*/
    function testWETHMintTransferAndBurn() external {
        uint256 mintAmount = 5 ether;
        weth.mint(user, mintAmount);
        assertEq(weth.balanceOf(user), mintAmount);

        vm.startPrank(user);
        weth.transfer(recipient, 2 ether);
        vm.stopPrank();

        assertEq(weth.balanceOf(user), 3 ether);
        assertEq(weth.balanceOf(recipient), 2 ether);

        vm.startPrank(user);
        weth.burn(user, 1 ether);
        vm.stopPrank();

        assertEq(weth.balanceOf(user), 2 ether);
        assertEq(weth.totalSupply(), 4 ether);
    }

    function testWETHTokenMetadata() external view {
        assertEq(weth.name(), "Wrapped ETH");
        assertEq(weth.symbol(), "WETH");
        assertEq(weth.decimals(), 18);
    }

    /*//////////////////////////////////////////////////////////////
                            MOCKMKR TESTS
    //////////////////////////////////////////////////////////////*/
    function testMKRMintTransferAndBurn() external {
        uint256 mintAmount = 5 ether;
        mkr.mint(user, mintAmount);
        assertEq(mkr.balanceOf(user), mintAmount);

        vm.startPrank(user);
        mkr.transfer(recipient, 2 ether);
        vm.stopPrank();

        assertEq(mkr.balanceOf(user), 3 ether);
        assertEq(mkr.balanceOf(recipient), 2 ether);

        vm.startPrank(user);
        mkr.burn(user, 1 ether);
        vm.stopPrank();

        assertEq(mkr.balanceOf(user), 2 ether);
        assertEq(mkr.totalSupply(), 4 ether);
    }

    function testMKRTokenMetadata() external view {
        assertEq(mkr.name(), "Maker");
        assertEq(mkr.symbol(), "MKR");
        assertEq(mkr.decimals(), 18);
    }
}
