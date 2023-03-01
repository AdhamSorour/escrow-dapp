# Decentralized Escrow Application

Escrows are a natural application of decentralized apps and smart contracts. They provide a simpler and more transparent mechanism of payement than traditional centralized methods. This is an Escrow Dapp built with [Hardhat](https://hardhat.org/).

## Project Description

An escrow is a three-way contract that allows a depositor to guarantee payment to a beneficiary when certain conditions are met. The depositor locks the funds such that only an authorized third-party can unlock them. When the third-party - the arbiter - confirms that the conditions are met, the contract is approved and the funds are unlocked and delivered automatically. **No one is capable of withholding the funds or delivering them elsewhere once the contract is approved.** 
The components of an escrow agreement are as follows:

* Depositor - wants to buy something
* Beneficiary - wants to sell something
* Arbiter - a trusted third party
* Value - the amount of funds required for purchase

The project has a *single* smart contract - the Escrow Manager - that is used to keep track of all escrow agreements. The manager maintains an array of structs that represents the escrow contracts managed by it. Each struct has the 4 fields mentioned above as well as a unique identifier for each contract and `bool` value to record whether the escrow has been approved.  

This structure allows us to not rely on any centralized storage facilities and keep all the required data on chain. It also decreases the creation and approval costs since we are not deploying a new smart contract for each escrow.
___

## Project Layout

There are three top-level folders:

* `/app` - contains the front-end application
* `/contracts` - contains the solidity contract
* `/tests` - contains tests for the solidity contract

## Setup

### In the root directory

1. Install the project dependencies with `npm install`
2. Compile the solidity contract with `npx hardhat compile`

The artifacts will be placed in `/app/artifacts`, which will make them available to the front-end. This path configuration can be found in the `hardhat.config.js` file.

### In the front-end app directory

3. Install the application dependencies with `npm install`
4. Run the app with `npm start`
5. Open it at [http://localhost:3000](http://localhost:3000) to view it in your browser.
___

## Usage

**You need a browser wallet for this app to even start. I developed and tested using [MetaMask](https://metamask.io/)**

On your first load the app will prompt you to setup the Escrow Manager. You will be given three options:

* **Use Default** - loads an Escrow Manager contract that was predeployed and verified on the Goerli testnet (you can see it [here](https://goerli.etherscan.io/address/0x0Ead1700C9996559ef2D8bbceee1fD2000341e96#code)). You'll notice that it is identical to `/contracts/Escrow.sol`. The address for this contract was hardcoded into the source - it will always be there.

* **Import Existing** - Use this option if you have deployed a different version of the *same exact* contract `/contracts/Escrow.sol` through whatever means and you would like to import it into the app. You'll need the contract's address.
* **Deploy New** - Selecting this will deploy a fresh instance of the contract for you and load it into the app

After selecting an option the app will store the manager contract address in local storage and you will not be prompted again on subsequent reloads. If you clear the local storage somehow, you will be prompted again and any address saved will be gone (unless you were using the default). However, the data stored on chain will persist regardless. If you keep a copy of the address of your non-default Escrow Manager you can always re-import it and get your escrows back.
___

## Potential Areas of Improvement

### Removing contracts 

Currently you can't remove contracts from the Escrow Manager. This was done for three reasons:

1. Serverless

	This structure allows us not to rely on any centralized server or database. All the data required is stored on the blockchain **except the manager contract address** which has been predeployed and embedded into the project's source. Options to change the manager contract have also been given and discussed above.

1. Simplicity

	This implementation is straight forward and uses a simple dynamic array to maintain the contracts with the id of each contract matching its index in the array.

3. Why not

 	There is also no burning reason to implement removal. Storage is only paid for once when it is allocated (as long as it is not being updated), so keeping the approved contracts on chain doesn't cost us anything extra than creating them in the first place. Reading the data is free, you can choose what do with it on your client.

### Approval Structures

The only way to approve an escrow currently is to simply click a button with the right account selected in the browser wallet. This allows for a single person/account to approve the transaction. This works, however, more complex, and potentially more secure structures also exist. For example, it could be set up that the approval requires more than one arbiter to approve. Or, even better, the approval structure could be based on a voting mechanism where a pool of "arbiters" need to reach consensus on the state of the escrow (a DAO perhaps?). You get the idea. 
