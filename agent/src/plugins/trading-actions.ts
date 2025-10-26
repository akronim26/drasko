import type { Plugin } from '@elizaos/core';
import {
  type Action,
  type HandlerCallback,
  type IAgentRuntime,
  type Memory,
  type State,
  elizaLogger,
} from '@elizaos/core';
import { z } from 'zod';

// === Schemas ===
const TradeSchema = z.object({
  fromAsset: z.string().describe('The asset to trade from (e.g., ETH, USDC, SOL)'),
  toAsset: z.string().describe('The asset to trade to (e.g., ETH, USDC, SOL)'),
  amount: z.string().describe('The amount to trade'),
  action: z.enum(['buy', 'sell']).describe('The trading action (buy or sell)'),
  sentimentScore: z.number().optional().describe('The sentiment score that triggered this trade'),
  source: z.string().optional().describe('The source that triggered this trade (e.g., discord)'),
});

const GetBalanceSchema = z.object({
  asset: z.string().describe('The asset to check balance for (e.g., ETH, USDC, SOL)'),
});

const TransferSchema = z.object({
  asset: z.string().describe('The asset to transfer (e.g., ETH, USDC, SOL)'),
  amount: z.string().describe('The amount to transfer'),
  destination: z.string().describe('The destination address or ENS name'),
});

// === Mock Trading Functions (Replace with real implementation) ===
interface TradeResult {
  success: boolean;
  transactionHash?: string;
  amountReceived?: string;
  error?: string;
}

interface BalanceResult {
  asset: string;
  balance: string;
  formattedBalance: string;
}

interface TransferResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
}

