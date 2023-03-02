import { 
	Button,
	Dialog, 
	DialogActions, 
	DialogContent, 
	DialogTitle, 
} from '@mui/material';
import { ethers } from 'ethers';

export default function WalletDialog({ isShowing, setAccount }) {
	const isWalletDetected = window.ethereum != null;
	const title = isWalletDetected? "Connect Your Wallet" : "No Wallet Detected";

	async function connect() {
		// send request to prompt a connection
		// we don't need to wait for result since we set up a listener (App.js:56)
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		provider.send("eth_requestAccounts", []);
	}

	return (
		<Dialog 
			open={isShowing}
			PaperProps={{
				style: {
					backgroundColor: '#1e1e1e'
				}
			}}
		>
			<DialogTitle color={"#aaa"}>
				{title}
			</DialogTitle>
			<DialogContent>
				<p>A browser wallet is required to interact with the Ethereum blockchain</p>
				{!isWalletDetected && 
					<p>To set one up visit&nbsp;
						<a 
							href="https://metamask.io/"
							target="_blank"
						>MetaMask</a>
					</p>
				}
			</DialogContent>
			<DialogActions
				style={{ 
					display: isWalletDetected? undefined : "none",
					justifyContent: "center"
				}}
			>
				<Button className='dialog-button' onClick={connect}>
					Connect
				</Button>
			</DialogActions>
		</Dialog>
	);
}