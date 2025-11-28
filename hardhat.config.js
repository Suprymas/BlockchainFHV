require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */

const URL = process.env.SEPOLIA_RPC_URL
const key = process.env.PRIVATE_KEY
module.exports = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: URL,
      accounts: [key]
    }
  }
};
