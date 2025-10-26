# Discord Trading Bot Setup

This guide will help you set up the TradeBot to analyze messages from Discord channels for trading sentiment.

## Prerequisites

1. A Discord application and bot token
2. OpenAI API key (or Gemini API key as fallback)
3. Node.js 22+ installed

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

### 3. Environment Variables

Create a `.env` file in your project root:

```env
# Gemini API (Primary - Required)
GEMINI_API_KEY=your_gemini_api_key_here

# OpenAI API (Optional - Fallback if Gemini fails)
OPENAI_API_KEY=your_openai_api_key_here

# Discord Bot Configuration
DISCORD_APPLICATION_ID=your_discord_application_id
DISCORD_API_TOKEN=your_discord_bot_token
```

## Running the Bot

### Start the Full ElizaOS Bot

```bash
npm start
```

This will start the bot with Discord integration enabled.

### Bot Features

The TradeBot will:

1. **Monitor Discord Channels**: Automatically analyze messages in channels where the bot has access
2. **Sentiment Analysis**: Detect trading sentiment in crypto-related messages
3. **Generate Trade Plans**: Create actionable trade plans for strong signals
4. **Discord-Formatted Responses**: Provide nicely formatted responses with emojis and markdown

### Supported Triggers

The bot will analyze messages containing:
- Crypto tokens: ETH, BTC, SOL, USDC
- Trading terms: moon, pump, dump, bull, bear, hodl, fomo, fud
- Dollar signs ($) in Discord messages

### Example Interactions

**User sends:** "ETH is going to moon! 🚀"

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

## Channel Configuration

The bot will analyze messages in any channel where it has:
- Read message permissions
- Send message permissions

To restrict the bot to specific channels:
1. Create a role for the bot
2. Give the role permissions only to specific channels
3. Assign the role to the bot

## Troubleshooting

### Bot Not Responding
- Check that the bot token is correct
- Verify the bot has proper permissions
- Ensure the bot is online in Discord

### No Trading Signals
- Make sure messages contain crypto-related content
- Check that the sentiment score threshold is met (0.5)
- Verify API keys are working

### API Quota Issues
- Gemini API has generous limits (15 req/min, 1500 req/day)
- If Gemini quota is exceeded, the bot will automatically fall back to OpenAI
- Set up both API keys for redundancy

## Security Notes

- Never share your bot tokens publicly
- Use environment variables for all sensitive data
- The bot only analyzes messages, it doesn't execute trades
- All responses include disclaimers about financial advice

## Advanced Configuration

You can modify the bot's behavior by editing:
- `src/character.ts` - Bot personality and settings
- `src/plugins/trade-planner.ts` - Trading logic and sentiment analysis
- `src/clients/index.ts` - Client initialization

## Support

For issues or questions:
1. Check the logs for error messages
2. Verify all environment variables are set
3. Ensure Discord bot permissions are correct
4. Test with simple messages first 