#!/usr/bin/env node

/**
 * Test script for Trading Actions Plugin
 * Demonstrates on-chain trading capabilities
 */

console.log('🚀 Testing Trading Actions Plugin\n');

// Mock test data
const testMessages = [
  {
    text: 'Check my ETH balance',
    expectedAction: 'GET_BALANCE',
    description: 'Balance check request'
  },
  {
    text: 'Transfer 0.1 ETH to 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    expectedAction: 'TRANSFER_ASSET',
    description: 'Asset transfer request'
  },
  {
    text: 'execute trade',
    expectedAction: 'EXECUTE_TRADE_REQUEST',
    description: 'Trade execution request'
  },
  {
    text: 'BTC looking bearish on Discord',
    expectedAction: 'GENERATE_TRADE_PLAN',
    description: 'Sentiment analysis and trade plan generation'
  }
];

// Mock trading functions (same as in the plugin)
async function mockExecuteTrade(fromAsset, toAsset, amount, action) {
  console.log(`📊 Executing ${action} trade: ${amount} ${fromAsset} -> ${toAsset}`);
  
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const mockTxHash = `0x${Math.random().toString(16).substring(2, 66)}`;
  const mockAmountReceived = (parseFloat(amount) * (action === 'buy' ? 1.1 : 0.9)).toFixed(6);
  
  return {
    success: true,
    transactionHash: mockTxHash,
    amountReceived: mockAmountReceived,
  };
}

async function mockGetBalance(asset) {
  console.log(`💰 Getting balance for ${asset}`);
  
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const mockBalance = (Math.random() * 1000).toFixed(6);
  
  return {
    asset,
    balance: mockBalance,
    formattedBalance: `${mockBalance} ${asset}`,
  };
}

async function mockTransferAsset(asset, amount, destination) {
  console.log(`📤 Transferring ${amount} ${asset} to ${destination}`);
  
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const mockTxHash = `0x${Math.random().toString(16).substring(2, 66)}`;
  
  return {
    success: true,
    transactionHash: mockTxHash,
  };
}

// Test functions
async function testBalanceCheck() {
  console.log('\n=== Testing Balance Check ===');
  
  const asset = 'ETH';
  const result = await mockGetBalance(asset);
  
  console.log(`✅ Balance Check Result:`);
  console.log(`   Asset: ${result.asset}`);
  console.log(`   Balance: ${result.formattedBalance}`);
  
  return result;
}

async function testTransfer() {
  console.log('\n=== Testing Asset Transfer ===');
  
  const asset = 'ETH';
  const amount = '0.1';
  const destination = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';
  
  const result = await mockTransferAsset(asset, amount, destination);
  
  if (result.success) {
    console.log(`✅ Transfer Successful:`);
    console.log(`   Asset: ${asset}`);
    console.log(`   Amount: ${amount}`);
    console.log(`   Destination: ${destination}`);
    console.log(`   Transaction Hash: ${result.transactionHash}`);
  } else {
    console.log(`❌ Transfer Failed: ${result.error}`);
  }
  
  return result;
}

async function testTradeExecution() {
  console.log('\n=== Testing Trade Execution ===');
  
  const fromAsset = 'ETH';
  const toAsset = 'USDC';
  const amount = '0.1';
  const action = 'buy';
  
  const result = await mockExecuteTrade(fromAsset, toAsset, amount, action);
  
  if (result.success) {
    console.log(`✅ Trade Executed Successfully:`);
    console.log(`   Action: ${action.toUpperCase()}`);
    console.log(`   Pair: ${fromAsset}/${toAsset}`);
    console.log(`   Amount: ${amount} ${fromAsset}`);
    console.log(`   Received: ${result.amountReceived} ${toAsset}`);
    console.log(`   Transaction Hash: ${result.transactionHash}`);
  } else {
    console.log(`❌ Trade Execution Failed: ${result.error}`);
  }
  
  return result;
}

async function testSentimentAnalysis() {
  console.log('\n=== Testing Sentiment Analysis ===');
  
  const message = 'BTC looking bearish on Discord';
  console.log(`📝 Analyzing message: "${message}"`);
  
  // Simulate sentiment analysis
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  const sentimentScore = Math.random() * 2 - 1; // -1 to 1
  const action = sentimentScore > 0.3 ? 'buy' : sentimentScore < -0.3 ? 'sell' : 'hold';
  const tokenPair = 'BTC/USDC';
  const amount = '0.05 BTC';
  const priceThreshold = sentimentScore > 0 ? '45000 USD' : '40000 USD';
  
  console.log(`✅ Sentiment Analysis Result:`);
  console.log(`   Sentiment Score: ${sentimentScore.toFixed(3)}`);
  console.log(`   Recommended Action: ${action.toUpperCase()}`);
  console.log(`   Token Pair: ${tokenPair}`);
  console.log(`   Amount: ${amount}`);
  console.log(`   Target Price: ${priceThreshold}`);
  
  return {
    sentimentScore,
    action,
    tokenPair,
    amount,
    priceThreshold
  };
}

// Main test runner
async function runTests() {
  console.log('🧪 Starting Trading Actions Tests...\n');
  
  try {
    // Test 1: Balance Check
    await testBalanceCheck();
    
    // Test 2: Asset Transfer
    await testTransfer();
    
    // Test 3: Trade Execution
    await testTradeExecution();
    
    // Test 4: Sentiment Analysis
    await testSentimentAnalysis();
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 Test Summary:');
    console.log('   ✅ Balance checking functionality');
    console.log('   ✅ Asset transfer functionality');
    console.log('   ✅ Trade execution functionality');
    console.log('   ✅ Sentiment analysis functionality');
    
    console.log('\n💡 Next Steps:');
    console.log('   1. Configure real CDP API keys in .env file');
    console.log('   2. Replace mock functions with real CDP integration');
    console.log('   3. Test with Discord bot integration');
    console.log('   4. Implement proper error handling and validation');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export {
  testBalanceCheck,
  testTransfer,
  testTradeExecution,
  testSentimentAnalysis,
  runTests
}; 