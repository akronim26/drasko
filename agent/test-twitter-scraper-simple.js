#!/usr/bin/env node

/**
 * Simplified Twitter Scraper Test
 * Compatible with Puppeteer v24+
 */

import puppeteer from 'puppeteer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Helper function for delays
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Twitter credentials from .env
const credentials = {
  username: process.env.TWITTER_USERNAME || '',
  password: process.env.TWITTER_PASSWORD || '',
  email: process.env.TWITTER_EMAIL || '',
  cookies: process.env.TWITTER_COOKIES || ''
};

console.log('🐦 Testing Twitter Scraper (Simplified)\n');

console.log('📋 Configuration:');
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
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set user agent
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    console.log('📱 Going to Twitter login page...');
    await page.goto('https://twitter.com/login', { waitUntil: 'networkidle2' });
    
    // Wait a bit for page to load
    await delay(3000);
    
    console.log('🔐 Attempting login...');
    
    // Try to find and fill username field
    try {
      await page.waitForSelector('input[name="text"]', { timeout: 10000 });
      await page.type('input[name="text"]', credentials.username);
      console.log('   ✅ Username entered');
      await delay(1000);
      
      // Press Enter or find Next button
      await page.keyboard.press('Enter');
      await delay(2000);
      
    } catch (error) {
      console.log('   ❌ Could not find username field:', error.message);
    }
    
    // Try to fill email if prompted
    if (credentials.email) {
      try {
        await page.waitForSelector('input[name="text"]', { timeout: 5000 });
        await page.type('input[name="text"]', credentials.email);
        console.log('   ✅ Email entered');
        await delay(1000);
        await page.keyboard.press('Enter');
        await delay(2000);
      } catch (error) {
        console.log('   ℹ️  Email field not found, continuing...');
      }
    }
    
    // Try to fill password
    try {
      await page.waitForSelector('input[name="password"]', { timeout: 10000 });
      await page.type('input[name="password"]', credentials.password);
      console.log('   ✅ Password entered');
      await delay(1000);
      await page.keyboard.press('Enter');
      await delay(3000);
    } catch (error) {
      console.log('   ❌ Could not find password field:', error.message);
    }
    
    // Check if login was successful
    console.log('🔍 Checking login status...');
    await delay(2000);
    
    const loginSuccess = await page.evaluate(() => {
      // Look for various indicators of successful login
      const indicators = [
        '[data-testid="SideNav_AccountSwitcher_Button"]',
        '[data-testid="AppTabBar_Home_Link"]',
        '[data-testid="primaryColumn"]'
      ];
      return indicators.some(selector => document.querySelector(selector) !== null);
    });
    
    if (loginSuccess) {
      console.log('✅ Login appears successful!');
      
      // Save cookies
      const cookies = await page.cookies();
      console.log('🍪 Cookies obtained. Save these to TWITTER_COOKIES in .env:');
      console.log(JSON.stringify(cookies, null, 2));
      
      return { success: true, browser, page };
    } else {
      console.log('❌ Login may have failed. Check browser for captcha or other issues.');
      console.log('💡 You may need to complete login manually in the browser window.');
      return { success: false, browser, page };
    }
    
  } catch (error) {
    console.error('❌ Login error:', error.message);
    if (browser) await browser.close();
    return { success: false, browser: null, page: null };
  }
}

async function testTweetFetching(page, query = 'ethereum', maxTweets = 3) {
  console.log(`\n=== Testing Tweet Fetching for "${query}" ===`);
  
  try {
    console.log(`🔍 Going to search page for "${query}"...`);
    const searchUrl = `https://twitter.com/search?q=${encodeURIComponent(query)}&src=typed_query&f=live`;
    await page.goto(searchUrl, { waitUntil: 'networkidle2' });
    await delay(3000);
    
    console.log('📜 Scrolling to load tweets...');
    await delay(2000);
    
    // Simple scroll to load tweets
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await delay(2000);
    
    console.log('📝 Extracting tweets...');
    const tweets = await page.evaluate((maxTweets) => {
      const tweetNodes = Array.from(document.querySelectorAll('article')).slice(0, maxTweets);
      return tweetNodes.map((node, index) => {
        const text = node.innerText || '';
        const id = node.querySelector('a[href*="/status/"]')?.getAttribute('href')?.split('/status/')[1] || `tweet_${index}`;
        const author = node.querySelector('a[role="link"][href^="/"] span')?.textContent || 'Unknown';
        
        return {
          id,
          text: text.substring(0, 150) + (text.length > 150 ? '...' : ''),
          author,
          created_at: new Date().toISOString()
        };
      });
    }, maxTweets);
    
    console.log(`✅ Successfully extracted ${tweets.length} tweets`);
    
    // Display tweets
    if (tweets.length > 0) {
      console.log('\n📋 Sample Tweets:');
      tweets.forEach((tweet, index) => {
        console.log(`\n${index + 1}. Author: ${tweet.author}`);
        console.log(`   Text: ${tweet.text}`);
      });
    } else {
      console.log('   No tweets found. This might be normal if the page structure changed.');
    }
    
    return { success: true, tweets };
    
  } catch (error) {
    console.error('❌ Tweet fetching error:', error.message);
    return { success: false, tweets: [] };
  }
}

async function runTests() {
  console.log('🧪 Starting Simplified Twitter Scraper Tests...\n');
  
  try {
    // Test 1: Login
    const loginResult = await testTwitterLogin();
    
    if (!loginResult.success) {
      console.log('\n❌ Login test failed.');
      console.log('💡 Tips:');
      console.log('   - Check your credentials in .env');
      console.log('   - You may need to solve a captcha manually in the browser');
      console.log('   - Twitter may have changed their login flow');
      console.log('   - Try using saved cookies from a previous successful login');
      
      // Keep browser open for manual intervention
      console.log('\n🔍 Browser window is still open. You can:');
      console.log('   1. Complete login manually');
      console.log('   2. Check for any error messages');
      console.log('   3. Close the browser when done');
      
      return;
    }
    
    // Test 2: Tweet Fetching
    console.log('\n🔄 Testing tweet fetching...');
    const fetchResult = await testTweetFetching(loginResult.page, 'ethereum', 3);
    
    if (fetchResult.success) {
      console.log('\n🎉 All tests completed successfully!');
      console.log(`📊 Summary:`);
      console.log(`   - Login: ✅ Success`);
      console.log(`   - Tweet Fetching: ✅ Success (${fetchResult.tweets.length} tweets)`);
    } else {
      console.log('\n❌ Tweet fetching failed.');
    }
    
    // Keep browser open for inspection
    console.log('\n🔍 Browser window is still open for inspection.');
    console.log('   Close it manually when you\'re done testing.');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
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