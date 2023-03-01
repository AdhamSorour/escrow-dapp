import { ethers } from 'ethers';
import Escrow from './artifacts/contracts/Escrow.sol/Escrow.json';

export async function getContractInstance(signer) {
	const address = window.localStorage.getItem('contract_address');
	if (address) {
		return new ethers.Contract(address, Escrow.abi, signer);
	}
}

export async function deployNewContract(signer) {
	const factory = new ethers.ContractFactory(Escrow.abi, Escrow.bytecode, signer);
	const contract = await factory.deploy();
	await contract.deployed();

	window.localStorage.setItem('contract_address', contract.address);

	return contract
}

export async function importExistingContract(address, signer) {
	window.localStorage.setItem('contract_address', address);
	return new ethers.Contract(address, Escrow.abi, signer);
}

export const DEFAULT_MANAGER_ADDRESS = "0x0Ead1700C9996559ef2D8bbceee1fD2000341e96";
export async function useDefaultContract(signer) {
	window.localStorage.setItem('contract_address', DEFAULT_MANAGER_ADDRESS);
	return new ethers.Contract(DEFAULT_MANAGER_ADDRESS, Escrow.abi, signer);
}

export async function getEscrows(contract, EscrowContract) {
	const escrowsContracts = await contract.getContracts();
	return escrowsContracts.map(escrow => EscrowContract(
		escrow.id.toString(),
		escrow.depositor,
		escrow.arbiter,
		escrow.beneficiary,
		ethers.utils.formatEther(escrow.amount),
		escrow.isApproved
	)).reverse();
}

export async function createEscrow(contract, signer, arbiter, beneficiary, value) {
	const tx = await contract.connect(signer).create(arbiter, beneficiary, { value })
	const receipt = await tx.wait();
	return receipt.events[0].args[0].toString(); // Created(uint) event (only 1 event and 1 argument)
}

export async function approveEscrow(contract, id, signer) {
	const approveTxn = await contract.connect(signer).approve(id);
	await approveTxn.wait();
}