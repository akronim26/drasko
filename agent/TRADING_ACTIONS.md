# Trading Actions Plugin

This plugin adds on-chain trading capabilities to TradeBot, inspired by the Coinbase CDP kit. It allows the bot to execute trades, check balances, and transfer assets based on sentiment analysis.

## Features

### 1. Trade Execution (`EXECUTE_TRADE`)
- Executes trades on-chain based on sentiment analysis
- Supports buy/sell actions for various token pairs
- Integrates with the trade planner plugin for automated trading
- Provides transaction hashes and execution details

### 2. Balance Checking (`GET_BALANCE`)
- Checks wallet balances for various assets (ETH, BTC, SOL, USDC)
- Supports natural language queries like "Check my ETH balance"
- Returns formatted balance information

### 3. Asset Transfer (`TRANSFER_ASSET`)
- Transfers assets to other addresses
- Supports both regular addresses and ENS names
- Provides transaction confirmation with hash

## Setup

### 1. Environment Variables

Add these to your `.env` file:

```bash
# CDP Configuration (for real trading)
CDP_API_KEY_ID=your_cdp_api_key_id
CDP_API_KEY_SECRET=your_cdp_api_key_secret

# Existing Discord and API keys
DISCORD_APPLICATION_ID=your_discord_app_id
DISCORD_API_TOKEN=your_discord_token
GEMINI_API_KEY=your_gemini_key
OPENAI_API_KEY=your_openai_key
```

### 2. CDP Integration (Coming Soon)

The current implementation uses mock functions. To enable real trading:

1. Install the Coinbase CDP SDK:
```bash
npm install @coinbase/coinbase-sdk
```

2. Replace the mock functions in `src/plugins/trading-actions.ts` with real CDP calls
3. Configure your CDP wallet and API keys

## Usage

### Discord Commands

#### Execute a Trade
```
User: execute trade
Bot: **Trade Executed Successfully!**
     **Action:** BUY
     **Pair:** ETH/USDC
     **Amount:** 0.1 ETH
     **Received:** 0.11 USDC
     **Transaction Hash:** 0x1234...
     **Sentiment Score:** 0.75
```

#### Check Balance
```
User: Check my ETH balance
Bot: **Balance Check**
     **Asset:** ETH
     **Balance:** 1.234567 ETH
```

#### Transfer Assets
```
User: Transfer 0.1 ETH to 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6
Bot: **Transfer Successful!**
     **Asset:** ETH
     **Amount:** 0.1
     **Destination:** 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6
     **Transaction Hash:** 0x1234...
```

### Automated Trading Flow

1. **Sentiment Analysis**: Bot analyzes Discord messages for trading signals
2. **Trade Plan Generation**: Creates a trade plan with action, amount, and target price
3. **User Confirmation**: User can request trade execution with "execute trade"
4. **On-Chain Execution**: Bot executes the trade and provides transaction details

## Supported Assets

- **Ethereum**: ETH
- **Bitcoin**: BTC
- **Solana**: SOL
- **USD Coin**: USDC
- **Other ERC-20 tokens**: Configurable

## Supported Networks

Currently configured for:
- **Base Mainnet**: Primary trading network
- **Ethereum Mainnet**: Secondary network
- **Testnets**: For development and testing

## Security Considerations

### Current Implementation (Mock)
- Uses mock functions for demonstration
- No real funds are at risk
- Transaction hashes are simulated

### Production Implementation
- Requires proper CDP wallet setup
- API keys should be securely stored
- Implement proper error handling and validation
- Add transaction confirmation delays
- Consider implementing trading limits and safeguards

## Error Handling

The plugin includes comprehensive error handling:

- **Insufficient Balance**: Checks wallet balance before trades
- **Invalid Addresses**: Validates destination addresses
- **Network Issues**: Handles connection failures gracefully
- **API Limits**: Respects rate limits and quotas

## Development

### Adding New Actions

1. Create a new action in `src/plugins/trading-actions.ts`
2. Add validation logic for message detection
3. Implement the handler function
4. Add examples to the character configuration
5. Test with the Discord bot

### Mock vs Real Implementation

The current implementation uses mock functions. To switch to real trading:

```typescript
// Replace mock function
async function executeTrade(...) {
  // Mock implementation
  const mockTxHash = `0x${Math.random().toString(16).substring(2, 66)}`;
  return { success: true, transactionHash: mockTxHash };
}

// With real CDP implementation
async function executeTrade(...) {
  const tradeResult = await cdpWallet.createTrade({
    amount: amount,
    fromAssetId: getAssetId(fromAsset),
    toAssetId: getAssetId(toAsset),
  });
  return await tradeResult.wait();
}
```

## Testing

### Test Script

Run the test script to verify functionality:

```bash
npm run test:trading
```

### Manual Testing

1. Start the Discord bot
2. Send messages with trading keywords
3. Request balance checks and transfers
4. Verify responses and mock transaction hashes

## Troubleshooting

### Common Issues

1. **Plugin Not Loaded**: Ensure `tradingActionsPlugin` is included in character configuration
2. **Invalid Commands**: Check message validation patterns
3. **Mock Responses**: Verify you're using the mock implementation for testing

### Debug Mode

Enable debug logging by setting:

```bash
DEBUG=elizaos:*
```

## Roadmap

- [ ] Real CDP integration
- [ ] Additional asset support
- [ ] Advanced trading strategies
- [ ] Portfolio management
- [ ] Risk management features
- [ ] Multi-network support
- [ ] Trading history and analytics

## Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License. 