import { ethers } from "ethers";
import { AGENT_FACTORY_CONTRACT_ADDRESS, AGENT_FACTORY_CONTRACT_ABI } from "../contracts/AgentFactory.js";
import { toast } from "react-toastify";

export const getAgentInfo = async (userAddress, index, signer) => {
  const contract = new ethers.Contract(AGENT_FACTORY_CONTRACT_ADDRESS, AGENT_FACTORY_CONTRACT_ABI, signer);
  const agentInfo = await contract.getAgentInfo(userAddress, index);
  return agentInfo;
};

export const getUserAgents = async (userAddress, signer) => {
  const contract = new ethers.Contract(AGENT_FACTORY_CONTRACT_ADDRESS, AGENT_FACTORY_CONTRACT_ABI, signer);
  const agents = [];
  
  try {
    let index = 0;
    while (true) {
      const agentInfo = await contract.getAgentInfo(userAddress, index);
      if (agentInfo.agentAddress === ethers.ZeroAddress) break;
      agents.push(agentInfo);
      index++;
    }
  } catch (error) {
    console.log("No more agents found or error occurred:", error.message);
  }
  
  return agents;
};

export const pauseAgent = async (agentAddress, signer) => {
  const agentABI = [
    "function pauseAgent() external",
    "function resumeAgent() external",
    "function getPausedState() external view returns (bool)",
    "function addFunds() external payable",
    "function withdrawFunds() external",
    "function getUserFunds() external view returns (uint256)",
    "function executeSwap((address,uint256,uint256,uint256,uint256),bytes) external",
    "function isNonceUsed(uint256) external view returns (bool)"
  ];
  
  try {
    toast.info("Pausing agent...");
    const agentContract = new ethers.Contract(agentAddress, agentABI, signer);
    const tx = await agentContract.pauseAgent();
    await tx.wait();
    toast.success("Agent paused successfully!");
    return tx;
  } catch (error) {
    console.error("Error pausing agent:", error);
    toast.error("Failed to pause agent");
    throw error;
  }
};

export const resumeAgent = async (agentAddress, signer) => {
  const agentABI = [
    "function pauseAgent() external",
    "function resumeAgent() external",
    "function getPausedState() external view returns (bool)",
    "function addFunds() external payable",
    "function withdrawFunds() external",
    "function getUserFunds() external view returns (uint256)",
    "function executeSwap((address,uint256,uint256,uint256,uint256),bytes) external",
    "function isNonceUsed(uint256) external view returns (bool)"
  ];
  
  try {
    toast.info("Resuming agent...");
    const agentContract = new ethers.Contract(agentAddress, agentABI, signer);
    const tx = await agentContract.resumeAgent();
    await tx.wait();
    toast.success("Agent resumed successfully!");
    return tx;
  } catch (error) {
    console.error("Error resuming agent:", error);
    toast.error("Failed to resume agent");
    throw error;
  }
};

export const getAgentPausedState = async (agentAddress, signer) => {
  const agentABI = [
    "function getPausedState() external view returns (bool)"
  ];
  
  const agentContract = new ethers.Contract(agentAddress, agentABI, signer);
  return await agentContract.getPausedState();
};

export const addFundsToAgent = async (agentAddress, amount, signer) => {
  const agentABI = [
    "function addFunds() external payable"
  ];
  
  try {
    toast.info("Adding funds to agent...");
    const agentContract = new ethers.Contract(agentAddress, agentABI, signer);
    const valueInWei = ethers.parseUnits(amount.toString(), "ether");
    const tx = await agentContract.addFunds({ value: valueInWei });
    await tx.wait();
    toast.success("Funds added successfully!");
    return tx;
  } catch (error) {
    console.error("Error adding funds:", error);
    toast.error("Failed to add funds to agent");
    throw error;
  }
};

export const withdrawFundsFromAgent = async (agentAddress, signer) => {
  const agentABI = [
    "function withdrawFunds() external"
  ];
  
  try {
    toast.info("Withdrawing funds from agent...");
    const agentContract = new ethers.Contract(agentAddress, agentABI, signer);
    const tx = await agentContract.withdrawFunds();
    await tx.wait();
    toast.success("Funds withdrawn successfully!");
    return tx;
  } catch (error) {
    console.error("Error withdrawing funds:", error);
    toast.error("Failed to withdraw funds from agent");
    throw error;
  }
};

export const getAgentFunds = async (agentAddress, signer) => {
  const agentABI = [
    "function getUserFunds() external view returns (uint256)"
  ];
  
  const agentContract = new ethers.Contract(agentAddress, agentABI, signer);
  const funds = await agentContract.getUserFunds();
  return ethers.formatEther(funds);
};

export const deleteAgent = async (agentAddress, agent, signer) => {
  const agentABI = [
    "function withdrawFunds() external",
    "function getUserFunds() external view returns (uint256)",
    "function getPausedState() external view returns (bool)"
  ];
  
  try {
    toast.info("Suspending agent and withdrawing all funds...");
    const agentContract = new ethers.Contract(agentAddress, agentABI, signer);
    
    const funds = await agentContract.getUserFunds();
    
    // Withdraw ETH if any
    if (funds > 0) {
      toast.info("Withdrawing remaining ETH...");
      const withdrawTx = await agentContract.withdrawFunds();
      await withdrawTx.wait();
      toast.success(`Withdrew ${ethers.formatEther(funds)} ETH from agent`);
    }
    
    // Check for token balances and inform user
    if (agent.tokenDetails && agent.tokenDetails.length > 0) {
      let hasTokens = false;
      for (const tokenDetail of agent.tokenDetails) {
        if (tokenDetail.balance && parseFloat(tokenDetail.balance) > 0) {
          hasTokens = true;
          break;
        }
      }
      
      if (hasTokens) {
        toast.warning("Agent has token balances. Execute trades to withdraw tokens before suspension.");
        return { funds: ethers.formatEther(funds), hasTokens: true };
      }
    }
    
    toast.success("Agent suspended successfully! All ETH funds have been withdrawn.");
    return { funds: ethers.formatEther(funds), hasTokens: false };
  } catch (error) {
    console.error("Error suspending agent:", error);
    if (error.code === 4001) {
      toast.error("Transaction rejected by user");
    } else {
      toast.error("Failed to suspend agent");
    }
    throw error;
  }
}; 