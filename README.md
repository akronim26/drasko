
# Drasko

Drasko is a modular project built with the purpose of making the trading on-chain smoother.

This repository contains three primary components:

- `contracts/` — Solidity smart contracts and tests.
- `frontend/` — frontend for interacting with agents and contracts.
- `agent/` — An off-chain AI/automation agent used for trading, social scraping, and integrations.

## Deployed Contracts

The following contract addresses are provided for use on the Ethereum Sepolia testnet:

- AgentFactory: 0x0d970e26953e488d96544951CA414c0692df4731
- MockDAI:      0x7Da8AFd2FC6d0A0d266956531CA3472ed7f7CFfb
- MockWETH:     0xe1Fd2ABAcB60D874aaE63fb72E4e4960a8eD69D7
- MockMKR:      0x0138A4138575d47E8e8EfEC415e3128d05525c10
- MockAMM:      0x74b2d933ca03e971bEDA9861c1D842e4922247Fe

## Repository layout

- contracts/ — Solidity sources, mocks and tests. Built for Foundry (forge).
- frontend/  — React + Vite application. UI for creating agents and interacting with contracts.
- agent/     — TypeScript-based agent framework. Contains bots, scrapers and trading utilities.

## Prerequisites

- Node.js >= 22 (agent requires Node >= 22 per package.json).
- pnpm (recommended) or npm/yarn for JS packages.
- Foundry (forge) for building and running Solidity tests. Install from https://book.getfoundry.sh/
- A JSON-RPC endpoint (local node, Alchemy, Infura or similar) for testing against networks.

## Quickstart

These quick instructions will get each component running locally.

### 1) Contracts (Foundry)

Build and test the contracts using Foundry:

```bash
# from repository root
cd contracts
forge build
forge test
```

### 2) Frontend (Vite + React)

The frontend is located in `frontend/` and uses Vite. From the repository root:

```bash
cd frontend
# install packages (pnpm recommended)
pnpm install
pnpm run dev
# or using npm
npm install
npm run dev
```

### 3) Agent (Node / TypeScript)

The `agent/` folder contains an extensible agent written in TypeScript. It includes example bots, scrapers and trading actions.

Install and run the agent:

```bash
cd agent
pnpm install
# run in dev mode (recommended for development)
pnpm run dev

# build and run production
pnpm run build
pnpm start
```

## Contributing

Contributions are welcome. For larger changes, please open an issue to discuss the planned work. Pull requests should include tests and follow the repo's code style.

When contributing:

- Run `forge test` in `contracts/` to ensure Solidity tests pass.
- Run `pnpm install` and `pnpm run dev` in `frontend/` and `agent/` to validate JS/TS changes locally.

## License

This repository includes various licenses in subfolders (see `contracts/lib` for included third-party licenses). The top-level license is included in the project root.

