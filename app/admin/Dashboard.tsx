'use client';

import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import MainContent from '../components/MainContent';
import Footer from '../components/Footer';

export default function AdminDashboard() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex">
        <div className="w-64 bg-gray-800 h-screen"></div>
        <div className="flex-1">
          <div className="h-16 bg-gray-800"></div>
          <div className="p-6">
            <div className="h-8 bg-gray-800 rounded w-64 mb-8"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <TopBar />
          <MainContent />
        </div>
      </div>
      <Footer />
    </div>
  );
}