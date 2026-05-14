// app/admin/selections/components/PlayerSelectionPanel.tsx
'use client';

import { useState } from 'react';
import { Search, Filter, RefreshCw, UserCheck, UserX } from 'lucide-react';

interface Player {
  id: string;
  full_name: string;
  email: string;
  district: string;
  gender: 'male' | 'female';
  primary_role: string;
  status: string;
  annual_rank?: number;
  created_at?: string;
}

interface PlayerSelectionPanelProps {
  players: Player[];
  selectedPlayers: Player[];
  loading: boolean;
  onSelectPlayer: (playerId: string, select: boolean) => Promise<void>;
  onRefresh: () => Promise<void>;
}

export default function PlayerSelectionPanel({
  players,
  selectedPlayers,
  loading,
  onSelectPlayer,
  onRefresh
}: PlayerSelectionPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedGender, setSelectedGender] = useState<'all' | 'male' | 'female'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'SELECTED' | 'REGISTERED'>('all');

  const districts = Array.from(new Set(players.map(p => p.district))).filter(Boolean);

  const filteredPlayers = players.filter(player => {
    const matchesSearch = 
      player.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.district?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDistrict = !selectedDistrict || player.district === selectedDistrict;
    const matchesGender = selectedGender === 'all' || player.gender === selectedGender;
    const matchesStatus = statusFilter === 'all' || player.status === statusFilter;
    
    return matchesSearch && matchesDistrict && matchesGender && matchesStatus;
  });

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Player Selection</h2>
          <p className="text-gray-600">Select players for district selections</p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search players..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full px-4 py-2 border rounded-lg"
          />
        </div>
        
        <select
          value={selectedDistrict}
          onChange={(e) => setSelectedDistrict(e.target.value)}
          className="border rounded-lg px-4 py-2"
        >
          <option value="">All Districts</option>
          {districts.map(district => (
            <option key={district} value={district}>{district}</option>
          ))}
        </select>
        
        <select
          value={selectedGender}
          onChange={(e) => setSelectedGender(e.target.value as any)}
          className="border rounded-lg px-4 py-2"
        >
          <option value="all">All Genders</option>
          <option value="male">Boys</option>
          <option value="female">Girls</option>
        </select>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="border rounded-lg px-4 py-2"
        >
          <option value="all">All Status</option>
          <option value="SELECTED">Selected</option>
          <option value="REGISTERED">Registered</option>
        </select>
      </div>

      {/* Players Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                District
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Gender
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading players...</p>
                </td>
              </tr>
            ) : filteredPlayers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  No players found
                </td>
              </tr>
            ) : (
              filteredPlayers.map((player) => (
                <tr key={player.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{player.full_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-600">{player.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                      {player.district}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      player.gender === 'male' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-pink-100 text-pink-800'
                    }`}>
                      {player.gender === 'male' ? 'Boy' : 'Girl'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded">
                      {player.primary_role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      player.status === 'SELECTED'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {player.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {player.status === 'SELECTED' ? (
                      <button
                        onClick={() => onSelectPlayer(player.id, false)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                      >
                        <UserX className="h-3 w-3" />
                        Deselect
                      </button>
                    ) : (
                      <button
                        onClick={() => onSelectPlayer(player.id, true)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                      >
                        <UserCheck className="h-3 w-3" />
                        Select
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Selection Criteria */}
      <div className="mt-8 bg-gray-50 p-6 rounded-xl">
        <h3 className="text-xl font-bold mb-4 text-gray-900">Selection Criteria</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-blue-600 mb-2">Boys Selection</h4>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span>Maximum 30 players per district</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span>Based on district registration order</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span>First come, first served basis</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-pink-600 mb-2">Girls Selection</h4>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-pink-600 rounded-full"></div>
                <span>Maximum 30 players per district</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-pink-600 rounded-full"></div>
                <span>Based on district registration order</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-pink-600 rounded-full"></div>
                <span>First come, first served basis</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}