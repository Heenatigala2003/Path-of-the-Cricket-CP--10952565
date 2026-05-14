
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '@/utils/supabase-client';


interface DistrictSelection {
  status: 'PENDING' | 'REGISTERED' | 'SELECTED' | 'DENIED';
  district: string;
  registered_at: string;
  selected_at: string | null;
}

interface AnnualSelection {
  status: 'NOT_YET_ELIGIBLE' | 'SELECTED' | 'NOT_SELECTED';
  profile_access: 'DENIED' | 'ACCESS_GRANTED';
  rank: number | null;
  year: number;
}

interface Profile {
  batting_points: number;
  bowling_points: number;
  annual_rank: number | null;
  height: number | null;
  weight: number | null;
  school: string | null;
  dob: string | null;
  preferred_format: string | null;
  avatar_url?: string | null;
  matches?: number | null;
  runs?: number | null;
  wickets?: number | null;
  best_bowling?: string | null;
  batting_strike_rate?: number | null;
  bowling_economy?: number | null;
  highest_score?: number | null;
  fifties?: number | null;
  hundreds?: number | null;
}

interface Player {
  id: string;
  full_name: string;
  email: string;
  district: string;
  primary_role: string;
  gender: 'male' | 'female';
  created_at: string;
  district_selections: DistrictSelection | null;
  annual_selections: AnnualSelection | null;
  profiles: Profile | null;
}

interface TestData {
  fitness_tests: any | null;
  medical_checks: any | null;
  mental_quizzes: any | null;
  batting_tests: any | null;
  bowling_tests: any | null;
  fielding_tests: any | null;
  wicketkeeping_tests: any | null;
}

const DISTRICTS = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
  'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
  'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
  'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
  'Moneragala', 'Ratnapura', 'Kegalle'
];

