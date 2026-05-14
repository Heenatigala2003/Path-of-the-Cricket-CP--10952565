"use client";

import { useState } from "react";

export default function ConnectWallet() {
  const [account, setAccount] =
    useState("");

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Install MetaMask");
      return;
    }

    const accounts =
      await window.ethereum.request({
        method: "eth_requestAccounts",
      });

    setAccount(accounts[0]);
  };

  return (
    <div>
      <button onClick={connectWallet}>
        Connect Wallet
      </button>

      <p>
        Connected: {account}
      </p>
    </div>
  );
}