// Mock trading function - replace with real CDP integration
async function executeTrade(
  fromAsset: string,
  toAsset: string,
  amount: string,
  action: 'buy' | 'sell'
): Promise<TradeResult> {
  elizaLogger.info(`Executing ${action} trade: ${amount} ${fromAsset} -> ${toAsset}`);
  
  try {
    // TODO: Replace with real CDP integration
    // const tradeResult = await cdpWallet.createTrade({
    //   amount: amount,
    //   fromAssetId: getAssetId(fromAsset),
    //   toAssetId: getAssetId(toAsset),
    // });
    
    // Mock successful trade
    const mockTxHash = `0x${Math.random().toString(16).substring(2, 66)}`;
    const mockAmountReceived = (parseFloat(amount) * (action === 'buy' ? 1.1 : 0.9)).toFixed(6);
    
    elizaLogger.info(`Trade executed successfully: ${mockTxHash}`);
    
    return {
      success: true,
      transactionHash: mockTxHash,
      amountReceived: mockAmountReceived,
    };
  } catch (error) {
    elizaLogger.error('Trade execution failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Mock balance function - replace with real CDP integration
async function getBalance(asset: string): Promise<BalanceResult> {
  elizaLogger.info(`Getting balance for ${asset}`);
  
  try {
    // TODO: Replace with real CDP integration
    // const balance = await cdpWallet.getBalance(asset);
    
    // Mock balance
    const mockBalance = (Math.random() * 1000).toFixed(6);
    
    return {
      asset,
      balance: mockBalance,
      formattedBalance: `${mockBalance} ${asset}`,
    };
  } catch (error) {
    elizaLogger.error('Failed to get balance:', error);
    throw error;
  }
}

// Mock transfer function - replace with real CDP integration
async function transferAsset(
  asset: string,
  amount: string,
  destination: string
): Promise<TransferResult> {
  elizaLogger.info(`Transferring ${amount} ${asset} to ${destination}`);
  
  try {
    // TODO: Replace with real CDP integration
    // const transferResult = await cdpWallet.transfer({
    //   asset: asset,
    //   amount: amount,
    //   destination: destination,
    // });
    
    // Mock successful transfer
    const mockTxHash = `0x${Math.random().toString(16).substring(2, 66)}`;
    
    elizaLogger.info(`Transfer executed successfully: ${mockTxHash}`);
    
    return {
      success: true,
      transactionHash: mockTxHash,
    };
  } catch (error) {
    elizaLogger.error('Transfer failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// === Actions ===

/**
 * Executes a trade based on sentiment analysis
 */
const executeTradeAction: Action = {
  name: 'EXECUTE_TRADE',
  similes: ['TRADE_EXECUTION', 'ONCHAIN_TRADE'],
  description: 'Executes an on-chain trade based on sentiment analysis and trading signals',

  validate: async (_runtime, message: Memory, _state: State) => {
    // Check if the message contains trade plan data
    return message.content.data && (message.content.data as any).tradePlan;
  },

  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    _state: State,
    _options: any,
    callback: HandlerCallback
  ) => {
    elizaLogger.info('EXECUTE_TRADE action triggered');
    
    try {
      const tradePlan = (message.content.data as any)?.tradePlan;
      if (!tradePlan) {
        await callback({ 
          text: 'No trade plan found in message data.', 
          source: message.content.source || 'unknown' 
        });
        return;
      }

      const { action, tokenPair, amount, sentimentScore, source } = tradePlan;
      
      // Parse token pair (e.g., "ETH/USDC" -> fromAsset: "ETH", toAsset: "USDC")
      const [fromAsset, toAsset] = tokenPair.split('/');
      
      if (!fromAsset || !toAsset) {
        await callback({ 
          text: 'Invalid token pair format. Expected format: TOKEN1/TOKEN2', 
          source: source || 'unknown' 
        });
        return;
      }

      // Execute the trade
      const tradeResult = await executeTrade(fromAsset, toAsset, amount, action);
      
      if (tradeResult.success) {
        const responseText = `**Trade Executed Successfully!**\n\n**Action:** ${action.toUpperCase()}\n**Pair:** ${tokenPair}\n**Amount:** ${amount}\n**Received:** ${tradeResult.amountReceived} ${toAsset}\n**Transaction Hash:** ${tradeResult.transactionHash}\n**Sentiment Score:** ${sentimentScore?.toFixed(2) || 'N/A'}\n\n*Trade executed on-chain based on sentiment analysis.*`;
        
        await callback({
          text: responseText,
          source: source || 'unknown',
          data: {
            tradeResult,
            tradePlan
          }
        });
      } else {
        await callback({
          text: `**Trade Execution Failed**\n\nError: ${tradeResult.error}\n\n*Please check your wallet balance and try again.*`,
          source: source || 'unknown',
          data: { tradeResult, tradePlan }
        });
      }
      
    } catch (error) {
      elizaLogger.error('Error in EXECUTE_TRADE handler:', error);
      await callback({
        text: `**Trade Execution Error**\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}`,
        source: message.content.source || 'unknown'
      });
    }
  },

  examples: [
    [
      { 
        user: '{{user}}', 
        content: { 
          text: 'Execute trade based on sentiment',
          data: {
            tradePlan: {
              action: 'buy',
              tokenPair: 'ETH/USDC',
              amount: '0.1 ETH',
              sentimentScore: 0.85,
              source: 'discord'
            }
          }
        } 
      },
      {
        user: '{{agent}}',
        content: {
          text: '**Trade Executed Successfully!**\n\n**Action:** BUY\n**Pair:** ETH/USDC\n**Amount:** 0.1 ETH\n**Received:** 0.11 USDC\n**Transaction Hash:** 0x1234...\n**Sentiment Score:** 0.85\n\n*Trade executed on-chain based on sentiment analysis.*',
          action: 'EXECUTE_TRADE',
        },
      },
    ],
  ],
};

/**
 * Gets the balance of a specific asset
 */
const getBalanceAction: Action = {
  name: 'GET_BALANCE',
  similes: ['CHECK_BALANCE', 'BALANCE_QUERY'],
  description: 'Gets the current balance of a specific asset in the wallet',

  validate: async (_runtime, message: Memory, _state: State) => {
    const text = message.content.text || '';
    return /\b(balance|check|get)\b.*\b(eth|btc|sol|usdc|token)\b/i.test(text);
  },

  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    _state: State,
    _options: any,
    callback: HandlerCallback
  ) => {
    elizaLogger.info('GET_BALANCE action triggered');
    
    try {
      const text = message.content.text || '';
      const source = message.content.source || 'unknown';
      
      // Extract asset from message (simple regex for demo)
      const assetMatch = text.match(/\b(eth|btc|sol|usdc|token)\b/i);
      const asset = assetMatch ? assetMatch[1].toUpperCase() : 'ETH';
      
      const balanceResult = await getBalance(asset);
      
      const responseText = `**Balance Check**\n\n**Asset:** ${balanceResult.asset}\n**Balance:** ${balanceResult.formattedBalance}`;
      
      await callback({
        text: responseText,
        source: source,
        data: { balanceResult }
      });
      
    } catch (error) {
      elizaLogger.error('Error in GET_BALANCE handler:', error);
      await callback({
        text: `**Balance Check Failed**\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}`,
        source: message.content.source || 'unknown'
      });
    }
  },

  examples: [
    [
      { user: '{{user}}', content: { text: 'Check my ETH balance' } },
      {
        user: '{{agent}}',
        content: {
          text: '**Balance Check**\n\n**Asset:** ETH\n**Balance:** 1.234567 ETH',
          action: 'GET_BALANCE',
        },
      },
    ],
  ],
};

/**
 * Transfers assets to another address
 */
const transferAction: Action = {
  name: 'TRANSFER_ASSET',
  similes: ['SEND_ASSET', 'TRANSFER_TOKENS'],
  description: 'Transfers a specified amount of an asset to another address',

  validate: async (_runtime, message: Memory, _state: State) => {
    const text = message.content.text || '';
    return /\b(transfer|send)\b.*\b(eth|btc|sol|usdc)\b.*\b(0x[a-fA-F0-9]{40}|[a-zA-Z0-9]+\.eth)\b/i.test(text);
  },

  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    _state: State,
    _options: any,
    callback: HandlerCallback
  ) => {
    elizaLogger.info('TRANSFER_ASSET action triggered');
    
    try {
      const text = message.content.text || '';
      const source = message.content.source || 'unknown';
      
      // Extract transfer details from message (simple regex for demo)
      const assetMatch = text.match(/\b(eth|btc|sol|usdc)\b/i);
      const amountMatch = text.match(/(\d+(?:\.\d+)?)\s*(eth|btc|sol|usdc)/i);
      const addressMatch = text.match(/(0x[a-fA-F0-9]{40}|[a-zA-Z0-9]+\.eth)/i);
      
      if (!assetMatch || !amountMatch || !addressMatch) {
        await callback({
          text: '**Transfer Failed**\n\nPlease specify: asset, amount, and destination address\n\nExample: "Transfer 0.1 ETH to 0x1234..."',
          source: source
        });
        return;
      }
      
      const asset = assetMatch[1].toUpperCase();
      const amount = amountMatch[1];
      const destination = addressMatch[1];
      
      const transferResult = await transferAsset(asset, amount, destination);
      
      if (transferResult.success) {
        const responseText = `**Transfer Successful!**\n\n**Asset:** ${asset}\n**Amount:** ${amount}\n**Destination:** ${destination}\n**Transaction Hash:** ${transferResult.transactionHash}`;
        
        await callback({
          text: responseText,
          source: source,
          data: { transferResult }
        });
      } else {
        await callback({
          text: `**Transfer Failed**\n\nError: ${transferResult.error}`,
          source: source,
          data: { transferResult }
        });
      }
      
    } catch (error) {
      elizaLogger.error('Error in TRANSFER_ASSET handler:', error);
      await callback({
        text: `**Transfer Error**\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}`,
        source: message.content.source || 'unknown'
      });
    }
  },

  examples: [
    [
      { user: '{{user}}', content: { text: 'Transfer 0.1 ETH to 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6' } },
      {
        user: '{{agent}}',
        content: {
          text: '**Transfer Successful!**\n\n**Asset:** ETH\n**Amount:** 0.1\n**Destination:** 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6\n**Transaction Hash:** 0x1234...',
          action: 'TRANSFER_ASSET',
        },
      },
    ],
  ],
};

// === Plugin Export ===
const tradingActionsPlugin: Plugin = {
  name: 'trading-actions',
  description: 'On-chain trading actions for executing trades, checking balances, and transferring assets',
  actions: [executeTradeAction, getBalanceAction, transferAction],
  providers: [],
  services: [],
};

export default tradingActionsPlugin; 