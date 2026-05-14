
"use client";

import React from 'react';
import { 
  FiUsers, FiEye, FiDollarSign, FiBarChart2, 
  FiTrendingUp, FiActivity, FiStar, FiAward,
  FiFilm, FiCalendar, FiMessageSquare, FiTarget
} from 'react-icons/fi';

export default function DashboardPage() {
  const statCards = [
    { title: 'Active Users', value: '1,245', change: '+12%', icon: <FiUsers /> },
    { title: 'Page Views', value: '45,678', change: '+8%', icon: <FiEye /> },
    { title: 'Revenue', value: '$12,450', change: '+15%', icon: <FiDollarSign /> },
    { title: 'Transactions', value: '345', change: '+5%', icon: <FiBarChart2 /> },
    { title: 'Conversion Rate', value: '3.2%', change: '+0.8%', icon: <FiTrendingUp /> },
    { title: 'Sessions', value: '65%', change: '+4%', icon: <FiActivity /> }
  ];

  const websiteStats = {
    sessions: 65,
    newUsers: 25,
    returningUsers: 10,
    registrations: 320,
    logins: 145,
    posts: 45,
    comments: 89
  };

  return (
    <>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-yellow-400 mb-2">Admin Dashboard</h1>
        <p className="text-gray-400">Welcome back, Theekshana Heenatigala. Here's what's happening with your platform.</p>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-gray-800 border border-yellow-600/20 rounded-xl p-5 hover:border-yellow-600/40 transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-sm">{stat.title}</p>
                <p className="text-2xl font-bold mt-2">{stat.value}</p>
              </div>
              <div className="p-3 bg-yellow-600/20 rounded-lg">
                {stat.icon}
              </div>
            </div>
            <div className="mt-4">
              <span className="text-green-400 text-sm">{stat.change} from last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Performance Metrics */}
      <div className="bg-gray-800 border border-yellow-600/20 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-bold text-yellow-400 mb-6">Performance Metrics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4">
            <div className="text-3xl font-bold text-yellow-400 mb-2">65%</div>
            <p className="text-gray-400">Session Rate</p>
          </div>
          <div className="text-center p-4">
            <div className="text-3xl font-bold text-green-400 mb-2">25%</div>
            <p className="text-gray-400">New Users</p>
          </div>
          <div className="text-center p-4">
            <div className="text-3xl font-bold text-blue-400 mb-2">10%</div>
            <p className="text-gray-400">Returning Users</p>
          </div>
          <div className="text-center p-4">
            <div className="text-3xl font-bold text-purple-400 mb-2">95%</div>
            <p className="text-gray-400">Uptime</p>
          </div>
        </div>
      </div>

      {/* Quick Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 border border-yellow-600/20 rounded-xl p-6">
          <h3 className="font-bold text-yellow-400 mb-4">Upcoming Talents</h3>
          <div className="space-y-3">
            {['John Smith', 'Sarah Johnson', 'Mike Wilson'].map((name, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 hover:bg-gray-750 rounded">
                <span>{name}</span>
                <FiStar className="text-yellow-400" />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 border border-yellow-600/20 rounded-xl p-6">
          <h3 className="font-bold text-yellow-400 mb-4">Recent Workshops</h3>
          <div className="space-y-3">
            {[
              { name: 'Web Development', date: 'Tomorrow' },
              { name: 'Digital Marketing', date: 'Next Week' },
              { name: 'UI/UX Design', date: 'In 2 Weeks' }
            ].map((workshop, idx) => (
              <div key={idx} className="p-2 hover:bg-gray-750 rounded">
                <p className="font-medium">{workshop.name}</p>
                <p className="text-sm text-gray-400">Starts: {workshop.date}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 border border-yellow-600/20 rounded-xl p-6">
          <h3 className="font-bold text-yellow-400 mb-4">Recent Achievements</h3>
          <div className="space-y-3">
            {[
              '100K Users Milestone',
              'Best Platform Award 2024',
              'New Workshop Launch'
            ].map((achievement, idx) => (
              <div key={idx} className="p-2 hover:bg-gray-750 rounded flex items-center">
                <FiAward className="text-yellow-400 mr-2" />
                <span>{achievement}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}