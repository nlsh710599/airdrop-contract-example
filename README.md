# airdrop-contract-example

## Getting Start

This repository is a example of airdrop event contract. It helps you to launch an airdrop event with few parameters needed which are described below.

- operator: the contract operator who have the access to add allow list in contract's storage
- startTime: the epoch time (in ms) when the event should start
- endTime: the epoch time (in ms) when the event should end
- eventAmount: the amount (in ether) which users in allow list could claim

### Prerequisites (With nodejs v14)

Before you start using the airdrop event contract. You need to install yarn for helping you to get modules you need

- yarn
  ```sh
  $ brew install yarn
  ```

If perform a test is needed, you will need to install ganache

- ganache
  ```
  $ npm install ganache --global
  ```

### Installation

After you have installed npm, do the following steps to setup the repo on your device

1. Clone the repo

   ```sh
   git clone git@github.com:nlsh710599/airdrop-contract-example.git
   ```

2. Install NPM packages

   ```sh
   yarn
   ```

### Deploy to production environment

```bash
$ yarn deploy-prod
```

### Perform a test

- run ganache

  ```
  $ ganahe
  ```

- perform test

  ```bash
  $ truffle test
  ```
