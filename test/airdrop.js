const { deployProxy } = require("@openzeppelin/truffle-upgrades")

const Airdrop = artifacts.require("Airdrop.sol")

contract("Airdrop", (accounts) => {
  it("should access control working perfectly", async () => {
    const airdropInstance = await deployProxy(Airdrop, [
      accounts[1], // operator
      0, // startTime
      2673594628764, // endtime
      1, // eventAmount
    ])

    let isAdmin = await airdropInstance.isAdmin(accounts[0])
    assert.equal(isAdmin, true, "msg.sender is not admin")

    let isOperator = await airdropInstance.isOperator(accounts[1])
    assert.equal(
      isOperator,
      true,
      "account which given when deploying contract is not operator"
    )

    try {
      await airdropInstance.addOperator(accounts[3], {
        from: accounts[4],
      })
    } catch (error) {
      assert.equal(
        error.reason,
        "Restricted to admins.",
        "onlyAdmin working incorrectly"
      )
    }

    await airdropInstance.addOperator(accounts[2], { from: accounts[0] })
    isOperator = await airdropInstance.isOperator(accounts[2])
    assert.equal(isOperator, true, "account given is not added as an operator")

    try {
      await airdropInstance.enlist([accounts[0]], {
        from: accounts[3],
      })
    } catch (error) {
      assert.equal(
        error.reason,
        "Restricted to operators.",
        "onlyOperator working incorrectly"
      )
    }

    await airdropInstance.enlist([accounts[0]], {
      from: accounts[1],
    })
  })

  it("should refuse to claim if event haven't start yet", async () => {
    const airdropInstance = await deployProxy(Airdrop, [
      accounts[1], // operator
      2673594628764, // startTime
      3673594628764, // endtime
      1, // eventAmount
    ])

    await airdropInstance.enlist([accounts[0]], {
      from: accounts[1],
    })

    let res = await airdropInstance.claim({ from: accounts[0] })
    assert.equal(
      res.logs[0].args.message,
      "Event has not started yet",
      "User can claim before event start"
    )
  })

  it("should refuse to claim if event had ended", async () => {
    const airdropInstance = await deployProxy(Airdrop, [
      accounts[1], // operator
      0, // startTime
      100, // endtime
      1, // eventAmount
    ])

    await airdropInstance.enlist([accounts[0]], {
      from: accounts[1],
    })

    let res = await airdropInstance.claim({ from: accounts[0] })
    assert.equal(
      res.logs[0].args.message,
      "Event has ended",
      "User can claim after event ended"
    )
  })

  it("should claim and once if event is on going", async () => {
    const airdropInstance = await deployProxy(Airdrop, [
      accounts[1], // operator
      0, // startTime
      2673594628764, // endtime
      1, // eventAmount
    ])

    //should send some eth to contract before claiming airdrop
    await web3.eth.sendTransaction({
      to: airdropInstance.address,
      from: accounts[1],
      value: web3.utils.toWei("10", "ether"),
    })

    contractBalance = web3.utils.fromWei(
      await web3.eth.getBalance(airdropInstance.address),
      "ether"
    )

    assert.equal(
      contractBalance,
      "10",
      "transfer ether fail when initialzing test case"
    )

    await airdropInstance.enlist([accounts[0]], {
      from: accounts[1],
    })

    let accountBalanceBeforeClaim = +web3.utils.fromWei(
      await web3.eth.getBalance(accounts[0]),
      "ether"
    )
    let res = await airdropInstance.claim({ from: accounts[0] })
    let balanceDiff =
      +web3.utils.fromWei(await web3.eth.getBalance(accounts[0]), "ether") -
      accountBalanceBeforeClaim

    assert.equal(res.logs[0].event, "Claimed", "User failed to claim")
    assert.equal(
      balanceDiff > 0 && balanceDiff < 1,
      true,
      "airdrop amount incorrect"
    )

    res = await airdropInstance.claim({ from: accounts[0] })
    assert.equal(
      res.logs[0].args.message,
      "Address has claim",
      "User can claim twice"
    )
  })

  it("should refuse to claim if account is not qualified", async () => {
    const airdropInstance = await deployProxy(Airdrop, [
      accounts[1], // operator
      0, // startTime
      2673594628764, // endtime
      1, // eventAmount
    ])

    //should send some eth to contract before claiming airdrop
    await web3.eth.sendTransaction({
      to: airdropInstance.address,
      from: accounts[1],
      value: web3.utils.toWei("10", "ether"),
    })

    contractBalance = web3.utils.fromWei(
      await web3.eth.getBalance(airdropInstance.address),
      "ether"
    )

    assert.equal(
      contractBalance,
      "10",
      "transfer ether fail when initialzing test case"
    )

    let res = await airdropInstance.claim({ from: accounts[0] })
    assert.equal(
      res.logs[0].args.message,
      "Address is not qualified",
      "User can claim without qualification"
    )
  })

  it("should failed if contract balance is insufficient", async () => {
    const airdropInstance = await deployProxy(Airdrop, [
      accounts[1], // operator
      0, // startTime
      2673594628764, // endtime
      1, // eventAmount
    ])

    await airdropInstance.enlist([accounts[0]], {
      from: accounts[1],
    })

    let res = await airdropInstance.claim({ from: accounts[0] })
    assert.equal(
      res.logs[0].args.message,
      "Run ouf of airdrop funds",
      "Contract can transfer without sufficient balance"
    )
  })

  it("should admin withdraw contract balance", async () => {
    const airdropInstance = await deployProxy(Airdrop, [
      accounts[1], // operator
      0, // startTime
      2673594628764, // endtime
      1, // eventAmount
    ])

    //should send some eth to contract before claiming airdrop
    await web3.eth.sendTransaction({
      to: airdropInstance.address,
      from: accounts[2],
      value: web3.utils.toWei("10", "ether"),
    })

    contractBalance = web3.utils.fromWei(
      await web3.eth.getBalance(airdropInstance.address),
      "ether"
    )

    assert.equal(
      contractBalance,
      "10",
      "transfer ether fail when initialzing test case"
    )

    let accountBalanceBeforeWithdraw = +web3.utils.fromWei(
      await web3.eth.getBalance(accounts[0]),
      "ether"
    )
    await airdropInstance.withdraw({ from: accounts[0] })
    let balanceDiff =
      +web3.utils.fromWei(await web3.eth.getBalance(accounts[0]), "ether") -
      accountBalanceBeforeWithdraw

    assert.equal(
      balanceDiff > 9 && balanceDiff < 10,
      true,
      "withdraw amount incorrect"
    )
  })
})
