"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ethers } from "ethers";
import {
  Wallet,
  Mail,
  Phone,
  Globe,
  Award,
  CheckCircle,
  Crown,
  Star,
  Shield,
  TrendingUp,
  Users,
  Target,
  DollarSign,
  BarChart3,
  Zap,
  Users as UsersIcon,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";   

// ---------- Types ----------
type Brand = {
  id: string;
  name: string;
  category: string;
  investment: number;
  contact: string;
  color: string;
  sponsorship_level: string;
  playerInvestment: number;
  description?: string;
  logo_url?: string;
  website_url?: string;
  is_active: boolean;
};

type SponsorTier = {
  id: number;
  name: string;
  color: string;
  minInvestment: number;
  benefits: string[];
  icon: React.ReactNode;
};

type StatsCard = {
  id: number;
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  subtitle: string;
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

declare global {
  interface Window {
    ethereum?: any;
  }
}

const CONTRACT_ADDRESS = "0xYourContractAddress";
const CONTRACT_ABI = [
  "function transfer(address to, uint256 amount) external",
  "function getMyBalance() external view returns (uint256)",
];

export default function SponsorPage() {
  const heroLogo = "/image55.png";

  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
  const [totalInvestment, setTotalInvestment] = useState<number>(48250);
  const [activeTab, setActiveTab] = useState<"tiers" | "brands">("tiers");
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [transfersLoading, setTransfersLoading] = useState(true);
  const [transfersError, setTransfersError] = useState<string | null>(null);
  const [supabaseConnectionError, setSupabaseConnectionError] = useState<string | null>(null);
  const [realtimeError, setRealtimeError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const mountedRef = useRef(true);
  const subscriptionRef = useRef<any>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const latestFetchRequestRef = useRef(0);

  const platinumSponsors = brands.filter((b) => b.sponsorship_level?.toLowerCase() === "platinum");
  const goldSponsors = brands.filter((b) => b.sponsorship_level?.toLowerCase() === "gold");
  const silverSponsors = brands.filter((b) => b.sponsorship_level?.toLowerCase() === "silver");
  const bronzeSponsors = brands.filter((b) => b.sponsorship_level?.toLowerCase() === "bronze");

  const getColorByTier = (tier: string) => {
    if (!tier) return "#FFD700";
    switch (tier.toLowerCase()) {
      case "platinum": return "#E5E4E2";
      case "gold": return "#FFD700";
      case "silver": return "#C0C0C0";
      case "bronze": return "#CD7F32";
      case "community": return "#50C878";
      default: return "#FFD700";
    }
  };

  const sponsorTiers: SponsorTier[] = [
    { id: 1, name: "Platinum Sponsor", color: "#E5E4E2", minInvestment: 10000,
      benefits: ["Logo on homepage hero", "Prime showcase position", "All social media mentions", "Exclusive interview features", "VIP event access", "Player meet & greet"],
      icon: <Crown size={24} /> },
    { id: 2, name: "Gold Sponsor", color: "#FFD700", minInvestment: 5000,
      benefits: ["Logo on tournament page", "Social media mentions", "Brand showcase", "Event booth", "Player endorsements"],
      icon: <Star size={24} /> },
    { id: 3, name: "Silver Sponsor", color: "#C0C0C0", minInvestment: 2500,
      benefits: ["Logo on team jerseys", "Website mention", "Social media shoutout", "Match tickets"],
      icon: <Award size={24} /> },
    { id: 4, name: "Bronze Sponsor", color: "#CD7F32", minInvestment: 1000,
      benefits: ["Website listing", "Social media mention", "Event recognition"],
      icon: <Shield size={24} /> },
    { id: 5, name: "Community Sponsor", color: "#50C878", minInvestment: 500,
      benefits: ["Website recognition", "Community shoutout", "Local promotion"],
      icon: <Users size={24} /> },
  ];

  const statsCards: StatsCard[] = [
    { id: 1, title: "Total Investment", value: totalInvestment.toLocaleString(), icon: <DollarSign size={24} />, color: "#FFD700", subtitle: "USDT Raised" },
    { id: 2, title: "Active Sponsors", value: brands.length.toString(), icon: <UsersIcon size={24} />, color: "#4ECDC4", subtitle: "Partner Brands" },
    { id: 3, title: "Platform Growth", value: "25%", icon: <BarChart3 size={24} />, color: "#45B7D1", subtitle: "Monthly Increase" },
    { id: 4, title: "Incoming Transfers", value: transfers.length.toString(), icon: <Zap size={24} />, color: "#FF6B6B", subtitle: "Live Updates" },
  ];

  const initialBrands: Brand[] = [
    { id: "1", name: "Sports Gear Pro", category: "Sports Equipment", investment: 15000, contact: "contact@sportsgearpro.com", color: "#FF6B6B", sponsorship_level: "Platinum", playerInvestment: 1500, is_active: true, description: "Premium sports equipment manufacturer", website_url: "https://sportsgearpro.com" },
    { id: "2", name: "Energy Boost", category: "Nutrition", investment: 8000, contact: "partner@energyboost.com", color: "#4ECDC4", sponsorship_level: "Gold", playerInvestment: 800, is_active: true, description: "Energy drinks and nutrition supplements", website_url: "https://energyboost.com" },
    { id: "3", name: "Tech Innovators", category: "Technology", investment: 6000, contact: "sponsor@techinnovators.com", color: "#45B7D1", sponsorship_level: "Gold", playerInvestment: 600, is_active: true, description: "Cutting-edge technology solutions", website_url: "https://techinnovators.com" },
    { id: "4", name: "Fit Life", category: "Fitness", investment: 3000, contact: "info@fitlife.com", color: "#96CEB4", sponsorship_level: "Silver", playerInvestment: 300, is_active: true, description: "Fitness and wellness brand", website_url: "https://fitlife.com" },
    { id: "5", name: "Local Champions", category: "Community", investment: 750, contact: "hello@localchampions.lk", color: "#FFEAA7", sponsorship_level: "Community", playerInvestment: 75, is_active: true, description: "Supporting local talent and communities", website_url: "https://localchampions.lk" },
  ];

  const fetchSponsors = useCallback(async () => {
    const requestId = ++latestFetchRequestRef.current;
    try {
      const { data, error } = await supabase
        .from("sponsors")
        .select("*")
        .eq("is_active", true)
        .order("sponsorship_level");

      if (error) throw error;

      const mappedBrands: Brand[] = (data || []).map((sponsor: any, index: number) => ({
        id: sponsor.id || `sponsor-${index + 1}`,
        name: sponsor.name || `Sponsor ${index + 1}`,
        category: sponsor.category || "Sports",
        investment: sponsor.investment || 1000 * (index + 1),
        contact: sponsor.contact || `contact@sponsor${index + 1}.com`,
        color: getColorByTier(sponsor.sponsorship_level) || "#FFD700",
        sponsorship_level: sponsor.sponsorship_level || "Bronze",
        playerInvestment: Math.floor((sponsor.investment || 1000) * 0.1),
        description: sponsor.description || "",
        logo_url: sponsor.logo_url || "",
        website_url: sponsor.website_url || "",
        is_active: sponsor.is_active || true,
      }));

      if (requestId === latestFetchRequestRef.current && mountedRef.current) {
        setBrands(mappedBrands);
        const total = mappedBrands.reduce((sum, b) => sum + b.investment, 0);
        setTotalInvestment(total || 48250);
        setSupabaseConnectionError(null);
      }
    } catch (error: any) {
      if (requestId === latestFetchRequestRef.current && mountedRef.current) {
        console.error("Error fetching sponsors:", error);
        setBrands(initialBrands);
        setSupabaseConnectionError(`Failed to load sponsors: ${error?.message || "Network error"}. Using demo data.`);
      }
    } finally {
      if (requestId === latestFetchRequestRef.current && mountedRef.current) setLoading(false);
    }
  }, []);

  const fetchTransfers = useCallback(async () => {
    const requestId = ++latestFetchRequestRef.current;
    try {
      setTransfersLoading(true);
      const { data, error } = await supabase
        .from("incoming_transfers")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        if (error.message.includes("created_at") || error.code === "42703") {
          const { data: fallbackData, error: fallbackError } = await supabase
            .from("incoming_transfers")
            .select("*")
            .order("id", { ascending: false })
            .limit(50);
          if (fallbackError) throw fallbackError;
          if (requestId === latestFetchRequestRef.current && mountedRef.current) setTransfers(fallbackData || []);
        } else {
          throw error;
        }
      } else {
        if (requestId === latestFetchRequestRef.current && mountedRef.current) setTransfers(data || []);
      }
      if (requestId === latestFetchRequestRef.current && mountedRef.current) setTransfersError(null);
    } catch (error: any) {
      if (requestId === latestFetchRequestRef.current && mountedRef.current) {
        setTransfersError(error?.message || "Failed to load transfers.");
        setTransfers([]);
      }
    } finally {
      if (requestId === latestFetchRequestRef.current && mountedRef.current) setTransfersLoading(false);
    }
  }, []);

  const setupRealtimeSubscription = useCallback(() => {
    if (!mountedRef.current) return;
    if (subscriptionRef.current) {
      supabase.removeChannel(subscriptionRef.current).catch(() => {});
      subscriptionRef.current = null;
    }
    if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
    retryTimeoutRef.current = null;

    const channelName = `incoming-transfers-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "incoming_transfers" },
        (payload) => {
          if (!mountedRef.current) return;
          if (payload.eventType === "INSERT") {
            setTransfers((prev) => [payload.new as Transfer, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setTransfers((prev) => prev.map((tx) => (tx.id === payload.new.id ? (payload.new as Transfer) : tx)));
          } else if (payload.eventType === "DELETE") {
            setTransfers((prev) => prev.filter((tx) => tx.id !== payload.old.id));
          }
        }
      )
      .subscribe((status) => {
        if (!mountedRef.current) return;
        if (status === "SUBSCRIBED") {
          console.log("✅ Realtime subscription active for incoming_transfers");
          setRealtimeError(null);
          setTransfersError(null);
          retryCountRef.current = 0;
          if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
          console.error("Subscription error:", status);
          const errorMsg = "Real‑time connection lost. Attempting to reconnect automatically...";
          setRealtimeError(errorMsg);
          setTransfersError(errorMsg);
          const delay = Math.min(1000 * Math.pow(2, retryCountRef.current), 30000);
          retryCountRef.current++;
          if (!retryTimeoutRef.current) {
            retryTimeoutRef.current = setTimeout(() => {
              if (mountedRef.current) setupRealtimeSubscription();
            }, delay);
          }
        }
      });

    subscriptionRef.current = channel;
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchSponsors();
    fetchTransfers();
    setupRealtimeSubscription();

    return () => {
      mountedRef.current = false;
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current).catch(() => {});
        subscriptionRef.current = null;
      }
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
    };
  }, [fetchSponsors, fetchTransfers, setupRealtimeSubscription]);

  const retryRealtime = useCallback(() => {
    if (realtimeError || transfersError) {
      setRealtimeError(null);
      setTransfersError(null);
      retryCountRef.current = 0;
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
      setupRealtimeSubscription();
    }
  }, [realtimeError, transfersError, setupRealtimeSubscription]);

  const connectWallet = async () => {
    if (isConnecting) return;
    setConnectionError(null);
    setIsConnecting(true);
    try {
      if (typeof window === "undefined" || !window.ethereum) {
        throw new Error("MetaMask is not installed. Please install MetaMask and try again.");
      }
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      if (accounts && accounts.length > 0) {
        setConnectedWallet(accounts[0]);
        setConnectionError(null);
      }
    } catch (error: any) {
      console.error("Error connecting wallet:", error);
      if (error.code === -32002) {
        setConnectionError("MetaMask is already processing a connection request. Please check the MetaMask popup and complete the request.");
      } else if (error.code === 4001) {
        setConnectionError("Connection rejected. Please approve the connection request in MetaMask.");
      } else {
        setConnectionError(error.message || "Failed to connect wallet. Please try again.");
      }
      setConnectedWallet("0x742d35Cc6634C0532925a3b844Bc9e199eC5F9A3");
    } finally {
      setIsConnecting(false);
    }
  };

  const connectCentralizedWallet = () => {
    setConnectedWallet("0xCentralizedWallet123456789");
  };

  const applyAsSponsor = () => {
    window.open("/sponsor/apply", "_blank");
  };

  const sponsorSignIn = () => {
    window.open("/sponsor/login", "_blank");
  };

  const getContract = async (withSigner = true) => {
    if (!window.ethereum) throw new Error("MetaMask not installed");
    const provider = new ethers.BrowserProvider(window.ethereum);
    if (withSigner) {
      const signer = await provider.getSigner();
      return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    }
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const truncateAddress = (address: string) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  if (loading && activeTab === "brands") {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
        <p style={styles.loadingText}>Loading sponsors...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {supabaseConnectionError && (
        <div style={styles.globalError}>
          <p>⚠️ {supabaseConnectionError}</p>
          <p style={{ fontSize: "0.9rem", marginTop: "0.5rem" }}>
            Please check your environment variables and network connection.
          </p>
        </div>
      )}

      <div style={styles.heroSection}>
        <div style={styles.heroLogoContainer}>
          <div style={styles.heroLogo}>
            <img
              src={heroLogo}
              alt="Path of the Cricket Logo"
              style={styles.logoImage}
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const fallback = document.createElement("div");
                fallback.textContent = "🏏";
                fallback.style.width = "0px";
                fallback.style.height = "200px";
                fallback.style.display = "flex";
                fallback.style.fontSize = "120px";
                fallback.style.alignItems = "center";
                fallback.style.justifyContent = "center";
                e.currentTarget.parentElement?.appendChild(fallback);
              }}
            />
          </div>
        </div>
        <h1 style={styles.title}>
          <span style={styles.titleText}>Path of the Cricket</span>
          <span style={styles.titleSubtext}>Sponsorship Platform</span>
        </h1>
        <p style={styles.heroDescription}>
          <span style={styles.highlightText}>Revolutionizing cricket sponsorship</span> through
          <span style={styles.blockchainHighlight}> blockchain technology</span>. Join the future of
          transparent, secure, and rewarding partnerships.
        </p>
      </div>

      <div style={styles.statsSection}>
        <div style={styles.statsGrid}>
          {statsCards.map((stat) => (
            <div
              key={stat.id}
              style={{
                ...styles.statCard,
                border: `2px solid ${stat.color}`,
              }}
            >
              <div style={styles.statCardHeader}>
                <div
                  style={{
                    ...styles.statIconContainer,
                    backgroundColor: `${stat.color}20`,
                  }}
                >
                  <div style={{ color: stat.color }}>{stat.icon}</div>
                </div>
                <div style={styles.statCardContent}>
                  <h3 style={styles.statCardTitle}>{stat.title}</h3>
                  <p style={styles.statCardValue}>{stat.value}</p>
                  <p style={styles.statCardSubtitle}>{stat.subtitle}</p>
                </div>
              </div>
              <div
                style={{
                  ...styles.statCardFooter,
                  backgroundColor: `${stat.color}15`,
                }}
              >
                <div style={styles.statTrend}>
                  <TrendingUp size={16} />
                  <span>+12% this month</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.walletSection}>
        <div style={styles.investmentCard}>
          <div style={styles.walletIconContainer}>
            <Wallet size={64} style={styles.walletIcon} />
            <TrendingUp size={32} style={styles.trendingIcon} />
          </div>
          <div style={styles.investmentInfo}>
            <h3 style={styles.investmentTitle}>Total Project Investment</h3>
            <p style={styles.investmentAmount}>{totalInvestment.toLocaleString()} USDT</p>
            <div style={styles.statsGrid}>
              <div style={styles.statItem}>
                <Target size={20} />
                <span>{brands.length} Sponsors</span>
              </div>
              <div style={styles.statItem}>
                <Users size={20} />
                <span>50+ Players</span>
              </div>
              <div style={styles.statItem}>
                <TrendingUp size={20} />
                <span>25% Growth</span>
              </div>
            </div>
            <div style={styles.walletButtons}>
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                style={{
                  ...styles.metamaskButton,
                  opacity: isConnecting ? 0.6 : 1,
                  cursor: isConnecting ? "not-allowed" : "pointer",
                }}
              >
                <img
                  src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIxLjYwMTUgNy42NjUwNUwxMi41MTM3IDBMMy40MDU3MiA3LjY2NTA1VjE2LjMzMDdMMTIuNTEzNyAyNEwyMS42MDE1IDE2LjMzMDdWNy42NjUwNVpNMTguNDQ0NiAxNi41OTY2TDE1LjU2OTkgMTguNzA2TDEyLjUxMzcgMjAuNjg1Mkw5LjQ1NzQ0IDE4LjcwNkw2LjU4Mjc3IDE2LjU5NjZWNi4wMTA2M0w5LjQ1NzQ0IDMuODkwMzFMMTIuNTEzNyAxLjkxMTA5TDE1LjU2OTkgMy44OTAzMUwxOC40NDQ2IDYuMDEwNjNWMTYuNTk2NloiIGZpbGw9IiNGNjg1MUIiLz4KPHBhdGggZD0iTTEyLjUxMzcgMy44OTAyMUwxNS41Njk5IDUuODY5OTNMMTguNDQ0NiA3Ljk5MDI1VjE2LjU5NjJMMTUuNTY5OSAxOC43MDU2TDEyLjUxMzcgMjAuNjg0OEw5LjQ1NzQ0IDE4LjcwNTZMNi41ODI3NyAxNi41OTYyVjcuOTkwMjVMOS40NTc0NCA1Ljg2OTkzTDEyLjUxMzcgMy44OTAyMVoiIGZpbGw9IiVFMjc2MUIiLz4KPC9zdmc+"
                  alt="MetaMask"
                  style={styles.walletLogo}
                />
                {isConnecting ? "Connecting..." : "Connect MetaMask"}
              </button>
              <button onClick={connectCentralizedWallet} style={styles.centralizedButton}>
                <Wallet size={20} />
                Connect Centralized Wallet
              </button>
            </div>
            {connectionError && (
              <div style={styles.errorMessage}>
                <span>⚠️ {connectionError}</span>
              </div>
            )}
            {connectedWallet && !connectionError && (
              <div style={styles.connectedWallet}>
                <CheckCircle size={16} />
                <span style={styles.connectedText}>
                  Connected: {connectedWallet.substring(0, 10)}...
                  {connectedWallet.substring(connectedWallet.length - 4)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={styles.transfersSection}>
        <h2 style={styles.transfersTitle}>Recent Incoming Transfers</h2>
        <p style={styles.transfersSubtitle}>Live updates from the admin panel</p>

        {transfersLoading ? (
          <div style={styles.transfersLoading}>Loading transfers...</div>
        ) : transfersError ? (
          <div style={styles.transfersError}>
            <p>⚠️ {transfersError}</p>
            {(realtimeError || transfersError) && (
              <button onClick={retryRealtime} style={styles.retryButton}>
                Retry Real‑time Connection
              </button>
            )}
            <p style={styles.transfersErrorHint}>
              Please ensure the <code>incoming_transfers</code> table has the required columns: <code>id</code>
              , <code>from_address</code>, <code>to_address</code>, <code>amount</code>,{" "}
              <code>created_at</code> (or <code>id</code> for ordering), <code>status</code>, and{" "}
              <code>tx_hash</code>.
            </p>
          </div>
        ) : transfers.length === 0 ? (
          <div style={styles.noTransfers}>No incoming transfers yet</div>
        ) : (
          <div style={styles.transfersTableContainer}>
            <table style={styles.transfersTable}>
              <thead>
                <tr>
                  <th>From</th>
                  <th>To</th>
                  <th>Amount (USDT)</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Tx Hash</th>
                </tr>
              </thead>
              <tbody>
                {transfers.map((tx) => (
                  <tr key={tx.id}>
                    <td>{truncateAddress(tx.from_address)}</td>
                    <td>{truncateAddress(tx.to_address)}</td>
                    <td>{tx.amount}</td>
                    <td>{tx.created_at ? formatDate(tx.created_at) : "N/A"}</td>
                    <td>
                      <span
                        style={{
                          ...styles.statusBadge,
                          ...(tx.status === "completed"
                            ? styles.statusCompleted
                            : tx.status === "pending"
                            ? styles.statusPending
                            : styles.statusFailed),
                        }}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td>
                      {tx.tx_hash ? (
                        <a
                          href={`https://etherscan.io/tx/${tx.tx_hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={styles.txHashLink}
                        >
                          {truncateAddress(tx.tx_hash)}
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={styles.tabsContainer}>
        <button
          onClick={() => setActiveTab("tiers")}
          style={activeTab === "tiers" ? styles.activeTab : styles.inactiveTab}
        >
          Sponsor Tiers
        </button>
        <button
          onClick={() => setActiveTab("brands")}
          style={activeTab === "brands" ? styles.activeTab : styles.inactiveTab}
        >
          Our Sponsors
        </button>
      </div>

      {activeTab === "tiers" && (
        <div style={styles.tiersSection}>
          <h2 style={styles.sectionTitle}>Choose Your Sponsorship Tier</h2>
          <p style={styles.sectionSubtitle}>
            Select a tier that matches your investment goals and brand vision
          </p>
          <div style={styles.tiersGrid}>
            {sponsorTiers.map((tier) => (
              <div
                key={tier.id}
                style={{
                  ...styles.tierCard,
                  borderColor: tier.color,
                  boxShadow: `0 10px 30px ${tier.color}40`,
                }}
              >
                <div
                  style={{
                    ...styles.tierHeader,
                    background: `linear-gradient(135deg, ${tier.color}, ${darkenColor(
                      tier.color,
                      20
                    )})`,
                  }}
                >
                  <div style={styles.tierIcon}>{tier.icon}</div>
                  <h3 style={styles.tierName}>{tier.name}</h3>
                  <p style={styles.tierInvestment}>
                    Min: {tier.minInvestment.toLocaleString()} USDT
                  </p>
                </div>
                <div style={styles.tierBenefits}>
                  <ul style={styles.benefitsList}>
                    {tier.benefits.map((benefit, index) => (
                      <li key={index} style={styles.benefitItem}>
                        <CheckCircle size={16} style={styles.checkIcon} />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div style={styles.tierFooter}>
                  <div
                    style={{
                      ...styles.colorBadge,
                      backgroundColor: tier.color,
                    }}
                  />
                  <button
                    onClick={applyAsSponsor}
                    style={{
                      ...styles.tierApplyButton,
                      background: `linear-gradient(135deg, ${tier.color}, ${darkenColor(
                        tier.color,
                        20
                      )})`,
                      color: getContrastColor(tier.color),
                      transform: "translateY(0)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-3px) scale(1.05)";
                      e.currentTarget.style.boxShadow = `0 10px 25px ${tier.color}80`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0) scale(1)";
                      e.currentTarget.style.boxShadow = `0 5px 15px ${tier.color}40`;
                    }}
                  >
                    Apply as {tier.name.split(" ")[0]}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "brands" && (
        <div style={styles.showcaseSection}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>Our Valued Sponsors</h2>
              <p style={styles.sectionSubtitle}>
                Partnering with industry leaders to bring you the best cricket experience
              </p>
            </div>
          </div>

          {platinumSponsors.length > 0 && (
            <div style={styles.tierCategory}>
              <h3 style={styles.tierCategoryTitle}>Platinum Sponsors</h3>
              <p style={styles.tierCategorySubtitle}>Our premier partners</p>
              <div style={styles.brandsGridPlatinum}>
                {platinumSponsors.map((brand) => (
                  <BrandCard key={brand.id} brand={brand} tier="platinum" />
                ))}
              </div>
            </div>
          )}

          {goldSponsors.length > 0 && (
            <div style={styles.tierCategory}>
              <h3 style={styles.tierCategoryTitle}>Gold Sponsors</h3>
              <p style={styles.tierCategorySubtitle}>Our valued partners</p>
              <div style={styles.brandsGridGold}>
                {goldSponsors.map((brand) => (
                  <BrandCard key={brand.id} brand={brand} tier="gold" />
                ))}
              </div>
            </div>
          )}

          {silverSponsors.length > 0 && (
            <div style={styles.tierCategory}>
              <h3 style={styles.tierCategoryTitle}>Silver Sponsors</h3>
              <p style={styles.tierCategorySubtitle}>Our supporting partners</p>
              <div style={styles.brandsGridSilver}>
                {silverSponsors.map((brand) => (
                  <BrandCard key={brand.id} brand={brand} tier="silver" />
                ))}
              </div>
            </div>
          )}

          {bronzeSponsors.length > 0 && (
            <div style={styles.tierCategory}>
              <h3 style={styles.tierCategoryTitle}>Community Partners</h3>
              <p style={styles.tierCategorySubtitle}>Our community supporters</p>
              <div style={styles.brandsGridBronze}>
                {bronzeSponsors.map((brand) => (
                  <BrandCard key={brand.id} brand={brand} tier="bronze" />
                ))}
              </div>
            </div>
          )}

          <div style={styles.sponsorCTASection}>
            <h2 style={styles.sponsorCTATitle}>Become a Sponsor</h2>
            <p style={styles.sponsorCTADescription}>
              Join our growing family of sponsors and be part of the cricket revolution
            </p>
            <div style={styles.sponsorCTAButtons}>
              <button
                style={styles.primaryCTAButton}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px) scale(1.05)";
                  e.currentTarget.style.boxShadow = "0 15px 30px rgba(0, 102, 204, 0.5)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0) scale(1)";
                  e.currentTarget.style.boxShadow = "0 5px 15px rgba(0, 102, 204, 0.3)";
                }}
              >
                Contact Partnership Team
              </button>
              <button
                style={styles.secondaryCTAButton}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px) scale(1.05)";
                  e.currentTarget.style.boxShadow = "0 10px 25px rgba(255, 215, 0, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0) scale(1)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                Download Sponsorship Kit
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={styles.applySection}>
        <div style={styles.applyCard}>
          <h2 style={styles.applyTitle}>Ready to Join?</h2>
          <p style={styles.applyDescription}>
            Become part of cricket history. Your sponsorship fuels dreams and creates champions.
            <br />
            <span style={styles.blockchainText}>
              Powered by secure blockchain technology for transparent and trustworthy partnerships.
            </span>
          </p>
          <div style={styles.applyButtons}>
            <button
              onClick={applyAsSponsor}
              style={styles.sponsorApplyButton}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px) scale(1.05)";
                e.currentTarget.style.boxShadow = "0 20px 35px rgba(255, 215, 0, 0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0) scale(1)";
                e.currentTarget.style.boxShadow = "0 10px 25px rgba(255, 215, 0, 0.3)";
              }}
            >
              Apply Sponsorship
            </button>
            <div style={styles.authButtons}>
              <button
                onClick={sponsorSignIn}
                style={styles.sponsorAuthButton}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px) scale(1.05)";
                  e.currentTarget.style.boxShadow = "0 10px 20px rgba(76, 175, 80, 0.4)";
                  e.currentTarget.style.borderColor = "#81c784";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0) scale(1)";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.borderColor = "#4CAF50";
                }}
              >
                Sponsor Sign In
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.footer}>
        <div style={styles.footerContent}>
          <div style={styles.footerLogo}>
            <span style={styles.footerLogoText}>Path of the Cricket</span>
          </div>
          <p style={styles.footerText}>
            <span style={styles.blockchainHighlight}>Revolutionizing cricket sponsorship</span> through
            <span style={styles.blockchainHighlight}> blockchain technology</span> for transparent,
            secure, and rewarding partnerships.
          </p>
          <p style={styles.copyright}>© 2025 Path of the Cricket. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

function BrandCard({ brand, tier }: { brand: Brand; tier: string }) {
  const getCardStyle = (tier: string) => {
    switch (tier) {
      case "platinum":
        return { ...styles.brandCard, padding: "2rem" };
      case "gold":
        return { ...styles.brandCard, padding: "1.5rem" };
      case "silver":
        return { ...styles.brandCard, padding: "1rem" };
      default:
        return { ...styles.brandCard, padding: "0.75rem" };
    }
  };

  return (
    <div style={getCardStyle(tier)}>
      <div style={styles.brandCardContent}>
        {brand.logo_url ? (
          <img src={brand.logo_url} alt={brand.name} style={styles.brandLogo} />
        ) : (
          <div style={styles.brandLogoPlaceholder}>
            <span style={styles.brandLogoText}>{brand.name.charAt(0)}</span>
          </div>
        )}
        <h3 style={styles.brandCardName}>{brand.name}</h3>
        {brand.description && <p style={styles.brandCardDescription}>{brand.description}</p>}
        <div style={styles.sponsorBadge}>{brand.sponsorship_level} Partner</div>
      </div>
    </div>
  );
}

function getContrastColor(hexcolor: string) {
  if (hexcolor.startsWith("#")) {
    const r = parseInt(hexcolor.substr(1, 2), 16);
    const g = parseInt(hexcolor.substr(3, 2), 16);
    const b = parseInt(hexcolor.substr(5, 2), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? "#000000" : "#FFFFFF";
  }
  return "#000000";
}

function darkenColor(hex: string, percent: number) {
  if (!hex.startsWith("#")) return hex;

  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) - amt;
  const G = ((num >> 8) & 0x00ff) - amt;
  const B = (num & 0x0000ff) - amt;
  return (
    "#" +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#000000",
    color: "#ffffff",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif",
  } as React.CSSProperties,
  globalError: {
    backgroundColor: "rgba(255, 0, 0, 0.8)",
    color: "white",
    padding: "1rem",
    textAlign: "center" as const,
    fontSize: "0.9rem",
    position: "sticky" as const,
    top: 0,
    zIndex: 1000,
  } as React.CSSProperties,
  loadingContainer: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    backgroundColor: "#000000",
  } as React.CSSProperties,
  loadingSpinner: {
    width: "50px",
    height: "50px",
    border: "3px solid rgba(255,215,0,0.3)",
    borderTop: "3px solid #FFD700",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  } as React.CSSProperties,
  loadingText: {
    marginTop: "1rem",
    color: "#FFD700",
    fontSize: "1.2rem",
  } as React.CSSProperties,
  heroSection: {
    textAlign: "center" as const,
    padding: "6rem 2rem 4rem",
    background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)",
    position: "relative" as const,
    overflow: "hidden" as const,
    borderBottom: "3px solid #FFD700",
  } as React.CSSProperties,
  heroLogoContainer: {
    maxWidth: "200px",
    margin: "0 auto 2rem",
    animation: "float 6s ease-in-out infinite",
  } as React.CSSProperties,
  heroLogo: {
    width: "200px",
    height: "200px",
    margin: "0 auto",
    background: "radial-gradient(circle, rgba(255,215,0,0.1) 0%, transparent 70%)",
    borderRadius: "50%",
    filter: "drop-shadow(0 0 30px rgba(255, 215, 0, 0.3))",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden" as const,
    border: "0px solid #FFD700",
  } as React.CSSProperties,
  logoImage: {
    width: "100%",
    height: "100%",
    objectFit: "contain" as const,
    padding: "15px",
  } as React.CSSProperties,
  title: { margin: "0", display: "flex", flexDirection: "column" as const, gap: "0.5rem" },
  titleText: {
    fontSize: "3.5rem",
    fontWeight: 700,
    background: "linear-gradient(45deg, #FFD700, #FFA500)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    textShadow: "0 0 30px rgba(255, 215, 0, 0.3)",
    letterSpacing: "1px",
  } as React.CSSProperties,
  titleSubtext: { fontSize: "1.2rem", color: "#cccccc", fontWeight: 300, letterSpacing: "2px", textTransform: "uppercase" },
  heroDescription: { maxWidth: "600px", margin: "2rem auto 0", fontSize: "1.1rem", color: "#aaaaaa", lineHeight: "1.6" },
  highlightText: { color: "#FFD700", fontWeight: "600" },
  blockchainHighlight: { color: "#4ECDC4", fontWeight: "600", textShadow: "0 0 10px rgba(78, 205, 196, 0.3)" },
  statsSection: { padding: "2rem", maxWidth: "1400px", margin: "0 auto" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem" },
  statCard: { background: "linear-gradient(145deg, #1a1a1a, #2a2a2a)", borderRadius: "20px", padding: "1.5rem", transition: "all 0.3s ease", overflow: "hidden", position: "relative" },
  statCardHeader: { display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" },
  statIconContainer: { width: "60px", height: "60px", borderRadius: "15px", display: "flex", alignItems: "center", justifyContent: "center" },
  statCardContent: { flex: 1 },
  statCardTitle: { margin: "0 0 0.5rem 0", fontSize: "0.9rem", color: "#cccccc", fontWeight: "500" },
  statCardValue: { margin: "0 0 0.25rem 0", fontSize: "2rem", fontWeight: "bold", color: "#ffffff" },
  statCardSubtitle: { margin: 0, fontSize: "0.8rem", color: "#aaaaaa" },
  statCardFooter: { padding: "0.75rem", borderRadius: "10px", display: "flex", justifyContent: "center", alignItems: "center" },
  statTrend: { display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "#ffffff" },
  walletSection: { padding: "2rem", maxWidth: "1200px", margin: "0 auto" },
  investmentCard: { background: "linear-gradient(145deg, #1a1a1a, #2a2a2a)", borderRadius: "24px", padding: "3rem", display: "flex", alignItems: "center", gap: "3rem", boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5)", border: "1px solid #333", position: "relative", overflow: "hidden" },
  walletIconContainer: { position: "relative", flexShrink: 0 },
  walletIcon: { color: "#FFD700", filter: "drop-shadow(0 0 10px rgba(255, 215, 0, 0.3))" },
  trendingIcon: { position: "absolute", bottom: "-10px", right: "-10px", color: "#4CAF50", backgroundColor: "#1a1a1a", padding: "8px", borderRadius: "50%", border: "2px solid #4CAF50" },
  investmentInfo: { flex: 1 },
  investmentTitle: { margin: "0 0 0.5rem 0", color: "#FFD700", fontSize: "1.8rem", fontWeight: "600" },
  investmentAmount: { fontSize: "3.5rem", fontWeight: "bold", color: "#ffffff", margin: "0 0 2rem 0", textShadow: "0 0 15px rgba(255, 215, 0, 0.5)", background: "linear-gradient(45deg, #FFD700, #FFFFFF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" },
  statItem: { display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.8rem", backgroundColor: "rgba(255, 255, 255, 0.05)", borderRadius: "10px", fontSize: "0.9rem", color: "#cccccc" },
  walletButtons: { display: "flex", gap: "1rem", flexWrap: "wrap" },
  metamaskButton: { display: "flex", alignItems: "center", gap: "0.8rem", padding: "1rem 2rem", border: "none", borderRadius: "12px", fontWeight: 600, cursor: "pointer", transition: "all 0.3s ease", fontSize: "1rem", background: "linear-gradient(45deg, #F6851B, #E2761B)", color: "white", boxShadow: "0 4px 15px rgba(246, 133, 27, 0.3)" },
  centralizedButton: { display: "flex", alignItems: "center", gap: "0.8rem", padding: "1rem 2rem", border: "none", borderRadius: "12px", fontWeight: 600, cursor: "pointer", transition: "all 0.3s ease", fontSize: "1rem", background: "linear-gradient(45deg, #0066CC, #004C99)", color: "white", boxShadow: "0 4px 15px rgba(0, 102, 204, 0.3)" },
  walletLogo: { width: "24px", height: "24px" },
  connectedWallet: { display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "1.5rem", padding: "0.8rem 1.2rem", background: "rgba(0, 255, 0, 0.1)", borderRadius: "10px", color: "#00ff00", fontSize: "0.9rem", border: "1px solid rgba(0, 255, 0, 0.3)" },
  connectedText: { fontFamily: "monospace" },
  transfersSection: { padding: "2rem", maxWidth: "1400px", margin: "0 auto", background: "#0a0a0a", borderRadius: "20px", border: "1px solid #333", marginTop: "2rem" },
  transfersTitle: { fontSize: "2rem", color: "#FFD700", textAlign: "center", marginBottom: "0.5rem" },
  transfersSubtitle: { textAlign: "center", color: "#aaaaaa", marginBottom: "2rem", fontSize: "1rem" },
  transfersLoading: { textAlign: "center", color: "#cccccc", padding: "2rem" },
  transfersError: { textAlign: "center", color: "#ff6b6b", padding: "2rem", backgroundColor: "rgba(255, 107, 107, 0.1)", borderRadius: "10px", border: "1px solid #ff6b6b" },
  transfersErrorHint: { fontSize: "0.9rem", color: "#cccccc", marginTop: "1rem" },
  retryButton: { marginTop: "1rem", padding: "0.5rem 1rem", background: "#FFD700", color: "#000", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", transition: "all 0.3s ease" },
  noTransfers: { textAlign: "center", color: "#cccccc", padding: "2rem" },
  transfersTableContainer: { overflowX: "auto" },
  transfersTable: { width: "100%", borderCollapse: "collapse", color: "#ffffff", fontSize: "0.9rem" },
  statusBadge: { display: "inline-block", padding: "0.25rem 0.75rem", borderRadius: "20px", fontSize: "0.8rem", fontWeight: "600", textTransform: "capitalize" },
  statusCompleted: { backgroundColor: "rgba(0, 255, 0, 0.2)", color: "#00ff00", border: "1px solid #00ff00" },
  statusPending: { backgroundColor: "rgba(255, 255, 0, 0.2)", color: "#ffff00", border: "1px solid #ffff00" },
  statusFailed: { backgroundColor: "rgba(255, 0, 0, 0.2)", color: "#ff6b6b", border: "1px solid #ff6b6b" },
  txHashLink: { color: "#4ECDC4", textDecoration: "none", borderBottom: "1px dashed #4ECDC4" },
  tabsContainer: { display: "flex", justifyContent: "center", gap: "1rem", padding: "2rem", maxWidth: "1200px", margin: "0 auto" },
  activeTab: { padding: "1rem 3rem", fontSize: "1.1rem", fontWeight: "600", background: "linear-gradient(45deg, #FFD700, #FFA500)", color: "#000000", border: "none", borderRadius: "10px", cursor: "pointer", transition: "all 0.3s ease", boxShadow: "0 5px 15px rgba(255, 215, 0, 0.3)" },
  inactiveTab: { padding: "1rem 3rem", fontSize: "1.1rem", fontWeight: "600", background: "rgba(255, 255, 255, 0.05)", color: "#cccccc", border: "1px solid #333", borderRadius: "10px", cursor: "pointer", transition: "all 0.3s ease" },
  tiersSection: { padding: "3rem 2rem", maxWidth: "1400px", margin: "0 auto" },
  sectionTitle: { textAlign: "center", fontSize: "2.8rem", marginBottom: "1rem", color: "#FFD700", position: "relative" },
  sectionSubtitle: { textAlign: "center", fontSize: "1.1rem", color: "#aaaaaa", marginBottom: "3rem", maxWidth: "600px", margin: "0 auto 3rem", lineHeight: "1.6" },
  tiersGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2.5rem", marginTop: "2rem" },
  tierCard: { background: "#1a1a1a", borderRadius: "20px", overflow: "hidden", border: "2px solid", transition: "all 0.3s ease" },
  tierHeader: { padding: "2rem", textAlign: "center", color: "#000000", position: "relative" },
  tierIcon: { position: "absolute", top: "1rem", right: "1rem", opacity: 0.8 },
  tierName: { margin: "0 0 0.5rem 0", fontSize: "1.4rem", fontWeight: "bold" },
  tierInvestment: { margin: 0, fontSize: "1.1rem", opacity: 0.9, fontWeight: "600" },
  tierBenefits: { padding: "2rem" },
  benefitsList: { listStyle: "none", padding: 0, margin: 0 },
  benefitItem: { display: "flex", alignItems: "center", gap: "0.8rem", marginBottom: "1rem", fontSize: "0.95rem", color: "#cccccc", lineHeight: "1.5" },
  checkIcon: { color: "#00ff00", flexShrink: 0 },
  tierFooter: { padding: "1.5rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255, 255, 255, 0.05)" },
  colorBadge: { width: "40px", height: "40px", borderRadius: "50%", boxShadow: "0 0 10px rgba(255,255,255,0.2)" },
  tierApplyButton: { padding: "0.8rem 1.5rem", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)", fontSize: "0.9rem", boxShadow: "0 5px 15px rgba(0,0,0,0.2)", backgroundSize: "200% auto" },
  showcaseSection: { padding: "3rem 2rem", background: "linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%)", maxWidth: "1400px", margin: "0 auto" },
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3rem", flexWrap: "wrap", gap: "1rem" },
  tierCategory: { marginBottom: "4rem" },
  tierCategoryTitle: { fontSize: "2.5rem", color: "#FFD700", textAlign: "center", marginBottom: "0.5rem" },
  tierCategorySubtitle: { textAlign: "center", color: "#aaaaaa", marginBottom: "2rem", fontSize: "1.1rem" },
  brandsGridPlatinum: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem", marginTop: "1rem" },
  brandsGridGold: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem", marginTop: "1rem" },
  brandsGridSilver: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginTop: "1rem" },
  brandsGridBronze: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem", marginTop: "1rem" },
  brandCard: { background: "linear-gradient(145deg, #1a1a1a, #2a2a2a)", borderRadius: "15px", transition: "all 0.3s ease", border: "1px solid rgba(255, 255, 255, 0.1)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" },
  brandCardContent: { padding: "1.5rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" },
  brandLogo: { width: "80px", height: "80px", objectFit: "contain", borderRadius: "10px", marginBottom: "1rem" },
  brandLogoPlaceholder: { width: "80px", height: "80px", borderRadius: "10px", background: "linear-gradient(45deg, #FFD700, #FFA500)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" },
  brandLogoText: { fontSize: "2rem", fontWeight: "bold", color: "#000000" },
  brandCardName: { fontSize: "1.2rem", fontWeight: "bold", color: "#ffffff", margin: 0 },
  brandCardDescription: { fontSize: "0.9rem", color: "#cccccc", margin: 0, lineHeight: "1.4" },
  sponsorBadge: { padding: "0.3rem 0.8rem", borderRadius: "20px", fontSize: "0.8rem", fontWeight: "600", background: "linear-gradient(45deg, #FFD700, #FFA500)", color: "#000000", marginTop: "0.5rem" },
  sponsorCTASection: { background: "linear-gradient(145deg, #1a1a1a, #2a2a2a)", borderRadius: "20px", padding: "3rem", textAlign: "center", marginTop: "4rem" },
  sponsorCTATitle: { fontSize: "2.5rem", color: "#FFD700", marginBottom: "1rem" },
  sponsorCTADescription: { fontSize: "1.1rem", color: "#cccccc", marginBottom: "2rem", maxWidth: "600px", marginLeft: "auto", marginRight: "auto" },
  sponsorCTAButtons: { display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" },
  primaryCTAButton: { padding: "1rem 2rem", background: "linear-gradient(45deg, #0066CC, #004C99)", color: "white", border: "none", borderRadius: "10px", fontWeight: "600", cursor: "pointer", transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)", fontSize: "1rem", boxShadow: "0 5px 15px rgba(0, 102, 204, 0.3)" },
  secondaryCTAButton: { padding: "1rem 2rem", background: "transparent", color: "#FFD700", border: "2px solid #FFD700", borderRadius: "10px", fontWeight: "600", cursor: "pointer", transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)", fontSize: "1rem", boxShadow: "none" },
  applySection: { padding: "5rem 2rem", maxWidth: "800px", margin: "0 auto" },
  applyCard: { background: "linear-gradient(145deg, #1a1a1a, #2a2a2a)", borderRadius: "25px", padding: "4rem", textAlign: "center", border: "2px solid #FFD700", boxShadow: "0 20px 40px rgba(255, 215, 0, 0.1)" },
  applyTitle: { color: "#FFD700", fontSize: "3rem", marginBottom: "1.5rem", fontWeight: "bold" },
  applyDescription: { color: "#cccccc", fontSize: "1.2rem", marginBottom: "3rem", lineHeight: "1.7" },
  blockchainText: { color: "#4ECDC4", fontSize: "1rem", fontWeight: "500", display: "block", marginTop: "1rem" },
  applyButtons: { display: "flex", flexDirection: "column", gap: "2rem", alignItems: "center" },
  sponsorApplyButton: { padding: "1.2rem 4rem", fontSize: "1.3rem", background: "linear-gradient(135deg, #FFD700, #FFA500)", color: "#000000", border: "none", borderRadius: "15px", fontWeight: "bold", cursor: "pointer", transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)", boxShadow: "0 10px 25px rgba(255, 215, 0, 0.3)", backgroundSize: "200% auto" },
  authButtons: { display: "flex", gap: "1.5rem" },
  sponsorAuthButton: { padding: "1rem 2.5rem", border: "2px solid #4CAF50", background: "transparent", color: "#4CAF50", borderRadius: "10px", fontWeight: "600", cursor: "pointer", transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)", fontSize: "1rem", boxShadow: "none" },
  footer: { padding: "4rem 2rem", background: "#0a0a0a", borderTop: "3px solid #FFD700", textAlign: "center" },
  footerContent: { maxWidth: "800px", margin: "0 auto" },
  footerLogo: { fontSize: "1.8rem", fontWeight: "bold", color: "#FFD700", marginBottom: "1.5rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" },
  footerLogoText: { color: "#FFD700" },
  footerText: { color: "#aaaaaa", fontSize: "1rem", marginBottom: "2rem", lineHeight: "1.6" },
  copyright: { color: "#666666", fontSize: "0.9rem", marginTop: "2rem" },
  errorMessage: { marginTop: "1rem", padding: "0.8rem 1.2rem", background: "rgba(255, 0, 0, 0.1)", borderRadius: "10px", color: "#ff6b6b", fontSize: "0.9rem", border: "1px solid rgba(255, 0, 0, 0.3)" },
} as const;