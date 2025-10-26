#!/usr/bin/env node

import { z } from 'zod';
import readline from 'readline';
import { config } from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load environment variables from .env file
config();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Simple sentiment analysis using Gemini API
async function analyzeSentiment(text: string): Promise<number> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `You are a crypto trading sentiment analyzer. Analyze the following message and return only a number between -1 and 1 representing how positive or negative this message is toward ETH/USDC trading. 

-1 = very negative/bearish
0 = neutral
1 = very positive/bullish

Message: "${text}"

Return only the number, no other text:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const sentimentText = response.text().trim();
    
    // Add debug logging
    console.log('Gemini response:', sentimentText);
    
    const sentimentScore = parseFloat(sentimentText);
    
    if (isNaN(sentimentScore)) {
      console.error('Could not parse sentiment score from:', sentimentText);
      return 0;
    }
    
    // Ensure the score is within bounds
    return Math.max(-1, Math.min(1, sentimentScore));
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    return 0;
  }
}

// Generate trade plan based on sentiment
function generateTradePlan(sentimentScore: number, source: string) {
  const now = new Date().toISOString();
  const action = sentimentScore > 0 ? 'buy' : 'sell';
  
  return {
    action,
    tokenPair: 'ETH/USDC',
    amount: '0.1 ETH',
    priceThreshold: action === 'buy' ? '3000 USD' : '3500 USD',
    timestamp: now,
    sentimentScore,
    source,
  };
}

// Main trading bot class
class SimpleTradingBot {
  private rl: readline.Interface;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    this.rl.on('SIGINT', () => {
      this.rl.close();
      process.exit(0);
    });
  }

  async analyzeMessage(text: string, source: string = 'user') {
    console.log(`\n🤖 Analyzing: "${text}"`);
    
    const sentimentScore = await analyzeSentiment(text);
    console.log(`📊 Sentiment Score: ${sentimentScore.toFixed(3)}`);
    
    if (Math.abs(sentimentScore) < 0.3) {
      console.log('❌ No strong signal detected (threshold: 0.3)');
      return null;
    }
    
    const tradePlan = generateTradePlan(sentimentScore, source);
    console.log('✅ Strong signal detected! Generating trade plan...');
    console.log(`📈 Trade Plan:`);
    console.log(`   Action: ${tradePlan.action.toUpperCase()}`);
    console.log(`   Pair: ${tradePlan.tokenPair}`);
    console.log(`   Amount: ${tradePlan.amount}`);
    console.log(`   Price Threshold: ${tradePlan.priceThreshold}`);
    console.log(`   Sentiment: ${tradePlan.sentimentScore.toFixed(3)}`);
    console.log(`   Source: ${tradePlan.source}`);
    console.log(`   Timestamp: ${tradePlan.timestamp}`);
    
    return tradePlan;
  }

  async batchAnalyze(posts: Array<{text: string, source: string}>) {
    console.log(`\n🔄 Starting batch analysis of ${posts.length} posts...`);
    
    const results = [];
    let strongSignals = 0;
    
    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      console.log(`\n--- Analyzing Post ${i + 1}/${posts.length} ---`);
      
      const tradePlan = await this.analyzeMessage(post.text, post.source);
      
      if (tradePlan) {
        strongSignals++;
        results.push({
          post: { text: post.text, source: post.source },
          tradePlan,
          hasSignal: true
        });
      } else {
        results.push({
          post: { text: post.text, source: post.source },
          tradePlan: null,
          hasSignal: false
        });
      }
    }
    
    console.log(`\n📋 Batch Analysis Complete!`);
    console.log(`   Total Posts: ${posts.length}`);
    console.log(`   Strong Signals: ${strongSignals}`);
    console.log(`   Success Rate: ${((strongSignals / posts.length) * 100).toFixed(1)}%`);
    
    return {
      totalPosts: posts.length,
      strongSignals,
      results
    };
  }

  start() {
    console.log('🤖 Simple Trading Bot Started!');
    console.log('================================');
    console.log('Type "exit" to quit');
    console.log('Type "batch" to test batch analysis');
    console.log('Type any crypto-related message to analyze sentiment');
    console.log('');
    
    this.askForInput();
  }

  private askForInput() {
    this.rl.question('You: ', async (input) => {
      if (input.toLowerCase() === 'exit') {
        this.rl.close();
        process.exit(0);
      }
      
      if (input.toLowerCase() === 'batch') {
        await this.testBatchAnalysis();
      } else {
        await this.analyzeMessage(input);
      }
      
      console.log('');
      this.askForInput();
    });
  }

  private async testBatchAnalysis() {
    const testPosts = [
      { text: 'ETH is going to moon!', source: 'Twitter' },
      { text: 'SOL looking bearish today', source: 'Reddit' },
      { text: 'BTC seems to be consolidating', source: 'Discord' },
      { text: 'USDC is stable as always', source: 'Telegram' },
      { text: 'ETH looking strong today', source: 'Twitter' }
    ];
    
    await this.batchAnalyze(testPosts);
  }
}

// Start the bot
async function main() {
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY environment variable is required!');
    console.log('Please set it in your .env file or export it:');
    console.log('export GEMINI_API_KEY=your_gemini_api_key_here');
    console.log('');
    console.log('Get your free Gemini API key from: https://makersuite.google.com/app/apikey');
    process.exit(1);
  }
  
  const bot = new SimpleTradingBot();
  bot.start();
}

main().catch(console.error); 