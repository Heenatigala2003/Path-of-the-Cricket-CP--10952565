"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ethers } from "ethers";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  Wallet,
  CheckCircle,
  Plus,
  Edit,
  Trash2,
  X,
  Send,
  RefreshCw,
  ArrowDown,
  ArrowUp,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";


const TOKEN_CONTRACT_ADDRESS = "0xBbE18e16672FB6160681cEC6D4F7F2d7858C995f";
const TARGET_ADDRESS = "0x5b2E64e045498c24e7cb8790a8D5aeA1931117E2";

const CONTRACT_ABI = [
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function balanceOf(address owner) external view returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 amount)",
];

type Brand = {
  id: string;
  name: string;
  category: string;
  investment: number;
  contact: string;
  sponsorship_level: string;
  description?: string;
  logo_url?: string;
  website_url?: string;
  is_active: boolean;
};

type Transfer = {
  id: string;
  from_address: string;
  to_address: string;
  amount: number;
  created_at: string;
  status: "pending" | "completed" | "failed";
  tx_hash?: string;
};

type Transaction = {
  id: string;
  from_address: string;
  to_address: string;
  amount: number;
  tx_hash: string;
  block_number: number;
  created_at: string;
  is_outgoing: boolean;
};

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      const isRpcError =
        error?.message?.includes("too many errors") ||
        error?.code === "UNKNOWN_ERROR" ||
        error?.code === -32002;
      if (i === retries - 1 || !isRpcError) throw error;
      console.warn(`RPC error, retrying in ${delay}ms... (${i + 1}/${retries})`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2; // exponential backoff
    }
  }
  throw new Error("Retry failed");
}


async function queryLogsInChunks(
  contract: ethers.Contract,
  filter: any,
  fromBlock: number,
  toBlock: number,
  chunkSize = 500
): Promise<ethers.Log[]> {
  let allLogs: ethers.Log[] = [];
  for (let start = fromBlock; start <= toBlock; start += chunkSize) {
    const end = Math.min(start + chunkSize - 1, toBlock);
    const logs = await retryWithBackoff(() =>
      contract.queryFilter(filter, start, end)
    );
    allLogs = allLogs.concat(logs);
  }
  return allLogs;
}

