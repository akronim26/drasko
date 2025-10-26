import { network } from "hardhat";

/**
 * Deploy all infrastructure contracts
 * Includes: AgentFactory, MockAMM, and all mock tokens
 */
const deployInfrastructure = async () => {
  const { viem } = await network.connect();

  console.log("Deploying infrastructure...\n");

  // Deploy mock tokens
  console.log("Deploying mock tokens...");
  
  const MockDAI = await viem.deployContract("MockDAI");
  const dai = MockDAI;
  console.log("MockDAI deployed at:", dai.address);

  const MockWETH = await viem.deployContract("MockWETH");
  const weth = MockWETH;
  console.log("MockWETH deployed at:", weth.address);

  const MockMKR = await viem.deployContract("MockMKR");
  const mkr = MockMKR;
  console.log("MockMKR deployed at:", mkr.address);

  // Get deployer address
  const [deployer] = await viem.getWalletClients();
  const deployerAddress = deployer.account.address;
  console.log("Deployer address:", deployerAddress);

  // Deploy MockAMM
  console.log("\nDeploying MockAMM...");
  const mockAMM = await viem.deployContract("MockAMM");
  console.log("MockAMM deployed at:", mockAMM.address);

  // Deploy AgentFactory
  console.log("Deploying AgentFactory...");
  const factory = await viem.deployContract("AgentFactory");
  console.log("AgentFactory deployed at:", factory.address);

  // Mint tokens for deployer
  console.log("\nMinting tokens for deployer...");
  const mintAmount = 1_000_000n * 10n ** 18n; // 1,000,000 tokens

  console.log("Minting DAI...");
  await dai.write.mint([deployerAddress, mintAmount], {
    account: deployer.account,
  });

  console.log("Minting WETH...");
  await weth.write.mint([deployerAddress, mintAmount], {
    account: deployer.account,
  });

  console.log("Minting MKR...");
  await mkr.write.mint([deployerAddress, mintAmount], {
    account: deployer.account,
  });

  console.log("\nInfrastructure deployed successfully!");
  console.log("\n=== Deployment Summary ===");
  console.log("AgentFactory:", factory.address);
  console.log("MockDAI:", dai.address);
  console.log("MockWETH:", weth.address);
  console.log("MockMKR:", mkr.address);
  console.log("MockAMM:", mockAMM.address);
  console.log("Deployer tokens minted successfully!");

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
  await deployInfrastructure();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

