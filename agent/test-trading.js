#!/usr/bin/env node

/**
 * Simple test script to demonstrate the trading bot functionality
 * Run with: node test-trading.js
 */

console.log("🤖 Eliza Trading Bot Test Script");
console.log("================================\n");

// Example messages that would trigger trading analysis
const testMessages = [
  "ETH is going to moon!",
  "SOL looking bearish today",
  "BTC seems to be consolidating",
  "USDC is stable as always",
  "What do you think about ETH right now?",
  "Can you analyze these posts for trading signals?",
];

console.log("📊 Test Messages that would trigger trading analysis:");
testMessages.forEach((msg, index) => {
  console.log(`${index + 1}. "${msg}"`);
});

console.log("\n🎯 Expected Bot Responses:");
console.log("1. For bullish messages: 'strong bullish sentiment detected! generating trade plan...'");
console.log("2. For bearish messages: 'strong bearish sentiment detected! generating trade plan...'");
console.log("3. For neutral messages: 'sentiment analysis complete, no strong signals detected'");
console.log("4. For batch analysis: 'analyzing multiple posts for trading signals...'");

console.log("\n🔧 Actions Available:");
console.log("- GENERATE_TRADE_PLAN: Single message sentiment analysis");
console.log("- BATCH_ANALYZE_POSTS: Multiple posts analysis");

console.log("\n💡 To test the bot:");
console.log("1. Run: npm start");
console.log("2. Type one of the test messages above");
console.log("3. Watch the bot analyze sentiment and generate trade plans");

console.log("\n⚠️  Disclaimer:");
console.log("This is for educational purposes only. Always do your own research!");
console.log("Trading involves risk and the bot's recommendations are not financial advice.\n");

console.log("🚀 Ready to start trading analysis!"); 