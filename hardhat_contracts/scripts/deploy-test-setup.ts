import { network } from "hardhat";

/**
 * Deploy test setup with additional configurations
 * This sets up the environment similar to the Foundry test setup
 */
const deployTestSetup = async () => {
  console.log("Deploying test setup...\n");

  // Deploy infrastructure components
  console.log("Deploying infrastructure components...");
  
  const { viem } = await network.connect();
  
  // Deploy mock tokens
  const MockDAI = await viem.deployContract("MockDAI");
  const dai = MockDAI;
  console.log("MockDAI deployed at:", dai.address);

  const MockWETH = await viem.deployContract("MockWETH");
  const weth = MockWETH;
  console.log("MockWETH deployed at:", weth.address);

  const MockMKR = await viem.deployContract("MockMKR");
  const mkr = MockMKR;
  console.log("MockMKR deployed at:", mkr.address);

  const mockAMM = await viem.deployContract("MockAMM");
  console.log("MockAMM deployed at:", mockAMM.address);

  const factory = await viem.deployContract("AgentFactory");
  console.log("AgentFactory deployed at:", factory.address);

  // Get deployer and owner addresses
  const [deployer] = await viem.getWalletClients();
  const deployerAddress = deployer.account.address;

  // Setup initial balances similar to test environment
  const initialBalance = 1_000_000n * 10n ** 18n;

  console.log("\n=== Test Setup Summary ===");
  console.log("Deployer address:", deployerAddress);
  console.log("Mock tokens balance:", initialBalance.toString());
  console.log("\nYou can now interact with:");
  console.log("- AgentFactory:", factory.address);
  console.log("- MockDAI:", dai.address);
  console.log("- MockWETH:", weth.address);
  console.log("- MockMKR:", mkr.address);
  console.log("- MockAMM:", mockAMM.address);

  return {
    factory,
    dai,
    weth,
    mkr,
    mockAMM,
  };
};

/**
 * Main deployment function
 */
async function main() {
  await deployTestSetup();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

