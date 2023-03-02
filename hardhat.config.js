require('@nomicfoundation/hardhat-toolbox');
const fs = require('fs');

task(
  "compile", 
  async function (taskArgs, hre, runSuper) {
    await runSuper();
    fs.copyFileSync(
      './artifacts/contracts/Escrow.sol/Escrow.json',
      './app/src/Escrow.json'
    );
  }
)

module.exports = {
  solidity: "0.8.17",
};
