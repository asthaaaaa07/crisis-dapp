require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

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
  mumbai: {
    url: "https://rpc-mumbai.maticvigil.com",

    accounts: c4655216ea4cb70cb6509ff585ce63a16e2875635378ffec240aadc07383417a
  }
},
    mumbai: {
      url: process.env.RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 80001
    }
  }
};