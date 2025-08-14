const fs = require('fs');
const path = require('path');
const hre = require('hardhat');

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying from:", deployer.address);

  // Deploy FactSBT
  const FactSBT = await hre.ethers.getContractFactory("FactSBT");
  const factSBT = await FactSBT.deploy();
  await factSBT.deployed();

  // Deploy WitnessStaking with FactSBT dependency
  const Witness = await hre.ethers.getContractFactory("WitnessStaking");
  const witness = await Witness.deploy(factSBT.address);
  await witness.deployed();

  // Deploy AidVoucher
  const Aid = await hre.ethers.getContractFactory("AidVoucher");
  const aid = await Aid.deploy();
  await aid.deployed();

  // Deploy ProofOfHelp
  const PoH = await hre.ethers.getContractFactory("ProofOfHelp");
  const poh = await PoH.deploy();
  await poh.deployed();

  // Deploy IdentityManager
  const Identity = await hre.ethers.getContractFactory("IdentityManager");
  const identity = await Identity.deploy();
  await identity.deployed();

  // Deploy ImpactNFT
  const Impact = await hre.ethers.getContractFactory("ImpactNFT");
  const impact = await Impact.deploy();
  await impact.deployed();

  // Deploy CrisisDonation
  const CrisisDonation = await hre.ethers.getContractFactory("CrisisDonation");
  const crisisDonation = await CrisisDonation.deploy();
  await crisisDonation.deployed();

  // Prepare deployments object
  const deployments = {
    FactSBT: { 
      address: factSBT.address, 
      abi: (await hre.artifacts.readArtifact("FactSBT")).abi 
    },
    WitnessStaking: { 
      address: witness.address, 
      abi: (await hre.artifacts.readArtifact("WitnessStaking")).abi 
    },
    AidVoucher: { 
      address: aid.address, 
      abi: (await hre.artifacts.readArtifact("AidVoucher")).abi 
    },
    ProofOfHelp: { 
      address: poh.address, 
      abi: (await hre.artifacts.readArtifact("ProofOfHelp")).abi 
    },
    IdentityManager: { 
      address: identity.address, 
      abi: (await hre.artifacts.readArtifact("IdentityManager")).abi 
    },
    ImpactNFT: { 
      address: impact.address, 
      abi: (await hre.artifacts.readArtifact("ImpactNFT")).abi 
    },
    CrisisDonation: { 
      address: crisisDonation.address, 
      abi: (await hre.artifacts.readArtifact("CrisisDonation")).abi 
    }
  };

  // Save deployments to file
  const outDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
  fs.writeFileSync(path.join(outDir, "localhost.json"), JSON.stringify(deployments, null, 2));
  
  console.log("✅ All contracts deployed:");
  console.log(`- FactSBT: ${factSBT.address}`);
  console.log(`- WitnessStaking: ${witness.address}`);
  console.log(`- AidVoucher: ${aid.address}`);
  console.log(`- ProofOfHelp: ${poh.address}`);
  console.log(`- IdentityManager: ${identity.address}`);
  console.log(`- ImpactNFT: ${impact.address}`);
  console.log(`- CrisisDonation: ${crisisDonation.address}`);
  console.log("Saved deployments/localhost.json");
}

main().catch((e) => { 
  console.error(e); 
  process.exit(1); 
});

