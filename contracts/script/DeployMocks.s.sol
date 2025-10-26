// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

/*//////////////////////////////////////////////////////////////
                            IMPORTS
//////////////////////////////////////////////////////////////*/
import {Script, console} from "../lib/forge-std/src/Script.sol";
import {MockDAI} from "../src/mocks/MockDAI.sol";
import {MockWETH} from "../src/mocks/MockWETH.sol";
import {MockMKR} from "../src/mocks/MockMKR.sol";

contract DeployMocks is Script {
    /*//////////////////////////////////////////////////////////////
                             STATE VARIABLES
    //////////////////////////////////////////////////////////////*/
    MockDAI public dai;
    MockWETH public weth;
    MockMKR public mkr;

    /*//////////////////////////////////////////////////////////////
                                FUNCTIONS
    //////////////////////////////////////////////////////////////*/
    function run() external returns (MockDAI, MockWETH, MockMKR) {
        dai = new MockDAI();
        weth = new MockWETH();
        mkr = new MockMKR();

        return (dai, weth, mkr);
    }
}
