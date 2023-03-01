// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

contract Escrow {
    struct Contract {
        uint id;
		address depositor;
        address arbiter;
	    address beneficiary;
        uint amount;
        bool isApproved;
    }
    Contract[] public contracts;

	event Created(uint);

    uint private idCounter = 0;
    function create(address arbiter, address beneficiary) external payable {
        contracts.push(Contract(idCounter, msg.sender, arbiter, beneficiary, msg.value, false));
		emit Created(idCounter++);
    }

	event Approved(uint);

	function approve(uint id) external {
		// since the idCounter starts at 0 and you cannot delete contracts,
		// a contract's id will always match its position in the contracts array
        require(id < contracts.length, "invalid ID");
        Contract storage escrow = contracts[id];
		require(msg.sender == escrow.arbiter, "you are not the arbiter");
        require(!escrow.isApproved, "escrow contract has already been approved");

		escrow.isApproved = true;

		(bool success, ) = payable(escrow.beneficiary).call{ value: escrow.amount }("");
 		require(success, "failed to send Ether");

		emit Approved(id);
	}

	function getContracts() external view returns (Contract[] memory) {
		return contracts;
	}
}
