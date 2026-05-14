// app/admin/components/Sidebar.tsx
import React from 'react';
import { 
  FiUser, FiList, FiAward, FiDollarSign, FiFilm, 
  FiStar, FiInfo, FiCheckCircle, FiHome, FiUsers,
  FiMenu, FiX
} from 'react-icons/fi';
import { 
  MdOutlineWorkspaces, MdOutlineEmojiEvents,
  MdOutlineNewspaper, MdOutlineDashboard 
} from 'react-icons/md';
import { adminProfile, navItems } from '../data';

interface SidebarProps {
  isOpen: boolean;
  activeTab: string;
  onToggle: () => void;
  onTabChange: (tab: string) => void;
}

// Icon mapping
const iconMap: Record<string, React.ReactNode> = {
  'dashboard': <MdOutlineDashboard />,
  'admin-account': <FiUser />,
  'user-profiles': <FiUsers />,
  'selections': <FiList />,
  'workshops': <MdOutlineWorkspaces />,
  'matches': <MdOutlineEmojiEvents />,
  'rankings': <FiAward />,
  'sponsorship': <FiDollarSign />,
  'match-highlight': <FiFilm />,
  'upcoming-talents': <FiStar />,
  'about-us': <FiInfo />,
  'news-articles': <MdOutlineNewspaper />,
  'achievements': <FiCheckCircle />,
  'footer': <FiHome />,
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, activeTab, onToggle, onTabChange }) => {
  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={onToggle}
        className="p-2 rounded-md text-gray-400 hover:text-yellow-500 hover:bg-gray-700 lg:hidden fixed top-4 left-4 z-50 bg-gray-800"
      >
        {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>
      
      {/* Sidebar */}
      <aside className={`${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} fixed lg:static bg-gray-800 border-r border-yellow-600/20 min-h-screen transition-transform duration-300 w-64 z-40`}>
        <div className="p-4 pt-20 lg:pt-4">
          <div className="mb-8 p-4 bg-gray-750 rounded-lg">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center mr-3">
                <span className="font-bold text-lg">{adminProfile.avatar}</span>
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
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  if (window.innerWidth < 1024) {
                    onToggle();
                  }
                }}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-all ${
                  activeTab === item.id
                    ? 'bg-yellow-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-yellow-400'
                }`}
              >
                <span className="mr-3">{iconMap[item.id]}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </aside>
      
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={onToggle}
        />
      )}
    </>
  );
};

export default Sidebar;