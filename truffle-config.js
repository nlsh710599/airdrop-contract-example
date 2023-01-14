const HDWalletProvider = require("@truffle/hdwallet-provider")
const fs = require("fs")

const PRODUCTION_RPC_URL = "https://testnet-rpc.thundercore.com"

const createProvider = (url) => () => {
  return new HDWalletProvider(privateKeys, url, 0, privateKeys.length)
}

const readSecretsFromFile = (path = ".private-keys") => {
  if (!fs.existsSync(path)) return []

  return fs
    .readFileSync(path, { encoding: "ascii" })
    .split("\n")
    .map((line) => line.trim())
    .filter((x) => x.length)
}

const privateKeys = [...readSecretsFromFile()]

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
    },
    production: {
      provider: createProvider(PRODUCTION_RPC_URL),
      network_id: "18",
      gas: 30000000,
      gasPrice: 2e10,
      timeoutBlocks: 300,
    },
  },

  mocha: {},

  compilers: {
    solc: {
      version: "0.8.17", // Fetch exact version from solc-bin (default: truffle's version)
    },
  },
}
