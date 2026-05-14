"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase/client";  

type Sponsorship = {
  id: string;
  sponsor_id: string;
  player_id?: string;
  amount: number;
  status: "pending" | "active" | "completed" | "cancelled";
  start_date: string;
  end_date: string;
  created_at?: string;
  updated_at?: string;
};

export default function AdminSponsorshipContractPage() {
  const [sponsorships, setSponsorships] = useState<Sponsorship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [realtimeError, setRealtimeError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

 
  const mountedRef = useRef(true);
  const latestRequestIdRef = useRef(0);
  const subscriptionRef = useRef<any>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const devLog = (...args: any[]) => {
    if (process.env.NODE_ENV === "development") {
      console.log(...args);
    }
  };
  const devError = (...args: any[]) => {
    if (process.env.NODE_ENV === "development") {
      console.error(...args);
    }
  };


  const fetchSponsorships = useCallback(async () => {
    const requestId = ++latestRequestIdRef.current;
    if (!mountedRef.current) return;

    setRefreshing(true);
    try {
      let data: any[] | null = null;
      const result = await supabase
        .from("sponsorships")
        .select("*")
        .order("created_at", { ascending: false });

      if (result.error && result.error.code === "42703") {
        devLog("created_at column not found, falling back to id ordering");
        const fallback = await supabase
          .from("sponsorships")
          .select("*")
          .order("id", { ascending: false });
        if (fallback.error) throw fallback.error;
        data = fallback.data;
      } else if (result.error) {
        throw result.error;
      } else {
        data = result.data;
      }

  
      if (requestId === latestRequestIdRef.current && mountedRef.current) {
        devLog("✅ Fetched sponsorships:", data?.length || 0, "records");
        setSponsorships(data || []);
        setError(null);
      }
    } catch (err: any) {
      if (requestId === latestRequestIdRef.current && mountedRef.current) {
        devError("❌ Error fetching sponsorships:", err);
        setError(err.message || "Failed to load sponsorships");
      }
    } finally {
      if (requestId === latestRequestIdRef.current && mountedRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);


  const setupRealtimeSubscription = useCallback(() => {
    if (!mountedRef.current) return;

   
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    
    const channelName = `sponsorships-changes-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sponsorships" },
        (payload: any) => {
          devLog("🔔 Realtime event:", payload);
          if (!mountedRef.current) return;
          if (payload.eventType === "INSERT") {
            setSponsorships((prev) => [payload.new as Sponsorship, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setSponsorships((prev) =>
              prev.map((item) =>
                item.id === payload.new.id ? (payload.new as Sponsorship) : item
              )
            );
          } else if (payload.eventType === "DELETE") {
            setSponsorships((prev) => prev.filter((item) => item.id !== payload.old.id));
          }
        }
      );

    subscriptionRef.current = channel;

    channel.subscribe((status: "SUBSCRIBED" | "CHANNEL_ERROR" | "TIMED_OUT" | "CLOSED") => {
      if (!mountedRef.current) return;
      if (status === "SUBSCRIBED") {
        devLog("✅ Real-time subscription active for sponsorships");
        setRealtimeError(null);
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
          retryTimeoutRef.current = null;
        }
      } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        devError(`❌ Subscription ${status} – will retry in 5 seconds`);
        const errorMsg = "Real-time connection lost. Please refresh the page or try again.";
        setRealtimeError(errorMsg);
        setError(errorMsg);
        if (!retryTimeoutRef.current && mountedRef.current) {
          retryTimeoutRef.current = setTimeout(() => {
            if (mountedRef.current) {
              devLog("🔄 Retrying real-time subscription...");
              setupRealtimeSubscription();
            }
          }, 5000);
        }
      } else if (status === "CLOSED") {
        devLog(`🔄 Subscription ${status} – will retry in 5 seconds`);
        if (!retryTimeoutRef.current && mountedRef.current) {
          retryTimeoutRef.current = setTimeout(() => {
            if (mountedRef.current) {
              devLog("🔄 Retrying real-time subscription...");
              setupRealtimeSubscription();
            }
          }, 5000);
        }
      }
    });
  }, []);

  const retryRealtime = useCallback(() => {
    if (realtimeError && mountedRef.current) {
      setRealtimeError(null);
      setError(null);
      setupRealtimeSubscription();
    }
  }, [realtimeError, setupRealtimeSubscription]);

  // Initial load
  useEffect(() => {
    mountedRef.current = true;

    fetchSponsorships();
    setupRealtimeSubscription();

    return () => {
      mountedRef.current = false;
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    };
  }, [fetchSponsorships, setupRealtimeSubscription]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading && !refreshing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-yellow-400 text-xl">Loading sponsorships...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-yellow-400">
            Sponsorship Contracts (Admin)
          </h1>
          <button
            onClick={fetchSponsorships}
            disabled={refreshing}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 disabled:opacity-50"
          >
            {refreshing ? "Refreshing..." : "Refresh Data"}
          </button>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-6">
            <p className="text-red-300">⚠️ {error}</p>
            {realtimeError && (
              <button
                onClick={retryRealtime}
                className="mt-2 px-4 py-2 bg-yellow-500 text-black rounded hover:bg-yellow-400 transition"
              >
                Retry Real‑time Connection
              </button>
            )}
          </div>
        )}

        {process.env.NODE_ENV === "development" && (
          <div className="mb-6 p-4 bg-gray-800 rounded text-sm font-mono">
            <div>Records: {sponsorships.length}</div>
            <div>Error: {error || "None"}</div>
          </div>
        )}

        {sponsorships.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            No sponsorship contracts found.
            {!error && (
              <p className="text-sm mt-2">
                Try adding a test record via the Supabase dashboard.
              </p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-700 rounded-lg">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-4 py-2 text-left">ID</th>
                  <th className="px-4 py-2 text-left">Sponsor ID</th>
                  <th className="px-4 py-2 text-left">Player ID</th>
                  <th className="px-4 py-2 text-right">Amount</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Start Date</th>
                  <th className="px-4 py-2 text-left">End Date</th>
                  <th className="px-4 py-2 text-left">Created At</th>
                  <th className="px-4 py-2 text-left">Updated At</th>
                </tr>
              </thead>
              <tbody>
                {sponsorships.map((sp) => (
                  <tr key={sp.id} className="border-t border-gray-700 hover:bg-gray-800">
                    <td className="px-4 py-2 font-mono text-sm">{sp.id}</td>
                    <td className="px-4 py-2">{sp.sponsor_id}</td>
                    <td className="px-4 py-2">{sp.player_id || "-"}</td>
                    <td className="px-4 py-2 text-right">{sp.amount}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          sp.status === "active"
                            ? "bg-green-900 text-green-300"
                            : sp.status === "pending"
                            ? "bg-yellow-900 text-yellow-300"
                            : sp.status === "completed"
                            ? "bg-blue-900 text-blue-300"
                            : "bg-red-900 text-red-300"
                        }`}
                      >
                        {sp.status}
                      </span>
                    </td>
                    <td className="px-4 py-2">{formatDate(sp.start_date)}</td>
                    <td className="px-4 py-2">{formatDate(sp.end_date)}</td>
                    <td className="px-4 py-2">
                      {sp.created_at ? formatDate(sp.created_at) : "-"}
                    </td>
                    <td className="px-4 py-2">
                      {sp.updated_at ? formatDate(sp.updated_at) : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}