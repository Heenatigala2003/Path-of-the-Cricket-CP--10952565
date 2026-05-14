'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import {
  CheckCircle,
  XCircle,
  RefreshCw,
  User,
  Mail,
  MapPin,
  Phone,
  FileText,
  Building,
  CreditCard,
  Banknote,
  Shield,
  Fingerprint,
  AlertCircle,
  Download,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const ADMIN_EMAILS = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];

interface Application {
  id: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  address: string;
  contact_number: string;
  id_number: string;
  player_id: string;
  token: string;
  district: string;
  division: string;
  bank_name: string;
  account_number: string;
  account_type: string;
  branch_name: string;
  account_holder_name: string | null;
  gs_certificate_url: string;
  gs_certificate_path: string;
  face_auth_status: 'pending' | 'success' | 'failed';
  agreement_accepted: boolean;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  created_at: string;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
  review_comment?: string | null;
}

export default function AdminSponsorshipApplications() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [expandedAppId, setExpandedAppId] = useState<string | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const mountedRef = useRef(true);
  const latestRequestIdRef = useRef(0);
  const channelRef = useRef<any>(null);
  const refreshTimeoutRef = useRef<NodeJS.Timeout>();


  const fetchApplications = useCallback(async () => {
    const requestId = ++latestRequestIdRef.current;
    try {
      const { data, error: fetchError } = await supabase
        .from('sponsorship_applications')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (fetchError) throw fetchError;
    
      if (requestId === latestRequestIdRef.current && mountedRef.current) {
        setApplications(data || []);
        setError(null);
      }
    } catch (err: any) {
      if (requestId === latestRequestIdRef.current && mountedRef.current) {
        console.error('Fetch error:', err);
        setError(err.message || 'Failed to load applications');
      }
    }
  }, []);


  useEffect(() => {
    mountedRef.current = true;

    const checkAdminAndFetch = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session?.user) {
          router.push('/auth/login');
          return;
        }

        if (!mountedRef.current) return;
        setUser(session.user);

        const isAdminUser = ADMIN_EMAILS.includes(session.user.email);
        if (!isAdminUser) {
          setIsAdmin(false);
          setError('Access denied: Admin privileges required.');
          return;
        }

        setIsAdmin(true);
        await fetchApplications();

      
        const channelName = `admin-sponsorship-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
        const channel = supabase
          .channel(channelName)
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'sponsorship_applications' },
            (payload) => {
              console.log('New application received:', payload);
              const newApp = payload.new as Application;
              setApplications((prev) => [newApp, ...prev]);
            }
          )
          .on(
            'postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'sponsorship_applications' },
            (payload) => {
              console.log('Application updated:', payload);
              const updatedApp = payload.new as Application;
              setApplications((prev) =>
                prev.map((app) => (app.id === updatedApp.id ? updatedApp : app))
              );
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') console.log('Realtime connected for admin panel');
          });

        channelRef.current = channel;
      } catch (err: any) {
        console.error('Admin check error:', err);
        if (mountedRef.current) setError(err.message || 'Failed to load admin panel');
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    };

    checkAdminAndFetch();

    return () => {
      mountedRef.current = false;
      if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current).catch(() => {});
        channelRef.current = null;
      }
    };
  }, [router, fetchApplications]);

  const handleStatusUpdate = async (applicationId: string, newStatus: 'approved' | 'rejected') => {
    if (!user || !mountedRef.current) return;

    setActionLoading(applicationId);
    setError(null);
    setSuccess(null);

    try {
      const updateData: any = {
        status: newStatus,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
      };
      if (reviewComment && newStatus === 'rejected') {
        updateData.review_comment = reviewComment;
      }

      const { error: updateError } = await supabase
        .from('sponsorship_applications')
        .update(updateData)
        .eq('id', applicationId);

      if (updateError) throw updateError;

      setSuccess(`Application ${applicationId.slice(0, 8)} ${newStatus} successfully.`);
      if (newStatus === 'rejected') setReviewComment('');
    } catch (err: any) {
      console.error('Update error:', err);
      if (mountedRef.current) setError(err.message || `Failed to ${newStatus} application`);
    } finally {
      if (mountedRef.current) setActionLoading(null);
    }
  };

  const toggleExpand = (appId: string) => {
    setExpandedAppId(expandedAppId === appId ? null : appId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-yellow-500 mx-auto mb-4"></div>
          <h2 className="text-white text-lg font-semibold">Loading Admin Panel...</h2>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 max-w-md mx-4 text-center">
            <div className="text-red-500 mb-4">
              <AlertCircle size={48} className="mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Access Denied</h2>
            <p className="text-gray-300 mb-6">You do not have permission to view this page.</p>
            <button
              onClick={() => router.push('/')}
              className="w-full py-3 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white font-semibold rounded-lg transition-all"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
    
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">
                <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                  Sponsorship Applications
                </span>
              </h1>
              <p className="text-gray-300 mt-1">Manage and review player sponsorship applications (real-time updates)</p>
            </div>
            <button
              onClick={fetchApplications}
              disabled={loading}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-2"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-4 md:p-6 pt-8">
        {success && (
          <div className="mb-6 p-4 bg-green-900/30 border border-green-700 rounded-xl">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
              <p className="text-green-200">{success}</p>
            </div>
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-xl">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-red-200">{error}</p>
            </div>
          </div>
        )}

        {applications.length === 0 ? (
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-12 text-center">
            <p className="text-gray-400 text-lg">No sponsorship applications found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app.id} className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden hover:shadow-xl transition-shadow">
                <div className="p-5 cursor-pointer hover:bg-gray-700/50 transition-colors" onClick={() => toggleExpand(app.id)}>
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          app.status === 'approved'
                            ? 'bg-green-900/50 text-green-300 border border-green-700'
                            : app.status === 'rejected'
                            ? 'bg-red-900/50 text-red-300 border border-red-700'
                            : 'bg-yellow-900/50 text-yellow-300 border border-yellow-700'
                        }`}
                      >
                        {app.status.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white font-medium">{app.first_name} {app.last_name}</p>
                        <p className="text-gray-400 text-sm">{app.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="hidden sm:block">
                        <span className="text-gray-400">Player ID:</span>
                        <span className="ml-2 text-yellow-400 font-mono">{app.player_id}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Submitted:</span>
                        <span className="ml-2 text-gray-300">{new Date(app.submitted_at).toLocaleDateString()}</span>
                      </div>
                      <div className="text-gray-400">
                        {expandedAppId === app.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    </div>
                  </div>
                </div>

                {expandedAppId === app.id && (
                  <div className="border-t border-gray-700 p-5 bg-gray-900/30">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      <div>
                        <h3 className="text-lg font-semibold text-yellow-400 mb-3 flex items-center">
                          <User size={18} className="mr-2" />
                          Personal Information
                        </h3>
                        <div className="space-y-2">
                          <p><span className="text-gray-400">Full Name:</span> {app.first_name} {app.last_name}</p>
                          <p><span className="text-gray-400">Email:</span> <a href={`mailto:${app.email}`} className="text-blue-400 hover:underline">{app.email}</a></p>
                          <p><span className="text-gray-400">Contact:</span> {app.contact_number}</p>
                          <p><span className="text-gray-400">NIC:</span> {app.id_number}</p>
                          <p><span className="text-gray-400">Address:</span> {app.address}</p>
                          <p><span className="text-gray-400">District:</span> {app.district}</p>
                          <p><span className="text-gray-400">Division:</span> {app.division}</p>
                        </div>
                      </div>

                    
                      <div>
                        <h3 className="text-lg font-semibold text-green-400 mb-3 flex items-center">
                          <Building size={18} className="mr-2" />
                          Bank Account Details
                        </h3>
                        <div className="space-y-2">
                          <p><span className="text-gray-400">Bank:</span> {app.bank_name}</p>
                          <p><span className="text-gray-400">Branch:</span> {app.branch_name}</p>
                          <p><span className="text-gray-400">Account Number:</span> {app.account_number}</p>
                          <p><span className="text-gray-400">Account Type:</span> {app.account_type}</p>
                          {app.account_holder_name && <p><span className="text-gray-400">Holder Name:</span> {app.account_holder_name}</p>}
                        </div>
                      </div>

                
                      <div>
                        <h3 className="text-lg font-semibold text-blue-400 mb-3 flex items-center">
                          <Shield size={18} className="mr-2" />
                          Application Identifiers
                        </h3>
                        <div className="space-y-2">
                          <p><span className="text-gray-400">Application ID:</span> <code className="bg-gray-800 px-1 py-0.5 rounded text-yellow-400">{app.id}</code></p>
                          <p><span className="text-gray-400">Player ID:</span> <code className="bg-gray-800 px-1 py-0.5 rounded text-yellow-400">{app.player_id}</code></p>
                          <p><span className="text-gray-400">Token:</span> <code className="bg-gray-800 px-1 py-0.5 rounded text-green-400">{app.token}</code></p>
                          <p><span className="text-gray-400">Face Auth:</span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ml-2 ${
                              app.face_auth_status === 'success' ? 'bg-green-900/50 text-green-300' :
                              app.face_auth_status === 'failed' ? 'bg-red-900/50 text-red-300' : 'bg-yellow-900/50 text-yellow-300'
                            }`}>{app.face_auth_status}</span>
                          </p>
                          <p><span className="text-gray-400">Agreement:</span> {app.agreement_accepted ? <CheckCircle size={16} className="inline text-green-400 ml-1" /> : <XCircle size={16} className="inline text-red-400 ml-1" />}</p>
                        </div>
                      </div>

            
                      <div>
                        <h3 className="text-lg font-semibold text-purple-400 mb-3 flex items-center">
                          <FileText size={18} className="mr-2" />
                          GS Certificate
                        </h3>
                        <div className="space-y-2">
                          <a href={app.gs_certificate_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors">
                            <Download size={16} /> Download PDF
                          </a>
                          <p className="text-xs text-gray-400 mt-2">Path: {app.gs_certificate_path}</p>
                        </div>
                      </div>

                    
                      <div className="md:col-span-2">
                        <h3 className="text-lg font-semibold text-yellow-400 mb-3 flex items-center">
                          <CheckCircle size={18} className="mr-2" />
                          Review & Decision
                        </h3>
                        {app.status === 'pending' ? (
                          <div className="flex flex-col sm:flex-row gap-4">
                            <textarea
                              placeholder="Optional comment (for rejection)"
                              value={reviewComment}
                              onChange={(e) => setReviewComment(e.target.value)}
                              className="flex-1 p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500"
                              rows={2}
                              disabled={actionLoading === app.id}
                            />
                            <div className="flex gap-3">
                              <button
                                onClick={() => handleStatusUpdate(app.id, 'approved')}
                                disabled={actionLoading === app.id}
                                className="px-5 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
                              >
                                {actionLoading === app.id ? <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div> : <CheckCircle size={18} />}
                                Approve
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(app.id, 'rejected')}
                                disabled={actionLoading === app.id}
                                className="px-5 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
                              >
                                {actionLoading === app.id ? <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div> : <XCircle size={18} />}
                                Reject
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
                            <p className="text-gray-300">
                              <span className="font-semibold">Status:</span> {app.status.toUpperCase()}
                              {app.reviewed_at && <> on {new Date(app.reviewed_at).toLocaleString()}</>}
                              {app.review_comment && <><br /><span className="font-semibold">Comment:</span> {app.review_comment}</>}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}