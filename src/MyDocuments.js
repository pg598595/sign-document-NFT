import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@material-ui/core";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

const MyDocuments = ({ web3, accounts, contract }) => {
  const [signatures, setSignatures] = useState([]);

  const [selectedFile, setSelectedFile] = useState(null);
  const [isDocumentSigned, setIsDocumentSigned] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSignOption, setSelectedSignOption] = useState(null);
  const [openDialog, handleDisplay] = React.useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [text, setText] = useState("");
  const divStyle = {
    backgroundColor: "#c1cad9",
    borderRadius: "20%",
    display: "flex",
    margin: 5,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    color: "#000000",
    fontSize: "36px",
    fontFamily: "Piny",
    textTransform: "capitalize",
  };
  const handleChange = (value) => {
    setText(value);
  };
  const handleClose = () => {
    handleDisplay(false);
  };
  const openDialogBox = () => {
    handleDisplay(true);
  };
  const dialogStyle = {
    padding: "20px",
  };
  const handleFileUpload = (event) => {
    console.log("text is ===");
    console.log(text);
    handleChange("");
    const file = event.target.files[0];
    setSelectedFile(file);
    setIsDocumentSigned(false);
  };

  const handleSignDocument = () => {
    setIsDialogOpen(true);
  };

  const handleSelectSignOption = async (option) => {
    if (contract) {
      try {
        setSelectedSignOption(option);
        setIsDialogOpen(false);
        await createNFTDocument(web3, contract, option.tokenID);
        setIsDocumentSigned(true);
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

  const createNFTDocument = async (web3, contract, tokenID) => {
    setIsLoading(true);
    // Get the current account
    const accounts = await web3.eth.getAccounts();
    const account = accounts[0];

    // Send a transaction to mint the NFT
    try {
      console.log(contract.methods);
      const tx = await contract.methods
        .mintDocument("3", "Test Document")
        .send({ from: account });
      console.log(tx);
      console.log(tx.transactionHash);
      handleChange(tx.transactionHash);

      // Wait for the "Transfer" event emitted by the contract with the token ID
      const events = tx.events;
      const transferEvent = events["Transfer"];
      console.log(transferEvent);
      setOpenSnackbar(true);

      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  const renderFilePreview = () => {
    if (!selectedFile) return null;

    const { type } = selectedFile;

    if (type.startsWith("image/")) {
      return (
        <div className="file-preview">
          <img src={URL.createObjectURL(selectedFile)} alt="File Preview" />
          {!isDocumentSigned && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleSignDocument}
            >
              Sign Document
            </Button>
          )}
        </div>
      );
    } else if (type === "application/pdf") {
      return (
        <div className="file-preview">
          <embed
            src={URL.createObjectURL(selectedFile)}
            type="application/pdf"
            width="100%"
            height="250"
          />
          {!isDocumentSigned && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleSignDocument}
            >
              Sign Document
            </Button>
          )}
        </div>
      );
    } else {
      return <p>Preview not available for this file type.</p>;
    }
  };

  const renderSignOptionsDialog = () => {
    return (
      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <DialogTitle>Select Signature for Document</DialogTitle>
        <DialogContent>
          {signatures.map((option) => (
            <Button
              key={option.tokenId}
              color="#00000000"
              onClick={() => handleSelectSignOption(option)}
            >
              <div style={divStyle}>{option.name}</div>
            </Button>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)} color="secondary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <div>
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
          Document NFT created successfully!
        </MuiAlert>
      </Snackbar>
      <h2>My Documents</h2>
      <input type="file" onChange={handleFileUpload} />
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
              <span>Creating Document NFT...Please Wait</span>
            </div>
          </div>
        </div>
      )}
      <div>
        <h3>File Preview</h3>
        {renderFilePreview()}

        {renderSignOptionsDialog()}
      </div>
      {text !== "" ? (
        <p>Transaction Hash : {text}</p>
      ) : (
        <div>
          <h3></h3>
        </div>
      )}
    </div>
  );
};

export default MyDocuments;
