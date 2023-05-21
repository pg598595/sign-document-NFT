import React, { useState, useEffect } from "react";
import Web3 from "web3";
import SignatureNFT from "./contracts/SignatureNFT.json";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import "./YourCustomFont.css";

function MySignatures({ web3, accounts, contract }) {
  const [signatures, setSignatures] = useState([]);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const getRandomColor = () => {
    const colors = [
      "#FFC107",
      "#3F51B5",
      "#E91E63",
      "#4CAF50",
      "#9C27B0",
      "#F44336",
    ];
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
  };
  const randomColor = getRandomColor();
  const divStyle = {
    backgroundColor: "#c1cad9",
    borderRadius: "20%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: 2,
    padding: 5,
    color: "#000000",
    fontSize: "36px",
    fontFamily: "Piny",
    textTransform: "capitalize",
  };

  //   const [web3, setWeb3] = useState(null);
  //   const [accounts, setAccounts] = useState([]);
  //   const [contract, setContract] = useState(null);
  const contractAddress = "0x6212Abf07560d8c1e639ca9FaB56CD5C6cb730bd";
  const [showMySignatures, setShowMySignatures] = useState(false);
  const handleMySignaturesClick = () => {
    setShowMySignatures(true);
  };
  const [isLoading, setIsLoading] = useState(false);

  const createSignatureNFT = async (web3, contract, email, name) => {
    setIsLoading(true);
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
      setOpenSnackbar(true);
      const tokenData = await getTokenSignature(contract, tokenId);
      console.log(tokenData);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
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

  const handleCreateSignature = async () => {
    if (contract) {
      try {
        await createSignatureNFT(web3, contract, email, name);
        setEmail("");
        setName("");
        await loadSignatures();
      } catch (error) {
        console.error(error);
      }
    } else {
      console.log("Contract not initialized yet");
    }
  };
  const loadSignatures = async () => {
    const totalSupply = await contract.methods.totalSupply().call();
    const newSignatures = [];
    console.log(totalSupply);
    if (totalSupply > 1) {
      for (let i = 0; i <= totalSupply - 1; i++) {
        if (i != 0) {
          console.log("totalSupply here for loop ==== ");
          console.log(i);
          const result = await contract.methods.getSignature(i).call();
          console.log(result);
          console.log(result[0]);

          newSignatures.push({
            tokenId: i,
            email: result[0],
            name: result[1],
          });
        }
      }
    }
    console.log("newSignatures");

    console.log(newSignatures);

    setSignatures(newSignatures);
  };

  useEffect(() => {
    loadSignatures();
  }, [contract]);

  return (
    <div className="App">
      <Snackbar
        open={openSnackbar}
        autoHideDuration={5000}
        onClose={() => setOpenSnackbar(false)}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          onClose={() => setOpenSnackbar(false)}
          severity="success"
        >
          NFT created successfully!
        </MuiAlert>
      </Snackbar>
      <h2>My Signatures</h2>

      <div>
        <div className="App">
          <input
            className="input-field"
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />
          <input
            className="input-field"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
          />
          <button className="create-button" onClick={handleCreateSignature}>
            Create Signature
          </button>
        </div>

        {isLoading && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 9999,
            }}
          >
            <div
              style={{
                backgroundColor: "#fff",
                borderRadius: 4,
                padding: 16,
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <div
                  className="loader"
                  style={{
                    marginRight: 16,
                    animationDuration: "1s",
                    animationIterationCount: "infinite",
                    animationTimingFunction: "linear",
                  }}
                ></div>
                <span>Creating Signature NFT...Please Wait</span>
              </div>
            </div>
          </div>
        )}
        <table
          style={{
            padding: "25px",
            alignContent : "center"
          }}
        >
          <thead>
            <tr>
              <th style={{ border: "1px solid black", fontWeight: "bold" }}>
                Token ID
              </th>

              <th style={{ border: "1px solid black", fontWeight: "bold" }}>
                Name
              </th>
              <th style={{ border: "1px solid black", fontWeight: "bold" }}>
                Sign
              </th>
            </tr>
          </thead>
          <tbody>
            {signatures.map((signature) => (
              <tr key={signature.tokenId}>
                <td style={{ border: "1px solid black" }}>
                  {signature.tokenId}
                </td>
                <td style={{ border: "1px solid black" }}>{signature.name}</td>
                <td style={{ border: "1px solid black" }}>
                  <div style={divStyle}>{signature.name}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MySignatures;
