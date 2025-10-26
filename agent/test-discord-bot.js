#!/usr/bin/env node

/**
 * Simple test script to verify Discord bot integration
 * This script simulates Discord messages to test the trading bot
 */

import dotenv from 'dotenv';
import { DirectClient } from "@elizaos/client-direct";
import { AgentRuntime, elizaLogger, stringToUuid } from "@elizaos/core";
import { bootstrapPlugin } from "@elizaos/plugin-bootstrap";
import { createNodePlugin } from "@elizaos/plugin-node";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { initializeDbCache } from "./src/cache/index.ts";
import { character } from "./src/character.ts";
import { initializeClients } from "./src/clients/index.ts";
import { getTokenForProvider } from "./src/config/index.ts";
import { initializeDatabase } from "./src/database/index.ts";
import tradePlannerPlugin from "./src/plugins/trade-planner.ts";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test messages that simulate Discord messages
const testMessages = [
  {
    text: "ETH is going to moon! 🚀",
    source: "discord",
    channelId: "test-channel-1",
    expected: "should trigger BUY signal"
  },
  {
    text: "BTC looking bearish today",
    source: "discord", 
    channelId: "test-channel-2",
    expected: "should trigger SELL signal"
  },
  {
    text: "SOL might be overbought",
    source: "discord",
    channelId: "test-channel-3", 
    expected: "should trigger SELL signal"
  },
  {
    text: "Just had coffee, feeling good!",
    source: "discord",
    channelId: "test-channel-4",
    expected: "should NOT trigger any signal"
  },
  {
    text: "USDC stable as always",
    source: "discord",
    channelId: "test-channel-5",
    expected: "should NOT trigger signal (stablecoin)"
  }
];

async function testDiscordIntegration() {
  console.log("Testing Discord Trading Bot Integration\n");
  
  try {
    // Check environment variables
    const requiredEnvVars = ['GEMINI_API_KEY', 'DISCORD_APPLICATION_ID', 'DISCORD_API_TOKEN'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.log("Missing required environment variables:");
      missingVars.forEach(varName => console.log(`   - ${varName}`));
      console.log("\nPlease set these in your .env file (see DISCORD_SETUP.md)");
      console.log("Note: Gemini API is now the primary API for better free tier limits");
      return;
    }
    
    console.log("Environment variables configured");
    console.log("Using Gemini API as primary (better free tier limits)");
    
    // Initialize the bot
    console.log("\nInitializing TradeBot...");
    
    character.id ??= stringToUuid(character.name);
    character.username ??= character.name;
    
    const token = getTokenForProvider(character.modelProvider, character);
    const dataDir = path.join(__dirname, "data");
    
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    const db = initializeDatabase(dataDir);
    await db.init();
    
    const cache = initializeDbCache(character, db);
    
    const nodePlugin = createNodePlugin();
    const runtime = new AgentRuntime({
      databaseAdapter: db,
      token,
      modelProvider: character.modelProvider,
      evaluators: [],
      character,
      plugins: [bootstrapPlugin, nodePlugin, tradePlannerPlugin],
      providers: [],
      actions: [],
      services: [],
      managers: [],
      cacheManager: cache,
    });
    
    await runtime.initialize();
    console.log("TradeBot initialized successfully");
    
    // Test Discord client initialization
    console.log("\nTesting Discord client...");
    const clients = await initializeClients(character, runtime);
    const discordClient = clients.find(client => client.constructor.name.includes('Discord'));
    
    if (discordClient) {
      console.log("Discord client initialized");
    } else {
      console.log("Discord client not found");
      return;
    }
    
    // Test message processing
    console.log("\nTesting message processing...");
    
    for (let i = 0; i < testMessages.length; i++) {
      const testMsg = testMessages[i];
      console.log(`\n--- Test ${i + 1}: ${testMsg.expected} ---`);
      console.log(`Message: "${testMsg.text}"`);
      
      try {
        // Simulate processing the message through the trade planner
        const message = {
          id: `test-${i}`,
          content: {
            text: testMsg.text,
            source: testMsg.source,
            channelId: testMsg.channelId
          },
          userId: "test-user",
          timestamp: new Date().toISOString()
        };
        
        // Check if the message would trigger the trade plan action
        const tradePlanAction = runtime.actions.find(action => action.name === 'GENERATE_TRADE_PLAN');
        if (tradePlanAction) {
          const isValid = await tradePlanAction.validate(runtime, message, {});
          console.log(`Validation: ${isValid ? 'Would trigger analysis' : 'Would NOT trigger analysis'}`);
          
          if (isValid) {
            console.log("This message would be analyzed for trading sentiment");
          }
        }
        
      } catch (error) {
        console.log(`❌ Error processing message: ${error.message}`);
      }
    }
    
    console.log("\nDiscord integration test completed!");
    console.log("\nNext steps:");
    console.log("1. Make sure your Discord bot is invited to your server");
    console.log("2. Run 'npm start' to start the full bot");
    console.log("3. Send crypto-related messages in Discord channels");
    console.log("4. Watch for trading signal responses!");
    
  } catch (error) {
    console.error("Test failed:", error);
    console.log("\nTroubleshooting:");
    console.log("1. Check your environment variables");
    console.log("2. Verify your Discord bot token and application ID");
    console.log("3. Ensure your Gemini API key is valid (primary API)");
    console.log("4. Optional: Set OpenAI API key as fallback");
    console.log("5. Check the logs for more details");
  }
}

// Run the test
testDiscordIntegration().catch(console.error); 