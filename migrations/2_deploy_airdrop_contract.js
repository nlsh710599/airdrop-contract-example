const { deployProxy } = require("@openzeppelin/truffle-upgrades")
const fs = require("fs")
const dotenv = require("dotenv")
dotenv.config({ path: "../.env" })

const Airdrop = artifacts.require("Airdrop.sol")

contractParams = async (network) => {
  let operator, startTime, endTime, eventAmount

  if (network === "production") {
    operator = process.env.operator
    startTime = process.env.startTime
    endTime = process.env.endTime
    eventAmount = process.env.eventAmount
  } else {
    operator = (await web3.eth.getAccounts())[0]
    startTime = 0
    endTime = 2 * new Date().getTime()
    eventAmount = 1
  }

  return [operator, startTime, endTime, eventAmount]
}

module.exports = async function (deployer, network) {
  try {
    const instance = await deployProxy(Airdrop, await contractParams(network), {
      deployer,
    })

    const streamedInfo = JSON.stringify({
      address: instance.address,
    })

    fs.writeFileSync(`./airdrop-contract-address-${network}.json`, streamedInfo)
  } catch (err) {
    console.error(err)
  }
}
