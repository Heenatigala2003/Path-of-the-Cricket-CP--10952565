"use client";

import { useState } from "react";
import { getContract }
  from "../lib/contract";

export default function Transfer() {
  const [to, setTo] =
    useState("");

  const [amount, setAmount] =
    useState("");

  const send = async () => {
    const contract =
      await getContract();

    const tx =
      await contract.transfer(
        to,
        Number(amount)
      );

    await tx.wait();

    alert("Transfer Success");
  };

  return (
    <div>

      <input
        placeholder="Recipient address"
        onChange={(e) =>
          setTo(e.target.value)
        }
      />

      <input
        placeholder="Amount"
        onChange={(e) =>
          setAmount(e.target.value)
        }
      />

      <button onClick={send}>
        Transfer
      </button>

    </div>
  );
}