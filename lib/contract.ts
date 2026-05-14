import { ethers } from "ethers";

const contractAddress = "PASTE_CONTRACT_ADDRESS";

const abi = [
  "function getMyBalance() view returns (uint256)",
  "function transfer(address to, uint256 amount)",
  "function addBalance(address user, uint256 amount)"
];

export const getContract = async () => {
  if (!window.ethereum) {
    alert("Install MetaMask");
    return null;
  }

  const provider =
    new ethers.BrowserProvider(window.ethereum);

  const signer =
    await provider.getSigner();

  const contract =
    new ethers.Contract(
      contractAddress,
      abi,
      signer
    );

  return contract;
};