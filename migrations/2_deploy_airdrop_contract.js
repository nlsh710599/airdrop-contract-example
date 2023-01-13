const { deployProxy } = require("@openzeppelin/truffle-upgrades")
const fs = require("fs")

const Airdrop = artifacts.require("Airdrop.sol")

module.exports = async function (deployer) {
  try {
    const accounts = await web3.eth.getAccounts()
    const instance = await deployProxy(
      Airdrop,
      [accounts[0], 0, 2673594628764, 1],
      {
        deployer,
      }
    )

    const streamedInfo = JSON.stringify({
      address: instance.address,
    })
    fs.writeFileSync(`./airdrop-contract-address.json`, streamedInfo)
  } catch (err) {
    console.error(err)
  }
}
