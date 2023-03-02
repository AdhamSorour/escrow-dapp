import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { 
  getContractInstance, 
  deployNewContract,
  importExistingContract,
  useDefaultContract,
  getEscrows,
  createEscrow,
  approveEscrow
} from './managerContractHandler';
import WalletDialog from './WalletDialog';
import SetupDialog from './SetupDialog';
import Escrow from './Escrow';


function App() {
  const [account, setAccount] = useState();
  const [signer, setSigner] = useState();

  const [managerContract, setManagerContract] = useState();
  const [managerAddress, setManagerAddress] = useState();
  const [escrows, setEscrows] = useState([]);

  const EscrowContract = (id, depositor, arbiter, beneficiary, value, isApproved) => {
    return {
      id,
      depositor,
      arbiter,
      beneficiary,
      value,
      isApproved,
      handleApprove: async (account) => {
        managerContract.on('Approved', (approvedID) => {
          if (approvedID.toString() === id) {
            document.getElementById(id).className = 'complete';
            document.getElementById(id).innerText = "✓ It's been approved!";
            document.getElementById(id).onClick = null;
          }
        });
        if (account.toUpperCase() !== arbiter.toUpperCase()) {
          alert("You are not the arbiter! 🤨");
        } else {
          await approveEscrow(managerContract, id, signer);
        }
      }
    }
  }


  useEffect(() => {
    window.ethereum?.request({method: 'eth_accounts'}).then((accounts) => {
      setAccount(accounts[0])
    });

    window.ethereum?.on('accountsChanged', (accounts) => {
      setAccount(accounts[0]);
    });
  }, []);

  useEffect(() => {
    if (account) {
      setSigner(new ethers.providers.Web3Provider(window.ethereum).getSigner());
    }
  }, [account]);

  useEffect(() => {
    getContractInstance(signer).then(setManagerContract);
  }, [signer]);

  useEffect(() => {
    if (managerContract) {
      setManagerAddress(managerContract.address);
      getEscrows(managerContract, EscrowContract).then(setEscrows);
    }
  }, [managerContract]);



  async function deploy() {
    const managerContract = await deployNewContract(signer);
    setManagerContract(managerContract);
  }

  async function importExisting(address) {
    const managerContract = await importExistingContract(address, signer);
    setManagerContract(managerContract);
  }

  async function useDefault() {
    const managerContract = await useDefaultContract(signer);
    setManagerContract(managerContract);
  }



  const validateInputs = () => {
    let amountInWei;
    try { 
      const amount = document.getElementById('amount').value;
      const unit = document.getElementById('unit').value;
      amountInWei = ethers.utils.parseUnits(amount, unit);
    } catch (e) { 
      alert("Invalid amount")
      return [false]; 
    }

    const arbiter = document.getElementById('arbiter').value;
    if (!ethers.utils.isAddress(arbiter)) {
      alert("Invalid arbiter address");
      return [false];
    }

    const beneficiary = document.getElementById('beneficiary').value;
    if(!ethers.utils.isAddress(beneficiary)) {
      alert("Invalid beneficiary address")
      return [false];
    }

    return [true, beneficiary, arbiter, amountInWei];
  }

  async function createEscrowContract() {
    const [valid, beneficiary, arbiter, amount] = validateInputs();
    if (!valid) return;
    
    const escrowID = await createEscrow(managerContract, signer, arbiter, beneficiary, amount);
    const newEscrow = EscrowContract(
      escrowID, 
      account, 
      arbiter, 
      beneficiary, 
      ethers.utils.formatEther(amount), 
      false
    );  
    setEscrows(currentEscrows => [newEscrow, ...currentEscrows]);
  }


  return (
    <div style={{ display: "flex" }}>

      <div className="column">
        <div className="manager-contract">
          <h1> Manager Contract </h1>
          <p>
            Address:&ensp;
            <a href={"https://goerli.etherscan.io/address/" + managerAddress} target="_blank">
              {managerAddress}
            </a>
          </p>
          <div className="button" onClick={() => {setManagerContract(null)}}>
            Switch Manager
          </div>
        </div>

        <div className="contract">
          <div>
            <h1> New Escrow </h1>
            <label>
              Arbiter Address
              <input type="text" id="arbiter" />
            </label>
  
            <label>
              Beneficiary Address
              <input type="text" id="beneficiary" />
            </label>
  
            <label>
              Deposit Amount
              <div>
                <input type="text" id="amount" />
                <select id="unit">
                  <option value="ether">Ether</option>
                  <option value="gwei">Gwei</option>
                  <option value="wei">Wei</option>
                </select>
              </div>
            </label>
  
            <div className="button" onClick={() => {createEscrowContract()}}>
              Deposit
            </div>
          </div>
        </div>
      </div>
  
      <div className="column">
        <div className="existing-contracts">
          <h1> Existing Escrows </h1>
  
          <div id="container">
            {escrows.map((escrow) => {
              return <Escrow key={escrow.id} account={account} {...escrow} />;
            })}
          </div>
        </div>
      </div>

      <WalletDialog
        isShowing={!account}
      />

      <SetupDialog
        isShowing={!!account && !managerContract}
        deployNewContract={deploy}
        importExistingContract={importExisting}
        useDefaultContract={useDefault}
      />
    </div>
  );
}

export default App;
