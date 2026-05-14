// app/admin/components/TopNav.tsx
import React, { useState } from 'react';
import { FiBell, FiAlertCircle, FiActivity, FiGlobe, FiChevronDown, FiSettings, FiLogOut } from 'react-icons/fi';
import { Alert } from '../types';
import { adminProfile } from '../data';

interface TopNavProps {
  onViewWebsite: () => void;
  onShowActivities: () => void;
}

const alerts: Alert[] = [
  { id: 1, type: 'error', message: 'Server timeout on API endpoint', time: '10 min ago' },
  { id: 2, type: 'warning', message: 'High memory usage detected', time: '25 min ago' },
  { id: 3, type: 'info', message: 'New user registration spike', time: '1 hour ago' },
  { id: 4, type: 'success', message: 'Backup completed successfully', time: '2 hours ago' },
  { id: 5, type: 'warning', message: 'SSL certificate expiring soon', time: '5 hours ago' }
];

const TopNav: React.FC<TopNavProps> = ({ onViewWebsite, onShowActivities }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const getAlertIconColor = (type: Alert['type']) => {
    switch (type) {
      case 'error': return 'bg-red-900/30 text-red-400';
      case 'warning': return 'bg-yellow-900/30 text-yellow-400';
      case 'success': return 'bg-green-900/30 text-green-400';
      default: return 'bg-blue-900/30 text-blue-400';
    }
  };

  return (
    <nav className="bg-gray-800 border-b border-yellow-600/20 sticky top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex items-center ml-4">
              <FiGlobe className="h-8 w-8 text-yellow-500" />
              <span className="ml-2 text-xl font-bold text-yellow-400">Admin Panel</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Admin Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowErrors(false);
                  setShowProfile(false);
                }}
                className="p-2 rounded-full hover:bg-gray-700 relative"
                aria-label="Notifications"
              >
                <FiBell size={22} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-gray-800 border border-yellow-600/30 rounded-lg shadow-xl z-50">
                  <div className="p-4 border-b border-gray-700">
                    <h3 className="font-semibold text-yellow-400">Notifications (5)</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {alerts.map(alert => (
                      <div key={alert.id} className="p-4 border-b border-gray-700 hover:bg-gray-750">
                        <div className="flex items-start">
                          <div className={`p-2 rounded-full mr-3 ${getAlertIconColor(alert.type)}`}>
                            <FiAlertCircle />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm">{alert.message}</p>
                            <p className="text-xs text-gray-400 mt-1">{alert.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 text-center border-t border-gray-700">
                    <button className="text-yellow-400 hover:text-yellow-300 text-sm font-medium">
                      View All Activities
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Platform Errors */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowErrors(!showErrors);
                  setShowNotifications(false);
                  setShowProfile(false);
                }}
                className="p-2 rounded-full hover:bg-gray-700"
                aria-label="Platform Errors"
              >
                <FiAlertCircle size={22} />
              </button>
              
              {showErrors && (
                <div className="absolute right-0 mt-2 w-80 bg-gray-800 border border-red-600/30 rounded-lg shadow-xl z-50">
                  <div className="p-4 border-b border-gray-700">
                    <h3 className="font-semibold text-red-400">Platform Errors (3)</h3>
                  </div>
                  <div className="p-4">
                    <div className="space-y-3">
                      <div className="p-3 bg-red-900/20 border border-red-800/30 rounded">
                        <p className="text-sm">API Connection Timeout</p>
                        <p className="text-xs text-gray-400">Last occurred: 2 hours ago</p>
                      </div>
                      <div className="p-3 bg-red-900/20 border border-red-800/30 rounded">
                        <p className="text-sm">Database Query Failed</p>
                        <p className="text-xs text-gray-400">Last occurred: 1 day ago</p>
                      </div>
                      <div className="p-3 bg-red-900/20 border border-red-800/30 rounded">
                        <p className="text-sm">Memory Limit Exceeded</p>
                        <p className="text-xs text-gray-400">Last occurred: 3 days ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Activities Button */}
            <button 
              onClick={onShowActivities}
              className="flex items-center px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors"
            >
              <FiActivity className="mr-2" />
              <span>User Activities</span>
            </button>

            {/* View Website Button */}
            <button 
              onClick={onViewWebsite}
              className="flex items-center px-4 py-2 border border-yellow-600 text-yellow-400 hover:bg-yellow-600/10 rounded-lg transition-colors"
            >
              <FiGlobe className="mr-2" />
              View Website
            </button>

            {/* Admin Profile */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowProfile(!showProfile);
                  setShowNotifications(false);
                  setShowErrors(false);
                }}
                className="flex items-center space-x-3"
                aria-label="Profile"
              >
                <div className="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center">
                  <span className="font-bold">{adminProfile.avatar}</span>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium">{adminProfile.name}</p>
                  <p className="text-xs text-gray-400">{adminProfile.role}</p>
                </div>
                <FiChevronDown className="hidden md:block" />
              </button>
              
              {showProfile && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-yellow-600/30 rounded-lg shadow-xl z-50">
                  <div className="p-4 border-b border-gray-700">
                    <p className="font-medium">{adminProfile.name}</p>
                    <p className="text-sm text-gray-400">{adminProfile.email}</p>
                  </div>
                  <div className="p-2">
                    <button className="w-full text-left px-3 py-2 hover:bg-gray-700 rounded flex items-center">
                      <FiSettings className="mr-2" />
                      Settings
                    </button>
                    <button className="w-full text-left px-3 py-2 hover:bg-gray-700 rounded flex items-center">
                      <FiLogOut className="mr-2" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default TopNav;