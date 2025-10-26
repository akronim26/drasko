# Drasko: AI-Powered Social Trading Agent

Drasko is a decentralized protocol that empowers users to deploy autonomous AI trading agents on the blockchain.

This repository contains three primary components:

- `contracts/` — Solidity smart contracts and tests.
- `frontend/` — frontend for interacting with agents and contracts.
- `agent/` — An off-chain AI/automation agent used for trading, social scraping, and integrations.

## Transaction Hashes

`Agent Factory:` [0x5EdF2B5Ae6DB39012C188027D8Fe874747D957c2](https://sepolia.etherscan.io/address/0x5EdF2B5Ae6DB39012C188027D8Fe874747D957c2)

`Mock DAI:` [0xED8470EaA77f22A92273253114d40477aCE078c5](https://sepolia.etherscan.io/address/0xED8470EaA77f22A92273253114d40477aCE078c5)

`Mock WETH:` [0xb04bB2e7c8e86760cAa613882d86B459274Eb445](https://sepolia.etherscan.io/address/0xb04bB2e7c8e86760cAa613882d86B459274Eb445)

`Mock MKR:` [0xf05A1d88741C4331bC27dE9df8eB319e7B11E5cC](https://sepolia.etherscan.io/address/0xf05A1d88741C4331bC27dE9df8eB319e7B11E5cC)

`Mock AMM:` [0xD4e1734749e948A733eD3653a6b6133733667C99](https://sepolia.etherscan.io/address/0xD4e1734749e948A733eD3653a6b6133733667C99)

## Table of Contents

<ol>
    <li><a href="#1-description">Description</a>
    </li>
    <li><a href="#2-working-of-agent">Working of Agent</a>
    </li>
    <li><a href="#3-features">Features</a></li>
    <li><a href="#4-getting-started">Getting Started</a>
        <ul>
            <li><a href="#41-prerequisites">Prerequisites</a></li>
            <li><a href="#42-installation">Installation</a></li>
            <li><a href="#43-configuration">Configuration</a></li>
            <li><a href="#44-running-locally">Running Locally</a></li>
        </ul>
    </li>
    <li><a href="#5-usage-deep-dive">Usage (Deep-Dive)</a>
        <ul>
            <li><a href="#agentfactorysol">AgentFactory.sol</a></li>
            <li><a href="#agentsol">Agent.sol</a></li>
            <li><a href="#mockammsol">MockAMM.sol</a></li>
        </ul>
    </li>
    <li><a href="#6-deployment">Deployment</a></li>
    <li><a href="#7-project-status">Project Status</a></li>
    <li><a href="#8-contributing">Contributing</a></li>
    <li><a href="#9-project-license">Project License</a></li>
    <li><a href="#10-references">References</a></li>
</ol>

## 1. Description

Drasko is a decentralized protocol that empowers users to deploy autonomous AI trading agents on the blockchain. These agents can analyze social media sentiment (from platforms like Twitter, Telegram, and Discord) and execute trades on your behalf based on natural language commands.

This project bridges the gap between social data and decentralized finance (DeFi) by using AI to interpret market sentiment and a secure smart contract architecture to manage funds and execute on-chain actions. Each user's agent operates from a dedicated, non-custodial smart contract, ensuring that only the user (the **owner**) has control over their funds, while trade execution is securely delegated to an **authorized signer**.

## 2. Working of Agent

Here is a typical workflow demonstrating how a user interacts with their Drasko agent:

```

You: fetch me some tweets related to ETH/USDC
Agent: Okay, fetching recent tweets related to ETH/USDC and will display them to you. Please wait...
Agent: *Twitter Sentiment Analysis for ETH*

*Tweets Analyzed:* 10
*Overall Sentiment:* Neutral
*Sentiment Breakdown:* Bullish: 0, Bearish: 0, Neutral: 10
*Alpha Signals:* 0 signals detected
*High-Confidence Alphas:* 0
*Top Keywords:* Analysis based on recent Twitter activity.
You: show me the tweets
Agent: Okay, here are the latest tweets I've found related to ETH/USDC:

[Tweet 1]: "ETH consolidating after the recent surge. Is this a bull flag? \#ETH \#Crypto"
[Tweet 2]: "USDC yields dropping on DeFi platforms. Where's the best place to stake now? \#USDC \#DeFiYield"
[Tweet 3]: "ETH scaling solutions making progress. Transaction speeds are improving. \#Ethereum \#Layer2"
[Tweet 4]: "USDC market cap hits new milestone. Confidence in stablecoins growing. \#USDC \#Stablecoins"
[Tweet 5]: "ETH whales moving large amounts to exchanges. Potential sell-off incoming? \#ETHUSD \#WhaleAlert"
You: now run sentiment analysis on these tweets
Agent: Okay, here's the sentiment analysis of the latest tweets related to ETH/USDC:

  * *Overall Sentiment:* Mixed.
  * *Positive Tweets:* Tweets 3 and 4 express positive sentiment towards ETH and USDC, highlighting improvements in ETH scaling solutions and USDC's market cap milestone.
  * *Negative Tweets:* Tweets 2 and 5 raise concerns about dropping USDC yields and potential sell-offs due to whale activity.
  * *Neutral Tweets:* Tweet 1 suggests ETH is consolidating, which could be a bullish or bearish sign depending on the breakout direction.

*Sentiment Score:*

  * Positive: 40%
  * Neutral: 20%
  * Negative: 40%

*Potential Trading Signals:*

  * The mixed sentiment suggests a cautious approach. While there are positive developments in scaling solutions and market cap, concerns about yields and potential sell-offs need to be considered.

*Disclaimer:* This analysis is based on a limited number of tweets and should not be considered financial advice. Always do your own research and consider multiple sources before making any trading decisions.
You: now make a tradePlan for the above sentiment analysis
Agent: Okay, based on the latest sentiment analysis, here's an updated trade plan for ETH/USDC. Please remember that this is for informational purposes only and not financial advice. Always conduct your own research before making any trades.

*Trade Plan: ETH/USDC (Revised)*

  * *Objective:* Navigate the mixed sentiment surrounding ETH and USDC, balancing positive developments with potential risks.
  * *Strategy:* Range Trading / Consolidation
  * *Entry Point:* Given the consolidation phase, consider setting buy orders near the lower end of the current trading range, anticipating a bounce. Look for confluence with technical indicators like support levels or Fibonacci retracements.
  * *Stop Loss:* Place a stop-loss order just below the lower end of the trading range to protect against a breakdown. A tighter stop-loss can be used if you are more risk-averse.
  * *Take Profit:* Set a take-profit target near the upper end of the trading range, anticipating resistance at that level. Be realistic with profit expectations given the mixed sentiment.
  * *USDC Monitoring:* Continue to monitor USDC yields and news related to stablecoin regulations. Dropping yields could indicate a decrease in demand or changes in the DeFi landscape.
  * *Whale Activity:* Closely monitor whale activity. Large transfers to exchanges could signal an impending sell-off. Use on-chain analytics tools to track whale movements.
  * *Risk Management:* Allocate a smaller percentage of your portfolio to this trade due to the mixed sentiment and consolidation phase (e.g., 1-2%).
  * *Alternative Scenario:* If ETH breaks out of the consolidation range, be prepared to adjust the trade plan accordingly. A breakout to the upside could signal a resumption of the uptrend, while a breakdown could lead to further downside.

*Disclaimer:* This is a hypothetical trade plan based on the provided sentiment analysis and technical observations. Market conditions can change rapidly. Always use risk management techniques and consult with a financial advisor before making any investment decisions.

````

## 3. Features

* **Agent Factory:** A factory contract (`AgentFactory.sol`) to deploy new, isolated `Agent` contracts for each user.
* **Non-Custodial Fund Management:** Users send funds (ETH) directly to their own `Agent` contract and remain the sole owner with withdrawal rights.
* **Secure Delegated Execution:** Trades are executed by a trusted backend **authorized signer**. This is secured using EIP-712 typed signatures, meaning the backend can only execute trades that the user's AI has explicitly approved.
* **Replay Protection:** Implements a nonce-tracking mechanism to ensure that a signed trade message can only be executed once.
* **Platform Agnostic:** Designed to work with multiple social platforms, defined by the `Platform` enum (Twitter, Telegram, Discord).
* **Safety Controls:** Agents include `pauseAgent` and `resumeAgent` functions, allowing the owner to halt all activity (except withdrawals) in an emergency.
* **AMM Integration:** Natively connects to an AMM (represented by `MockAMM.sol`) to execute swaps from ETH to various ERC20 tokens.
* **Gasless for Users:** The user interacts via natural language. The authorized signer pays the gas fees for executing the `executeSwap` transaction, creating a smooth user experience.
* **EIP-712 Compliance:** Uses EIP-712 standards for structured data signing, providing clear and readable signature prompts in user wallets.

## 4. Getting Started

This guide covers setting up the smart contract environment.

### 4.1. Prerequisites

* [Foundry](https://getfoundry.sh/) (Includes `forge` and `cast`)
* [Node.js](https://nodejs.org/en) (v18 or later)

### 4.2. Installation

1.  Clone the repository:
    ```bash
    git clone github.com/akronim26/drasko
    cd drasko/contracts
    ```
2.  Install dependencies (like OpenZeppelin contracts):
    ```bash
    forge install
    ```

### 4.3. Configuration

Contract parameters (like mock token addresses, AMM addresses, etc.) are managed within the deployment scripts in the `script/` directory.

### 4.4. Running Locally

1.  **Build Contracts:**
    ```bash
    forge build
    ```
2.  **Run Tests:**
    ```bash
    forge test
    ```

## 5. Usage (Deep-Dive)

The core logic is split between two main contracts: `AgentFactory.sol` and `Agent.sol`.

### `AgentFactory.sol`

This contract acts as the entry point for users. Its primary role is to create and track `Agent` contracts.

**`createAgent`**

This is the main function a user calls to get their own agent. It deploys a new `Agent` contract and funds it with the `msg.value` (ETH) sent in the transaction.

```solidity
/// @notice Creates a new trading agent
/// @param _tokens Array of token addresses that the agent will support
/// @param _platformType The platform type for the agent (Twitter, Telegram, or Discord)
/// @param authorizedSigner Address that will be authorized to execute trades
/// @param _mockAMM The address of the MockAMM contract
/// @return agent The address of the newly created Agent contract
function createAgent(
    address[] memory _tokens,
    Platform _platformType,
    address authorizedSigner,
    address _mockAMM
) 
external payable returns (Agent) {
    if (_tokens.length == 0) {
        revert Factory__NoTokenPresent();
}
    if (!isValidPlatform(_platformType)) {
        revert Factory__PlatformNotAvailable();
}
    if (msg.value <= 0) {
        revert Factory__AmountIsZero();
}

    Agent agent = new Agent{value: msg.value}(
        _tokens,
        _platformType,
        authorizedSigner,
        msg.sender,
        _mockAMM
    );
AgentInfo memory info = AgentInfo({
        agentAddress: address(agent),
        owner: msg.sender,
        tokens: _tokens,
        amountInvested: msg.value,
        platformType: _platformType
    });
userToAgents[msg.sender].push(info);
    emit Factory__AgentCreated(address(agent), _platformType, _tokens);
    return agent;
}
````

-----

### `Agent.sol`

This is the user's personal trading contract. It holds the user's funds and contains the logic for executing signed trades.

**`executeSwap`**

This is the most critical function. It can **only** be called by the `authorizedSigner`. It verifies an EIP-712 signature to ensure the trade is valid, checks the deadline, and prevents replays using a nonce. If all checks pass, it calls the `MockAMM` to perform the swap.

```solidity
/// @notice Executes a trade if the signature and parameters are valid
/// @param data The trade data
/// @param signature The EIP-712 signature
function executeSwap(
    TradeData memory data,
    bytes calldata signature
) external nonReentrant onlyAuthorized {
    if (block.timestamp > data.deadline) {
        revert Agent__DeadlinePassed();
}
    if (noncesUsed[data.nonce] == true) {
        revert Agent__NonceAlreadyUsed();
}

    if (signature.length != 65) {
        revert Agent__IncorrectSignatureLength();
}

    if (tokensPresent[data.tokenOut] == false) {
        revert Agent__InvalidTokens();
}

    bool valid = verifySignature(data, signature);
if (!valid) {
        revert Agent__IncorrectSignature();
}

    uint256 amountOut = i_mockAMM.swapETHForTokens{value: data.amountIn}(
        data.tokenOut,
        data.minAmountOut
    );
_transferTokensToOwner(data.tokenOut, amountOut);

    noncesUsed[data.nonce] = true;

    emit Agent__TradeExecuted(
        msg.sender,
        data.tokenOut,
        data.amountIn,
        amountOut
    );
}
```

**`TradeData` Struct & Signature Verification**

The `executeSwap` function relies on the `TradeData` struct and EIP-712 verification. The backend signs this struct, and the contract verifies it.

```solidity
/// @param nonce Unique identifier to prevent replay attacks
struct TradeData {
    address tokenOut;
uint256 amountIn;
    uint256 minAmountOut;
    uint256 deadline;
    uint256 nonce;
}

/// @notice Verifies the EIP-712 signature for the given TradeData
/// @param data The TradeData struct to verify
/// @param signature The signature to verify
/// @return True if the signature is valid and signed by the authorized signer, false otherwise
function verifySignature(
    TradeData memory data,
    bytes calldata signature
) internal view returns (bool) {
    bytes32 digest = calculateDigest(data);
address signer = digest.recover(signature);
    return signer == authorizedSigner;
}
```

**Fund Management**

The user (`owner`) can add or withdraw their ETH at any time. These functions are protected by the `onlyOwner` modifier.

```solidity
/// @notice Allows user to add funds to the agent
function addFunds() external payable nonReentrant onlyOwner {
    if (msg.value == 0) {
        revert Agent__AmountIsZero();
}
    pauseAgent();
    _addFunds(msg.value);
    resumeAgent();
}

/// @notice Withdraws all funds from the agent to the owner
function withdrawFunds() external nonReentrant onlyOwner {
    pauseAgent();
_withdrawFunds();
    resumeAgent();
}
```

**Safety Controls**

The owner can pause and resume the agent. When paused, no new trades can be executed.

```solidity
/// @notice Pauses the agent
function pauseAgent() public onlyOwner {
    if (isPaused) {
        revert Agent__AgentIsPaused();
}
    isPaused = true;
    emit Agent__AgentPaused();
}

/// @notice Resumes the agent
function resumeAgent() public onlyOwner {
    if (!isPaused) {
        revert Agent__AgentIsRunning();
}
    isPaused = false;
    emit Agent__AgentResumed();
}
```

-----

### `MockAMM.sol`

A simple Constant Product (`x * y = k`) AMM for testing purposes.

**`swapETHForTokens`**

This function is called by the `Agent` contract to execute the swap. It calculates the token `amountOut` based on the ETH `msg.value` and the pool's reserves, applying a small fee.

```solidity
function swapETHForTokens(
    address tokenOut,
    uint256 minAmountOut
) external payable nonReentrant returns (uint256 amountOut) {
    if (msg.value == 0) revert MockAMM__InsufficientETH();
if (tokenOut == address(0)) revert MockAMM__InvalidToken();

    Pool storage pool = pools[tokenOut];
if (pool.ethReserve == 0 || pool.tokenReserve == 0) {
        revert MockAMM__InsufficientLiquidity();
}

    uint256 amountInWithFee = msg.value * (FEE_DENOMINATOR - FEE_NUMERATOR);
uint256 numerator = amountInWithFee * pool.tokenReserve;
    uint256 denominator = (pool.ethReserve * FEE_DENOMINATOR) +
        amountInWithFee;
amountOut = numerator / denominator;

    if (amountOut < minAmountOut)
        revert MockAMM__InsufficientOutputAmount();
if (amountOut >= pool.tokenReserve)
        revert MockAMM__InsufficientLiquidity();

    pool.ethReserve += msg.value;
pool.tokenReserve -= amountOut;

    IERC20(tokenOut).safeTransfer(msg.sender, amountOut);

    emit MockAMM__Swap(
        msg.sender,
        address(0),
        tokenOut,
        msg.value,
        amountOut
    );
}
```

**`addLiquidity`**

A standard function to add liquidity to an ETH/Token pair.

```solidity
function addLiquidity(
    address token,
    uint256 tokenAmount
) external payable nonReentrant returns (uint256 lpTokens) {
    if (msg.value == 0 || tokenAmount == 0)
    
    revert MockAMM__InsufficientETH();
    if (token == address(0)) revert MockAMM__InvalidToken();

    Pool storage pool = pools[token];

    IERC20(token).safeTransferFrom(msg.sender, address(this), tokenAmount);
if (pool.totalSupply == 0) {
        lpTokens = sqrt(msg.value * tokenAmount);
pool.ethReserve = msg.value;
        pool.tokenReserve = tokenAmount;
        pool.totalSupply = lpTokens;
    } else {
        // ... logic for adding to existing pool
}
    // ...
}
```

## 6\. Deployment

The project includes Foundry scripts for deployment:

  * `DeployMocks.s.sol`: Deploys mock ERC20 tokens (DAI, MKR, WETH).
  * `DeployInfrastructure.s.sol`: Deploys the `MockAMM` and the `AgentFactory`.

To deploy to a testnet (e.g., Sepolia), configure your `foundry.toml` and run:

```bash
forge script script/DeployInfrastructure.s.sol:DeployInfrastructure --rpc-url $SEPOLIA_RPC_URL --private-key $PRIVATE_KEY --broadcast --verify
```

## 7\. Project Status

This project is currently in development. The core smart contract architecture is complete and tested, but it should be considered experimental.

## 8\. Contributing

Contributions are welcome\! Please fork the repository, make your changes on a separate branch, and submit a pull request for review.

## 9\. Project License

This project is licensed under the MIT License.

```
MIT License

Copyright (c) 2025 ai16z

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 10\. References

  * [EIP-712: Typed structured data hashing and signing](https://eips.ethereum.org/EIPS/eip-712)
  * [OpenZeppelin Contracts](https://github.com/OpenZeppelin/openzeppelin-contracts)
  * [Foundry](https://getfoundry.sh/)
