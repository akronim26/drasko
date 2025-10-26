import puppeteer from 'puppeteer';

interface TwitterCredentials {
  username: string;
  password: string;
  email?: string;
  cookies?: string;
}

interface Tweet {
  id: string;
  text: string;
  author: string;
  created_at: string;
  public_metrics: {
    retweet_count: number;
    reply_count: number;
    like_count: number;
    quote_count: number;
  };
}

// Helper function for delays
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Logs in to Twitter and fetches tweets for a given query.
 * @param query The search query (e.g., 'ethereum')
 * @param credentials Twitter credentials from .env
 * @param maxTweets Maximum number of tweets to fetch
 */
export async function fetchTweetsWithLogin(
  query: string,
  credentials: TwitterCredentials,
  maxTweets: number = 10
): Promise<{ tweets: Tweet[]; count: number; success: boolean; error?: string }> {
  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: true, // Set to true for production
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set user agent to avoid detection
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Optionally set cookies if provided
    if (credentials.cookies) {
      try {
        const cookies = JSON.parse(credentials.cookies);
        await page.setCookie(...cookies);
      } catch (error) {
        console.log('Failed to parse cookies, proceeding with login');
      }
    }
    
    // Go to Twitter login
    await page.goto('https://twitter.com/login', { waitUntil: 'networkidle2' });
    await delay(3000);
    
    // Check if already logged in
    const isLoggedIn = await page.evaluate(() => {
      const indicators = [
        '[data-testid="SideNav_AccountSwitcher_Button"]',
        '[data-testid="AppTabBar_Home_Link"]',
        '[data-testid="primaryColumn"]'
      ];
      return indicators.some(selector => document.querySelector(selector) !== null);
    });
    
    // If not already logged in, perform login
    if (!isLoggedIn) {
      // Enter username
      await page.waitForSelector('input[name="text"]', { timeout: 15000 });
      await page.type('input[name="text"]', credentials.username, { delay: 50 });
      await page.keyboard.press('Enter');
      await delay(2000);
      
      // If Twitter asks for email, fill it
      if (credentials.email) {
        try {
          await page.waitForSelector('input[name="text"]', { timeout: 5000 });
          await page.type('input[name="text"]', credentials.email, { delay: 50 });
          await page.keyboard.press('Enter');
          await delay(2000);
        } catch (error) {
          // Email field not found, continue
        }
      }
      
      // Enter password
      await page.waitForSelector('input[name="password"]', { timeout: 15000 });
      await page.type('input[name="password"]', credentials.password, { delay: 50 });
      await page.keyboard.press('Enter');
      await delay(5000);
    }
    
    // Go to search page
    const searchUrl = `https://twitter.com/search?q=${encodeURIComponent(query)}&src=typed_query&f=live`;
    await page.goto(searchUrl, { waitUntil: 'networkidle2' });
    await delay(4000);
    
    // Scroll to load more tweets
    let lastHeight = await page.evaluate('document.body.scrollHeight');
    let scrollCount = 0;
    
    while (scrollCount < 3) { // Limit scrolling for performance
      await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
      await delay(2000);
      
      let newHeight = await page.evaluate('document.body.scrollHeight');
      if (newHeight === lastHeight) break;
      
      lastHeight = newHeight;
      scrollCount++;
      
      const tweetCount = await page.evaluate(() => document.querySelectorAll('article').length);
      if (tweetCount >= maxTweets) break;
    }
    
    // Extract tweets
    const tweets: Tweet[] = await page.evaluate((maxTweets) => {
      const tweetNodes = Array.from(document.querySelectorAll('article')).slice(0, maxTweets);
      return tweetNodes.map((node: any, index: number) => {
        const text = node.innerText || '';
        const id = node.querySelector('a[href*="/status/"]')?.getAttribute('href')?.split('/status/')[1] || `tweet_${index}`;
        const author = node.querySelector('a[role="link"][href^="/"] span')?.textContent || 'Unknown';
        const created_at = node.querySelector('time')?.getAttribute('datetime') || new Date().toISOString();
        
        return {
          id,
          text: text.substring(0, 500), // Limit text length
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
    
    await browser.close();
    return { tweets, count: tweets.length, success: true };
  } catch (error) {
    if (browser) await browser.close();
    return { 
      tweets: [], 
      count: 0, 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
} 