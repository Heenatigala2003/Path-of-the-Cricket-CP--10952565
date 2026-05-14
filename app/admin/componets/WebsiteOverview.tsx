// app/admin/components/WebsiteOverview.tsx
import React from 'react';
import { FiChevronDown } from 'react-icons/fi';
import { WebsiteStats } from '../types';

interface WebsiteOverviewProps {
  stats: WebsiteStats;
}

const WebsiteOverview: React.FC<WebsiteOverviewProps> = ({ stats }) => {
  return (
    <div className="bg-gray-800 border border-yellow-600/20 rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-yellow-400">Website Overview</h2>
        <button className="text-yellow-400 hover:text-yellow-300 text-sm flex items-center">
          View Site Analytics <FiChevronDown className="ml-1" />
        </button>
      </div>
      
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-300">User Activity Stats</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-750 rounded-lg p-4">
            <p className="text-sm text-gray-400">Sessions</p>
            <p className="text-2xl font-bold">{stats.sessions}%</p>
          </div>
          <div className="bg-gray-750 rounded-lg p-4">
            <p className="text-sm text-gray-400">New Users</p>
            <p className="text-2xl font-bold">{stats.newUsers}%</p>
          </div>
          <div className="bg-gray-750 rounded-lg p-4">
            <p className="text-sm text-gray-400">Returning Users</p>
            <p className="text-2xl font-bold">{stats.returningUsers}%</p>
          </div>
          <div className="bg-gray-750 rounded-lg p-4">
            <p className="text-sm text-gray-400">Registrations</p>
            <p className="text-2xl font-bold">{stats.registrations}</p>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="font-semibold text-gray-300 mb-3">Traffic & Engagement</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Logins</span>
              <span className="text-yellow-400">{stats.logins}</span>
            </div>
            <div className="flex justify-between">
              <span>Posts</span>
              <span className="text-yellow-400">{stats.posts}</span>
            </div>
            <div className="flex justify-between">
              <span>Comments</span>
              <span className="text-yellow-400">{stats.comments}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebsiteOverview;