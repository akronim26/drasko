
# Drasko

Drasko is a modular project built with the purpose of making the trading on-chain smoother.

This repository contains three primary components:

- `contracts/` — Solidity smart contracts and tests.
- `frontend/` — frontend for interacting with agents and contracts.
- `agent/` — An off-chain AI/automation agent used for trading, social scraping, and integrations.

## Deployed Contracts

The following contract addresses are provided for use on the Ethereum Sepolia testnet:

-  AgentFactory: 0x5EdF2B5Ae6DB39012C188027D8Fe874747D957c2
- MockDAI: 0xED8470EaA77f22A92273253114d40477aCE078c5
- MockWETH: 0xb04bB2e7c8e86760cAa613882d86B459274Eb445
- MockMKR: 0xf05A1d88741C4331bC27dE9df8eB319e7B11E5cC
- MockAMM: 0xD4e1734749e948A733eD3653a6b6133733667C99

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

