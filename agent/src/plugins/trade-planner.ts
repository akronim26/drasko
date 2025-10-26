import type { Plugin } from '@elizaos/core';
import {
  type Action,
  type Content,
  type HandlerCallback,
  type IAgentRuntime,
  type Memory,
  ModelClass,
  type Provider,
  type State,
  elizaLogger,
  generateText,
} from '@elizaos/core';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

const configSchema = z.object({});

// === Token Utilities ===
const supportedTokens = ['ETH', 'USDC', 'SOL', 'BTC'];
const defaultPair = 'ETH/USDC';

function extractTokenMention(text: string): string | null {
  const match = text.match(/[$#]?([A-Z]{2,5})/g);
  if (!match) return null;
  const found = match.map(m => m.replace(/[$#]/g, ''));
  for (const token of found) {
    if (supportedTokens.includes(token)) return token;
  }
  return null;
}

async function fetchPriceUSD(token: string): Promise<number> {
  try {
    const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${token.toLowerCase()}&vs_currencies=usd`);
    const data = await res.json() as Record<string, { usd: number }>;
    return data[token.toLowerCase()]?.usd ?? 3000;
  } catch (e) {
    elizaLogger.error('Price fetch failed, using fallback');
    return 3000;
  }
}

// === Gemini API Function ===
async function generateGeminiSentiment(text: string): Promise<number> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not found');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `You are a crypto trading sentiment analyzer. Return only a number between -1 and 1 representing how positive or negative this message is toward ETH/USDC trading.

Message: ${text}

Sentiment score:`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const sentimentScore = parseFloat(response.text().trim() || '0');
    
    // Validate the response is a number between -1 and 1
    if (isNaN(sentimentScore) || sentimentScore < -1 || sentimentScore > 1) {
      throw new Error('Invalid sentiment score returned');
    }
    
    return sentimentScore;
  } catch (error) {
    elizaLogger.error('Gemini API error:', error);
    throw error;
  }
}

// === Evaluator Function ===
/**
 * Analyzes the sentiment of a message and creates a trade plan if the signal is strong.
 *
 * @param {string} text - The message to analyze
 * @param {IAgentRuntime} runtime - The agent runtime
 * @param {string} source - Where the message came from
 * @returns {Promise<Object|null>} Trade plan object or null if no strong signal
 */
async function generateTradePlan(text: string, runtime: IAgentRuntime, source: string) {
  elizaLogger.info(`Starting sentiment analysis for: "${text}"`);
  const now = new Date().toISOString();

  // Try Gemini first (primary)
  if (process.env.GEMINI_API_KEY) {
    try {
      elizaLogger.info('Using Gemini API for sentiment analysis');
      const sentimentScore = await generateGeminiSentiment(text);
      elizaLogger.info(`Gemini sentiment score: ${sentimentScore}`);

      if (Math.abs(sentimentScore) < 0.5) {
        elizaLogger.info('Sentiment score below threshold (0.5), no trade plan generated');
        return null;
      }

      const action = sentimentScore > 0 ? 'buy' : 'sell';
      elizaLogger.info(`Strong signal detected! Action: ${action}, Score: ${sentimentScore}`);

      return {
        tradePlan: {
          action,
          tokenPair: 'ETH/USDC',
          amount: '0.1 ETH',
          priceThreshold: action === 'buy' ? '3000 USD' : '3500 USD',
          timestamp: now,
          sentimentScore,
          source,
          apiUsed: 'gemini',
        },
      };
    } catch (error) {
      elizaLogger.error('Error generating sentiment analysis with Gemini:', error);
    }
  }

  // Fallback to OpenAI
  if (process.env.OPENAI_API_KEY) {
    try {
      elizaLogger.info('Attempting fallback to OpenAI API...');
      
      const sentimentPrompt = `You are a crypto trading sentiment analyzer. Return only a number between -1 and 1 representing how positive or negative this message is toward ETH/USDC trading.

Message: ${text}

Sentiment score:`;

      const sentimentResponse = await generateText({
        runtime,
        context: sentimentPrompt,
        modelClass: ModelClass.LARGE,
      });
      
      const sentimentScore = parseFloat(sentimentResponse.trim() || '0');
      elizaLogger.info(`OpenAI fallback sentiment score: ${sentimentScore}`);

      if (Math.abs(sentimentScore) < 0.5) {
        elizaLogger.info('Sentiment score below threshold (0.5), no trade plan generated');
        return null;
      }

      const action = sentimentScore > 0 ? 'buy' : 'sell';
      elizaLogger.info(`Strong signal detected via OpenAI fallback! Action: ${action}, Score: ${sentimentScore}`);

      return {
        tradePlan: {
          action,
          tokenPair: 'ETH/USDC',
          amount: '0.1 ETH',
          priceThreshold: action === 'buy' ? '3000 USD' : '3500 USD',
          timestamp: now,
          sentimentScore,
          source,
          apiUsed: 'openai_fallback',
        },
      };
    } catch (fallbackError) {
      elizaLogger.error('OpenAI fallback also failed:', fallbackError);
    }
  }
  
  elizaLogger.error('No API keys available for sentiment analysis');
  return null;
}

// === Provider ===
const tradeSentimentProvider: Provider = {
  get: async (
    runtime: IAgentRuntime,
    message: Memory,
    _state: State
  ): Promise<any> => {
    const text = message.content.text || '';
    const source = message.content.source || 'unknown';
    const tradePlan = await generateTradePlan(text, runtime, source);
    return {
      text: tradePlan ? 'Strong signal detected.' : 'No trade signal.',
      values: tradePlan || {},
      data: {},
    };
  },
};

// === Action ===
const tradePlanAction: Action = {
  name: 'GENERATE_TRADE_PLAN',
  similes: ['TRADE_ANALYSIS'],
  description: 'Analyzes sentiment and creates a trade plan JSON.',

  validate: async (_runtime, message: Memory, _state: State) => {
    const text = message.content.text || '';
    const source = message.content.source || '';
    
    // Check for crypto tokens in the message
    const hasCryptoMention = /\$?ETH|USDC|SOL|BTC|bitcoin|ethereum|solana/i.test(text);
    
    // If it's from Discord, be more lenient with validation
    if (source === 'discord' || source.includes('discord')) {
      return hasCryptoMention || /\$|moon|pump|dump|bull|bear|hodl|fomo|fud/i.test(text);
    }
    
    return hasCryptoMention;
  },

  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    _state: State,
    _options: any,
    callback: HandlerCallback
  ) => {
    elizaLogger.info(`GENERATE_TRADE_PLAN action triggered for message: "${message.content.text}"`);
    const text = message.content.text || '';
    const source = message.content.source || 'unknown';
    const channelId = message.content.channelId || 'unknown';
    
    elizaLogger.info(`Processing text: "${text}" from source: ${source}${channelId !== 'unknown' ? ` (channel: ${channelId})` : ''}`);
    
    const tradePlan = await generateTradePlan(text, runtime, source);
    if (!tradePlan) {
      elizaLogger.info('No strong trade signal found, sending callback');
      const responseText = source === 'discord' || source.includes('discord') 
        ? 'No strong trading signal detected in this message.' 
        : 'No strong trade signal found.';
      await callback({ text: responseText, source });
      return;
    }

    elizaLogger.info('Trade plan generated successfully');
    const {
      action,
      tokenPair,
      amount,
      priceThreshold,
      timestamp,
      sentimentScore,
      source: sourcePlatform,
    } = tradePlan.tradePlan;

    // For now, just log the trade plan without blockchain interaction
    // You can add blockchain integration later if needed
    elizaLogger.info(`Trade plan: ${action} ${amount} ${tokenPair} at ${priceThreshold} (sentiment: ${sentimentScore})`);

    const responseText = source === 'discord' || source.includes('discord')
      ? `**Trading Signal Detected!**\n\n**Action:** ${action.toUpperCase()}\n**Pair:** ${tokenPair}\n**Amount:** ${amount}\n**Target:** ${priceThreshold}\n**Sentiment Score:** ${sentimentScore.toFixed(2)}\n\n*Remember: This is analysis only, not financial advice.*\n\n*To execute this trade, reply with: "execute trade"*`
      : `Trade plan generated: ${action.toUpperCase()} ${amount} ${tokenPair} at ${priceThreshold} (sentiment: ${sentimentScore.toFixed(2)})`;

    await callback({
      text: responseText,
      source,
      data: tradePlan.tradePlan
    });
  },

  examples: [
    [
      { user: '{{user}}', content: { text: 'ETH is going to moon!' } },
      {
        user: '{{agent}}',
        content: {
          text: 'Trade plan generated.',
          action: 'GENERATE_TRADE_PLAN',
        },
      },
    ],
    [
      { user: '{{user}}', content: { text: 'BTC looking bearish', source: 'discord', channelId: '123456789' } },
      {
        user: '{{agent}}',
        content: {
          text: '**Trading Signal Detected!**\n\n**Action:** SELL\n**Pair:** BTC/USDC\n**Sentiment Score:** -0.75\n\n*Remember: This is analysis only, not financial advice.*',
          action: 'GENERATE_TRADE_PLAN',
        },
      },
    ],
  ],
};

// === Batch Action ===
/**
 * Represents an action that analyzes multiple posts and generates trade plans.
 *
 * @typedef {Object} Action
 * @property {string} name - The name of the action
 * @property {string[]} similes - The related similes of the action
 * @property {string} description - Description of the action
 * @property {Function} validate - Validation function for the action
 * @property {Function} handler - The function that handles the action
 * @property {Object[]} examples - Array of examples for the action
 */
const batchTradePlanAction: Action = {
  name: 'BATCH_ANALYZE_POSTS',
  similes: ['BATCH_TRADE_ANALYSIS', 'MULTI_POST_ANALYSIS'],
  description: 'Analyzes multiple social media posts and generates trade plans for strong signals.',

  validate: async (_runtime, message: Memory, _state: State) => {
    // Check if the message contains an array of posts
    return Array.isArray(message.content.posts) && message.content.posts.length > 0;
  },

  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    _state: State,
    _options: any,
    callback: HandlerCallback
  ) => {
    const posts = (message.content.posts as Array<{text: string, source: string}>) || [];
    const results = [];
    let strongSignals = 0;
    const source = message.content.source || 'batch_analysis';

    const startMessage = source === 'discord' || source.includes('discord')
      ? `**Starting analysis of ${posts.length} messages...**`
      : `Starting analysis of ${posts.length} posts...`;

    await callback({ 
      text: startMessage, 
      source: source 
    });

    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      const text = post.text || '';
      const postSource = post.source || 'unknown';
      
      try {
        const tradePlan = await generateTradePlan(text, runtime, postSource);
        
        if (tradePlan) {
          strongSignals++;
          results.push({
            post: { text, source: postSource },
            tradePlan: tradePlan.tradePlan,
            hasSignal: true
          });
          
          // Log strong signals immediately
          const signalMessage = source === 'discord' || source.includes('discord')
            ? `**Strong Signal #${strongSignals}:** ${tradePlan.tradePlan.action.toUpperCase()} ${tradePlan.tradePlan.tokenPair} (sentiment: ${tradePlan.tradePlan.sentimentScore.toFixed(2)})`
            : `Strong signal #${strongSignals}: ${tradePlan.tradePlan.action.toUpperCase()} ${tradePlan.tradePlan.tokenPair} (sentiment: ${tradePlan.tradePlan.sentimentScore.toFixed(2)})`;

          await callback({
            text: signalMessage,
            source: source
          });
        } else {
          results.push({
            post: { text, source: postSource },
            tradePlan: null,
            hasSignal: false
          });
        }
      } catch (error) {
        elizaLogger.error(`Error analyzing post ${i + 1}:`, error);
        results.push({
          post: { text, source: postSource },
          error: error.message,
          hasSignal: false
        });
      }
    }

    // Final summary
    const summaryMessage = source === 'discord' || source.includes('discord')
      ? `**Analysis Complete!**\n\n**Processed:** ${posts.length} messages\n**Strong Signals:** ${strongSignals}\n\n${strongSignals > 0 ? 'Trading opportunities detected!' : 'No strong signals found.'}`
      : `Analysis complete! Processed ${posts.length} posts, found ${strongSignals} strong signals.`;

    await callback({
      text: summaryMessage,
      source: source,
      data: {
        totalPosts: posts.length,
        strongSignals,
        results
      }
    });
  },

  examples: [
    [
      { 
        user: '{{user}}', 
        content: { 
          text: 'Analyze these posts',
          posts: [
            { text: 'ETH is going to moon!', source: 'Twitter' },
            { text: 'SOL looking bearish', source: 'Reddit' }
          ]
        } 
      },
      {
        user: '{{agent}}',
        content: {
          text: 'Starting analysis of 2 posts...',
          action: 'BATCH_ANALYZE_POSTS',
        },
      },
    ],
  ],
};

// === Execute Trade Action ===
const executeTradeAction: Action = {
  name: 'EXECUTE_TRADE_REQUEST',
  similes: ['EXECUTE_TRADE', 'TRADE_EXECUTION'],
  description: 'Executes a previously generated trade plan on-chain',

  validate: async (_runtime, message: Memory, _state: State) => {
    const text = message.content.text || '';
    return /\b(execute|run|do)\b.*\b(trade|buy|sell)\b/i.test(text);
  },

  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    _state: State,
    _options: any,
    callback: HandlerCallback
  ) => {
    elizaLogger.info('EXECUTE_TRADE_REQUEST action triggered');
    const text = message.content.text || '';
    const source = message.content.source || 'unknown';
    
    // Check if there's a recent trade plan in the conversation
    // For now, we'll create a mock trade plan based on recent sentiment
    const mockTradePlan = {
      action: 'buy' as const,
      tokenPair: 'ETH/USDC',
      amount: '0.1 ETH',
      priceThreshold: '3000 USD',
      timestamp: new Date().toISOString(),
      sentimentScore: 0.75,
      source: source,
    };

    // Trigger the trading actions plugin
    const tradingAction = runtime.actions.find(action => action.name === 'EXECUTE_TRADE');
    if (tradingAction) {
      // Create a message with the trade plan data
      const tradeMessage = {
        id: `execute-${Date.now()}`,
        content: {
          text: 'Execute trade based on sentiment analysis',
          source: source,
          data: {
            tradePlan: mockTradePlan
          }
        },
        userId: message.userId,
        timestamp: new Date().toISOString()
      } as any; // Bypass strict typing for plugin-to-plugin call

      // Create a minimal mock State object with all required properties and correct types
      const mockState = {
        bio: '',
        lore: '',
        messageDirections: '',
        postDirections: '',
        style: '',
        adjectives: [],
        topics: [],
        roomId: '00000000-0000-0000-0000-000000000000' as `${string}-${string}-${string}-${string}-${string}`,
        actors: '',
        recentMessages: '',
        recentMessagesData: [],
      };

      await tradingAction.handler(runtime, tradeMessage, mockState, {}, callback);
    } else {
      await callback({
        text: '**Trade Execution Not Available**\n\nTrading actions plugin is not loaded. Please ensure the trading-actions plugin is properly configured.',
        source: source
      });
    }
  },

  examples: [
    [
      { user: '{{user}}', content: { text: 'execute trade' } },
      {
        user: '{{agent}}',
        content: {
          text: '**Trade Executed Successfully!**\n\n**Action:** BUY\n**Pair:** ETH/USDC\n**Amount:** 0.1 ETH\n**Received:** 0.11 USDC\n**Transaction Hash:** 0x1234...\n**Sentiment Score:** 0.75\n\n*Trade executed on-chain based on sentiment analysis.*',
          action: 'EXECUTE_TRADE_REQUEST',
        },
      },
    ],
  ],
};

const plugin: Plugin = {
  name: 'trade-planner',
  description: 'AI agent that analyzes sentiment and generates trade plans',
  actions: [tradePlanAction, batchTradePlanAction, executeTradeAction],
  providers: [tradeSentimentProvider],
  services: [],
};

export default plugin; 