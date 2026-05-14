'use client';

import React from 'react';
import { Users, BarChart, DollarSign, TrendingUp } from 'lucide-react';

const stats = [
  { 
    label: 'Total Users', 
    value: '2,847', 
    change: '+12%', 
    icon: Users, 
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-600'
  },
  { 
    label: 'Revenue', 
    value: '$24,580', 
    change: '+8%', 
    icon: DollarSign, 
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-600'
  },
  { 
    label: 'Page Views', 
    value: '48,923', 
    change: '+23%', 
    icon: BarChart, 
    color: 'purple',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-600'
  },
  { 
    label: 'Conversion Rate', 
    value: '3.2%', 
    change: '+2%', 
    icon: TrendingUp, 
    color: 'orange',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-600'
  },
];

export default function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-white rounded-xl shadow p-6 dashboard-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">{stat.label}</p>
              <p className="text-2xl font-bold mt-2">{stat.value}</p>
              <p className={`text-sm mt-1 ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change} from last month
              </p>
            </div>
            <div className={`p-3 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={stat.textColor} size={24} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}