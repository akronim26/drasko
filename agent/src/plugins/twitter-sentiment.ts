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
import { fetchTweetsWithLogin } from '../clients/twitter-scraper.js';

// === Types ===
type Skill = (input: any, config?: any) => Promise<any>;

interface ScoredTweet {
  id: string;
  text: string;
  score: number;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  keywords: string[];
  engagement_score: number;
  author_id?: string;
  created_at?: string;
  public_metrics?: {
    retweet_count: number;
    reply_count: number;
    like_count: number;
    quote_count: number;
  };
}

interface AlphaTweet extends ScoredTweet {
  alpha_score: number;
  alpha_signals: string[];
  risk_level: 'low' | 'medium' | 'high';
  potential_impact: 'low' | 'medium' | 'high';
}

// === Tweet Fetching Skill (Updated to use scraper) ===
const fetch_tweets: Skill = async (input, config) => {
  try {
    const query = input.coin || input.query || "ethereum";
    
    // Get credentials from environment
    const credentials = {
      username: process.env.TWITTER_USERNAME || '',
      password: process.env.TWITTER_PASSWORD || '',
      email: process.env.TWITTER_EMAIL || '',
      cookies: process.env.TWITTER_COOKIES || ''
    };
    
    if (!credentials.username || !credentials.password) {
      throw new Error('Twitter credentials not configured. Please set TWITTER_USERNAME and TWITTER_PASSWORD in .env');
    }
    
    elizaLogger.info(`Fetching tweets for query: ${query}`);
    
    // Use the scraper to fetch tweets
    const result = await fetchTweetsWithLogin(query, credentials, 15); // Fetch 15 tweets
    
    if (!result.success) {
      throw new Error(`Failed to fetch tweets: ${result.error}`);
    }
    
    // Transform scraper tweets to match expected format
    const tweets = result.tweets.map(tweet => ({
      id: tweet.id,
      text: tweet.text,
      author_id: tweet.author,
      created_at: tweet.created_at,
      public_metrics: tweet.public_metrics
    }));
    
    return { 
      tweets,
      count: tweets.length,
      success: true 
    };
  } catch (error) {
    elizaLogger.error("Error fetching tweets:", error);
    return {
      tweets: [],
      count: 0,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
};

// === Alpha Detection Skill ===
const detect_alpha: Skill = async (input, config) => {
  try {
    const scored = input.scored || [];
    
    if (!Array.isArray(scored) || scored.length === 0) {
      return {
        alpha_tweets: [],
        alpha_summary: {
          total_alpha_signals: 0,
          high_confidence_alphas: 0,
          risk_distribution: { low: 0, medium: 0, high: 0 },
          top_alpha_keywords: []
        }
      };
    }

    // Define alpha signals and their weights
    const alphaSignals = {
      // Technical signals
      'breakout': 3,
      'support': 2,
      'resistance': 2,
      'consolidation': 1,
      'accumulation': 3,
      'distribution': -2,
      'volume spike': 4,
      'liquidity': 2,
      'market cap': 1,
      'circulating supply': 1,
      
      // Fundamental signals
      'partnership': 3,
      'adoption': 4,
      'institutional': 3,
      'regulation': 2,
      'compliance': 2,
      'audit': 2,
      'security': 2,
      'team': 2,
      'roadmap': 1,
      'milestone': 2,
      
      // Social signals
      'viral': 4,
      'trending': 3,
      'fomo': 2,
      'community': 2,
      'influencer': 3,
      'whale': 2,
      'diamond hands': 2,
      'hodl': 1,
      
      // Market signals
      'bull run': 3,
      'alt season': 2,
      'rotation': 2,
      'sector': 2,
      'narrative': 2,
      'momentum': 3,
      'relative strength': 3,
      
      // Risk signals (negative weights)
      'scam': -5,
      'rug': -5,
      'ponzi': -5,
      'fake': -4,
      'manipulation': -4,
      'pump and dump': -4,
      'insider': -3,
      'wash trading': -4
    };

    const alpha_tweets: AlphaTweet[] = scored
      .filter((tweet: ScoredTweet) => {
        // Filter for potential alpha tweets
        return tweet.sentiment === 'bullish' && 
               tweet.score >= 2 && 
               tweet.confidence >= 0.3;
      })
      .map((tweet: ScoredTweet) => {
        const text = tweet.text.toLowerCase();
        let alpha_score = tweet.score; // Start with sentiment score
        const alpha_signals: string[] = [];
        
        // Check for alpha signals
        Object.entries(alphaSignals).forEach(([signal, weight]) => {
          if (text.includes(signal)) {
            alpha_score += weight;
            alpha_signals.push(signal);
          }
        });

        // Boost score based on engagement
        if (tweet.engagement_score > 2) {
          alpha_score += Math.min(tweet.engagement_score * 0.5, 3);
        }

        // Boost score based on confidence
        alpha_score += tweet.confidence * 2;

        // Determine risk level
        let risk_level: 'low' | 'medium' | 'high' = 'medium';
        const riskKeywords = ['scam', 'rug', 'ponzi', 'fake', 'manipulation'];
        const hasRiskKeywords = riskKeywords.some(keyword => text.includes(keyword));
        
        if (hasRiskKeywords) {
          risk_level = 'high';
        } else if (alpha_score > 8 && tweet.confidence > 0.7) {
          risk_level = 'low';
        }

        // Determine potential impact
        let potential_impact: 'low' | 'medium' | 'high' = 'medium';
        if (alpha_score > 10 && tweet.engagement_score > 3) {
          potential_impact = 'high';
        } else if (alpha_score < 5) {
          potential_impact = 'low';
        }

        return {
          ...tweet,
          alpha_score: Math.max(0, alpha_score), // Ensure non-negative
          alpha_signals,
          risk_level,
          potential_impact
        };
      })
      .filter(tweet => tweet.alpha_score >= 5) // Only keep high-alpha tweets
      .sort((a, b) => b.alpha_score - a.alpha_score); // Sort by alpha score

    // Calculate alpha summary
    const alpha_summary = {
      total_alpha_signals: alpha_tweets.length,
      high_confidence_alphas: alpha_tweets.filter(t => t.confidence > 0.7).length,
      average_alpha_score: alpha_tweets.length > 0 
        ? alpha_tweets.reduce((sum, t) => sum + t.alpha_score, 0) / alpha_tweets.length 
        : 0,
      risk_distribution: {
        low: alpha_tweets.filter(t => t.risk_level === 'low').length,
        medium: alpha_tweets.filter(t => t.risk_level === 'medium').length,
        high: alpha_tweets.filter(t => t.risk_level === 'high').length
      },
      impact_distribution: {
        low: alpha_tweets.filter(t => t.potential_impact === 'low').length,
        medium: alpha_tweets.filter(t => t.potential_impact === 'medium').length,
        high: alpha_tweets.filter(t => t.potential_impact === 'high').length
      },
      top_alpha_signals: getTopAlphaSignals(alpha_tweets),
      top_alpha_tweets: alpha_tweets.slice(0, 10) // Top 10 alpha tweets
    };

    return {
      alpha_tweets,
      alpha_summary
    };

  } catch (error) {
    console.error("Error in alpha detection:", error);
    return {
      alpha_tweets: [],
      alpha_summary: {
        total_alpha_signals: 0,
        high_confidence_alphas: 0,
        average_alpha_score: 0,
        risk_distribution: { low: 0, medium: 0, high: 0 },
        impact_distribution: { low: 0, medium: 0, high: 0 },
        top_alpha_signals: [],
        top_alpha_tweets: [],
        error: error instanceof Error ? error.message : "Unknown error"
      }
    };
  }
};

// Helper function to get top alpha signals
function getTopAlphaSignals(tweets: AlphaTweet[]): { signal: string; count: number; avg_score: number }[] {
  const signalStats: { [key: string]: { count: number; total_score: number } } = {};
  
  tweets.forEach(tweet => {
    tweet.alpha_signals.forEach(signal => {
      if (!signalStats[signal]) {
        signalStats[signal] = { count: 0, total_score: 0 };
      }
      signalStats[signal].count++;
      signalStats[signal].total_score += tweet.alpha_score;
    });
  });

  return Object.entries(signalStats)
    .map(([signal, stats]) => ({
      signal,
      count: stats.count,
      avg_score: stats.total_score / stats.count
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

// === Sentiment Analysis for Tweets ===
async function analyzeTweetSentiment(tweetText: string): Promise<{
  sentiment: 'bullish' | 'bearish' | 'neutral';
  score: number;
  confidence: number;
  keywords: string[];
}> {
  try {
    // Use Gemini API for sentiment analysis (same as trade planner)
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Analyze the sentiment of this crypto-related tweet and provide a structured response:

Tweet: "${tweetText}"

Please respond with ONLY a JSON object in this exact format:
{
  "sentiment": "bullish|bearish|neutral",
  "score": number (1-10, where 10 is extremely positive),
  "confidence": number (0-1, where 1 is very confident),
  "keywords": ["keyword1", "keyword2", "keyword3"]
}

Focus on crypto trading sentiment, market sentiment, and potential price impact.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    
    const analysis = JSON.parse(jsonMatch[0]);
    
    return {
      sentiment: analysis.sentiment || 'neutral',
      score: analysis.score || 5,
      confidence: analysis.confidence || 0.5,
      keywords: analysis.keywords || []
    };
  } catch (error) {
    elizaLogger.error('Error analyzing tweet sentiment:', error);
    return {
      sentiment: 'neutral',
      score: 5,
      confidence: 0.3,
      keywords: []
    };
  }
}

// === Actions ===

/**
 * Fetches and analyzes tweets for a specific cryptocurrency
 */
const fetchTweetsAction: Action = {
  name: 'FETCH_TWEETS',
  similes: ['TWITTER_ANALYSIS', 'SOCIAL_SENTIMENT'],
  description: 'Fetches tweets for a cryptocurrency and analyzes sentiment',

  validate: async (_runtime, message: Memory, _state: State) => {
    const text = message.content.text || '';
    return /\b(tweets?|twitter|social)\b.*\b(eth|btc|sol|usdc|coin|crypto)\b/i.test(text) ||
           /\b(fetch|get|analyze)\b.*\b(tweets?|twitter)\b/i.test(text);
  },

  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    _state: State,
    _options: any,
    callback: HandlerCallback
  ) => {
    elizaLogger.info('FETCH_TWEETS action triggered');
    
    try {
      const text = message.content.text || '';
      const source = message.content.source || 'unknown';
      
      // Extract coin/token from message
      const coinMatch = text.match(/\b(eth|btc|sol|usdc|ethereum|bitcoin|solana)\b/i);
      const coin = coinMatch ? coinMatch[1].toLowerCase() : 'ethereum';
      
      elizaLogger.info(`Fetching tweets for ${coin}`);
      
      // Fetch tweets
      const tweetResult = await fetch_tweets({ coin });
      
      if (!tweetResult.success) {
        await callback({
          text: `**Twitter Analysis Failed**\n\nError: ${tweetResult.error}`,
          source: source
        });
        return;
      }
      
      if (tweetResult.count === 0) {
        await callback({
          text: `**No Tweets Found**\n\nNo recent tweets found for ${coin.toUpperCase()}.`,
          source: source
        });
        return;
      }
      
      // Analyze sentiment for each tweet
      const scoredTweets: ScoredTweet[] = [];
      
      for (const tweet of tweetResult.tweets.slice(0, 10)) { // Limit to 10 tweets
        const sentiment = await analyzeTweetSentiment(tweet.text);
        const engagement_score = calculateEngagementScore(tweet);
        
        scoredTweets.push({
          id: tweet.id,
          text: tweet.text,
          score: sentiment.score,
          sentiment: sentiment.sentiment,
          confidence: sentiment.confidence,
          keywords: sentiment.keywords,
          engagement_score,
          author_id: tweet.author_id,
          created_at: tweet.created_at,
          public_metrics: tweet.public_metrics
        });
      }
      
      // Detect alpha signals
      const alphaResult = await detect_alpha({ scored: scoredTweets });
      
      // Generate response
      const responseText = generateTwitterAnalysisResponse(coin, scoredTweets, alphaResult);
      
      await callback({
        text: responseText,
        source: source,
        data: {
          coin,
          tweets: scoredTweets,
          alphaResult
        }
      });
      
    } catch (error) {
      elizaLogger.error('Error in FETCH_TWEETS handler:', error);
      await callback({
        text: `**Twitter Analysis Error**\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}`,
        source: message.content.source || 'unknown'
      });
    }
  },

  examples: [
    [
      { user: '{{user}}', content: { text: 'Fetch tweets for ETH' } },
      {
        user: '{{agent}}',
        content: {
          text: '**Twitter Sentiment Analysis for ETH**\n\n**Tweets Analyzed:** 10\n**Overall Sentiment:** Bullish\n**Alpha Signals:** 3 high-confidence signals detected\n**Top Keywords:** adoption, institutional, momentum\n\n*Analysis based on recent Twitter activity.*',
          action: 'FETCH_TWEETS',
        },
      },
    ],
  ],
};

/**
 * Analyzes alpha signals from social media
 */
const alphaAnalysisAction: Action = {
  name: 'ALPHA_ANALYSIS',
  similes: ['ALPHA_DETECTION', 'SIGNAL_ANALYSIS'],
  description: 'Analyzes social media for alpha trading signals',

  validate: async (_runtime, message: Memory, _state: State) => {
    const text = message.content.text || '';
    return /\b(alpha|signal|opportunity)\b.*\b(detect|find|analyze)\b/i.test(text) ||
           /\b(trading|investment)\b.*\b(signal|alpha)\b/i.test(text);
  },

  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    _state: State,
    _options: any,
    callback: HandlerCallback
  ) => {
    elizaLogger.info('ALPHA_ANALYSIS action triggered');
    
    try {
      const text = message.content.text || '';
      const source = message.content.source || 'unknown';
      
      // Extract coin/token from message
      const coinMatch = text.match(/\b(eth|btc|sol|usdc|ethereum|bitcoin|solana)\b/i);
      const coin = coinMatch ? coinMatch[1].toLowerCase() : 'ethereum';
      
      elizaLogger.info(`Analyzing alpha signals for ${coin}`);
      
      // Fetch and analyze tweets
      const tweetResult = await fetch_tweets({ coin });
      
      if (!tweetResult.success || tweetResult.count === 0) {
        await callback({
          text: `**Alpha Analysis Failed**\n\nNo tweets found for ${coin.toUpperCase()} or API error occurred.`,
          source: source
        });
        return;
      }
      
      // Score tweets
      const scoredTweets: ScoredTweet[] = [];
      
      for (const tweet of tweetResult.tweets.slice(0, 15)) { // More tweets for alpha analysis
        const sentiment = await analyzeTweetSentiment(tweet.text);
        const engagement_score = calculateEngagementScore(tweet);
        
        scoredTweets.push({
          id: tweet.id,
          text: tweet.text,
          score: sentiment.score,
          sentiment: sentiment.sentiment,
          confidence: sentiment.confidence,
          keywords: sentiment.keywords,
          engagement_score,
          author_id: tweet.author_id,
          created_at: tweet.created_at,
          public_metrics: tweet.public_metrics
        });
      }
      
      // Detect alpha signals
      const alphaResult = await detect_alpha({ scored: scoredTweets });
      
      // Generate alpha-focused response
      const responseText = generateAlphaAnalysisResponse(coin, alphaResult);
      
      await callback({
        text: responseText,
        source: source,
        data: {
          coin,
          alphaResult
        }
      });
      
    } catch (error) {
      elizaLogger.error('Error in ALPHA_ANALYSIS handler:', error);
      await callback({
        text: `**Alpha Analysis Error**\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}`,
        source: message.content.source || 'unknown'
      });
    }
  },

  examples: [
    [
      { user: '{{user}}', content: { text: 'Find alpha signals for BTC' } },
      {
        user: '{{agent}}',
        content: {
          text: '**Alpha Signal Analysis for BTC**\n\n**High-Confidence Alphas:** 5 signals\n**Average Alpha Score:** 8.2\n**Risk Distribution:** Low: 3, Medium: 2, High: 0\n**Top Signals:** institutional, adoption, momentum\n\n*Alpha signals detected from social media analysis.*',
          action: 'ALPHA_ANALYSIS',
        },
      },
    ],
  ],
};

// === Helper Functions ===

function calculateEngagementScore(tweet: any): number {
  const metrics = tweet.public_metrics || {};
  const retweets = metrics.retweet_count || 0;
  const replies = metrics.reply_count || 0;
  const likes = metrics.like_count || 0;
  const quotes = metrics.quote_count || 0;
  
  // Weighted engagement score
  return (retweets * 2) + (replies * 1.5) + (likes * 1) + (quotes * 2);
}

function generateTwitterAnalysisResponse(coin: string, tweets: ScoredTweet[], alphaResult: any): string {
  const bullishCount = tweets.filter(t => t.sentiment === 'bullish').length;
  const bearishCount = tweets.filter(t => t.sentiment === 'bearish').length;
  const neutralCount = tweets.filter(t => t.sentiment === 'neutral').length;
  
  const overallSentiment = bullishCount > bearishCount ? 'Bullish' : 
                          bearishCount > bullishCount ? 'Bearish' : 'Neutral';
  
  const topKeywords = getTopKeywords(tweets);
  
  return `**Twitter Sentiment Analysis for ${coin.toUpperCase()}**\n\n` +
         `**Tweets Analyzed:** ${tweets.length}\n` +
         `**Overall Sentiment:** ${overallSentiment}\n` +
         `**Sentiment Breakdown:** Bullish: ${bullishCount}, Bearish: ${bearishCount}, Neutral: ${neutralCount}\n` +
         `**Alpha Signals:** ${alphaResult.alpha_summary.total_alpha_signals} signals detected\n` +
         `**High-Confidence Alphas:** ${alphaResult.alpha_summary.high_confidence_alphas}\n` +
         `**Top Keywords:** ${topKeywords.join(', ')}\n\n` +
         `*Analysis based on recent Twitter activity.*`;
}

function generateAlphaAnalysisResponse(coin: string, alphaResult: any): string {
  const summary = alphaResult.alpha_summary;
  
  if (summary.total_alpha_signals === 0) {
    return `**Alpha Signal Analysis for ${coin.toUpperCase()}**\n\n` +
           `**No significant alpha signals detected**\n\n` +
           `*Consider monitoring for longer periods or different keywords.*`;
  }
  
  const topSignals = summary.top_alpha_signals.slice(0, 5).map(s => s.signal).join(', ');
  
  return `**Alpha Signal Analysis for ${coin.toUpperCase()}**\n\n` +
         `**High-Confidence Alphas:** ${summary.high_confidence_alphas} signals\n` +
         `**Average Alpha Score:** ${summary.average_alpha_score.toFixed(1)}\n` +
         `**Risk Distribution:** Low: ${summary.risk_distribution.low}, Medium: ${summary.risk_distribution.medium}, High: ${summary.risk_distribution.high}\n` +
         `**Impact Distribution:** Low: ${summary.impact_distribution.low}, Medium: ${summary.impact_distribution.medium}, High: ${summary.impact_distribution.high}\n` +
         `**Top Alpha Signals:** ${topSignals}\n\n` +
         `*Alpha signals detected from social media analysis.*`;
}

function getTopKeywords(tweets: ScoredTweet[]): string[] {
  const keywordCount: { [key: string]: number } = {};
  
  tweets.forEach(tweet => {
    tweet.keywords.forEach(keyword => {
      keywordCount[keyword] = (keywordCount[keyword] || 0) + 1;
    });
  });
  
  return Object.entries(keywordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([keyword]) => keyword);
}

// === Plugin Export ===
const twitterSentimentPlugin: Plugin = {
  name: 'twitter-sentiment',
  description: 'Twitter sentiment analysis and alpha signal detection for crypto trading',
  actions: [fetchTweetsAction, alphaAnalysisAction],
  providers: [],
  services: [],
};

export default twitterSentimentPlugin; 