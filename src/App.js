import React, { useState, useEffect } from "react";
import Web3 from "web3";
import SignatureNFT from "./contracts/SignatureNFT.json";
import "./App.css";
import MySignatures from "./MySignatures.js";
import MyDocuments from "./MyDocuments";

function App() {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [contract, setContract] = useState(null);
  const contractAddress = "0x6212Abf07560d8c1e639ca9FaB56CD5C6cb730bd";
  const [showMySignatures, setShowMySignatures] = useState(false);
  const [showMyDocuments, setShowMyDocuments] = useState(false);

  const handleMySignaturesClick = () => {
    setShowMyDocuments(false);
    setShowMySignatures(true);
  };
  const handleMyDocumentsClick = () => {
    setShowMySignatures(false);
    setShowMyDocuments(true);
  };
  const createSignatureNFT = async (web3, contract, email, name) => {
    // Get the current account
    const accounts = await web3.eth.getAccounts();
    const account = accounts[0];

    // Send a transaction to mint the NFT
    try {
      const tx = await contract.methods
        .mintNFT(email, name)
        .send({ from: account });
      console.log(tx);

      // Wait for the "Transfer" event emitted by the contract with the token ID
      const events = tx.events;
      const transferEvent = events["Transfer"];
      const tokenId = transferEvent.returnValues.tokenId;
      console.log(tokenId);
      const tokenData = await getTokenSignature(contract, tokenId);
      console.log(tokenData);
    } catch (error) {
      console.error(error);
    }
  };
  const getTokenSignature = async (contract, tokenId) => {
    try {
      const result = await contract.methods.getTokenSignature(tokenId).call();
      return {
        email: result[0],
        name: result[1],
      };
    } catch (error) {
      console.error(error);
      return null;
    }
  };
  useEffect(() => {
    const initWeb3 = async () => {
      // Check if Web3 is already injected by MetaMask
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        try {
          // Request account access
          await window.ethereum.enable();
          setWeb3(web3);
        } catch (error) {
          // User denied account access
          console.error(error);
        }
      }
      // If no Web3 instance is detected, fallback to Infura
      else {
        const provider = new Web3.providers.HttpProvider(
          "https://sepolia.infura.io/v3/beca57374a9b4fc1ab668a1afce967d6"
        );
        const web3 = new Web3(provider);
        setWeb3(web3);
      }
    };
    initWeb3();
  }, []);

  useEffect(() => {
    const initContract = async () => {
      if (web3) {
        // Get the contract instance
        const networkId = await web3.eth.net.getId();
        const deployedNetwork = SignatureNFT.networks[networkId];
        const instance = new web3.eth.Contract(
          SignatureNFT.abi,
          contractAddress
        );
        setContract(instance);

        // Get the accounts
        const accounts = await web3.eth.getAccounts();
        setAccounts(accounts);
      }
    };
    initContract();
  }, [web3]);

  useEffect(() => {
    const initContract = async () => {
      if (web3) {
        // Get the contract instance
        const networkId = await web3.eth.net.getId();
        const deployedNetwork = SignatureNFT.networks[networkId];
        if (deployedNetwork && deployedNetwork.address) {
          const instance = new web3.eth.Contract(
            SignatureNFT.abi,
            deployedNetwork.address
          );
          setContract(instance);
        }

        // Get the accounts
        const accounts = await web3.eth.getAccounts();
        setAccounts(accounts);
      }
    };
    initContract();
  }, [web3]);

  const handleButtonClick = async () => {
    if (contract) {
      try {
        await createSignatureNFT(
          web3,
          contract,
          "test@example.com",
          "John Doe"
        );
      } catch (error) {
        console.error(error);
      }
    } else {
      console.log("Contract not initialized yet");
    }
  };

  return (
    <div className="App">
      <nav className="navbar">
        <ul className="navbar-menu">
          <li className="navbar-menu-item">
            <a href="#" onClick={handleMySignaturesClick}>
              My Signatures
            </a>
          </li>
          <li className="navbar-menu-item">
            <a href="#" onClick={handleMyDocumentsClick}>
              My Documents
            </a>
          </li>
        </ul>

        <div className="navbar-account">
          <img
            className="navbar-account-avatar"
            src="https://w7.pngwing.com/pngs/764/495/png-transparent-computer-icons-user-profile-user-miscellaneous-silhouette-account-thumbnail.png"
            alt="Account avatar"
          />
          <p className="navbar-account-address">{accounts[0]}</p>
        </div>
      </nav>
      {!showMySignatures && !showMyDocuments ? (
        <div>
          <h2>Welcome To Surety Bonds</h2>
          <img
            src="https://st2.depositphotos.com/37400932/44713/i/450/depositphotos_447134872-stock-photo-white-paper-sheet-text-surety.jpg"
            alt="new"
          />
        </div>
      ) : (
        <p></p>
      )}
      {showMySignatures && (
        <MySignatures accounts={accounts} contract={contract} web3={web3} />
      )}
      {showMyDocuments && (
        <MyDocuments accounts={accounts} contract={contract} web3={web3} />
      )}
    </div>
  );
}
{
  /* <button onClick={handleButtonClick}>Call Smart Contract Function</button> */
}
export default App;
