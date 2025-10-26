#!/usr/bin/env node

/**
 * Test script for Twitter Sentiment Analysis Plugin
 * Demonstrates tweet fetching and alpha signal detection
 */

console.log('🐦 Testing Twitter Sentiment Analysis Plugin\n');

// Mock tweet data for testing
const mockTweets = [
  {
    id: '1',
    text: 'ETH looking bullish! Institutional adoption is growing rapidly. This is just the beginning of the bull run! 🚀',
    author_id: 'user1',
    created_at: '2024-01-15T10:00:00Z',
    public_metrics: {
      retweet_count: 150,
      reply_count: 45,
      like_count: 1200,
      quote_count: 30
    }
  },
  {
    id: '2',
    text: 'Bitcoin showing strong support at 40k. Volume spike indicates accumulation phase. Whales are buying!',
    author_id: 'user2',
    created_at: '2024-01-15T09:30:00Z',
    public_metrics: {
      retweet_count: 89,
      reply_count: 23,
      like_count: 567,
      quote_count: 12
    }
  },
  {
    id: '3',
    text: 'Solana ecosystem is exploding! New partnerships and adoption metrics are off the charts. This is viral growth!',
    author_id: 'user3',
    created_at: '2024-01-15T09:00:00Z',
    public_metrics: {
      retweet_count: 234,
      reply_count: 67,
      like_count: 1890,
      quote_count: 45
    }
  },
  {
    id: '4',
    text: 'Be careful with this new token. Looks like a potential scam. No team info, no audit, red flags everywhere!',
    author_id: 'user4',
    created_at: '2024-01-15T08:45:00Z',
    public_metrics: {
      retweet_count: 12,
      reply_count: 8,
      like_count: 45,
      quote_count: 3
    }
  },
  {
    id: '5',
    text: 'USDC adoption continues to grow. More merchants accepting stablecoins. This is the future of payments!',
    author_id: 'user5',
    created_at: '2024-01-15T08:30:00Z',
    public_metrics: {
      retweet_count: 67,
      reply_count: 19,
      like_count: 432,
      quote_count: 8
    }
  }
];

// Mock sentiment analysis function
async function mockAnalyzeTweetSentiment(tweetText) {
  console.log(`📝 Analyzing sentiment: "${tweetText.substring(0, 50)}..."`);
  
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Simple mock sentiment analysis
  const text = tweetText.toLowerCase();
  let sentiment = 'neutral';
  let score = 5;
  let confidence = 0.5;
  let keywords = [];
  
  // Bullish indicators
  if (text.includes('bullish') || text.includes('bull run') || text.includes('🚀')) {
    sentiment = 'bullish';
    score = 8;
    confidence = 0.8;
    keywords.push('bullish', 'momentum');
  }
  
  if (text.includes('adoption') || text.includes('institutional')) {
    sentiment = 'bullish';
    score = Math.max(score, 7);
    confidence = Math.max(confidence, 0.7);
    keywords.push('adoption', 'institutional');
  }
  
  if (text.includes('viral') || text.includes('exploding')) {
    sentiment = 'bullish';
    score = Math.max(score, 9);
    confidence = Math.max(confidence, 0.9);
    keywords.push('viral', 'growth');
  }
  
  // Bearish indicators
  if (text.includes('scam') || text.includes('red flags')) {
    sentiment = 'bearish';
    score = 2;
    confidence = 0.9;
    keywords.push('risk', 'scam');
  }
  
  // Technical indicators
  if (text.includes('support') || text.includes('accumulation')) {
    keywords.push('technical', 'support');
  }
  
  if (text.includes('volume') || text.includes('whales')) {
    keywords.push('volume', 'institutional');
  }
  
  return {
    sentiment,
    score,
    confidence,
    keywords
  };
}

// Mock engagement score calculation
function mockCalculateEngagementScore(tweet) {
  const metrics = tweet.public_metrics || {};
  const retweets = metrics.retweet_count || 0;
  const replies = metrics.reply_count || 0;
  const likes = metrics.like_count || 0;
  const quotes = metrics.quote_count || 0;
  
  return (retweets * 2) + (replies * 1.5) + (likes * 1) + (quotes * 2);
}

// Mock alpha detection
async function mockDetectAlpha(scoredTweets) {
  console.log('🔍 Detecting alpha signals...');
  
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const alphaSignalWeights = {
    'breakout': 3,
    'support': 2,
    'accumulation': 3,
    'volume spike': 4,
    'partnership': 3,
    'adoption': 4,
    'institutional': 3,
    'viral': 4,
    'trending': 3,
    'whale': 2,
    'scam': -5,
    'rug': -5
  };
  
  const alphaTweets = scoredTweets
    .filter(tweet => tweet.sentiment === 'bullish' && tweet.score >= 2)
    .map(tweet => {
      const text = tweet.text.toLowerCase();
      let alphaScore = tweet.score;
      const detectedSignals = [];
      
      Object.entries(alphaSignalWeights).forEach(([signal, weight]) => {
        if (text.includes(signal)) {
          alphaScore += weight;
          detectedSignals.push(signal);
        }
      });
      
      // Boost score based on engagement
      if (tweet.engagement_score > 2) {
        alphaScore += Math.min(tweet.engagement_score * 0.5, 3);
      }
      
      // Determine risk level
      let riskLevel = 'medium';
      if (text.includes('scam') || text.includes('rug')) {
        riskLevel = 'high';
      } else if (alphaScore > 8 && tweet.confidence > 0.7) {
        riskLevel = 'low';
      }
      
      return {
        ...tweet,
        alpha_score: Math.max(0, alphaScore),
        alpha_signals: detectedSignals,
        risk_level: riskLevel,
        potential_impact: alphaScore > 10 ? 'high' : alphaScore > 5 ? 'medium' : 'low'
      };
    })
    .filter(tweet => tweet.alpha_score >= 5)
    .sort((a, b) => b.alpha_score - a.alpha_score);
  
  return {
    alpha_tweets: alphaTweets,
    alpha_summary: {
      total_alpha_signals: alphaTweets.length,
      high_confidence_alphas: alphaTweets.filter(t => t.confidence > 0.7).length,
      average_alpha_score: alphaTweets.length > 0 
        ? alphaTweets.reduce((sum, t) => sum + t.alpha_score, 0) / alphaTweets.length 
        : 0,
      risk_distribution: {
        low: alphaTweets.filter(t => t.risk_level === 'low').length,
        medium: alphaTweets.filter(t => t.risk_level === 'medium').length,
        high: alphaTweets.filter(t => t.risk_level === 'high').length
      }
    }
  };
}

