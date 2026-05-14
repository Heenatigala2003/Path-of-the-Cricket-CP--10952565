// app/admin/components/StatCard.tsx
import React from 'react';
import { StatCard as StatCardType } from '../types';

interface StatCardProps {
  stat: StatCardType;
}

const StatCard: React.FC<StatCardProps> = ({ stat }) => {
  return (
    <div className="bg-gray-800 border border-yellow-600/20 rounded-xl p-5 hover:border-yellow-600/40 transition-colors">
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
  );
};

export default StatCard;