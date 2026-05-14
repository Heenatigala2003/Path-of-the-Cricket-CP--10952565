"use client";

import { useState, useEffect } from "react";

interface ServiceReport {
  id: string;
  first_name: string;
  last_name: string;
  district: string;
  problem_type: string;
  details: string;
  created_at: string;
  status: string;
}

export default function AdminServicePortal() {
  const [reports, setReports] = useState<ServiceReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("");

  // Fetch reports with robust error handling
  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = filterStatus
        ? `/api/service-reports?status=${filterStatus}`
        : "/api/service-reports";

      const res = await fetch(url);
      console.log('Response status:', res.status);

    
      const text = await res.text();
      console.log('Response text:', text);

      
      if (!text.trim()) {
        throw new Error('Empty response from server');
      }

  
      let result;
      try {
        result = JSON.parse(text);
      } catch (parseError) {
        console.error('Failed to parse JSON:', parseError);
       
        throw new Error(`Invalid JSON response. Server returned: ${text.substring(0, 100)}...`);
      }

      if (!res.ok) {
        throw new Error(result.error || `HTTP error ${res.status}`);
      }

    
      if (result.success) {
        setReports(result.data || []);
      } else {
        throw new Error(result.error || "Failed to load reports");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [filterStatus]);

  // Update status
  const updateStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/service-reports/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const text = await res.text();
      if (!text.trim()) throw new Error('Empty response from server');

      let result;
      try {
        result = JSON.parse(text);
      } catch (e) {
        throw new Error(`Invalid JSON: ${text.substring(0, 100)}`);
      }

      if (!res.ok) throw new Error(result.error || `HTTP error ${res.status}`);

      if (result.success) {
        setReports(prev =>
          prev.map(r => (r.id === id ? { ...r, status: newStatus } : r))
        );
      } else {
        throw new Error(result.error || "Update failed");
      }
    } catch (err: any) {
      alert("Error updating status: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  // Delete report
  const deleteReport = async (id: string) => {
    if (!confirm("Are you sure you want to delete this report?")) return;
    try {
      const res = await fetch(`/api/service-reports/${id}`, {
        method: "DELETE",
      });

      const text = await res.text();
      if (!text.trim()) throw new Error('Empty response from server');

      let result;
      try {
        result = JSON.parse(text);
      } catch (e) {
        throw new Error(`Invalid JSON: ${text.substring(0, 100)}`);
      }

      if (!res.ok) throw new Error(result.error || `HTTP error ${res.status}`);

      if (result.success) {
        setReports(prev => prev.filter(r => r.id !== id));
      } else {
        throw new Error(result.error || "Delete failed");
      }
    } catch (err: any) {
      alert("Error deleting report: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold text-yellow-400 mb-6">Service Reports - Admin Panel</h1>

      {/* Filter */}
      <div className="mb-4 flex items-center gap-4">
        <label className="text-gray-300">Filter by status:</label>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2"
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="in progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
        <button
          onClick={fetchReports}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
        >
          Refresh
        </button>
      </div>

      {loading && <p className="text-gray-400">Loading reports...</p>}
      {error && (
        <div className="bg-red-900 border border-red-700 text-red-200 p-4 rounded mb-4">
          <p className="font-bold">Error:</p>
          <p className="text-sm">{error}</p>
          <p className="text-xs mt-2">
            Check the browser console (F12) for more details.
          </p>
        </div>
      )}

      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-800 border border-gray-700">
            <thead>
              <tr className="bg-gray-700 text-left">
                <th className="p-3">Date</th>
                <th className="p-3">Name</th>
                <th className="p-3">District</th>
                <th className="p-3">Problem Type</th>
                <th className="p-3">Details</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id} className="border-t border-gray-700 hover:bg-gray-750">
                  <td className="p-3 text-sm">
                    {new Date(report.created_at).toLocaleString()}
                  </td>
                  <td className="p-3">{report.first_name} {report.last_name}</td>
                  <td className="p-3">{report.district}</td>
                  <td className="p-3">{report.problem_type}</td>
                  <td className="p-3 max-w-xs truncate">{report.details}</td>
                  <td className="p-3">
                    <select
                      value={report.status}
                      onChange={(e) => updateStatus(report.id, e.target.value)}
                      disabled={updatingId === report.id}
                      className="bg-gray-900 text-white border border-gray-600 rounded px-2 py-1 text-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="in progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => deleteReport(report.id)}
                      disabled={updatingId === report.id}
                      className="text-red-400 hover:text-red-300 disabled:opacity-50"
                      title="Delete"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
              {reports.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-gray-500">
                    No reports found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}