export default function AdminUsersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    gender: '',
    district: '',
    status: '',
    search: '',
  });
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testData, setTestData] = useState<TestData | null>(null);
  const [loadingTests, setLoadingTests] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchPlayers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.gender) params.append('gender', filters.gender);
      if (filters.district) params.append('district', filters.district);
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);

      const res = await fetch(`/api/admin/players?${params}`);
      if (!res.ok) {
        const clonedRes = res.clone();
        try {
          const errData = await clonedRes.json();
          throw new Error(errData.error || `HTTP error ${res.status}`);
        } catch {
          const text = await res.text();
          throw new Error(text || `HTTP error ${res.status}`);
        }
      }
      const data = await res.json();
      setPlayers(data);
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message || 'Error loading players');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, [filters]);

 
  useEffect(() => {
    const handleFocus = () => {
      fetchPlayers();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const handleAvatarUpload = async (playerId: string, file: File) => {
    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('playerId', playerId);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        if (err.error?.includes('Bucket not found')) {
          throw new Error('Storage bucket "avatars" does not exist. Please create it in Supabase.');
        }
        throw new Error(err.error || 'Upload failed');
      }

      const data = await res.json();

      setPlayers(prev =>
        prev.map(p =>
          p.id === playerId
            ? {
                ...p,
                profiles: {
                  ...p.profiles,
                  avatar_url: data.avatar_url,
                } as Profile,
              }
            : p
        )
      );

      if (selectedPlayer?.id === playerId) {
        setSelectedPlayer(prev =>
          prev
            ? {
                ...prev,
                profiles: {
                  ...prev.profiles,
                  avatar_url: data.avatar_url,
                } as Profile,
              }
            : prev
        );
      }

      alert('Avatar updated successfully!');
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (player: Player) => {
    setSelectedPlayer(player);
    setIsEditModalOpen(true);
  };

  const handleTestScores = async (player: Player) => {
    setSelectedPlayer(player);
    setTestData(null);
    setLoadingTests(true);
    setIsTestModalOpen(true);

    try {
      const res = await fetch(`/api/admin/player-tests/${player.id}`);
      if (!res.ok) throw new Error('Failed to load test data');
      const data = await res.json();
      setTestData(data);
    } catch (err: any) {
      alert('Error loading test data: ' + err.message);
      setIsTestModalOpen(false);
    } finally {
      setLoadingTests(false);
    }
  };

  const handleSaveEdit = async (updated: Player) => {
    if (!selectedPlayer?.id) {
      alert('Player ID missing. Cannot save.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/players/${selectedPlayer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player: {
            full_name: updated.full_name,
            email: updated.email,
            district: updated.district,
            primary_role: updated.primary_role,
            gender: updated.gender,
          },
          districtSelection: updated.district_selections,
          annualSelection: updated.annual_selections,
          profile: updated.profiles,
        }),
      });

      if (!res.ok) {
        const clonedRes = res.clone();
        try {
          const errData = await clonedRes.json();
          throw new Error(errData.error || `HTTP error ${res.status}`);
        } catch {
          const text = await res.text();
          throw new Error(text || `HTTP error ${res.status}`);
        }
      }

      await fetchPlayers();
      setIsEditModalOpen(false);
      alert('Player updated successfully!');
    } catch (err: any) {
      console.error('Save error:', err);
      alert('Error saving player: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTests = async (formData: any) => {
    if (!selectedPlayer?.id) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/player-tests/${selectedPlayer.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to save test scores');
      }
      await fetchPlayers();
      setIsTestModalOpen(false);
      alert('Test scores saved!');
    } catch (err: any) {
      alert('Error saving test scores: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const getDistrictStatusColor = (status: string) => {
    switch (status) {
      case 'SELECTED': return 'bg-green-900 text-green-300';
      case 'REGISTERED': return 'bg-yellow-900 text-yellow-300';
      case 'DENIED': return 'bg-red-900 text-red-300';
      default: return 'bg-gray-700 text-gray-300';
    }
  };

  const getAnnualStatusColor = (status: string) => {
    switch (status) {
      case 'SELECTED': return 'bg-green-900 text-green-300';
      case 'NOT_SELECTED': return 'bg-red-900 text-red-300';
      default: return 'bg-gray-700 text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-yellow-400">Admin Dashboard</h1>
        <p className="text-gray-400 mb-8">Manage Players, Selections & Test Scores</p>

        {/* Filters */}
        <div className="bg-gray-800 rounded-xl p-6 mb-8 border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Search</label>
              <input
                type="text"
                placeholder="Name or Email"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Gender</label>
              <select
                value={filters.gender}
                onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="">All</option>
                <option value="male">Boys</option>
                <option value="female">Girls</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">District</label>
              <select
                value={filters.district}
                onChange={(e) => setFilters({ ...filters, district: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="">All Districts</option>
                {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">District Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="">All</option>
                <option value="PENDING">PENDING</option>
                <option value="REGISTERED">REGISTERED</option>
                <option value="SELECTED">SELECTED</option>
                <option value="DENIED">DENIED</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={fetchPlayers}
              className="bg-yellow-600 hover:bg-yellow-700 text-black font-semibold px-6 py-2 rounded-lg transition"
            >
              Apply Filters
            </button>
          </div>
        </div>

    
        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 mb-6 text-red-400">
            <p className="font-semibold">Error: {error}</p>
          </div>
        )}

    
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
              <p className="mt-2 text-gray-400">Loading players...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Avatar</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Gender</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">District</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">District Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Annual Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Profile Access</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {players.length === 0 ? (
                    <tr><td colSpan={10} className="px-6 py-12 text-center text-gray-400">No players found</td></tr>
                  ) : (
                    players.map((player) => (
                      <tr key={player.id} className="hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="relative w-10 h-10">
                              {player.profiles?.avatar_url ? (
                                <Image
                                  src={player.profiles.avatar_url}
                                  alt="avatar"
                                  fill
                                  className="rounded-full object-cover"
                                />
                              ) : (
                                <div className={`w-full h-full rounded-full border-2 ${player.gender === 'male' ? 'border-blue-500' : 'border-pink-500'} bg-gray-700 flex items-center justify-center text-lg`}>
                                  {player.gender === 'male' ? '♂' : '♀'}
                                </div>
                              )}
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  await handleAvatarUpload(player.id, file);
                                }
                              }}
                              disabled={uploading}
                              className="text-xs text-gray-400 w-20"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{player.full_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{player.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {player.gender === 'male' ? <span className="text-blue-400">Boys</span> : <span className="text-pink-400">Girls</span>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{player.district}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{player.primary_role}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {player.district_selections && (
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getDistrictStatusColor(player.district_selections.status)}`}>
                              {player.district_selections.status}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {player.annual_selections && (
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getAnnualStatusColor(player.annual_selections.status)}`}>
                              {player.annual_selections.status === 'NOT_YET_ELIGIBLE' ? 'NOT YET ELIGIBLE' : player.annual_selections.status}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {player.annual_selections?.profile_access === 'ACCESS_GRANTED' ? (
                            <span className="text-green-400">GRANTED</span>
                          ) : (
                            <span className="text-red-400">DENIED</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button onClick={() => handleEdit(player)} className="text-yellow-400 hover:text-yellow-300 font-medium mr-2">Edit</button>
                          <button onClick={() => handleTestScores(player)} className="text-blue-400 hover:text-blue-300 font-medium">Test Scores</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>


      {isEditModalOpen && selectedPlayer && (
        <EditPlayerModal
          player={selectedPlayer}
          onSave={handleSaveEdit}
          onClose={() => setIsEditModalOpen(false)}
          onAvatarUpload={handleAvatarUpload}
          uploading={uploading}
          saving={saving}
        />
      )}


      {isTestModalOpen && selectedPlayer && (
        <TestScoresModal
          player={selectedPlayer}
          initialData={testData}
          loading={loadingTests}
          onSave={handleSaveTests}
          onClose={() => setIsTestModalOpen(false)}
          saving={saving}
        />
      )}
    </div>
  );
}

const toIntOrNull = (val: string): number | null => {
  if (val === '') return null;
  const num = parseInt(val, 10);
  return isNaN(num) ? null : num;
};

const toFloatOrNull = (val: string): number | null => {
  if (val === '') return null;
  const num = parseFloat(val);
  return isNaN(num) ? null : num;
};


function EditPlayerModal({ player, onSave, onClose, onAvatarUpload, uploading, saving }: {
  player: Player;
  onSave: (updated: Player) => void;
  onClose: () => void;
  onAvatarUpload: (playerId: string, file: File) => Promise<void>;
  uploading: boolean;
  saving: boolean;
}) {
  const [formData, setFormData] = useState({
    full_name: player.full_name,
    email: player.email,
    district: player.district,
    primary_role: player.primary_role,
    gender: player.gender,
    district_status: player.district_selections?.status || 'PENDING',
    annual_status: player.annual_selections?.status || 'NOT_YET_ELIGIBLE',
    annual_rank: player.annual_selections?.rank?.toString() || '',
    batting_points: player.profiles?.batting_points?.toString() || '0',
    bowling_points: player.profiles?.bowling_points?.toString() || '0',
    height: player.profiles?.height?.toString() || '',
    weight: player.profiles?.weight?.toString() || '',
    school: player.profiles?.school || '',
    dob: player.profiles?.dob || '',
    preferred_format: player.profiles?.preferred_format || 'ODI',
    matches: player.profiles?.matches?.toString() || '',
    runs: player.profiles?.runs?.toString() || '',
    wickets: player.profiles?.wickets?.toString() || '',
    best_bowling: player.profiles?.best_bowling || '',
    batting_strike_rate: player.profiles?.batting_strike_rate?.toString() || '',
    bowling_economy: player.profiles?.bowling_economy?.toString() || '',
    highest_score: player.profiles?.highest_score?.toString() || '',
    fifties: player.profiles?.fifties?.toString() || '',
    hundreds: player.profiles?.hundreds?.toString() || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse integer fields
    const updated: Player = {
      ...player,
      full_name: formData.full_name,
      email: formData.email,
      district: formData.district,
      primary_role: formData.primary_role,
      gender: formData.gender as 'male' | 'female',
      district_selections: player.district_selections ? {
        ...player.district_selections,
        status: formData.district_status as DistrictSelection['status'],
      } : {
        status: formData.district_status as DistrictSelection['status'],
        district: formData.district,
        registered_at: new Date().toISOString(),
        selected_at: null,
      },
      annual_selections: player.annual_selections ? {
        ...player.annual_selections,
        status: formData.annual_status as AnnualSelection['status'],
        profile_access: formData.annual_status === 'SELECTED' ? 'ACCESS_GRANTED' : 'DENIED',
        rank: toIntOrNull(formData.annual_rank),
      } : {
        status: formData.annual_status as AnnualSelection['status'],
        profile_access: formData.annual_status === 'SELECTED' ? 'ACCESS_GRANTED' : 'DENIED',
        rank: toIntOrNull(formData.annual_rank),
        year: new Date().getFullYear(),
      },
      profiles: {
        batting_points: toIntOrNull(formData.batting_points) ?? 0,
        bowling_points: toIntOrNull(formData.bowling_points) ?? 0,
        annual_rank: toIntOrNull(formData.annual_rank),
        height: toIntOrNull(formData.height),
        weight: toIntOrNull(formData.weight),
        school: formData.school || null,
        dob: formData.dob || null,
        preferred_format: formData.preferred_format,
        avatar_url: player.profiles?.avatar_url,
        matches: toIntOrNull(formData.matches),
        runs: toIntOrNull(formData.runs),
        wickets: toIntOrNull(formData.wickets),
        best_bowling: formData.best_bowling || null,
        batting_strike_rate: toFloatOrNull(formData.batting_strike_rate),
        bowling_economy: toFloatOrNull(formData.bowling_economy),
        highest_score: toIntOrNull(formData.highest_score),
        fifties: toIntOrNull(formData.fifties),
        hundreds: toIntOrNull(formData.hundreds),
      },
    };
    onSave(updated);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="sticky top-0 bg-gray-800 p-6 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-yellow-400">Edit Player</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Avatar Upload */}
          <div className="mb-4 flex items-center gap-4">
            <div className="relative w-16 h-16">
              {player.profiles?.avatar_url ? (
                <Image src={player.profiles.avatar_url} alt="avatar" fill className="rounded-full object-cover" />
              ) : (
                <div className="w-full h-full rounded-full bg-gray-600 flex items-center justify-center text-2xl">
                  {player.gender === 'male' ? '♂' : '♀'}
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  await onAvatarUpload(player.id, file);
                }
              }}
              disabled={uploading}
              className="text-sm text-gray-300"
            />
            {uploading && <span className="text-yellow-400">Uploading...</span>}
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-300 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">District</label>
                <select
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Primary Role</label>
                <select
                  name="primary_role"
                  value={formData.primary_role}
                  onChange={handleChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="Batter">Batter</option>
                  <option value="Bowler">Bowler</option>
                  <option value="All-Rounder">All-Rounder</option>
                  <option value="Wicket-Keeper">Wicket-Keeper</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="male">Boys</option>
                  <option value="female">Girls</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-300 mb-4">Selection Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">District Status</label>
                <select
                  name="district_status"
                  value={formData.district_status}
                  onChange={handleChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="REGISTERED">REGISTERED</option>
                  <option value="SELECTED">SELECTED</option>
                  <option value="DENIED">DENIED</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Annual Status</label>
                <select
                  name="annual_status"
                  value={formData.annual_status}
                  onChange={handleChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="NOT_YET_ELIGIBLE">NOT YET ELIGIBLE</option>
                  <option value="SELECTED">SELECTED</option>
                  <option value="NOT_SELECTED">NOT SELECTED</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Annual Rank</label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  max="750"
                  name="annual_rank"
                  value={formData.annual_rank}
                  onChange={handleChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-300 mb-4">Profile Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Batting Points</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  name="batting_points"
                  value={formData.batting_points}
                  onChange={handleChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Bowling Points</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  name="bowling_points"
                  value={formData.bowling_points}
                  onChange={handleChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Height (cm)</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-1">School</label>
                <input
                  type="text"
                  name="school"
                  value={formData.school}
                  onChange={handleChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Preferred Format</label>
                <select
                  name="preferred_format"
                  value={formData.preferred_format}
                  onChange={handleChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="Test">Test</option>
                  <option value="ODI">ODI</option>
                  <option value="T20">T20</option>
                  <option value="All Formats">All Formats</option>
                </select>
              </div>
            </div>
          </div>

         
          <div>
            <h3 className="text-lg font-semibold text-gray-300 mb-4">Cricket Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Matches</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  name="matches"
                  value={formData.matches}
                  onChange={handleChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Runs</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  name="runs"
                  value={formData.runs}
                  onChange={handleChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Highest Score</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  name="highest_score"
                  value={formData.highest_score}
                  onChange={handleChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Batting Strike Rate</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="batting_strike_rate"
                  value={formData.batting_strike_rate}
                  onChange={handleChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Wickets</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  name="wickets"
                  value={formData.wickets}
                  onChange={handleChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Best Bowling</label>
                <input
                  type="text"
                  name="best_bowling"
                  value={formData.best_bowling}
                  onChange={handleChange}
                  placeholder="e.g. 5/30"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Bowling Economy</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="bowling_economy"
                  value={formData.bowling_economy}
                  onChange={handleChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Fifties</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  name="fifties"
                  value={formData.fifties}
                  onChange={handleChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Hundreds</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  name="hundreds"
                  value={formData.hundreds}
                  onChange={handleChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
            <button type="button" onClick={onClose} className="px-6 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 transition" disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-black font-semibold rounded-lg transition disabled:opacity-50" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TestScoresModal({ player, initialData, loading, onSave, onClose, saving }: {
  player: Player;
  initialData: TestData | null;
  loading: boolean;
  onSave: (data: any) => void;
  onClose: () => void;
  saving: boolean;
}) {
  const role = player.primary_role;

  const defaultForm = {
    fitness: { passed: false, run_time_seconds: '' },
    medical: { passed: false, notes: '' },
    mental: { score: '0' },
    batting: { score: '0' },
    bowling: { score: '0' },
    fielding: { score: '0' },
    wicketkeeping: { score: '0' },
  };

  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    if (initialData) {
      setForm({
        fitness: {
          passed: initialData.fitness_tests?.passed || false,
          run_time_seconds: initialData.fitness_tests?.run_time_seconds?.toString() || '',
        },
        medical: {
          passed: initialData.medical_checks?.passed || false,
          notes: initialData.medical_checks?.notes || '',
        },
        mental: {
          score: initialData.mental_quizzes?.score?.toString() || '0',
        },
        batting: {
          score: initialData.batting_tests?.score?.toString() || '0',
        },
        bowling: {
          score: initialData.bowling_tests?.score?.toString() || '0',
        },
        fielding: {
          score: initialData.fielding_tests?.score?.toString() || '0',
        },
        wicketkeeping: {
          score: initialData.wicketkeeping_tests?.score?.toString() || '0',
        },
      });
    }
  }, [initialData]);

  const handleChange = (category: string, field: string, value: any) => {
    setForm((prev) => ({
      ...prev,
      [category]: { ...prev[category as keyof typeof prev], [field]: value },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const processed = {
      fitness: {
        ...form.fitness,
        run_time_seconds: form.fitness.run_time_seconds ? Number(form.fitness.run_time_seconds) : undefined,
      },
      medical: form.medical,
      mental: { score: parseInt(form.mental.score, 10) || 0 },
      batting: { score: parseInt(form.batting.score, 10) || 0 },
      bowling: { score: parseInt(form.bowling.score, 10) || 0 },
      fielding: { score: parseInt(form.fielding.score, 10) || 0 },
      wicketkeeping: { score: parseInt(form.wicketkeeping.score, 10) || 0 },
    };
    onSave(processed);
  };

  const battingMax = role === 'Batter' ? 40 : (role === 'All-Rounder' || role === 'Wicket-Keeper' ? 20 : 0);
  const bowlingMax = role === 'Bowler' ? 40 : (role === 'All-Rounder' ? 20 : 0);
  const fieldingMax = 20;
  const wicketkeepingMax = role === 'Wicket-Keeper' ? 20 : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="sticky top-0 bg-gray-800 p-6 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-yellow-400">Test Scores for {player.full_name}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
            <p className="mt-2 text-gray-400">Loading test data...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
           
            <div className="border border-gray-700 p-4 rounded">
              <h3 className="text-lg font-semibold mb-2 text-yellow-400">Fitness Test (2km run within 8 min)</h3>
              <div className="flex items-center gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={form.fitness.passed}
                    onChange={(e) => handleChange('fitness', 'passed', e.target.checked)}
                    className="mr-2"
                  />
                  Passed (award 20 points)
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  placeholder="Run time (seconds)"
                  value={form.fitness.run_time_seconds}
                  onChange={(e) => handleChange('fitness', 'run_time_seconds', e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded px-3 py-2 w-40"
                />
              </div>
            </div>

        
            <div className="border border-gray-700 p-4 rounded">
              <h3 className="text-lg font-semibold mb-2 text-yellow-400">Medical Check-up</h3>
              <div className="flex items-center gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={form.medical.passed}
                    onChange={(e) => handleChange('medical', 'passed', e.target.checked)}
                    className="mr-2"
                  />
                  Passed
                </label>
                <input
                  type="text"
                  placeholder="Notes"
                  value={form.medical.notes}
                  onChange={(e) => handleChange('medical', 'notes', e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded px-3 py-2 flex-1"
                />
              </div>
            </div>

         
            <div className="border border-gray-700 p-4 rounded">
              <h3 className="text-lg font-semibold mb-2 text-yellow-400">Mental Capacity Quiz (0-10)</h3>
              <input
                type="number"
                step="1"
                min="0"
                max="10"
                value={form.mental.score}
                onChange={(e) => handleChange('mental', 'score', e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded px-3 py-2 w-24"
              />
            </div>

   
            {battingMax > 0 && (
              <div className="border border-gray-700 p-4 rounded">
                <h3 className="text-lg font-semibold mb-2 text-yellow-400">Batting Evaluation (max {battingMax})</h3>
                <input
                  type="number"
                  step="1"
                  min="0"
                  max={battingMax}
                  value={form.batting.score}
                  onChange={(e) => handleChange('batting', 'score', e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded px-3 py-2 w-24"
                />
              </div>
            )}

            {bowlingMax > 0 && (
              <div className="border border-gray-700 p-4 rounded">
                <h3 className="text-lg font-semibold mb-2 text-yellow-400">Bowling Test (max {bowlingMax})</h3>
                <input
                  type="number"
                  step="1"
                  min="0"
                  max={bowlingMax}
                  value={form.bowling.score}
                  onChange={(e) => handleChange('bowling', 'score', e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded px-3 py-2 w-24"
                />
              </div>
            )}

        
            <div className="border border-gray-700 p-4 rounded">
              <h3 className="text-lg font-semibold mb-2 text-yellow-400">Fielding Drills (max 20)</h3>
              <input
                type="number"
                step="1"
                min="0"
                max="20"
                value={form.fielding.score}
                onChange={(e) => handleChange('fielding', 'score', e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded px-3 py-2 w-24"
              />
            </div>

         
            {wicketkeepingMax > 0 && (
              <div className="border border-gray-700 p-4 rounded">
                <h3 className="text-lg font-semibold mb-2 text-yellow-400">Wicket-keeping Drills (max 20)</h3>
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="20"
                  value={form.wicketkeeping.score}
                  onChange={(e) => handleChange('wicketkeeping', 'score', e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded px-3 py-2 w-24"
                />
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
              <button type="button" onClick={onClose} className="px-6 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 transition" disabled={saving}>
                Cancel
              </button>
              <button type="submit" className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-black font-semibold rounded-lg transition disabled:opacity-50" disabled={saving}>
                {saving ? 'Saving...' : 'Save Scores'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}