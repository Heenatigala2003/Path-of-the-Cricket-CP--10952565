// app/admin/upcoming-talents/page.tsx
"use client";

import React, { useState } from 'react';
import { FiStar, FiTrendingUp, FiEye, FiMessageSquare, FiFilter } from 'react-icons/fi';

export default function UpcomingTalentsPage() {
  const [talents, setTalents] = useState([
    { id: 1, name: 'Alex Johnson', age: 19, skill: 'Football', rating: 4.8, scouts: 24, status: 'Rising' },
    { id: 2, name: 'Maria Garcia', age: 21, skill: 'Basketball', rating: 4.9, scouts: 32, status: 'Hot' },
    { id: 3, name: 'David Chen', age: 20, skill: 'Tennis', rating: 4.6, scouts: 18, status: 'Promising' },
    { id: 4, name: 'Sarah Miller', age: 22, skill: 'Swimming', rating: 4.7, scouts: 21, status: 'Rising' },
    { id: 5, name: 'James Wilson', age: 18, skill: 'Athletics', rating: 4.5, scouts: 15, status: 'New' },
    { id: 6, name: 'Lisa Brown', age: 19, skill: 'Volleyball', rating: 4.8, scouts: 28, status: 'Hot' },
  ]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-yellow-400 mb-6">Upcoming Talents</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-800 border border-yellow-600/20 rounded-xl p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-2">156</div>
            <p className="text-gray-400">Total Talents</p>
          </div>
        </div>
        
        <div className="bg-gray-800 border border-red-600/20 rounded-xl p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-red-400 mb-2">24</div>
            <p className="text-gray-400">Hot Prospects</p>
          </div>
        </div>
        
        <div className="bg-gray-800 border border-green-600/20 rounded-xl p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">45</div>
            <p className="text-gray-400">Signed This Month</p>
          </div>
        </div>
        
        <div className="bg-gray-800 border border-blue-600/20 rounded-xl p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">4.7</div>
            <p className="text-gray-400">Average Rating</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-gray-800 border border-yellow-600/20 rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <button className="flex items-center px-4 py-2 border border-yellow-600 text-yellow-400 rounded-lg hover:bg-yellow-600/10">
            <FiFilter className="mr-2" />
            Filter by Sport
          </button>
          <button className="flex items-center px-4 py-2 border border-yellow-600 text-yellow-400 rounded-lg hover:bg-yellow-600/10">
            <FiFilter className="mr-2" />
            Filter by Age
          </button>
          <button className="flex items-center px-4 py-2 border border-yellow-600 text-yellow-400 rounded-lg hover:bg-yellow-600/10">
            <FiFilter className="mr-2" />
            Filter by Rating
          </button>
        </div>
      </div>

      {/* Talents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {talents.map(talent => (
          <div key={talent.id} className="bg-gray-800 border border-yellow-600/20 rounded-xl p-6 hover:border-yellow-600/40 transition-colors">
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 bg-yellow-600 rounded-full flex items-center justify-center text-xl font-bold mr-4">
                {talent.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-bold">{talent.name}</h3>
                <p className="text-gray-400">{talent.skill} • Age: {talent.age}</p>
              </div>
            </div>
            
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FiStar className="mr-2 text-yellow-400" />
                  <span className="text-gray-400">Rating:</span>
                </div>
                <span className="font-bold">{talent.rating}/5.0</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FiEye className="mr-2 text-blue-400" />
                  <span className="text-gray-400">Scouts Viewing:</span>
                </div>
                <span className="font-bold">{talent.scouts}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FiTrendingUp className="mr-2 text-green-400" />
                  <span className="text-gray-400">Status:</span>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  talent.status === 'Hot' ? 'bg-red-900/30 text-red-400' :
                  talent.status === 'Rising' ? 'bg-yellow-900/30 text-yellow-400' :
                  talent.status === 'Promising' ? 'bg-blue-900/30 text-blue-400' :
                  'bg-green-900/30 text-green-400'
                }`}>
                  {talent.status}
                </span>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded">
                View Profile
              </button>
              <button className="flex-1 py-2 bg-yellow-600 hover:bg-yellow-700 rounded flex items-center justify-center">
                <FiMessageSquare className="mr-2" />
                Contact
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}