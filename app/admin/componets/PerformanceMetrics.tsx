// app/admin/components/PerformanceMetrics.tsx
import React from 'react';
import { FaChartLine, FaUserPlus, FaUserFriends } from 'react-icons/fa';

const PerformanceMetrics = () => {
  const metrics = [
    {
      title: 'Sessions',
      value: '65%',
      icon: <FaChartLine className="text-blue-500" />,
      color: 'bg-blue-900/30',
      progress: 65,
    },
    {
      title: 'New Users',
      value: '25%',
      icon: <FaUserPlus className="text-green-500" />,
      color: 'bg-green-900/30',
      progress: 25,
    },
    {
      title: 'Returning Users',
      value: '10%',
      icon: <FaUserFriends className="text-purple-500" />,
      color: 'bg-purple-900/30',
      progress: 10,
    },
  ];

  return (
    <div className="space-y-6">
      {metrics.map((metric, index) => (
        <div key={index} className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${metric.color}`}>
                {metric.icon}
              </div>
              <div>
                <p className="font-medium">{metric.title}</p>
                <p className="text-2xl font-bold">{metric.value}</p>
              </div>
            </div>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-600"
              style={{ width: `${metric.progress}%` }}
            ></div>
          </div>
        </div>
      ))}
      
      {/* Additional Metrics */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="bg-gray-900 p-4 rounded-lg">
          <p className="text-sm text-gray-400">Conversion Rate</p>
          <p className="text-2xl font-bold text-white">4.8%</p>
          <p className="text-green-500 text-sm mt-1">+1.2%</p>
        </div>
        <div className="bg-gray-900 p-4 rounded-lg">
          <p className="text-sm text-gray-400">Avg. Session</p>
          <p className="text-2xl font-bold text-white">4m 32s</p>
          <p className="text-green-500 text-sm mt-1">+0:45</p>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMetrics;