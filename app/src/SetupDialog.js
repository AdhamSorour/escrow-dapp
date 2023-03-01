import { 
	Button,
	Dialog, 
	DialogActions, 
	DialogContent, 
	DialogTitle, 
	TextField 
} from '@mui/material';
import { ethers } from 'ethers';
import { useState } from 'react';
import { DEFAULT_MANAGER_ADDRESS } from "./managerContractHandler";

export default function SetupDialog({ 
	isShowing, 
	deployNewContract, 
	importExistingContract,
	useDefaultContract
}) {
	const [inputAddress, setInputAddress] = useState("");
	const [inputError, setInputError] = useState(false);
	const [errorText, setErrorText] = useState("");

	const handleImport = () => {
		if (ethers.utils.isAddress(inputAddress)) {
			importExistingContract(inputAddress);
		} else {
			setInputError(true);
			setErrorText("Invalid Address: Make sure you enter a valid 20 bytes (40 characters) long address");
		}
	}

	const handleTextChange = (e) => {
		setInputAddress(e.target.value);
		setInputError(false);
		setErrorText("");
	}

	return (
		<Dialog 
			open={isShowing}
			PaperProps={{
				style: {
					minWidth: "45vw",
					backgroundColor: '#1e1e1e'
				}
			}}
		>
			<DialogTitle color={"#aaa"}>Setup Manager Contract</DialogTitle>
			<DialogContent>
				<p>
					The manager contract is a smart contract that 
					manages all the created escrow contracts.
					It only needs to be deployed once.
				</p>
				<p>
					You can use a preset default contract, import a contract, or deploy a new contract.
				</p>
				<p>
					The default contract is deployed on&nbsp;
					<a 
						href={"https://goerli.etherscan.io/address/"+DEFAULT_MANAGER_ADDRESS}
						target="_blank"
					>Goerli</a>
				</p>
				<TextField
					fullWidth
					error={inputError}
					helperText={errorText}
					placeholder="Existing Contract Address"
					onChange={handleTextChange}
					onKeyDown={e => { if (e.key === 'Enter') handleImport() }}
				/>
			</DialogContent>
			<DialogActions style={{justifyContent:"space-between"}}>
				<Button className='dialog-button' onClick={useDefaultContract}>
					Use Default Contract
				</Button>
				<Button className='dialog-button' onClick={handleImport}>
					Import Existing Contract
				</Button>
				<Button className='dialog-button' onClick={deployNewContract}>
					Deploy New Contract
				</Button>
			</DialogActions>
		</Dialog>
	);
}