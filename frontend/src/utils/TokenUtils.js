import { ethers } from "ethers";

const ERC20_ABI = [
    "function name() external view returns (string)",
    "function symbol() external view returns (string)",
    "function decimals() external view returns (uint8)",
    "function totalSupply() external view returns (uint256)",
    "function balanceOf(address) external view returns (uint256)",
    "function transfer(address,uint256) external returns (bool)",
    "function allowance(address,address) external view returns (uint256)",
    "function approve(address,uint256) external returns (bool)",
    "function transferFrom(address,address,uint256) external returns (bool)"
];

export const getTokenSymbol = async (tokenAddress, signer) => {
    try {
        const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
        const symbol = await tokenContract.symbol();
        return symbol;
    } catch (error) {
        console.error(`Error getting token symbol for ${tokenAddress}:`, error);
        return 'Unknown';
    }
};

export const getTokenName = async (tokenAddress, signer) => {
    try {
        const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
        const name = await tokenContract.name();
        return name;
    } catch (error) {
        console.error(`Error getting token name for ${tokenAddress}:`, error);
        return 'Unknown Token';
    }
};

export const getTokenBalance = async (tokenAddress, accountAddress, signer) => {
    try {
        const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
        const balance = await tokenContract.balanceOf(accountAddress);
        const decimals = await tokenContract.decimals();
        return ethers.formatUnits(balance, decimals);
    } catch (error) {
        console.error(`Error getting token balance for ${tokenAddress}:`, error);
        return '0';
    }
};

export const getTokenDecimals = async (tokenAddress, signer) => {
    try {
        const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
        const decimals = await tokenContract.decimals();
        return decimals;
    } catch (error) {
        console.error(`Error getting token decimals for ${tokenAddress}:`, error);
        return 18;
    }
}; 