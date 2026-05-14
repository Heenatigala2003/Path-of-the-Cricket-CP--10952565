
"use client";

import React, { useState } from 'react';
import { 
  FiUser, FiBell, FiAlertCircle, FiActivity, 
  FiGlobe, FiUsers, FiList, FiCalendar, 
  FiAward, FiDollarSign, FiBarChart2, FiStar,
  FiHome, FiTrendingUp, FiTarget, FiFilm,
  FiInfo, FiFileText, FiCheckCircle, FiChevronDown,
  FiMenu, FiX, FiEye, FiLogOut, FiSettings,
  FiMessageSquare
} from 'react-icons/fi';
import { 
  MdOutlineWorkspaces, MdOutlineEmojiEvents,
  MdOutlineNewspaper, MdOutlineDashboard 
} from 'react-icons/md';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const pathname = usePathname();

  const adminProfile = {
    name: "Theekshana Heenatigala",
    role: "Admin",
    email: "pdtheenatigala@gmail.com",
    avatar: "TH",
    joinDate: "2025-12-15"
  };

  const alerts = [
    { id: 1, type: 'error', message: 'Server timeout on API endpoint', time: '10 min ago' },
    { id: 2, type: 'warning', message: 'High memory usage detected', time: '25 min ago' },
    { id: 3, type: 'info', message: 'New user registration spike', time: '1 hour ago' },
    { id: 4, type: 'success', message: 'Backup completed successfully', time: '2 hours ago' },
    { id: 5, type: 'warning', message: 'SSL certificate expiring soon', time: '5 hours ago' }
  ];

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <MdOutlineDashboard />, path: '/admin' },
    { id: 'admin-account', label: 'Admin Account', icon: <FiUser />, path: '/admin/admin-account' },
    { id: 'user-profiles', label: 'User Profiles', icon: <FiUsers />, path: '/admin/users' },
    { id: 'selections', label: 'Selections', icon: <FiList />, path: '/admin/selections' },
    { id: 'workshops', label: 'Workshops', icon: <MdOutlineWorkspaces />, path: '/admin/workshops' },
    { id: 'matches', label: 'Matches', icon: <MdOutlineEmojiEvents />, path: '/admin/showcases' },
    { id: 'rankings', label: 'Rankings', icon: <FiAward />, path: '/admin/rankings' },
    { id: 'sponsorship', label: 'Sponsorship', icon: <FiDollarSign />, path: '/admin/sponsorship' },
    { id: 'portfolio', label: 'portfolio', icon: <FiFilm />, path: '/admin/portfolio' },
    { id: 'upcoming-talents', label: 'Upcoming Talents', icon: <FiStar />, path: '/admin/upcoming-talents' },
    { id: 'about-us', label: 'About Us', icon: <FiInfo />, path: '/admin/service-portal' },
    { id: 'gallery', label: 'gallery', icon: <FiUser />, path: '/admin/gallery' },
    { id: 'achievements', label: 'Achievements', icon: <FiCheckCircle />, path: '/admin/achievements' },
    { id: 'footer', label: 'Footer', icon: <FiHome />, path: '/admin/footer' },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
    
      <nav className="bg-gray-800 border-b border-yellow-600/20 sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-md text-gray-400 hover:text-yellow-500 hover:bg-gray-700 lg:hidden"
              >
                {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
              
              <div className="flex items-center ml-4">
                <FiGlobe className="h-8 w-8 text-yellow-500" />
                <span className="ml-2 text-xl font-bold text-yellow-400">Admin Panel</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
           
              <div className="relative">
                <button
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowErrors(false);
                  }}
                  className="p-2 rounded-full hover:bg-gray-700 relative"
                >
                  <FiBell size={22} />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-gray-800 border border-yellow-600/30 rounded-lg shadow-xl">
                    <div className="p-4 border-b border-gray-700">
                      <h3 className="font-semibold text-yellow-400">Notifications (5)</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {alerts.map(alert => (
                        <div key={alert.id} className="p-4 border-b border-gray-700 hover:bg-gray-750">
                          <div className="flex items-start">
                            <div className={`p-2 rounded-full mr-3 ${
                              alert.type === 'error' ? 'bg-red-900/30 text-red-400' :
                              alert.type === 'warning' ? 'bg-yellow-900/30 text-yellow-400' :
                              alert.type === 'success' ? 'bg-green-900/30 text-green-400' : 'bg-blue-900/30 text-blue-400'
                            }`}>
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
                      <Link href="/admin/notifications" className="text-yellow-400 hover:text-yellow-300 text-sm font-medium">
                        View All Activities
                      </Link>
                    </div>
                  </div>
                )}
              </div>

            
              <div className="relative">
                <button
                  onClick={() => {
                    setShowErrors(!showErrors);
                    setShowNotifications(false);
                  }}
                  className="p-2 rounded-full hover:bg-gray-700"
                >
                  <FiAlertCircle size={22} />
                </button>
                
                {showErrors && (
                  <div className="absolute right-0 mt-2 w-80 bg-gray-800 border border-red-600/30 rounded-lg shadow-xl">
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

              <Link 
                href="/admin/user-activities" 
                className="flex items-center px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors"
              >
                <FiActivity className="mr-2" />
                <span>User Activities</span>
              </Link>

            
              <a 
                href="/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center px-4 py-2 border border-yellow-600 text-yellow-400 hover:bg-yellow-600/10 rounded-lg transition-colors"
              >
                <FiGlobe className="mr-2" />
                View Website
              </a>

            
              <div className="relative group">
                <button className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center">
                    <span className="font-bold">TH</span>
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium">{adminProfile.name}</p>
                    <p className="text-xs text-gray-400">{adminProfile.role}</p>
                  </div>
                  <FiChevronDown className="hidden md:block" />
                </button>
                
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-yellow-600/30 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <div className="p-4 border-b border-gray-700">
                    <p className="font-medium">{adminProfile.name}</p>
                    <p className="text-sm text-gray-400">{adminProfile.email}</p>
                  </div>
                  <div className="p-2">
                    <Link 
                      href="/admin/admin-account" 
                      className="w-full text-left px-3 py-2 hover:bg-gray-700 rounded flex items-center"
                    >
                      <FiSettings className="mr-2" />
                      Settings
                    </Link>
                    <button className="w-full text-left px-3 py-2 hover:bg-gray-700 rounded flex items-center">
                      <FiLogOut className="mr-2" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
       
        <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-gray-800 border-r border-yellow-600/20 min-h-screen transition-all duration-300 overflow-hidden lg:w-64`}>
          <div className="p-4">
            <div className="mb-8 p-4 bg-gray-750 rounded-lg">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center mr-3">
                  <span className="font-bold text-lg">TH</span>
                </div>
                <div>
                  <h3 className="font-bold text-yellow-400">{adminProfile.name}</h3>
                  <p className="text-sm text-gray-400">Administrator</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">Joined: {adminProfile.joinDate}</p>
            </div>

            <nav className="space-y-1">
              {navItems.map(item => (
                <Link
                  key={item.id}
                  href={item.path}
                  className={`w-full flex items-center px-4 py-3 rounded-lg transition-all ${
                    pathname === item.path
                      ? 'bg-yellow-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-yellow-400'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>

      
    </div>
  );
}