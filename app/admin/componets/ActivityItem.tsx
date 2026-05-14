// app/admin/components/ActivityItem.tsx
import React from 'react';
import { FiUser } from 'react-icons/fi';
import { UserActivity } from '../types';

interface ActivityItemProps {
  activity: UserActivity;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ activity }) => {
  const getStatusColor = (status: UserActivity['status']) => {
    switch (status) {
      case 'active': return 'bg-green-900/30 text-green-400';
      case 'completed': return 'bg-blue-900/30 text-blue-400';
      case 'pending': return 'bg-yellow-900/30 text-yellow-400';
      default: return 'bg-gray-900/30 text-gray-400';
    }
  };

  return (
    <div className="flex items-center justify-between p-3 hover:bg-gray-750 rounded-lg transition-colors">
      <div className="flex items-center">
        <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center mr-3">
          <FiUser />
        </div>
        <div>
          <p className="font-medium">{activity.user}</p>
          <p className="text-sm text-gray-400">{activity.action}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm text-gray-400">{activity.time}</p>
        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(activity.status)}`}>
          {activity.status}
        </span>
      </div>
    </div>
  );
};

export default ActivityItem;