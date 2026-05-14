"use client";

import { useState } from "react";
import { getContract }
  from "../lib/contract";

export default function GetBalance() {
  const [balance, setBalance] =
    useState("");

  const getBalance = async () => {
    const contract =
      await getContract();

    const result =
      await contract.getMyBalance();

    setBalance(result.toString());
  };

  return (
    <div>
      <button onClick={getBalance}>
        Get My Balance
      </button>

      <p>
        Balance: {balance}
      </p>
    </div>
  );
}