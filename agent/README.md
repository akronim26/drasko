# Eliza Trading Bot

A specialized AI trading assistant built on the ElizaOS platform that analyzes market sentiment and generates trade plans. Now with Discord integration for real-time channel monitoring!

## Features

- **Sentiment Analysis**: Analyzes Discord messages for crypto trading sentiment
- **Trade Planning**: Generates trade plans based on sentiment analysis
- **Batch Analysis**: Processes multiple messages for comprehensive market analysis
- **Discord Integration**: Real-time message processing from Discord channels
- **On-Chain Trading**: Execute trades, check balances, and transfer assets (mock implementation)
- **Twitter Analysis**: Fetch and analyze tweets for sentiment and alpha signals
- **Alpha Detection**: Identify high-confidence trading signals from social media
- **Multi-API Support**: Uses Gemini API with OpenAI fallback for sentiment analysis

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp env.example .env
   # Edit .env with your API keys
   ```

3. **Run Tests**
   ```bash
   # Test Discord integration
   npm run test
   
   # Test trading functionality
   npm run test:trading
   
   # Test trading actions
   npm run test:actions
   
   # Test Twitter sentiment analysis
   npm run test:twitter
   ```

4. **Start the Bot**
   ```bash
   npm run dev
   ```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up your environment variables:
```bash
# Copy the example environment file
cp env.example .env

# Add your API keys
GEMINI_API_KEY=your_gemini_api_key_here
DISCORD_APPLICATION_ID=your_discord_application_id
DISCORD_API_TOKEN=your_discord_bot_token

# Optional: OpenAI API (fallback if Gemini fails)
OPENAI_API_KEY=your_openai_api_key_here
```

## Discord Bot Setup

### 1. Create a Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Give it a name (e.g., "TradeBot")
4. Go to the "Bot" section
5. Click "Add Bot"
6. Copy the bot token (you'll need this for `DISCORD_API_TOKEN`)
7. Copy the Application ID (you'll need this for `DISCORD_APPLICATION_ID`)

### 2. Configure Bot Permissions

In the Discord Developer Portal:

1. Go to "OAuth2" → "URL Generator"
2. Select scopes: `bot`, `applications.commands`
3. Select bot permissions:
   - Read Messages/View Channels
   - Send Messages
   - Use Slash Commands
   - Read Message History
4. Copy the generated URL and use it to invite the bot to your server

### 3. Test Discord Integration

```bash
npm run test:discord
```

This will verify your Discord configuration and test message processing.

## Getting API Keys

### Gemini API Key (Primary - Recommended)
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key and add it to your `.env` file as `GEMINI_API_KEY`

**Note**: Gemini API has a generous free tier (15 requests per minute, 1500 requests per day), making it perfect for development and testing.

### OpenAI API Key (Optional - Fallback)
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in and create a new API key
3. Add it to your `.env` file as `OPENAI_API_KEY`

**Note**: The bot will automatically fall back to OpenAI if Gemini fails or hits rate limits.

## Usage

### Starting the Discord Trading Bot (Recommended)

```bash
npm start
```

This starts the full ElizaOS bot with Discord integration enabled. The bot will:
- Connect to Discord and monitor channels
- Analyze crypto-related messages for sentiment
- Generate trading signals and respond with formatted messages
- Provide real-time market analysis

### Starting the Simplified Trading Bot (Console Only)

```bash
npm run start:simple
```

This bypasses the complex ElizaOS initialization and provides a fast, interactive trading bot for console use.

### Example Discord Interactions

#### User sends: "ETH is going to moon! 🚀"

**Bot responds:**
```
**Trading Signal Detected!**

Action: BUY
Pair: ETH/USDC
Amount: 0.1 ETH
Target: 3000 USD
Sentiment Score: 0.85

Remember: This is analysis only, not financial advice.
```

#### User sends: "BTC looking bearish today"

**Bot responds:**
```
**Trading Signal Detected!**

Action: SELL
Pair: BTC/USDC
Amount: 0.01 BTC
Target: 3500 USD
Sentiment Score: -0.72

Remember: This is analysis only, not financial advice.
```

## Supported Tokens

The bot currently analyzes sentiment for:
- ETH (Ethereum)
- USDC (USD Coin)
- SOL (Solana)
- BTC (Bitcoin)

## Trading Actions

The bot includes on-chain trading capabilities inspired by the Coinbase CDP kit:

- **Trade Execution**: Execute trades based on sentiment analysis
- **Balance Checking**: Check wallet balances for various assets
- **Asset Transfer**: Transfer assets to other addresses
- **Automated Trading**: Trigger trades from Discord commands

See [TRADING_ACTIONS.md](./TRADING_ACTIONS.md) for detailed documentation.

### Example Commands

```
User: Check my ETH balance
Bot: **Balance Check**
     **Asset:** ETH
     **Balance:** 1.234567 ETH

