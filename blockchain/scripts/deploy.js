const { ethers, artifacts } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
	console.log("Deploying contracts...");

	const AidVoucher = await ethers.getContractFactory("AidVoucher");
	const aidVoucher = await AidVoucher.deploy();
	await aidVoucher.waitForDeployment();
	const aidVoucherAddress = await aidVoucher.getAddress();
	console.log("AidVoucher deployed at:", aidVoucherAddress);

	const WitnessStaking = await ethers.getContractFactory("WitnessStaking");
	const witnessStaking = await WitnessStaking.deploy();
	await witnessStaking.waitForDeployment();
	const witnessStakingAddress = await witnessStaking.getAddress();
	console.log("WitnessStaking deployed at:", witnessStakingAddress);

	// Prepare frontend artifact paths
	const frontendRoot = path.resolve(__dirname, "../../frontend/src");
	const abisDir = path.join(frontendRoot, "abis");
	const addressesFile = path.join(frontendRoot, "addresses.json");

	fs.mkdirSync(abisDir, { recursive: true });

	// Write ABIs
	const aidVoucherArtifact = await artifacts.readArtifact("AidVoucher");
	fs.writeFileSync(path.join(abisDir, "AidVoucher.json"), JSON.stringify({ abi: aidVoucherArtifact.abi }, null, 2));
	const witnessStakingArtifact = await artifacts.readArtifact("WitnessStaking");
	fs.writeFileSync(path.join(abisDir, "WitnessStaking.json"), JSON.stringify({ abi: witnessStakingArtifact.abi }, null, 2));

	// Write addresses
	const addresses = {
		AidVoucher: aidVoucherAddress,
		WitnessStaking: witnessStakingAddress
	};
	fs.writeFileSync(addressesFile, JSON.stringify(addresses, null, 2));

	console.log("Frontend artifacts written to:", frontendRoot);
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});