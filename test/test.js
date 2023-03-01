const { ethers } = require('hardhat');
const { expect } = require('chai');
const { time } = require('@nomicfoundation/hardhat-network-helpers');

describe('Escrow', function () {
  let id = 0;
  let contract;
  let depositor;
  let beneficiary;
  let arbiter;
  const deposit = ethers.utils.parseEther('1');

  beforeEach(async () => {
    [depositor, arbiter, beneficiary] = await ethers.getSigners();
    const Escrow = await ethers.getContractFactory('Escrow');
    contract = await Escrow.deploy();
    await contract.deployed();
  });

  describe("create()", () => {
    it("should create a new escrow contract", async () => {

      await expect(contract.create(arbiter.address, beneficiary.address, { value: deposit }))
        .to.emit(contract, "Created")
        .withArgs(0);

      const contracts = await contract.contracts(0);
      expect(contracts.id).to.equal(id);
      expect(contracts.arbiter).to.equal(arbiter.address);
      expect(contracts.beneficiary).to.equal(beneficiary.address);
      expect(contracts.amount).to.equal(deposit);
      expect(contracts.isApproved).to.equal(false);
    });

    it('should properly increment the id counter', async () => {
      for (let id = 0; id < 10; id++) {
        await expect(contract.create(arbiter.address, beneficiary.address, { value: deposit }))
          .to.emit(contract, "Created")
          .withArgs(id);
      }
    });
  });
  
  describe("approve()", () => {
    beforeEach(async () => {
      await contract.create(arbiter.address, beneficiary.address, { value: deposit });
    });

    it("should deposit the funds when the escrow contract is approved", async () => {
      const [contractBalanceBefore, beneficiaryBalanceBefore] = await Promise.all([
        ethers.provider.getBalance(contract.address),
        ethers.provider.getBalance(beneficiary.address)
      ]);

      await expect(contract.connect(arbiter).approve(id))
        .to.emit(contract, "Approved").withArgs(id);

      const [contractBalanceAfter, beneficiaryBalanceAfter] = await Promise.all([
        ethers.provider.getBalance(contract.address),
        ethers.provider.getBalance(beneficiary.address)
      ]);

      expect(contractBalanceAfter).to.equal(contractBalanceBefore.sub(deposit));
      expect(beneficiaryBalanceAfter).to.equal(beneficiaryBalanceBefore.add(deposit));

      const contracts = await contract.contracts(0);
      expect(contracts.isApproved).to.equal(true);
    });

    it("should revert if the caller is not the arbiter", async () => {
      await expect(contract.connect(beneficiary).approve(id))
        .to.be.revertedWith("you are not the arbiter");
    });

    it("should revert if the escrow contract has already been approved", async () => {
      await contract.connect(arbiter).approve(id);

      await expect(contract.connect(arbiter).approve(id))
        .to.be.revertedWith("escrow contract has already been approved");
    });

    it("should revert if the ID is invalid", async () => {
      const invalidId = 77;
      await expect(contract.connect(arbiter).approve(invalidId))
        .to.be.revertedWith("invalid ID");
    });
  });
});