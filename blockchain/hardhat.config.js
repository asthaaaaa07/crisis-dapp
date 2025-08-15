require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

const AMOY_RPC = process.env.AMOY_RPC || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
	solidity: {
		version: "0.8.19",
		settings: {
			optimizer: {
				enabled: true,
				runs: 200
			}
		}
	},
	networks: {
		hardhat: {},
		"polygon-amoy": {
			url: AMOY_RPC,
			accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
			chainId: 80002
		}
	}
};