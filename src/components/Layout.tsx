import React, { useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import QuickStats from './QuickStats';
import AboutFooter from './AboutFooter';
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowLeftIcon,
  UserCircleIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

interface LayoutProps {
  userName?: string;
  onLogout?: () => void;
  onBack?: () => void;
  showBackButton?: boolean;
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ 
  userName, 
  onLogout,
  onBack,
  showBackButton = false
}) => {
  const navigate = useNavigate();

  const navigationItems = [
    { icon: <HomeIcon className="w-6 h-6" />, label: 'Dashboard', path: '/dashboard' },
    { icon: <ClipboardDocumentListIcon className="w-6 h-6" />, label: 'Projects', path: '/projects' },
    { icon: <UserGroupIcon className="w-6 h-6" />, label: 'Team', path: '/team' },
    { icon: <CurrencyDollarIcon className="w-6 h-6" />, label: 'Financial', path: '/financial' },
    { icon: <ChartBarIcon className="w-6 h-6" />, label: 'Reports', path: '/reports' },
  ];

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  
  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-20 right-0 bg-white shadow-sm h-16 flex items-center justify-between px-6 z-10">
        <div className="flex items-center space-x-8">
          <img src="/image/logo.svg" alt="OneFlow" className="h-8 w-auto" />
          <QuickStats />
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
            >
              <span className="text-sm font-medium">{userName}</span>
              <UserCircleIcon className="w-8 h-8" />
            </button>
            
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
                <button
                  onClick={() => {
                    setShowProfileSettings(true);
                    setShowProfileMenu(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Settings
                </button>
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Side Navigation */}
      <div className="w-20 bg-gray-900 min-h-screen flex flex-col items-center py-8 fixed left-0 top-0 bottom-0">
        {showBackButton && (
          <button 
            onClick={onBack} 
            className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
        )}
        
        {navigationItems.map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-white mb-4 transition-colors rounded-lg hover:bg-gray-800"
            title={item.label}
          >
            {item.icon}
          </button>
        ))}

        <div className="mt-auto">
          {userName && (
            <div className="flex flex-col items-center">
              <button 
                className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
                title="Settings"
              >
                <Cog6ToothIcon className="w-6 h-6" />
              </button>
              <button 
                className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
                title={userName}
              >
                <UserCircleIcon className="w-6 h-6" />
              </button>
              {onLogout && (
                <button 
                  onClick={onLogout}
                  className="text-xs text-gray-400 hover:text-white mt-2 transition-colors"
                >
                  Logout
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-20 mt-16 p-6 flex flex-col">
        <div className="flex-1">
          <Outlet />
        </div>
        <AboutFooter />
      </div>

      {/* Profile Settings Modal */}
      {showProfileSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowProfileSettings(false)}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-4">Profile Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <div className="mt-1">
                  <input
                    type="text"
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={userName}
                    readOnly
                  />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => setShowProfileSettings(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => setShowProfileSettings(false)}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;