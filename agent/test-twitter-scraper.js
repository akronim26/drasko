#!/usr/bin/env node

/**
 * Standalone test script for Twitter Scraper
 * Tests Puppeteer-based login and tweet fetching
 */

import puppeteer from 'puppeteer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Helper function for delays (compatible with all Puppeteer versions)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Twitter credentials from .env
const credentials = {
  username: process.env.TWITTER_USERNAME || '',
  password: process.env.TWITTER_PASSWORD || '',
  email: process.env.TWITTER_EMAIL || '',
  cookies: process.env.TWITTER_COOKIES || ''
};

// Test configuration
const TEST_QUERY = 'ethereum';
const MAX_TWEETS = 5;
const DRY_RUN = process.env.TWITTER_DRY_RUN === 'true';

console.log('🐦 Testing Twitter Scraper\n');

console.log('📋 Configuration:');
console.log(`   Query: ${TEST_QUERY}`);
console.log(`   Max Tweets: ${MAX_TWEETS}`);
console.log(`   Dry Run: ${DRY_RUN}`);
console.log(`   Username: ${credentials.username ? '✅ Set' : '❌ Not set'}`);
console.log(`   Password: ${credentials.password ? '✅ Set' : '❌ Not set'}`);
console.log(`   Email: ${credentials.email ? '✅ Set' : '❌ Not set'}`);
console.log(`   Cookies: ${credentials.cookies ? '✅ Set' : '❌ Not set'}\n`);

// Validate credentials
if (!credentials.username || !credentials.password) {
  console.error('❌ Error: TWITTER_USERNAME and TWITTER_PASSWORD must be set in .env file');
  process.exit(1);
}

async function testTwitterLogin() {
  console.log('=== Testing Twitter Login ===');
  
  let browser;
  try {
    console.log('🚀 Launching browser...');
    browser = await puppeteer.launch({ 
      headless: false, // Set to false for debugging
      slowMo: 100 // Slow down actions for visibility
    });
    
    const page = await browser.newPage();
    
    // Set user agent to avoid detection
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    console.log('📱 Going to Twitter login page...');
    await page.goto('https://twitter.com/login', { waitUntil: 'networkidle2' });
    
    // Check if we're already logged in
    const isLoggedIn = await page.evaluate(() => {
      return document.querySelector('[data-testid="SideNav_AccountSwitcher_Button"]') !== null;
    });
    
    if (isLoggedIn) {
      console.log('✅ Already logged in (cookies working)');
      return { success: true, browser, page };
    }
    
    console.log('🔐 Performing login...');
    
    // Wait for username field and enter username
    console.log('   Entering username...');
    await page.waitForSelector('input[name="text"]', { timeout: 15000 });
    await page.type('input[name="text"]', credentials.username, { delay: 100 });
    await page.keyboard.press('Enter');
    await delay(2000);
    
    // If Twitter asks for email, fill it
    if (credentials.email) {
      try {
        console.log('   Entering email...');
        await page.waitForSelector('input[name="text"]', { timeout: 5000 });
        await page.type('input[name="text"]', credentials.email, { delay: 100 });
        await page.keyboard.press('Enter');
        await delay(2000);
      } catch (error) {
        console.log('   Email field not found, continuing...');
      }
    }
    
    // Enter password
    console.log('   Entering password...');
    await page.waitForSelector('input[name="password"]', { timeout: 15000 });
    await page.type('input[name="password"]', credentials.password, { delay: 100 });
    await page.keyboard.press('Enter');
    
    // Wait for login to complete
    console.log('   Waiting for login to complete...');
    await delay(5000);
    
    // Check if login was successful
    const loginSuccess = await page.evaluate(() => {
      return document.querySelector('[data-testid="SideNav_AccountSwitcher_Button"]') !== null;
    });
    
    if (loginSuccess) {
      console.log('✅ Login successful!');
      
      // Save cookies for future use
      const cookies = await page.cookies();
      console.log('🍪 Cookies obtained. Save these to TWITTER_COOKIES in .env:');
      console.log(JSON.stringify(cookies, null, 2));
      
      return { success: true, browser, page };
    } else {
      console.log('❌ Login failed. Check credentials or solve captcha manually.');
      return { success: false, browser, page };
    }
    
  } catch (error) {
    console.error('❌ Login error:', error.message);
    if (browser) await browser.close();
    return { success: false, browser: null, page: null };
  }
}

