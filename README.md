# AidVoucher & WitnessStaking DApp (Polygon Amoy)

This repository contains a full-stack DApp with:
- blockchain/: Hardhat project, Solidity ^0.8.19 contracts, deployment scripts
- frontend/: Vite + React + TailwindCSS app using ethers v6

Contracts:
- AidVoucher: Owner-mintable ERC-721 voucher redeemable by a specific address
- WitnessStaking: Simple native MATIC staking (stake/withdraw)

## Prerequisites
- Node.js 18+
- MetaMask browser extension

## Environment
Copy `.env.example` to `.env` and set:

```
AMOY_RPC=https://rpc-amoy.polygon.technology
PRIVATE_KEY=0xYOUR_PRIVATE_KEY
```

Ensure the private key has Amoy MATIC.

## Install

```
cd blockchain
npm install
cd ../frontend
npm install
```

## Compile Contracts

```
cd blockchain
npm run compile
```

## Deploy to Polygon Amoy

```
cd blockchain
npm run deploy:amoy
```

This writes:
- `frontend/src/addresses.json`
- `frontend/src/abis/*.json`

## Run Frontend

```
cd frontend
npm run dev
```

Open the app, click Connect MetaMask. If not on Amoy, MetaMask will prompt to switch/add the chain. The UI supports:
- Mint AidVoucher to an address (owner only)
- Redeem AidVoucher (token holder + designated redeemer)
- Stake MATIC to WitnessStaking

## Localhost Testing
You can deploy to an ephemeral local Hardhat network to generate frontend artifacts quickly:

```
cd blockchain
npm run deploy:local
```

Then run the frontend as above. Note: the frontend addresses will be for the local network; for Amoy, re-run `deploy:amoy` to overwrite frontend artifacts with testnet addresses.

## Notes
- Ethers v6 API is used throughout.
- TailwindCSS is configured via `tailwind.config.js` and `postcss.config.js`.
- The frontend imports ABIs and addresses from generated files; no hardcoded addresses in the UI.