User: execute trade
Bot: **Trade Executed Successfully!**
     **Action:** BUY
     **Pair:** ETH/USDC
     **Amount:** 0.1 ETH
     **Transaction Hash:** 0x1234...

User: Transfer 0.1 ETH to 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6
Bot: **Transfer Successful!**
     **Asset:** ETH
     **Amount:** 0.1
     **Transaction Hash:** 0x1234...
```

## Configuration

The bot can be customized by modifying:

- **`src/character.ts`**: Bot personality, Discord settings, and client configuration
- **`src/plugins/trade-planner.ts`**: Trading logic, sentiment analysis, and response formatting
- **`src/clients/index.ts`**: Client initialization and Discord integration

### Discord Configuration

To restrict the bot to specific channels:
1. Create a role for the bot in your Discord server
2. Give the role permissions only to specific channels
3. Assign the role to the bot

## Development

### Adding New Features

1. **New Tokens**: Add to `supportedTokens` array in the plugin
2. **New Actions**: Create new action handlers in the plugin
3. **Enhanced Analysis**: Extend the sentiment analysis logic
4. **Discord Commands**: Add slash commands for additional functionality

### Testing

```bash
# Test Discord integration
npm run test:discord

# Build the project
npm run build

# Start the simplified bot
npm run start:simple

# Start the full ElizaOS bot with Discord
npm start
```

## Troubleshooting

### Common Issues

1. **"Missing required environment variables"**
   - Make sure you have a `.env` file with all required API keys
   - Check `DISCORD_SETUP.md` for detailed setup instructions

2. **Bot not responding in Discord**
   - Check that the bot token is correct
   - Verify the bot has proper permissions
   - Ensure the bot is online in Discord
   - Test with `npm run test:discord`

3. **"Bot stuck on initialization"**
   - Use the simplified version: `npm run start:simple`
   - This bypasses complex ElizaOS initialization

4. **API Rate Limits**
   - Gemini API has generous limits (15 req/min, 1500 req/day)
   - If you hit Gemini limits, the bot will fall back to OpenAI
   - OpenAI has rate limits based on your plan

### Discord-Specific Issues

1. **Bot not joining channels**
   - Check bot permissions in Discord
   - Verify the bot was invited with proper scopes
   - Ensure the bot role has channel access

2. **No trading signals in Discord**
   - Make sure messages contain crypto-related content
   - Check that the sentiment score threshold is met (0.5)
   - Verify API keys are working

## Security Notes

- Never share your bot tokens publicly
- Use environment variables for all sensitive data
- The bot only analyzes messages, it doesn't execute trades
- All responses include disclaimers about financial advice
- Discord bot tokens should be kept secure

## Disclaimer

This trading bot is for educational and research purposes. Always do your own research and consider the risks involved in cryptocurrency trading. The bot's recommendations should not be considered as financial advice.

## License

This project is licensed under the same terms as the ElizaOS platform.

## Twitter Analysis

The bot can fetch and analyze tweets for cryptocurrency sentiment and alpha signal detection:

- **Tweet Fetching**: Retrieves recent tweets for specific cryptocurrencies
- **Sentiment Analysis**: Analyzes tweet sentiment using AI (bullish/bearish/neutral)
- **Alpha Detection**: Identifies high-confidence trading signals from social media
- **Risk Assessment**: Evaluates risk levels and potential impact of signals
- **Engagement Scoring**: Considers retweets, likes, and replies for signal strength

### Example Commands

```
User: Fetch tweets for ETH
Bot: **Twitter Sentiment Analysis for ETH**
     **Tweets Analyzed:** 10
     **Overall Sentiment:** Bullish
     **Alpha Signals:** 3 high-confidence signals detected
     **Top Keywords:** adoption, institutional, momentum

User: Find alpha signals for BTC
Bot: **Alpha Signal Analysis for BTC**
     **High-Confidence Alphas:** 5 signals
     **Average Alpha Score:** 8.2
     **Risk Distribution:** Low: 3, Medium: 2, High: 0
     **Top Signals:** institutional, adoption, momentum
```