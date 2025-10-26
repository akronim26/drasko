import { network } from "hardhat";

/**
 * Deploy mock tokens (DAI, WETH, MKR)
 * @returns Deployed mock token contracts
 */
const deployMocks = async () => {
  const { viem } = await network.connect();

  console.log("Deploying mock tokens...");

  // Deploy MockDAI
  console.log("Deploying MockDAI...");
  const MockDAI = await viem.deployContract("MockDAI");
  console.log("MockDAI deployed at:", MockDAI.address);

  // Deploy MockWETH
  console.log("Deploying MockWETH...");
  const MockWETH = await viem.deployContract("MockWETH");
  console.log("MockWETH deployed at:", MockWETH.address);

  // Deploy MockMKR
  console.log("Deploying MockMKR...");
  const MockMKR = await viem.deployContract("MockMKR");
  console.log("MockMKR deployed at:", MockMKR.address);

  console.log("All mock tokens deployed successfully!");

  return {
    dai: MockDAI,
    weth: MockWETH,
    mkr: MockMKR,
  };
};

/**
 * Main deployment function
 */
async function main() {
  const mockTokens = await deployMocks();

  console.log("\n=== Deployment Summary ===");
  console.log("MockDAI:", mockTokens.dai.address);
  console.log("MockWETH:", mockTokens.weth.address);
  console.log("MockMKR:", mockTokens.mkr.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

