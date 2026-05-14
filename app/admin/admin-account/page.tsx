// app/admin/admin-account/page.tsx
"use client";

import React, { useState } from 'react';
import { FiUser, FiMail, FiLock, FiCalendar, FiShield, FiSave } from 'react-icons/fi';

export default function AdminAccountPage() {
  const [adminData, setAdminData] = useState({
    name: "Theekshana Heenatigala",
    email: "theekshana@admin.com",
    role: "Super Administrator",
    joinDate: "2026-01-05",
    lastLogin: "2026-03-27 10:30",
    status: "Active"
  });

  const [security, setSecurity] = useState({
    twoFactor: true,
    sessionTimeout: "30 minutes",
    loginAlerts: true
  });

  return (
    <div>
      <h1 className="text-3xl font-bold text-yellow-400 mb-6">Admin Account</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Admin Profile */}
        <div className="bg-gray-800 border border-yellow-600/20 rounded-xl p-6">
          <div className="flex items-center mb-6">
            <div className="w-20 h-20 bg-yellow-600 rounded-full flex items-center justify-center text-2xl font-bold">
              TH
            </div>
            <div className="ml-6">
              <h2 className="text-2xl font-bold">{adminData.name}</h2>
              <p className="text-gray-400">{adminData.role}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center">
              <FiMail className="text-yellow-400 mr-3" />
              <div>
                <p className="text-sm text-gray-400">Email</p>
                <p>{adminData.email}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <FiCalendar className="text-yellow-400 mr-3" />
              <div>
                <p className="text-sm text-gray-400">Joined Date</p>
                <p>{adminData.joinDate}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <FiUser className="text-yellow-400 mr-3" />
              <div>
                <p className="text-sm text-gray-400">Last Login</p>
                <p>{adminData.lastLogin}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-full bg-green-500 mr-3"></div>
              <div>
                <p className="text-sm text-gray-400">Status</p>
                <p className="text-green-400">{adminData.status}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-gray-800 border border-yellow-600/20 rounded-xl p-6">
          <h2 className="text-xl font-bold text-yellow-400 mb-6 flex items-center">
            <FiShield className="mr-2" />
            Security Settings
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-750 rounded">
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-gray-400">Add an extra layer of security</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={security.twoFactor}
                  onChange={() => setSecurity({...security, twoFactor: !security.twoFactor})}
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
              </label>
            </div>

            <div className="p-3 bg-gray-750 rounded">
              <p className="font-medium">Session Timeout</p>
              <p className="text-sm text-gray-400 mb-2">Auto logout after inactivity</p>
              <select 
                className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"
                value={security.sessionTimeout}
                onChange={(e) => setSecurity({...security, sessionTimeout: e.target.value})}
              >
                <option>15 minutes</option>
                <option>30 minutes</option>
                <option>1 hour</option>
                <option>2 hours</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-750 rounded">
              <div>
                <p className="font-medium">Login Alerts</p>
                <p className="text-sm text-gray-400">Email notifications for new logins</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={security.loginAlerts}
                  onChange={() => setSecurity({...security, loginAlerts: !security.loginAlerts})}
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
              </label>
            </div>
          </div>

          <button className="w-full mt-6 bg-yellow-600 hover:bg-yellow-700 text-white py-3 rounded-lg flex items-center justify-center font-medium">
            <FiSave className="mr-2" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}