import { ethers } from "ethers";
import { AGENT_FACTORY_CONTRACT_ADDRESS, AGENT_FACTORY_CONTRACT_ABI } from "../contracts/AgentFactory.js";
import { MOCK_AMM_CONTRACT_ADDRESS } from "../contracts/MockAMM.js";
import { MOCK_DAI_CONTRACT_ADDRESS, MOCK_DAI_CONTRACT_ABI } from "../contracts/MockDAI.js";
import { MOCK_WETH_CONTRACT_ADDRESS, MOCK_WETH_CONTRACT_ABI } from "../contracts/MockWETH.js";
import { MOCK_MKR_CONTRACT_ADDRESS, MOCK_MKR_CONTRACT_ABI } from "../contracts/MockMKR.js";
import { toast } from "react-toastify";

const tokenMap = {
  DAI: "0x0068f10Fc6a40736a18388a93e7540C51B110330",
  WETH: '0xfF31a63af3fEf47e8b8D4c0a1D57d8935161c9Cf',
  MKR: "0x36c7782F1dEDfF622F6941740C4f9223C045e924",
};

const tokenABIMap = {
  DAI: MOCK_DAI_CONTRACT_ABI,
  WETH: MOCK_WETH_CONTRACT_ABI,
  MKR: MOCK_MKR_CONTRACT_ABI,
};

const platformEnumMap = {
  Telegram: 0,
  Twitter: 1,
  Discord: 2,
};

export const deployAgent = async ({
  platformType,
  /*agentName,*/
  /*description,*/
  maxSpend,
  selectedTokens,
  liquidityAmount,
  signer
}) => {
  try {
    if (!signer) {
      throw new Error("No signer provided. Please connect your wallet first.");
    }

    const userAddress = await signer.getAddress();
    console.log("Deploying agent with address:", userAddress);

    const contract = new ethers.Contract(AGENT_FACTORY_CONTRACT_ADDRESS, AGENT_FACTORY_CONTRACT_ABI, signer);

    const tokenAddresses = selectedTokens.map((symbol) => tokenMap[symbol]);
    const platformEnum = platformEnumMap[platformType];

    const valueInWei = ethers.parseUnits(maxSpend.toString(), "ether");

    console.log("Deploying agent with params:", {
      tokenAddresses,
      platformEnum,
      userAddress,
      valueInWei: valueInWei.toString(),
      mockAMM: MOCK_AMM_CONTRACT_ADDRESS
    });

    toast.info("Creating agent contract...");

    const tx = await contract.createAgent(
      tokenAddresses,
      platformEnum,
      userAddress,
      MOCK_AMM_CONTRACT_ADDRESS,
      { value: valueInWei }
    );

    console.log("Transaction sent:", tx.hash);
    toast.info("Transaction submitted! Waiting for confirmation...");
    
    const receipt = await tx.wait();
    console.log("Agent deployed successfully:", receipt);
    
    // Extract agent address from the event
    const agentCreatedEvent = receipt.logs.find(log => {
      try {
        const parsed = contract.interface.parseLog(log);
        return parsed.name === 'Factory__AgentCreated';
      } catch {
        return false;
      }
    });

    if (!agentCreatedEvent) {
      throw new Error("Could not find agent creation event");
    }

    const parsedEvent = contract.interface.parseLog(agentCreatedEvent);
    const agentAddress = parsedEvent.args[0]; // agentAddress is the first indexed parameter

    toast.success("Agent deployed successfully! Setting up liquidity...");

    // Setup liquidity if liquidityAmount is provided
    if (liquidityAmount && liquidityAmount > 0) {
      await setupLiquidity(agentAddress, selectedTokens, liquidityAmount, signer);
    }
    
    toast.success("Agent deployment and liquidity setup complete! 🎉");
    return { receipt, agentAddress };
  } catch (err) {
    console.error("Deployment failed:", err);
    
    if (err.code === "INSUFFICIENT_FUNDS") {
      toast.error("Insufficient funds for deployment");
    } else if (err.code === 4001) {
      toast.error("Transaction rejected by user");
    } else if (err.message.includes("No signer provided")) {
      toast.error("Please connect your wallet first");
    } else {
      toast.error("Deployment failed. Please try again.");
    }
    
    throw err;
  }
};

const setupLiquidity = async (agentAddress, selectedTokens, liquidityAmount, signer) => {
  try {
    const liquidityAmountWei = ethers.parseUnits(liquidityAmount.toString(), "ether");
    
    // Mint tokens to the agent for each selected token
    for (const tokenSymbol of selectedTokens) {
      const tokenAddress = tokenMap[tokenSymbol];
      const tokenABI = tokenABIMap[tokenSymbol];
      
      const tokenContract = new ethers.Contract(tokenAddress, tokenABI, signer);
      
      toast.info(`Minting ${tokenSymbol} tokens to agent...`);
      const mintTx = await tokenContract.mint(agentAddress, liquidityAmountWei);
      await mintTx.wait();
    }

    // Send ETH to agent for liquidity
    toast.info("Sending ETH to agent for liquidity...");
    const ethTx = await signer.sendTransaction({
      to: agentAddress,
      value: liquidityAmountWei * BigInt(selectedTokens.length)
    });
    await ethTx.wait();

    // Setup pools and add liquidity
    toast.info("Setting up pools and adding liquidity...");
    const agentABI = [
      "function setupPoolsAndLiquidity(address[] memory _tokens, uint256 _liquidityAmount) external"
    ];
    
    const agentContract = new ethers.Contract(agentAddress, agentABI, signer);
    const tokenAddresses = selectedTokens.map((symbol) => tokenMap[symbol]);
    
    const setupTx = await agentContract.setupPoolsAndLiquidity(tokenAddresses, liquidityAmountWei);
    await setupTx.wait();
    
    toast.success("Liquidity setup completed successfully!");
  } catch (error) {
    console.error("Error setting up liquidity:", error);
    toast.error("Failed to setup liquidity. Agent deployed but may not be functional for swaps.");
    throw error;
  }
};