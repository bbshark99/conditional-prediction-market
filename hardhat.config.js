require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");

require("dotenv").config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
// task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
//   const accounts = await hre.ethers.getSigners();

//   for (const account of accounts) {
//     console.log(account.address);
//   }
// });

const accounts = {
  mnemonic: process.env.PRIVATE_KEY,
};

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.5.1",
      },
      {
        version: "0.5.0",
      },
      {
        version: "0.4.11",
      },
    ],
  },
  etherscan: {
    apiKey: process.env.BSCSCAN_API_KEY,
  },
  networks: {
    chapel: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      accounts,
      chainId: 97,
      live: true,
      saveDeployments: true,
      tags: ["dev"],
    },
  },
};
