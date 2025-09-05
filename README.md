
# 🌍 CrisisResponse

**CrisisResponse** is a decentralized platform for real-time crisis reporting, verification, and response coordination.  
Built on **Ethereum**, it empowers communities to report emergencies, verify information through staking mechanisms, and coordinate relief efforts transparently.

---

## 🌟 Key Features

- **Real-time Crisis Mapping** – Interactive map displaying verified crisis reports  
- **Stake-Based Verification** – Users stake ETH to verify or dispute crisis reports  
- **Transparent Donations** – Direct ETH donations to verified crisis campaigns  
- **NFT Reward System** – Earn FactSBTs, AidVouchers, and ImpactNFTs for contributions  
- **Admin Management** – Tools for crisis validation and campaign management  
- **Reputation System** – User reputation built on contribution history  

---

## 🛠️ Tech Stack

### Frontend
- React 18 with modern hooks  
- React Router for navigation  
- React Leaflet for interactive maps  
- Tailwind CSS for styling  
- Heroicons for UI icons  
- React Hot Toast for notifications  

### Blockchain
- Solidity smart contracts  
- Hardhat development environment  
- Ethers.js for blockchain interactions  
- Local Ethereum node for testing  

### Storage
- IPFS for decentralized file storage  
- Local JSON-RPC for development  

---

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)  
- npm or yarn  
- MetaMask wallet  
- Local Ethereum node (Hardhat)  

### Setup Instructions

Clone the repository:
```bash
git clone https://github.com/your-username/crisisresponse.git
cd crisisresponse
Install dependencies:

bash
Copy code
npm install
Start Hardhat local node:

bash
Copy code
npx hardhat node
Configure MetaMask:

Network Name: Hardhat Local

RPC URL: http://localhost:8545

Chain ID: 31337

Currency Symbol: ETH

Import test accounts using private keys from Hardhat output

Deploy contracts:

bash
Copy code
npx hardhat run scripts/deploy.js --network localhost
Start development server:

bash
Copy code
npm run dev
🏗️ Project Structure
bash
Copy code
src/
├── components/           
│   ├── CrisisMap.jsx        # Interactive crisis map
│   ├── ReportForm.jsx       # Crisis reporting form
│   ├── StakeCard.jsx        # Stake verification interface
│   ├── DonationWidget.jsx   # Crisis donation system
│   ├── AssetGallery.jsx     # User NFT gallery
│   ├── AdminPanel.jsx       # Administration tools
│   └── WalletConnector.jsx  # Web3 connection
├── contexts/
│   └── BlockchainContext.jsx # Web3 state management
├── contracts/               # Solidity smart contracts
├── services/
│   └── ipfs.js              # IPFS integration
└── App.jsx                  # Main application component
🔐 Smart Contracts
The platform utilizes multiple smart contracts:

CrisisReport – Main reporting & verification system

FactSBT – Soulbound tokens for verification contributions

AidVoucher – NFTs for aid recipients

ImpactNFT – Achievement NFTs for contributors

CrisisDonation – Donation management

⚠️ Note: Contract addresses shown in development are local Hardhat deployments. They reset each time you restart Hardhat.
For production, update addresses after deploying to your chosen Ethereum network.

📸 Screenshots & Demo
🗺️ Crisis Mapping
Real-time interactive map showing crisis reports.
![Crisis Map](crisis-dapp/frontend-temp/src/assets/crisismap.jpg)

📝 Submit Report
Submit detailed crisis reports with optional evidence uploads.
![Submit Report](assets/submit report.jpg)

👤 Profile & Reputation
Track earned NFTs and contribution history.
![Profile](assets/profile.jpg)

🔄 Recent Activity
View latest reports, verifications, and donations.
![Recent Activity](assets/recent activity.jpg)

🚀 Usage Guide
Reporting a Crisis
Connect your wallet

Navigate to Submit Report

Fill in crisis details (type, location, description)

Optionally upload evidence images

Submit report to blockchain

Verifying Reports
Go to Verify & Stake section

Review pending crisis reports

Stake ETH to verify or dispute reports

Earn FactSBTs for successful verifications

Donating to Crises
Browse active crisis campaigns

Select a crisis to support

Choose donation amount in ETH

Add optional message

Complete transaction

Managing Assets
View your earned NFTs in the Profile section:

FactSBTs – Verification achievements

AidVouchers – Crisis assistance tokens

ImpactNFTs – Contribution recognition

🧪 Testing
Run the test suite to verify contract functionality:

bash
Copy code
npx hardhat test
🌍 Deployment
Local Development
Follow installation instructions

Ensure MetaMask is connected to Hardhat Local

Use test ETH from Hardhat accounts

Production Deployment
Configure environment variables

Update contract addresses for target network

Deploy to preferred Ethereum network (Mainnet, Polygon, etc.)

Update MetaMask network configuration

🤝 Contributing
We welcome contributions!

Fork the repository

Create a feature branch

bash
Copy code
git checkout -b feature/amazing-feature
Commit your changes

bash
Copy code
git commit -m 'Add amazing feature'
Push to branch

bash
Copy code
git push origin feature/amazing-feature
Open a Pull Request

🆘 Support
If you encounter issues:

Check troubleshooting section below

Search existing GitHub issues

Create a new issue with detailed information

🔧 Troubleshooting
Common Issues
MetaMask Connection Issues

Ensure you’re on the correct network (Hardhat Local, Chain ID 31337)

Reset MetaMask account if transactions stall

Contract Interaction Errors

Verify contract addresses match your deployment

Check ETH balance for gas fees

Balance Display Issues

Refresh the page after transactions

Check browser console for errors

Reset Local Environment
bash
Copy code
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules
npm install

# Restart Hardhat node
npx hardhat node
🎯 Future Roadmap
Multi-chain support (Polygon, Arbitrum)

Mobile application

Advanced analytics dashboard

Crisis prediction algorithms

Integration with emergency services

Multi-language support

Disaster preparedness resources

🙏 Acknowledgments
Ethereum Foundation – blockchain infrastructure

Hardhat team – development tools

React community – frontend framework

OpenStreetMap – mapping data

⚠️ Disclaimer: This is a demonstration project for educational purposes.
Not intended for production crisis management without proper security audits and testing.
