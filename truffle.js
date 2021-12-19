/**
 * Use this file to configure your truffle project. It's seeded with some
 * common settings for different networks and features like migrations,
 * compilation and testing. Uncomment the ones you need or modify
 * them to suit your project as necessary.
 *
 * More information about configuration can be found at:
 *
 * truffleframework.com/docs/advanced/configuration
 *
 * To deploy via Infura you'll need a wallet provider (like truffle-hdwallet-provider)
 * to sign your transactions before they're sent to a remote public node. Infura accounts
 * are available for free at: infura.io/register.
 *
 * You'll also need a mnemonic - the twelve word phrase the wallet uses to generate
 * public/private key pairs. If you're publishing your code to GitHub make sure you load this
 * phrase from a file you've .gitignored so it doesn't accidentally become public.
 *
 */
const path = require('path')
require('dotenv').config()

const HDWalletProvider = require('@truffle/hdwallet-provider')
const mnemonic = process.env.REACT_APP_OPERATOR_MNEMONIC || 'myth like bonus scare over problem client lizard pioneer submit female collect'

const createInfuraEntry = (networkName, networkId, gasPrice) => ({
  [networkName]: {
    provider: () =>
      new HDWalletProvider(
        mnemonic,
        `https://${networkName}.infura.io/v3/${process.env.REACT_APP_INFURA_ID}`
      ),
    network_id: networkId,
    gasPrice,
    skipDryRun: true
  }
})

module.exports = {
  contracts_build_directory: path.join(__dirname, './src/abi'),

  /**
   * Networks define how you connect to your ethereum client and let you set the
   * defaults web3 uses to send transactions. If you don't specify one truffle
   * will spin up a development blockchain for you on port 9545 when you
   * run `develop` or `test`. You can ask a truffle command to use a specific
   * network from the command line, e.g
   *
   * $ truffle test --network <network-name>
   */

  networks: Object.assign(
    {
      development: {
        host: '127.0.0.1',
        port: 8545,
        network_id: '*',
      },
      polygon: {
        provider: () =>
          new HDWalletProvider(
            mnemonic,
            `https://polygon-rpc.com`
          ),
        network_id: '137',
        gasPrice: 100000000000,
        skipDryRun: true
      },
      mumbai: {
        provider: () =>
          new HDWalletProvider(
            mnemonic,
            `https://rpc-mumbai.maticvigil.com/v1/0799d5bc18a0549f82ef51f9a597b6ccda1de2b9`
          ),
        network_id: '80001',
        gasPrice: 30000000002,
        skipDryRun: true
      },
      bsc: {
        provider: () =>
          new HDWalletProvider(
            mnemonic,
            `https://bsc-dataseed1.ninicoin.io`
          ),
        network_id: '56',
        gasPrice: 30000000002,
        skipDryRun: true
      },
      bsctest: {
        provider: () =>
          new HDWalletProvider(
            mnemonic,
            `https://data-seed-prebsc-1-s1.binance.org:8545`
          ),
        network_id: '97',
        gasPrice: 50000000002,
        skipDryRun: true
      },
    },
    ...[
      ['mainnet', '1', 10000000002],
      ['ropsten', '3'],
      ['rinkeby', '4', 13e9],
      ['goerli', '5', 1e9],
      ['kovan', '42']
    ].map(data => createInfuraEntry(...data))
  ),

  // Configure your compilers
  compilers: {
    solc: {
      version: '0.5.10',
      settings: {
       optimizer: {
         enabled: true,
       },
      }
    }
  },
  plugins: [
    'truffle-plugin-verify'
  ],
  api_keys: {
    polygonscan: process.env.REACT_APP_POLYGONSCAN_API_KEY || 'REACT_APP_POLYGONSCAN_API_KEY',
    etherscan: process.env.REACT_APP_ETHERSCAN_API_KEY || 'REACT_APP_ETHERSCAN_API_KEY',
    bscscan: process.env.REACT_APP_BSCSCAN_API_KEY || 'REACT_APP_BSCSCAN_API_KEY',
  }
}