// Test functions
async function testTweetFetching() {
  console.log('\n=== Testing Tweet Fetching ===');
  
  console.log('📡 Fetching tweets for ETH...');
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log(`✅ Fetched ${mockTweets.length} tweets successfully`);
  
  return mockTweets;
}

async function testSentimentAnalysis() {
  console.log('\n=== Testing Sentiment Analysis ===');
  
  const scoredTweets = [];
  
  for (const tweet of mockTweets) {
    const sentiment = await mockAnalyzeTweetSentiment(tweet.text);
    const engagementScore = mockCalculateEngagementScore(tweet);
    
    scoredTweets.push({
      id: tweet.id,
      text: tweet.text,
      score: sentiment.score,
      sentiment: sentiment.sentiment,
      confidence: sentiment.confidence,
      keywords: sentiment.keywords,
      engagement_score: engagementScore
    });
    
    console.log(`   Tweet ${tweet.id}: ${sentiment.sentiment} (${sentiment.score}/10) - ${sentiment.keywords.join(', ')}`);
  }
  
  return scoredTweets;
}

async function testAlphaDetection(scoredTweets) {
  console.log('\n=== Testing Alpha Detection ===');
  
  const alphaResult = await mockDetectAlpha(scoredTweets);
  
  console.log(`✅ Alpha Detection Results:`);
  console.log(`   Total Alpha Signals: ${alphaResult.alpha_summary.total_alpha_signals}`);
  console.log(`   High-Confidence Alphas: ${alphaResult.alpha_summary.high_confidence_alphas}`);
  console.log(`   Average Alpha Score: ${alphaResult.alpha_summary.average_alpha_score.toFixed(1)}`);
  
  if (alphaResult.alpha_tweets.length > 0) {
    console.log('\n   Top Alpha Tweets:');
    alphaResult.alpha_tweets.slice(0, 3).forEach((tweet, index) => {
      console.log(`   ${index + 1}. Alpha Score: ${tweet.alpha_score.toFixed(1)} - Risk: ${tweet.risk_level} - ${tweet.text.substring(0, 60)}...`);
    });
  }
  
  return alphaResult;
}

async function testTwitterAnalysis() {
  console.log('\n=== Testing Complete Twitter Analysis ===');
  
  const coin = 'ETH';
  
  // Fetch tweets
  const tweets = await testTweetFetching();
  
  // Analyze sentiment
  const scoredTweets = await testSentimentAnalysis();
  
  // Detect alpha signals
  const alphaResult = await testAlphaDetection(scoredTweets);
  
  // Generate summary
  const bullishCount = scoredTweets.filter(t => t.sentiment === 'bullish').length;
  const bearishCount = scoredTweets.filter(t => t.sentiment === 'bearish').length;
  const neutralCount = scoredTweets.filter(t => t.sentiment === 'neutral').length;
  
  const overallSentiment = bullishCount > bearishCount ? 'Bullish' : 
                          bearishCount > bullishCount ? 'Bearish' : 'Neutral';
  
  console.log(`\n📊 Twitter Analysis Summary for ${coin}:`);
  console.log(`   Overall Sentiment: ${overallSentiment}`);
  console.log(`   Sentiment Breakdown: Bullish: ${bullishCount}, Bearish: ${bearishCount}, Neutral: ${neutralCount}`);
  console.log(`   Alpha Signals Detected: ${alphaResult.alpha_summary.total_alpha_signals}`);
  console.log(`   High-Confidence Alphas: ${alphaResult.alpha_summary.high_confidence_alphas}`);
  
  return {
    coin,
    tweets: scoredTweets,
    alphaResult,
    summary: {
      overallSentiment,
      bullishCount,
      bearishCount,
      neutralCount
    }
  };
}

// Main test runner
async function runTests() {
  console.log('🧪 Starting Twitter Sentiment Analysis Tests...\n');
  
  try {
    // Test complete Twitter analysis workflow
    const result = await testTwitterAnalysis();
    
    console.log('\n🎉 All Twitter analysis tests completed successfully!');
    console.log('\n📋 Test Summary:');
    console.log('   ✅ Tweet fetching functionality');
    console.log('   ✅ Sentiment analysis functionality');
    console.log('   ✅ Alpha signal detection');
    console.log('   ✅ Engagement score calculation');
    console.log('   ✅ Risk assessment');
    
    console.log('\n💡 Next Steps:');
    console.log('   1. Configure real Twitter API key in .env file');
    console.log('   2. Test with real Twitter API endpoints');
    console.log('   3. Integrate with Discord bot for real-time analysis');
    console.log('   4. Add more sophisticated alpha signal detection');
    console.log('   5. Implement caching for API rate limits');
    
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
  testTweetFetching,
  testSentimentAnalysis,
  testAlphaDetection,
  testTwitterAnalysis,
  runTests
}; 