require("@nomicfoundation/hardhat-toolbox");
require('hardhat-deploy');
require('dotenv').config();
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [process.env.PK],
    },
  },
  namedAccounts: {
    firstAccount: {
      default: 0, // here this will by default take the first account as deployer
    },
    secondAccount: {
      default: 1, // here this will by default take the second account as deployer
    }
  },
};
