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
import SetupDialog from './SetupDialog';
import Escrow from './Escrow';

const provider = new ethers.providers.Web3Provider(window.ethereum);

function App() {
  const [isDialogShowing, setIsDialogShowing] = useState(false);
  const [managerContract, setManagerContract] = useState();
  const [managerAddress, setManagerAddress] = useState();
  const [escrows, setEscrows] = useState([]);
  const [account, setAccount] = useState();
  const [signer, setSigner] = useState();

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


  window.ethereum.on('accountsChanged', (accounts) => {
    setAccount(accounts[0]);
  });

  useEffect(() => {
    async function getAccounts() {
      const accounts = await provider.send('eth_requestAccounts', []);
      setAccount(accounts[0]);
      setSigner(provider.getSigner());
    }

    getAccounts();
  }, []);

  useEffect(() => {
    async function setContractInstance() {
      const contractInstance = await getContractInstance(signer);
      if (contractInstance) {
        setManagerContract(contractInstance);
      } else {
        setIsDialogShowing(true);
      }
    }

    setContractInstance();
  }, [signer]);

  useEffect(() => {
    async function updateInfo() {
      setManagerAddress(managerContract.address);
      const newEscrows = await getEscrows(managerContract, EscrowContract);
      setEscrows(newEscrows);
    }

    if (managerContract) updateInfo();
  }, [managerContract]);


  async function deploy() {
    const managerContract = await deployNewContract(signer);
    setManagerContract(managerContract);
    setIsDialogShowing(false);
  }

  async function importExisting(address) {
    const managerContract = await importExistingContract(address, signer);
    setManagerContract(managerContract);
    setIsDialogShowing(false);
  }

  async function useDefault() {
    const managerContract = await useDefaultContract(signer);
    setManagerContract(managerContract);
    setIsDialogShowing(false);
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
          <div className="button" onClick={() => {setIsDialogShowing(true)}}>
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

      <SetupDialog
        isShowing={isDialogShowing}
        deployNewContract={deploy}
        importExistingContract={importExisting}
        useDefaultContract={useDefault}
      />
    </div>
  );
}

export default App;