async function testTweetFetching(page, query, maxTweets) {
  console.log(`\n=== Testing Tweet Fetching for "${query}" ===`);
  
  try {
    console.log(`🔍 Going to search page for "${query}"...`);
    const searchUrl = `https://twitter.com/search?q=${encodeURIComponent(query)}&src=typed_query&f=live`;
    await page.goto(searchUrl, { waitUntil: 'networkidle2' });
    await delay(3000);
    
    console.log('📜 Scrolling to load tweets...');
    let lastHeight = await page.evaluate('document.body.scrollHeight');
    let scrollCount = 0;
    
    while (scrollCount < 3) { // Limit scrolling for testing
      await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
      await delay(2000);
      
      let newHeight = await page.evaluate('document.body.scrollHeight');
      if (newHeight === lastHeight) break;
      
      lastHeight = newHeight;
      scrollCount++;
      
      const tweetCount = await page.evaluate(() => document.querySelectorAll('article').length);
      console.log(`   Loaded ${tweetCount} tweets...`);
      
      if (tweetCount >= maxTweets) break;
    }
    
    console.log('📝 Extracting tweets...');
    const tweets = await page.evaluate((maxTweets) => {
      const tweetNodes = Array.from(document.querySelectorAll('article')).slice(0, maxTweets);
      return tweetNodes.map((node, index) => {
        const text = node.innerText || '';
        const id = node.querySelector('a[href*="/status/"]')?.getAttribute('href')?.split('/status/')[1] || `tweet_${index}`;
        const author = node.querySelector('a[role="link"][href^="/"] span')?.textContent || 'Unknown';
        const created_at = node.querySelector('time')?.getAttribute('datetime') || new Date().toISOString();
        
        return {
          id,
          text: text.substring(0, 200) + (text.length > 200 ? '...' : ''),
          author,
          created_at,
          public_metrics: {
            retweet_count: 0,
            reply_count: 0,
            like_count: 0,
            quote_count: 0
          }
        };
      });
    }, maxTweets);
    
    console.log(`✅ Successfully extracted ${tweets.length} tweets`);
    
    // Display tweets
    console.log('\n📋 Extracted Tweets:');
    tweets.forEach((tweet, index) => {
      console.log(`\n${index + 1}. Tweet ID: ${tweet.id}`);
      console.log(`   Author: ${tweet.author}`);
      console.log(`   Created: ${tweet.created_at}`);
      console.log(`   Text: ${tweet.text}`);
    });
    
    return { success: true, tweets };
    
  } catch (error) {
    console.error('❌ Tweet fetching error:', error.message);
    return { success: false, tweets: [] };
  }
}

async function runTests() {
  console.log('🧪 Starting Twitter Scraper Tests...\n');
  
  try {
    // Test 1: Login
    const loginResult = await testTwitterLogin();
    
    if (!loginResult.success) {
      console.log('\n❌ Login failed. Cannot proceed with tweet fetching.');
      console.log('💡 Tips:');
      console.log('   - Check your credentials in .env');
      console.log('   - You may need to solve a captcha manually');
      console.log('   - Try using saved cookies from a previous successful login');
      return;
    }
    
    // Test 2: Tweet Fetching (only if not dry run)
    if (!DRY_RUN) {
      const fetchResult = await testTweetFetching(loginResult.page, TEST_QUERY, MAX_TWEETS);
      
      if (fetchResult.success) {
        console.log('\n🎉 All tests completed successfully!');
        console.log(`📊 Summary:`);
        console.log(`   - Login: ✅ Success`);
        console.log(`   - Tweet Fetching: ✅ Success (${fetchResult.tweets.length} tweets)`);
        
        // Test 3: Test with different query
        console.log('\n🔄 Testing with different query...');
        const btcResult = await testTweetFetching(loginResult.page, 'bitcoin', 3);
        if (btcResult.success) {
          console.log(`✅ Bitcoin query successful (${btcResult.tweets.length} tweets)`);
        }
      } else {
        console.log('\n❌ Tweet fetching failed.');
      }
    } else {
      console.log('\n🔒 Dry run mode - skipping tweet fetching');
      console.log('✅ Login test completed successfully!');
    }
    
    // Close browser
    if (loginResult.browser) {
      await loginResult.browser.close();
      console.log('\n🔒 Browser closed');
    }
    
    console.log('\n💡 Next Steps:');
    console.log('   1. If login was successful, save the cookies to TWITTER_COOKIES in .env');
    console.log('   2. Set TWITTER_DRY_RUN=false to test tweet fetching');
    console.log('   3. Integrate the scraper into your plugin');
    console.log('   4. Test with different queries and parameters');
    
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
  testTwitterLogin,
  testTweetFetching,
  runTests
}; 