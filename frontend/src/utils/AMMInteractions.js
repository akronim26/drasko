import { ethers } from "ethers";
import { MOCK_AMM_CONTRACT_ADDRESS, MOCK_AMM_CONTRACT_ABI } from "../contracts/MockAMM.js";
import { MOCK_DAI_CONTRACT_ADDRESS, MOCK_DAI_CONTRACT_ABI } from "../contracts/MockDAI.js";
import { MOCK_WETH_CONTRACT_ADDRESS, MOCK_WETH_CONTRACT_ABI } from "../contracts/MockWETH.js";
import { MOCK_MKR_CONTRACT_ADDRESS, MOCK_MKR_CONTRACT_ABI } from "../contracts/MockMKR.js";
import { toast } from "react-toastify";

const tokenMap = {
  DAI: MOCK_DAI_CONTRACT_ADDRESS,
  WETH: MOCK_WETH_CONTRACT_ADDRESS,
  MKR: MOCK_MKR_CONTRACT_ADDRESS,
};

const tokenABIMap = {
  DAI: MOCK_DAI_CONTRACT_ABI,
  WETH: MOCK_WETH_CONTRACT_ABI,
  MKR: MOCK_MKR_CONTRACT_ABI,
};

const getAMMContract = (signer) => {
  return new ethers.Contract(MOCK_AMM_CONTRACT_ADDRESS, MOCK_AMM_CONTRACT_ABI, signer);
};

const getTokenContract = (tokenSymbol, signer) => {
  const tokenAddress = tokenMap[tokenSymbol];
  const tokenABI = tokenABIMap[tokenSymbol];
  return new ethers.Contract(tokenAddress, tokenABI, signer);
};

export const swapETHForTokens = async (tokenSymbol, ethAmount, minAmountOut, signer) => {
  try {
    toast.info(`Swapping ${ethAmount} ETH for ${tokenSymbol}...`);
    
    const ammContract = getAMMContract(signer);
    const tokenContract = getTokenContract(tokenSymbol, signer);
    
    const ethAmountWei = ethers.parseUnits(ethAmount.toString(), "ether");
    const minAmountOutWei = ethers.parseUnits(minAmountOut.toString(), "ether");
    
    const tx = await ammContract.swapETHForTokens(
      tokenContract.target,
      minAmountOutWei,
      { value: ethAmountWei }
    );
    
    toast.info("Transaction submitted! Waiting for confirmation...");
    const receipt = await tx.wait();
    toast.success("Swap completed successfully!");
    
    return receipt;
  } catch (error) {
    console.error("Error swapping ETH for tokens:", error);
    toast.error("Failed to swap ETH for tokens. Please try again.");
    throw error;
  }
};

export const swapTokensForETH = async (tokenSymbol, tokenAmount, minAmountOut, signer) => {
  try {
    toast.info(`Swapping ${tokenAmount} ${tokenSymbol} for ETH...`);
    
    const ammContract = getAMMContract(signer);
    const tokenContract = getTokenContract(tokenSymbol, signer);
    
    const tokenAmountWei = ethers.parseUnits(tokenAmount.toString(), "ether");
    const minAmountOutWei = ethers.parseUnits(minAmountOut.toString(), "ether");
    
    toast.info("Approving token spend...");
    const approveTx = await tokenContract.approve(ammContract.target, tokenAmountWei);
    await approveTx.wait();
    
    toast.info("Executing swap...");
    const tx = await ammContract.swapTokensForETH(
      tokenContract.target,
      tokenAmountWei,
      minAmountOutWei
    );
    
    toast.info("Transaction submitted! Waiting for confirmation...");
    const receipt = await tx.wait();
    toast.success("Swap completed successfully!");
    
    return receipt;
  } catch (error) {
    console.error("Error swapping tokens for ETH:", error);
    toast.error("Failed to swap tokens for ETH. Please try again.");
    throw error;
  }
};

export const getAmountOut = async (tokenSymbol, ethAmount, signer) => {
  const ammContract = getAMMContract(signer);
  const tokenContract = getTokenContract(tokenSymbol, signer);
  
  const ethAmountWei = ethers.parseUnits(ethAmount.toString(), "ether");
  const amountOutWei = await ammContract.getAmountOut(tokenContract.target, ethAmountWei);
  
  return ethers.formatEther(amountOutWei);
};

export const getPoolInfo = async (tokenSymbol, signer) => {
  const ammContract = getAMMContract(signer);
  const tokenContract = getTokenContract(tokenSymbol, signer);
  
  const pool = await ammContract.getPool(tokenContract.target);
  
  return {
    token: pool.token,
    ethReserve: ethers.formatEther(pool.ethReserve),
    tokenReserve: ethers.formatEther(pool.tokenReserve),
    totalSupply: ethers.formatEther(pool.totalSupply)
  };
};

export const getTokenBalance = async (tokenSymbol, address, signer) => {
  const tokenContract = getTokenContract(tokenSymbol, signer);
  const balance = await tokenContract.balanceOf(address);
  return ethers.formatEther(balance);
};

export const getTokenAllowance = async (tokenSymbol, owner, spender, signer) => {
  const tokenContract = getTokenContract(tokenSymbol, signer);
  const allowance = await tokenContract.allowance(owner, spender);
  return ethers.formatEther(allowance);
}; 