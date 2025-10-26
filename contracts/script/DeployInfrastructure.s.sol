// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

/*//////////////////////////////////////////////////////////////
                            IMPORTS
//////////////////////////////////////////////////////////////*/
import {Script, console} from "../lib/forge-std/src/Script.sol";
import {AgentFactory} from "../src/AgentFactory.sol";
import {DeployMocks} from "./DeployMocks.s.sol";
import {MockDAI} from "../src/mocks/MockDAI.sol";
import {MockMKR} from "../src/mocks/MockMKR.sol";
import {MockWETH} from "../src/mocks/MockWETH.sol";
import {MockAMM} from "../src/amm/MockAMM.sol";

contract DeployInfrastructure is Script {
    /*//////////////////////////////////////////////////////////////
                           STATE VARIABLES
    //////////////////////////////////////////////////////////////*/
    DeployMocks mockDeployer;
    MockDAI public dai;
    MockMKR public mkr;
    MockWETH public weth;
    MockAMM public mockAMM;
    AgentFactory public factory;

    /*//////////////////////////////////////////////////////////////
                                FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /*//////////////////////////////////////////////////////////////
                            EXTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/
    function run()
        external
        returns (AgentFactory, MockDAI, MockWETH, MockMKR, MockAMM)
    {
        address deployer;
        try vm.envUint("PRIVATE_KEY") returns (uint256 privateKey) {
            deployer = vm.addr(privateKey);
        } catch {
            deployer = makeAddr("deployer");
        }

        vm.startBroadcast();

        mockDeployer = new DeployMocks();
        (dai, weth, mkr) = mockDeployer.run();
        mockAMM = new MockAMM();

        factory = new AgentFactory();

        dai.mint(deployer, 1_000_000 ether);
        mkr.mint(deployer, 1_000_000 ether);
        weth.mint(deployer, 1_000_000 ether);

        vm.stopBroadcast();

        console.log("Infrastructure deployed successfully!");
        console.log("AgentFactory:", address(factory));
        console.log("MockDAI:", address(dai));
        console.log("MockWETH:", address(weth));
        console.log("MockMKR:", address(mkr));
        console.log("MockAMM:", address(mockAMM));

        return (factory, dai, weth, mkr, mockAMM);
    }
}