export default function AdminSponsorshipPage() {
  const router = useRouter();

  const [brands, setBrands] = useState<Brand[]>([]);
  const [outgoingTransfers, setOutgoingTransfers] = useState<Transfer[]>([]);
  const [incomingTransfers, setIncomingTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [outgoingLoading, setOutgoingLoading] = useState(true);
  const [incomingLoading, setIncomingLoading] = useState(true);
  const [supabaseError, setSupabaseError] = useState<string | null>(null);
  const [incomingTableError, setIncomingTableError] = useState<string | null>(null);

  const [showSponsorModal, setShowSponsorModal] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState<Brand | null>(null);
  const [formData, setFormData] = useState<Partial<Brand>>({
    name: "",
    category: "",
    investment: 0,
    contact: "",
    sponsorship_level: "bronze",
    description: "",
    logo_url: "",
    website_url: "",
    is_active: true,
  });
  const [formError, setFormError] = useState("");

  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [transferAmount, setTransferAmount] = useState("");
  const [transferTo, setTransferTo] = useState("");
  const [transferStatus, setTransferStatus] = useState<{
    message: string;
    type: "info" | "success" | "error";
  } | null>(null);
  const [isTransferring, setIsTransferring] = useState(false);
  const [contractValid, setContractValid] = useState(false);

  const [connectedWalletTxs, setConnectedWalletTxs] = useState<Transaction[]>([]);
  const [connectedWalletTxsLoading, setConnectedWalletTxsLoading] = useState(true);
  const [connectedWalletTxsError, setConnectedWalletTxsError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const [fixedTransactions, setFixedTransactions] = useState<Transaction[]>([]);
  const [fixedLoading, setFixedLoading] = useState(true);
  const [fixedTableError, setFixedTableError] = useState<string | null>(null);

  const [isSepolia, setIsSepolia] = useState(false);
  const [networkError, setNetworkError] = useState<string | null>(null);
  const [historicalSyncError, setHistoricalSyncError] = useState<string | null>(null);

  const sponsorsSubscriptionRef = useRef<any>(null);
  const outgoingSubscriptionRef = useRef<any>(null);
  const incomingSubscriptionRef = useRef<any>(null);
  const fixedSubscriptionRef = useRef<any>(null);
  const connectedWalletSubscriptionRef = useRef<any>(null);
  const fixedContractEventFilterRef = useRef<any>(null);
  const connectedWalletEventFilterRef = useRef<any>(null);
  const blockListenerRef = useRef<any>(null);
  const lastProcessedBlockRef = useRef<number>(0);
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  const getSupabaseErrorMessage = (error: any): string => {
    if (error?.message) return error.message;
    if (typeof error === "string") return error;
    return "An unknown error occurred.";
  };

  const isContractAddressValid = (address: string) => {
    if (!address || address === "0xYourContractAddress") return false;
    return ethers.isAddress(address);
  };

  const isWalletContract = () => {
    return connectedWallet && connectedWallet.toLowerCase() === TOKEN_CONTRACT_ADDRESS.toLowerCase();
  };

  const checkAndSwitchToSepolia = async () => {
    if (!window.ethereum) return false;
    try {
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      if (chainId === "0xaa36a7") {
        setIsSepolia(true);
        setNetworkError(null);
        return true;
      } else {
        setIsSepolia(false);
        setNetworkError("Please switch to Sepolia testnet in MetaMask.");
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0xaa36a7" }],
          });
          setIsSepolia(true);
          setNetworkError(null);
          return true;
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            setNetworkError("Sepolia network not added to MetaMask. Please add it manually.");
          } else {
            setNetworkError("Failed to switch to Sepolia. Please switch manually.");
          }
          return false;
        }
      }
    } catch (err) {
      console.error("Network check error:", err);
      setNetworkError("Could not verify network.");
      return false;
    }
  };

  const getProvider = () => {
    // Optional: use a custom RPC from environment variable
    const customRpc = process.env.NEXT_PUBLIC_RPC_URL;
    if (customRpc) {
      return new ethers.JsonRpcProvider(customRpc);
    }
    if (!window.ethereum) throw new Error("MetaMask not installed");
    return new ethers.BrowserProvider(window.ethereum);
  };

  const fetchSponsors = async () => {
    try {
      setLoading(true);
      setSupabaseError(null);
      const { data, error } = await supabase
        .from("sponsors")
        .select("*")
        .order("sponsorship_level", { ascending: false });
      if (error) throw error;
      setBrands(data || []);
    } catch (err: any) {
      console.error("Error fetching sponsors:", err);
      setSupabaseError(`Failed to load sponsors: ${getSupabaseErrorMessage(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchOutgoingTransfers = async () => {
    try {
      setOutgoingLoading(true);
      const { data, error } = await supabase
        .from("transfers")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      setOutgoingTransfers(data || []);
    } catch (err: any) {
      console.error("Error fetching outgoing transfers:", err);
    } finally {
      setOutgoingLoading(false);
    }
  };

  const fetchIncomingTransfers = async () => {
    try {
      setIncomingLoading(true);
      setIncomingTableError(null);
      const { data, error } = await supabase
        .from("incoming_transfers")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) {
        if (error.code === "42P01") {
          setIncomingTableError("Table 'incoming_transfers' does not exist. Please create it first.");
        } else {
          throw error;
        }
        setIncomingTransfers([]);
      } else {
        setIncomingTransfers(data || []);
      }
    } catch (err: any) {
      console.error("Error fetching incoming transfers:", err);
      setIncomingTableError(getSupabaseErrorMessage(err));
    } finally {
      setIncomingLoading(false);
    }
  };

  const fetchConnectedWalletTransactions = useCallback(async () => {
    if (!connectedWallet) return;
    try {
      setConnectedWalletTxsLoading(true);
      setConnectedWalletTxsError(null);
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .or(`from_address.eq.${connectedWallet},to_address.eq.${connectedWallet}`)
        .order("block_number", { ascending: false })
        .limit(50);
      if (error) {
        if (error.code === "42P01") {
          setConnectedWalletTxsError("Table 'transactions' does not exist. Please create it first.");
        } else {
          throw error;
        }
        setConnectedWalletTxs([]);
      } else {
        setConnectedWalletTxs(data || []);
      }
    } catch (err: any) {
      console.error("Error fetching connected wallet transactions:", err);
      setConnectedWalletTxsError(getSupabaseErrorMessage(err));
    } finally {
      setConnectedWalletTxsLoading(false);
    }
  }, [connectedWallet]);

  const insertNativeTransaction = useCallback(
    async (txHash: string, from: string, to: string, value: bigint, blockNumber: number) => {
      const amount = parseFloat(ethers.formatEther(value));
      const isOutgoing = from.toLowerCase() === connectedWallet?.toLowerCase();
      const { error } = await supabase
        .from("transactions")
        .upsert(
          {
            from_address: from,
            to_address: to,
            amount,
            tx_hash: txHash,
            block_number: blockNumber,
            is_outgoing: isOutgoing,
          },
          { onConflict: "tx_hash" }
        );
      if (error && error.code !== "23505") {
        console.error("Failed to insert native transaction:", error);
      }
    },
    [connectedWallet]
  );

  const fetchHistoricalNativeTransactions = useCallback(async () => {
    if (!connectedWallet || !window.ethereum) return;
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    try {
      const provider = getProvider();
      const currentBlock = await retryWithBackoff(() => provider.getBlockNumber());
      const fromBlock = Math.max(0, currentBlock - 1000);
      const batchSize = 50;
      for (let start = fromBlock; start <= currentBlock; start += batchSize) {
        if (abortController.signal.aborted) break;
        const end = Math.min(start + batchSize - 1, currentBlock);
        const blockPromises = [];
        for (let b = start; b <= end; b++) {
          blockPromises.push(retryWithBackoff(() => provider.getBlock(b, true)));
        }
        const blocks = await Promise.all(blockPromises);
        for (const block of blocks) {
          if (abortController.signal.aborted) break;
          if (!block || !block.transactions) continue;
          for (const tx of block.transactions) {
            if (tx.value > 0n) {
              if (
                tx.from.toLowerCase() === connectedWallet.toLowerCase() ||
                tx.to?.toLowerCase() === connectedWallet.toLowerCase()
              ) {
                await insertNativeTransaction(tx.hash, tx.from, tx.to || "", tx.value, block.number);
              }
            }
          }
        }
      }
      if (!abortController.signal.aborted) {
        await fetchConnectedWalletTransactions();
      }
    } catch (err) {
      console.error("Error fetching historical native transactions:", err);
      setHistoricalSyncError("Failed to sync native ETH transactions. RPC may be busy.");
    } finally {
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null;
      }
    }
  }, [connectedWallet, insertNativeTransaction, fetchConnectedWalletTransactions]);

  const setupNativeBlockListener = useCallback(async () => {
    if (!connectedWallet || !window.ethereum) return;
    if (blockListenerRef.current) {
      blockListenerRef.current.removeAllListeners();
      blockListenerRef.current = null;
    }
    const provider = getProvider();
    const listener = async (blockNumber: number) => {
      if (blockNumber <= lastProcessedBlockRef.current) return;
      lastProcessedBlockRef.current = blockNumber;
      try {
        const block = await provider.getBlock(blockNumber, true);
        if (!block || !block.transactions) return;
        for (const tx of block.transactions) {
          if (tx.value > 0n) {
            if (
              tx.from.toLowerCase() === connectedWallet.toLowerCase() ||
              tx.to?.toLowerCase() === connectedWallet.toLowerCase()
            ) {
              await insertNativeTransaction(tx.hash, tx.from, tx.to || "", tx.value, block.number);
            }
          }
        }
      } catch (err) {
        console.error("Error processing block:", err);
      }
    };
    provider.on("block", listener);
    blockListenerRef.current = provider;
  }, [connectedWallet, insertNativeTransaction]);

  const fetchHistoricalTokenTransfers = useCallback(async () => {
    if (!connectedWallet || !window.ethereum || !contractValid || !isSepolia) return;
    setHistoricalSyncError(null);
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    try {
      const provider = getProvider();
      const contract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const currentBlock = await retryWithBackoff(() => provider.getBlockNumber());
      const fromBlock = Math.max(0, currentBlock - 5000); // smaller range to avoid RPC overload

      const filterFrom = contract.filters.Transfer(connectedWallet, null);
      const filterTo = contract.filters.Transfer(null, connectedWallet);

   
      const [eventsFrom, eventsTo] = await Promise.all([
        queryLogsInChunks(contract, filterFrom, fromBlock, currentBlock),
        queryLogsInChunks(contract, filterTo, fromBlock, currentBlock),
      ]);

      const allEvents = [...eventsFrom, ...eventsTo];
      const uniqueEvents = Array.from(
        new Map(allEvents.map((event) => [event.transactionHash, event])).values()
      );

      console.log(`Found ${uniqueEvents.length} historical token transfers`);

      for (const event of uniqueEvents) {
        if (abortController.signal.aborted) break;
        const { from, to, amount } = event.args as any;
        const txHash = event.transactionHash;
        const amountNumber = parseFloat(ethers.formatUnits(amount, 18));
        const blockNumber = event.blockNumber;
        await supabase
          .from("transactions")
          .upsert(
            {
              from_address: from,
              to_address: to,
              amount: amountNumber,
              tx_hash: txHash,
              block_number: blockNumber,
              is_outgoing: from.toLowerCase() === connectedWallet.toLowerCase(),
            },
            { onConflict: "tx_hash" }
          );
      }
      if (!abortController.signal.aborted) {
        await fetchConnectedWalletTransactions();
      }
    } catch (err: any) {
      console.error("Error fetching historical token transfers:", err);
      setHistoricalSyncError(
        "Could not fetch token transfer history due to RPC errors. You can still send tokens, and new transfers will be recorded automatically. Try manual sync later."
      );
    } finally {
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null;
      }
    }
  }, [connectedWallet, contractValid, isSepolia, fetchConnectedWalletTransactions]);

  const setupTokenBlockchainListener = useCallback(async () => {
    if (!connectedWallet || !window.ethereum || !contractValid || !isSepolia) return;
    try {
      const provider = getProvider();
      const contract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      if (connectedWalletEventFilterRef.current) {
        const { contract: oldContract, filters, listener } = connectedWalletEventFilterRef.current;
        if (oldContract && filters && listener) {
          filters.forEach((filter: any) => oldContract.off(filter, listener));
        }
        connectedWalletEventFilterRef.current = null;
      }
      const filterFrom = contract.filters.Transfer(connectedWallet, null);
      const filterTo = contract.filters.Transfer(null, connectedWallet);
      const filters = [filterFrom, filterTo];
      const listener = async (from: string, to: string, amount: ethers.BigNumberish, event: any) => {
        if (!isMountedRef.current) return;
        const txHash = event.log.transactionHash;
        const amountNumber = parseFloat(ethers.formatUnits(amount, 18));
        const blockNumber = event.blockNumber;
        const { error } = await supabase
          .from("transactions")
          .upsert(
            {
              from_address: from,
              to_address: to,
              amount: amountNumber,
              tx_hash: txHash,
              block_number: blockNumber,
              is_outgoing: from.toLowerCase() === connectedWallet.toLowerCase(),
            },
            { onConflict: "tx_hash" }
          );
        if (error && error.code !== "23505") {
          console.error("Failed to record token transaction:", error);
        }
      };
      contract.on(filterFrom, listener);
      contract.on(filterTo, listener);
      connectedWalletEventFilterRef.current = { contract, filters, listener };
    } catch (err) {
      console.error("Error setting up token blockchain listener:", err);
    }
  }, [connectedWallet, contractValid, isSepolia]);

  const setupConnectedWalletRealtime = useCallback(() => {
    if (!connectedWallet) return;
    if (connectedWalletSubscriptionRef.current) {
      supabase.removeChannel(connectedWalletSubscriptionRef.current);
    }
    connectedWalletSubscriptionRef.current = supabase
      .channel("transactions-wallet-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "transactions" },
        (payload) => {
          const newTx = payload.new as Transaction;
          if (
            newTx.from_address.toLowerCase() === connectedWallet.toLowerCase() ||
            newTx.to_address.toLowerCase() === connectedWallet.toLowerCase()
          ) {
            setConnectedWalletTxs((prev) => [newTx, ...prev.slice(0, 49)]);
          }
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") console.log("Connected wallet realtime active");
        if (status === "CHANNEL_ERROR") console.warn("Connected wallet realtime channel error");
      });
  }, [connectedWallet]);

  const fetchFixedTransactions = async () => {
    try {
      setFixedLoading(true);
      setFixedTableError(null);
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .or(`from_address.eq.${TARGET_ADDRESS},to_address.eq.${TARGET_ADDRESS}`)
        .order("block_number", { ascending: false })
        .limit(50);
      if (error) {
        if (error.code === "42P01") {
          setFixedTableError("Table 'transactions' does not exist. Please create it first.");
        } else {
          throw error;
        }
        setFixedTransactions([]);
      } else {
        setFixedTransactions(data || []);
      }
    } catch (err: any) {
      console.error("Error fetching fixed transactions:", err);
    } finally {
      setFixedLoading(false);
    }
  };

  const fetchHistoricalFixedTokenTransfers = useCallback(async () => {
    if (!window.ethereum || !contractValid || !isSepolia) return;
    try {
      const provider = getProvider();
      const contract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const currentBlock = await retryWithBackoff(() => provider.getBlockNumber());
      const fromBlock = Math.max(0, currentBlock - 5000);
      const filterFrom = contract.filters.Transfer(TARGET_ADDRESS, null);
      const filterTo = contract.filters.Transfer(null, TARGET_ADDRESS);
      const [eventsFrom, eventsTo] = await Promise.all([
        queryLogsInChunks(contract, filterFrom, fromBlock, currentBlock),
        queryLogsInChunks(contract, filterTo, fromBlock, currentBlock),
      ]);
      const allEvents = [...eventsFrom, ...eventsTo];
      const uniqueEvents = Array.from(
        new Map(allEvents.map((event) => [event.transactionHash, event])).values()
      );
      for (const event of uniqueEvents) {
        const { from, to, amount } = event.args as any;
        const txHash = event.transactionHash;
        const amountNumber = parseFloat(ethers.formatUnits(amount, 18));
        const blockNumber = event.blockNumber;
        await supabase
          .from("transactions")
          .upsert(
            {
              from_address: from,
              to_address: to,
              amount: amountNumber,
              tx_hash: txHash,
              block_number: blockNumber,
              is_outgoing: from.toLowerCase() === TARGET_ADDRESS.toLowerCase(),
            },
            { onConflict: "tx_hash" }
          );
      }
      await fetchFixedTransactions();
    } catch (err: any) {
      console.error("Error fetching historical fixed token transfers:", err);
      // Non-critical, just log
    }
  }, [contractValid, isSepolia]);

  const setupFixedTokenBlockchainListener = useCallback(async () => {
    if (!window.ethereum || !contractValid || !isSepolia) return;
    try {
      const provider = getProvider();
      const contract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      if (fixedContractEventFilterRef.current) {
        const { contract: oldContract, filters, listener } = fixedContractEventFilterRef.current;
        if (oldContract && filters && listener) {
          filters.forEach((filter: any) => oldContract.off(filter, listener));
        }
        fixedContractEventFilterRef.current = null;
      }
      const filterFrom = contract.filters.Transfer(TARGET_ADDRESS, null);
      const filterTo = contract.filters.Transfer(null, TARGET_ADDRESS);
      const filters = [filterFrom, filterTo];
      const listener = async (from: string, to: string, amount: ethers.BigNumberish, event: any) => {
        if (!isMountedRef.current) return;
        const txHash = event.log.transactionHash;
        const amountNumber = parseFloat(ethers.formatUnits(amount, 18));
        const blockNumber = event.blockNumber;
        const { error } = await supabase
          .from("transactions")
          .upsert(
            {
              from_address: from,
              to_address: to,
              amount: amountNumber,
              tx_hash: txHash,
              block_number: blockNumber,
              is_outgoing: from.toLowerCase() === TARGET_ADDRESS.toLowerCase(),
            },
            { onConflict: "tx_hash" }
          );
        if (error && error.code !== "23505") {
          console.error("Failed to record fixed token transaction:", error);
        }
      };
      contract.on(filterFrom, listener);
      contract.on(filterTo, listener);
      fixedContractEventFilterRef.current = { contract, filters, listener };
    } catch (err) {
      console.error("Error setting up fixed token blockchain listener:", err);
    }
  }, [contractValid, isSepolia]);

  const setupFixedRealtime = useCallback(() => {
    if (fixedSubscriptionRef.current) {
      supabase.removeChannel(fixedSubscriptionRef.current);
    }
    fixedSubscriptionRef.current = supabase
      .channel("transactions-fixed-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "transactions" },
        (payload) => {
          const newTx = payload.new as Transaction;
          if (
            newTx.from_address.toLowerCase() === TARGET_ADDRESS.toLowerCase() ||
            newTx.to_address.toLowerCase() === TARGET_ADDRESS.toLowerCase()
          ) {
            setFixedTransactions((prev) => [newTx, ...prev.slice(0, 49)]);
          }
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") console.log("Fixed address realtime active");
        if (status === "CHANNEL_ERROR") console.warn("Fixed address realtime channel error");
      });
  }, []);

  const setupRealtime = useCallback(() => {
    const cleanup = () => {
      if (sponsorsSubscriptionRef.current) supabase.removeChannel(sponsorsSubscriptionRef.current);
      if (outgoingSubscriptionRef.current) supabase.removeChannel(outgoingSubscriptionRef.current);
      if (incomingSubscriptionRef.current) supabase.removeChannel(incomingSubscriptionRef.current);
    };
    cleanup();
    sponsorsSubscriptionRef.current = supabase
      .channel("sponsors-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "sponsors" }, (payload) => {
        if (payload.eventType === "INSERT") setBrands((prev) => [payload.new as Brand, ...prev]);
        else if (payload.eventType === "UPDATE")
          setBrands((prev) => prev.map((b) => (b.id === payload.new.id ? (payload.new as Brand) : b)));
        else if (payload.eventType === "DELETE")
          setBrands((prev) => prev.filter((b) => b.id !== payload.old.id));
      })
      .subscribe();
    outgoingSubscriptionRef.current = supabase
      .channel("transfers-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "transfers" }, (payload) => {
        if (payload.eventType === "INSERT") setOutgoingTransfers((prev) => [payload.new as Transfer, ...prev]);
        else if (payload.eventType === "UPDATE")
          setOutgoingTransfers((prev) =>
            prev.map((t) => (t.id === payload.new.id ? (payload.new as Transfer) : t))
          );
        else if (payload.eventType === "DELETE")
          setOutgoingTransfers((prev) => prev.filter((t) => t.id !== payload.old.id));
      })
      .subscribe();
    if (!incomingTableError) {
      incomingSubscriptionRef.current = supabase
        .channel("incoming-realtime")
        .on("postgres_changes", { event: "*", schema: "public", table: "incoming_transfers" }, (payload) => {
          if (payload.eventType === "INSERT") setIncomingTransfers((prev) => [payload.new as Transfer, ...prev]);
          else if (payload.eventType === "UPDATE")
            setIncomingTransfers((prev) =>
              prev.map((t) => (t.id === payload.new.id ? (payload.new as Transfer) : t))
            );
          else if (payload.eventType === "DELETE")
            setIncomingTransfers((prev) => prev.filter((t) => t.id !== payload.old.id));
        })
        .subscribe();
    }
  }, [incomingTableError]);

  useEffect(() => {
    isMountedRef.current = true;
    const init = async () => {
      await fetchSponsors();
      await fetchOutgoingTransfers();
      await fetchIncomingTransfers();
      await fetchFixedTransactions();
      if (isMountedRef.current) {
        setupRealtime();
        setupFixedRealtime();
      }
      const valid = isContractAddressValid(TOKEN_CONTRACT_ADDRESS);
      setContractValid(valid);
      if (!valid) {
        setTransferStatus({
          message: "Contract address is invalid. Please set a valid contract address.",
          type: "error",
        });
      } else {
        const onSepolia = await checkAndSwitchToSepolia();
        if (onSepolia && window.ethereum) {
          await fetchHistoricalFixedTokenTransfers();
          await setupFixedTokenBlockchainListener();
        }
      }
    };
    init();
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) abortControllerRef.current.abort();
      if (sponsorsSubscriptionRef.current) supabase.removeChannel(sponsorsSubscriptionRef.current);
      if (outgoingSubscriptionRef.current) supabase.removeChannel(outgoingSubscriptionRef.current);
      if (incomingSubscriptionRef.current) supabase.removeChannel(incomingSubscriptionRef.current);
      if (fixedSubscriptionRef.current) supabase.removeChannel(fixedSubscriptionRef.current);
      if (connectedWalletSubscriptionRef.current) supabase.removeChannel(connectedWalletSubscriptionRef.current);
      if (fixedContractEventFilterRef.current) {
        const { contract, filters, listener } = fixedContractEventFilterRef.current;
        if (contract && filters && listener) filters.forEach((filter: any) => contract.off(filter, listener));
      }
      if (connectedWalletEventFilterRef.current) {
        const { contract, filters, listener } = connectedWalletEventFilterRef.current;
        if (contract && filters && listener) filters.forEach((filter: any) => contract.off(filter, listener));
      }
      if (blockListenerRef.current) blockListenerRef.current.removeAllListeners();
    };
  }, [setupRealtime, setupFixedRealtime, fetchHistoricalFixedTokenTransfers, setupFixedTokenBlockchainListener]);

  useEffect(() => {
    if (!connectedWallet) {
      setConnectedWalletTxs([]);
      setConnectedWalletTxsLoading(false);
      if (connectedWalletSubscriptionRef.current) supabase.removeChannel(connectedWalletSubscriptionRef.current);
      if (connectedWalletEventFilterRef.current) {
        const { contract, filters, listener } = connectedWalletEventFilterRef.current;
        if (contract && filters && listener) filters.forEach((filter: any) => contract.off(filter, listener));
        connectedWalletEventFilterRef.current = null;
      }
      if (blockListenerRef.current) {
        blockListenerRef.current.removeAllListeners();
        blockListenerRef.current = null;
      }
      return;
    }
    const init = async () => {
      const onSepolia = await checkAndSwitchToSepolia();
      if (!onSepolia) {
        setTransferStatus({
          message: "Please switch to Sepolia testnet in MetaMask to use token features.",
          type: "error",
        });
        return;
      }
      await fetchConnectedWalletTransactions();
      await fetchHistoricalNativeTransactions();
      await fetchHistoricalTokenTransfers();
      await setupNativeBlockListener();
      await setupTokenBlockchainListener();
      setupConnectedWalletRealtime();
    };
    init();
  }, [
    connectedWallet,
    fetchConnectedWalletTransactions,
    fetchHistoricalNativeTransactions,
    fetchHistoricalTokenTransfers,
    setupNativeBlockListener,
    setupTokenBlockchainListener,
    setupConnectedWalletRealtime,
  ]);

  const manualSync = async () => {
    if (!connectedWallet || isSyncing) return;
    setIsSyncing(true);
    setTransferStatus({ message: "Syncing transactions...", type: "info" });
    setHistoricalSyncError(null);
    try {
      await fetchHistoricalNativeTransactions();
      await fetchHistoricalTokenTransfers();
      setTransferStatus({ message: "Sync completed!", type: "success" });
    } catch (err) {
      console.error(err);
      setTransferStatus({ message: "Sync failed. RPC may be busy. Try again later.", type: "error" });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAddSponsor = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!formData.name || !formData.category || !formData.investment || !formData.contact) {
      setFormError("Please fill all required fields.");
      return;
    }
    try {
      const { error } = await supabase.from("sponsors").insert([
        {
          name: formData.name,
          category: formData.category,
          investment: formData.investment,
          contact: formData.contact,
          sponsorship_level: formData.sponsorship_level,
          description: formData.description || null,
          logo_url: formData.logo_url || null,
          website_url: formData.website_url || null,
          is_active: formData.is_active ?? true,
        },
      ]);
      if (error) throw error;
      setShowSponsorModal(false);
      setEditingSponsor(null);
      setFormData({
        name: "",
        category: "",
        investment: 0,
        contact: "",
        sponsorship_level: "bronze",
        description: "",
        logo_url: "",
        website_url: "",
        is_active: true,
      });
    } catch (err: any) {
      setFormError(getSupabaseErrorMessage(err));
    }
  };

  const handleEditSponsor = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!editingSponsor) return;
    try {
      const { error } = await supabase
        .from("sponsors")
        .update({
          name: formData.name,
          category: formData.category,
          investment: formData.investment,
          contact: formData.contact,
          sponsorship_level: formData.sponsorship_level,
          description: formData.description,
          logo_url: formData.logo_url,
          website_url: formData.website_url,
          is_active: formData.is_active,
        })
        .eq("id", editingSponsor.id);
      if (error) throw error;
      setShowSponsorModal(false);
      setEditingSponsor(null);
      setFormData({
        name: "",
        category: "",
        investment: 0,
        contact: "",
        sponsorship_level: "bronze",
        description: "",
        logo_url: "",
        website_url: "",
        is_active: true,
      });
    } catch (err: any) {
      setFormError(getSupabaseErrorMessage(err));
    }
  };

  const handleDeleteSponsor = async (id: string) => {
    if (!confirm("Are you sure you want to delete this sponsor?")) return;
    try {
      const { error } = await supabase.from("sponsors").delete().eq("id", id);
      if (error) throw error;
    } catch (err: any) {
      alert("Failed to delete: " + getSupabaseErrorMessage(err));
    }
  };

  const openEditModal = (sponsor: Brand) => {
    setEditingSponsor(sponsor);
    setFormData({
      name: sponsor.name,
      category: sponsor.category,
      investment: sponsor.investment,
      contact: sponsor.contact,
      sponsorship_level: sponsor.sponsorship_level,
      description: sponsor.description,
      logo_url: sponsor.logo_url,
      website_url: sponsor.website_url,
      is_active: sponsor.is_active,
    });
    setShowSponsorModal(true);
  };

  const connectWallet = async () => {
    if (isConnecting) return;
    setConnectionError(null);
    setIsConnecting(true);
    try {
      if (typeof window === "undefined" || !window.ethereum) {
        throw new Error("MetaMask is not installed. Please install MetaMask.");
      }
      const onSepolia = await checkAndSwitchToSepolia();
      if (!onSepolia) throw new Error("Please switch to Sepolia testnet in MetaMask.");
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      if (accounts && accounts.length > 0) setConnectedWallet(accounts[0]);
    } catch (err: any) {
      setConnectionError(err.message);
    } finally {
      setIsConnecting(false);
    }
  };

  const switchAccount = async () => {
    if (isSwitching) return;
    setIsSwitching(true);
    setTransferStatus(null);
    setConnectionError(null);
    try {
      if (!window.ethereum) throw new Error("MetaMask not installed");
      let accounts: string[] = [];
      try {
        await window.ethereum.request({ method: "wallet_requestPermissions", params: [{ eth_accounts: {} }] });
        accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      } catch {
        accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      }
      if (accounts && accounts.length > 0) {
        setConnectedWallet(accounts[0]);
        setTransferStatus({ message: `Switched to ${accounts[0].substring(0, 6)}...`, type: "success" });
      } else {
        setConnectedWallet(null);
        setTransferStatus({ message: "No account selected", type: "error" });
      }
    } catch (err: any) {
      setConnectionError(err?.message);
      setTransferStatus({ message: `Failed to switch account: ${err?.message}`, type: "error" });
    } finally {
      setIsSwitching(false);
    }
  };

  const getContract = async (withSigner = true) => {
    const provider = getProvider();
    if (withSigner) {
      const signer = await provider.getSigner();
      return new ethers.Contract(TOKEN_CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    }
    return new ethers.Contract(TOKEN_CONTRACT_ADDRESS, CONTRACT_ABI, provider);
  };

  const performTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setTransferStatus(null);
    if (!contractValid) {
      setTransferStatus({ message: "Contract address is invalid.", type: "error" });
      return;
    }
    if (!connectedWallet) {
      setTransferStatus({ message: "Please connect MetaMask first.", type: "error" });
      return;
    }
    if (!isSepolia) {
      setTransferStatus({ message: "Please switch to Sepolia testnet in MetaMask.", type: "error" });
      return;
    }
    if (isWalletContract()) {
      setTransferStatus({ message: "Cannot send from the contract address. Please connect a different wallet.", type: "error" });
      return;
    }
    if (!transferTo || !transferAmount) {
      setTransferStatus({ message: "Please enter recipient address and amount.", type: "error" });
      return;
    }
    if (!ethers.isAddress(transferTo)) {
      setTransferStatus({ message: "Invalid recipient address.", type: "error" });
      return;
    }
    if (transferTo.toLowerCase() === connectedWallet.toLowerCase()) {
      setTransferStatus({ message: "Cannot send tokens to yourself.", type: "error" });
      return;
    }
    if (transferTo.toLowerCase() === TOKEN_CONTRACT_ADDRESS.toLowerCase()) {
      setTransferStatus({ message: "Cannot send tokens to the token contract itself.", type: "error" });
      return;
    }

    const provider = getProvider();
    const code = await provider.getCode(transferTo);
    if (code !== "0x") {
      const confirmSend = window.confirm(
        "⚠️ Recipient is a smart contract. Make sure it can receive ERC20 tokens. Do you want to continue?"
      );
      if (!confirmSend) return;
    }

    setIsTransferring(true);
    setTransferStatus({ message: "Initiating transfer on Sepolia...", type: "info" });

    try {
      const amountInWei = ethers.parseUnits(transferAmount, 18);
      const contract = await getContract(true);
      const tx = await contract.transfer(transferTo, amountInWei);
      setTransferStatus({ message: `Transaction sent: ${tx.hash}. Waiting for confirmation...`, type: "info" });

      const { data: pendingTransfer, error: insertError } = await supabase
        .from("transfers")
        .insert({
          from_address: connectedWallet,
          to_address: transferTo,
          amount: parseFloat(transferAmount),
          status: "pending",
          tx_hash: tx.hash,
        })
        .select()
        .single();

      if (insertError) {
        console.error("Failed to insert pending transfer:", insertError);
        setTransferStatus({ message: "Transfer initiated but record failed to save.", type: "error" });
        return;
      }

      await tx.wait();
      setTransferStatus({ message: "Transfer completed successfully!", type: "success" });

      await supabase.from("transfers").update({ status: "completed" }).eq("id", pendingTransfer.id);

      setTransferAmount("");
      setTransferTo("");
    } catch (err: any) {
      console.error("Transfer error:", err);
      let errorMessage = err.message || err.error?.message || "Unknown error";
      if (errorMessage.includes("internal accounts") || errorMessage.includes("cannot include data")) {
        errorMessage =
          "🔴 Cannot send tokens to this address because it is an internal account. Please make sure you are on Sepolia testnet and the recipient is a standard externally owned account (EOA).";
      }
      setTransferStatus({ message: `Transfer failed: ${errorMessage}`, type: "error" });
    } finally {
      setIsTransferring(false);
    }
  };

  const truncateAddress = (address: string) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleString();

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="bg-gradient-to-r from-gray-900 to-black border-b border-yellow-500 py-6 px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold text-yellow-500">Admin Panel - Sponsorship (Sepolia)</h1>
          <div className="flex gap-4">
            <button onClick={() => router.push("/admin/sponsorship/application")} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg">
              Applications
            </button>
            <button onClick={() => router.push("/admin/sponsorship/contract")} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg">
              Contract
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-12">
        {supabaseError && (
          <div className="bg-red-900 text-red-200 p-4 rounded-lg">
            <strong>Error:</strong> {supabaseError}
            <button onClick={() => { setSupabaseError(null); fetchSponsors(); fetchOutgoingTransfers(); fetchIncomingTransfers(); }} className="ml-4 px-2 py-1 bg-red-700 rounded text-sm">
              Retry
            </button>
          </div>
        )}

        {networkError && (
          <div className="bg-yellow-900 text-yellow-200 p-4 rounded-lg flex items-center gap-3">
            <AlertTriangle size={24} />
            <div>
              <strong>Network issue:</strong> {networkError}
              <button onClick={checkAndSwitchToSepolia} className="ml-4 px-2 py-1 bg-yellow-700 rounded text-sm">
                Try Again
              </button>
            </div>
          </div>
        )}

        {historicalSyncError && (
          <div className="bg-orange-900 text-orange-200 p-4 rounded-lg flex items-center gap-3">
            <AlertTriangle size={24} />
            <div>{historicalSyncError}</div>
          </div>
        )}

        {!contractValid && (
          <div className="bg-yellow-900 text-yellow-200 p-4 rounded-lg flex items-center gap-3">
            <AlertTriangle size={24} />
            <div>Contract address not configured or invalid. Please verify the Sepolia contract address.</div>
          </div>
        )}

        {connectedWallet && isWalletContract() && (
          <div className="bg-red-900 text-red-200 p-4 rounded-lg flex items-center gap-3">
            <AlertTriangle size={24} />
            <div className="flex-1">
              <strong>⚠️ Connected wallet is the contract address!</strong> Please switch to a different wallet.
              <button onClick={switchAccount} disabled={isSwitching} className="ml-3 px-3 py-1 bg-red-700 rounded text-sm">
                {isSwitching ? "Switching..." : "Switch Account"}
              </button>
            </div>
          </div>
        )}


        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Sponsors</h2>
            <button
              onClick={() => {
                setEditingSponsor(null);
                setFormData({
                  name: "",
                  category: "",
                  investment: 0,
                  contact: "",
                  sponsorship_level: "bronze",
                  description: "",
                  logo_url: "",
                  website_url: "",
                  is_active: true,
                });
                setShowSponsorModal(true);
              }}
              className="flex items-center gap-2 bg-yellow-500 text-black px-4 py-2 rounded-lg hover:bg-yellow-400"
            >
              <Plus size={20} /> Add Sponsor
            </button>
          </div>
          {loading ? (
            <div className="text-center py-12">Loading sponsors...</div>
          ) : brands.length === 0 ? (
            <div className="text-center py-12 text-gray-400">No sponsors yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {brands.map((brand) => (
                <div key={brand.id} className="bg-gray-900 rounded-xl border border-gray-800 hover:border-yellow-500">
                  <div className="p-4 bg-gradient-to-r from-gray-800 to-gray-900 flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold">{brand.name}</h3>
                      <p className="text-sm text-yellow-400">{brand.sponsorship_level}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openEditModal(brand)} className="p-1 hover:bg-gray-700 rounded"><Edit size={18} /></button>
                      <button onClick={() => handleDeleteSponsor(brand.id)} className="p-1 hover:bg-red-800 rounded text-red-500"><Trash2 size={18} /></button>
                    </div>
                  </div>
                  <div className="p-4 space-y-2 text-sm">
                    <p><strong>Category:</strong> {brand.category}</p>
                    <p><strong>Investment:</strong> ${brand.investment.toLocaleString()}</p>
                    <p><strong>Contact:</strong> {brand.contact}</p>
                    {brand.description && <p><strong>Description:</strong> {brand.description}</p>}
                    {brand.website_url && <a href={brand.website_url} target="_blank" className="text-blue-400 hover:underline">Website</a>}
                    <div className={`text-xs ${brand.is_active ? "text-green-400" : "text-red-400"}`}>{brand.is_active ? "Active" : "Inactive"}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

  
        <section className="border-t border-gray-800 pt-8">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <ArrowUp size={24} className="text-green-500" /> Send Tokens (Sepolia)
          </h2>
          <div className="bg-gray-900 rounded-xl p-6 space-y-6">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div>
                {connectedWallet ? (
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle size={20} />
                    <span>Connected: {truncateAddress(connectedWallet)}</span>
                    {isWalletContract() && <span className="text-red-400 text-xs">(Contract address – not valid)</span>}
                  </div>
                ) : (
                  <button onClick={connectWallet} disabled={isConnecting} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg">
                    <Wallet size={20} /> {isConnecting ? "Connecting..." : "Connect MetaMask"}
                  </button>
                )}
                {connectionError && <div className="text-red-400 text-sm mt-2">{connectionError}</div>}
              </div>
              {connectedWallet && isWalletContract() && (
                <button onClick={switchAccount} disabled={isSwitching} className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded">
                  {isSwitching ? "Switching..." : "Switch Account"}
                </button>
              )}
            </div>

            <form onSubmit={performTransfer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Recipient Address</label>
                <input
                  type="text"
                  value={transferTo}
                  onChange={(e) => setTransferTo(e.target.value)}
                  placeholder="0x..."
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-yellow-500"
                  required
                  disabled={!connectedWallet || isWalletContract() || !isSepolia}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Amount (USDT)</label>
                <input
                  type="number"
                  step="any"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-yellow-500"
                  required
                  disabled={!connectedWallet || isWalletContract() || !isSepolia}
                />
              </div>
              <button
                type="submit"
                disabled={!connectedWallet || isTransferring || !contractValid || isWalletContract() || !isSepolia}
                className="flex items-center gap-2 bg-yellow-500 text-black px-6 py-2 rounded-lg hover:bg-yellow-400 disabled:opacity-50"
              >
                {isTransferring ? <RefreshCw size={20} className="animate-spin" /> : <Send size={20} />}
                {isTransferring ? "Processing..." : "Send Tokens"}
              </button>
              {transferStatus && (
                <div className={`p-3 rounded-lg ${
                  transferStatus.type === "success" ? "bg-green-900 text-green-200" :
                  transferStatus.type === "error" ? "bg-red-900 text-red-200" : "bg-blue-900 text-blue-200"
                }`}>
                  {transferStatus.message}
                </div>
              )}
            </form>
          </div>
        </section>

    
        <section className="border-t border-gray-800 pt-8">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2"><ArrowUp size={24} className="text-green-500" /> Sent Transfers (Manual)</h2>
          <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
            {outgoingLoading ? <div className="text-center py-12">Loading...</div> : outgoingTransfers.length === 0 ? <div className="text-center py-12 text-gray-400">No outgoing transfers.</div> : (
              <table className="w-full text-sm">
                <thead className="border-b border-gray-700"><tr><th className="text-left py-2">From</th><th className="text-left py-2">To</th><th className="text-left py-2">Amount</th><th className="text-left py-2">Time</th><th className="text-left py-2">Status</th><th className="text-left py-2">Tx Hash</th></tr></thead>
                <tbody>
                  {outgoingTransfers.map((tx) => (
                    <tr key={tx.id} className="border-b border-gray-800">
                      <td className="py-2 font-mono">{truncateAddress(tx.from_address)}</td>
                      <td className="py-2 font-mono">{truncateAddress(tx.to_address)}</td>
                      <td className="py-2">{tx.amount} USDT</td>
                      <td className="py-2">{formatDate(tx.created_at)}</td>
                      <td className="py-2"><span className={`px-2 py-1 rounded-full text-xs ${tx.status === "completed" ? "bg-green-900" : tx.status === "pending" ? "bg-yellow-900" : "bg-red-900"}`}>{tx.status}</span></td>
                      <td className="py-2">{tx.tx_hash ? <a href={`https://sepolia.etherscan.io/tx/${tx.tx_hash}`} target="_blank" className="text-blue-400 hover:underline">{truncateAddress(tx.tx_hash)}</a> : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

       
        <section className="border-t border-gray-800 pt-8">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2"><ArrowDown size={24} className="text-blue-500" /> Received Transfers (Manual)</h2>
          <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
            {!connectedWallet ? <div className="text-center py-12 text-yellow-400">Connect wallet to see incoming transfers.</div> : isWalletContract() ? (
              <div className="text-center py-12 text-yellow-400">Switch to a different wallet to view incoming transfers.</div>
            ) : incomingTableError ? (
              <div className="text-center py-12 text-red-400">{incomingTableError}</div>
            ) : incomingLoading ? <div className="text-center py-12">Loading...</div> : incomingTransfers.length === 0 ? <div className="text-center py-12 text-gray-400">No incoming transfers.</div> : (
              <table className="w-full text-sm">
                <thead className="border-b border-gray-700"><tr><th className="text-left py-2">From</th><th className="text-left py-2">To</th><th className="text-left py-2">Amount</th><th className="text-left py-2">Time</th><th className="text-left py-2">Status</th><th className="text-left py-2">Tx Hash</th></tr></thead>
                <tbody>
                  {incomingTransfers.map((tx) => (
                    <tr key={tx.id} className="border-b border-gray-800">
                      <td className="py-2 font-mono">{truncateAddress(tx.from_address)}</td>
                      <td className="py-2 font-mono">{truncateAddress(tx.to_address)}</td>
                      <td className="py-2">{tx.amount} USDT</td>
                      <td className="py-2">{formatDate(tx.created_at)}</td>
                      <td className="py-2"><span className="px-2 py-1 rounded-full text-xs bg-green-900">{tx.status}</span></td>
                      <td className="py-2">{tx.tx_hash ? <a href={`https://sepolia.etherscan.io/tx/${tx.tx_hash}`} target="_blank" className="text-blue-400 hover:underline">{truncateAddress(tx.tx_hash)}</a> : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>


        <section className="border-t border-gray-800 pt-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold flex items-center gap-2"><RefreshCw size={24} className="text-blue-500" /> Your Wallet Transactions {connectedWallet && <span className="text-sm text-gray-400">– {truncateAddress(connectedWallet)}</span>}</h2>
            {connectedWallet && !isWalletContract() && isSepolia && (
              <button onClick={manualSync} disabled={isSyncing} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">
                <RefreshCw size={16} className={isSyncing ? "animate-spin" : ""} /> {isSyncing ? "Syncing..." : "Sync History"}
              </button>
            )}
          </div>
          <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
            {!connectedWallet ? <div className="text-center py-12 text-yellow-400">Connect wallet.</div> : connectedWalletTxsError ? (
              <div className="text-center py-12 text-red-400">{connectedWalletTxsError}</div>
            ) : connectedWalletTxsLoading ? <div className="text-center py-12">Loading...</div> : connectedWalletTxs.length === 0 ? <div className="text-center py-12 text-gray-400">No transactions found.</div> : (
              <table className="w-full text-sm">
                <thead className="border-b border-gray-700"><tr><th className="text-left py-2">Type</th><th className="text-left py-2">From</th><th className="text-left py-2">To</th><th className="text-left py-2">Amount</th><th className="text-left py-2">Time</th><th className="text-left py-2">Tx Hash</th></tr></thead>
                <tbody>
                  {connectedWalletTxs.map((tx) => (
                    <tr key={tx.id} className="border-b border-gray-800">
                      <td className="py-2">{tx.is_outgoing ? <span className="flex items-center gap-1 text-red-400"><ArrowUp size={16} /> Outgoing</span> : <span className="flex items-center gap-1 text-green-400"><ArrowDown size={16} /> Incoming</span>}</td>
                      <td className="py-2 font-mono">{truncateAddress(tx.from_address)}</td>
                      <td className="py-2 font-mono">{truncateAddress(tx.to_address)}</td>
                      <td className="py-2">{tx.amount.toLocaleString()} USDT</td>
                      <td className="py-2">{formatDate(tx.created_at)}</td>
                      <td className="py-2"><a href={`https://sepolia.etherscan.io/tx/${tx.tx_hash}`} target="_blank" className="text-blue-400 hover:underline flex items-center gap-1">{truncateAddress(tx.tx_hash)}<ExternalLink size={12} /></a></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        
        <section className="border-t border-gray-800 pt-8">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2"><RefreshCw size={24} className="text-blue-500" /> Transaction History for {truncateAddress(TARGET_ADDRESS)}</h2>
          <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
            {fixedTableError ? <div className="text-center py-12 text-red-400">{fixedTableError}</div> : fixedLoading ? <div className="text-center py-12">Loading...</div> : fixedTransactions.length === 0 ? <div className="text-center py-12 text-gray-400">No transactions.</div> : (
              <table className="w-full text-sm">
                <thead className="border-b border-gray-700"><tr><th className="text-left py-2">Type</th><th className="text-left py-2">From</th><th className="text-left py-2">To</th><th className="text-left py-2">Amount</th><th className="text-left py-2">Time</th><th className="text-left py-2">Tx Hash</th></tr></thead>
                <tbody>
                  {fixedTransactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-gray-800">
                      <td className="py-2">{tx.is_outgoing ? <span className="flex items-center gap-1 text-red-400"><ArrowUp size={16} /> Outgoing</span> : <span className="flex items-center gap-1 text-green-400"><ArrowDown size={16} /> Incoming</span>}</td>
                      <td className="py-2 font-mono">{truncateAddress(tx.from_address)}</td>
                      <td className="py-2 font-mono">{truncateAddress(tx.to_address)}</td>
                      <td className="py-2">{tx.amount.toLocaleString()} USDT</td>
                      <td className="py-2">{formatDate(tx.created_at)}</td>
                      <td className="py-2"><a href={`https://sepolia.etherscan.io/tx/${tx.tx_hash}`} target="_blank" className="text-blue-400 hover:underline flex items-center gap-1">{truncateAddress(tx.tx_hash)}<ExternalLink size={12} /></a></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>

      
      {showSponsorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b border-gray-800">
              <h3 className="text-xl font-semibold">{editingSponsor ? "Edit Sponsor" : "Add New Sponsor"}</h3>
              <button onClick={() => setShowSponsorModal(false)} className="p-1 hover:bg-gray-800 rounded"><X size={20} /></button>
            </div>
            <form onSubmit={editingSponsor ? handleEditSponsor : handleAddSponsor} className="p-4 space-y-4">
              <div><label className="block text-sm font-medium mb-1">Name *</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2" required /></div>
              <div><label className="block text-sm font-medium mb-1">Category *</label><input type="text" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2" required /></div>
              <div><label className="block text-sm font-medium mb-1">Investment (USD) *</label><input type="number" value={formData.investment} onChange={(e) => setFormData({ ...formData, investment: parseFloat(e.target.value) || 0 })} className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2" required /></div>
              <div><label className="block text-sm font-medium mb-1">Contact Email *</label><input type="email" value={formData.contact} onChange={(e) => setFormData({ ...formData, contact: e.target.value })} className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2" required /></div>
              <div><label className="block text-sm font-medium mb-1">Sponsorship Level</label><select value={formData.sponsorship_level} onChange={(e) => setFormData({ ...formData, sponsorship_level: e.target.value })} className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2"><option value="platinum">Platinum</option><option value="gold">Gold</option><option value="silver">Silver</option><option value="bronze">Bronze</option><option value="community">Community</option></select></div>
              <div><label className="block text-sm font-medium mb-1">Description</label><textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2" /></div>
              <div><label className="block text-sm font-medium mb-1">Logo URL</label><input type="url" value={formData.logo_url} onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })} className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2" /></div>
              <div><label className="block text-sm font-medium mb-1">Website URL</label><input type="url" value={formData.website_url} onChange={(e) => setFormData({ ...formData, website_url: e.target.value })} className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2" /></div>
              <div className="flex items-center gap-2"><input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="w-4 h-4" /><label>Active</label></div>
              {formError && <div className="text-red-500 text-sm">{formError}</div>}
              <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={() => setShowSponsorModal(false)} className="px-4 py-2 border border-gray-700 rounded-lg hover:bg-gray-800">Cancel</button><button type="submit" className="px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400">{editingSponsor ? "Update" : "Create"}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}