import React, { useState } from 'react';
import '../styles/Pages.css';
import '../styles/Dashboard.css';
import {
  ChartBarIcon,
  FolderIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
  CurrencyDollarIcon,
  DocumentChartBarIcon,
  BellIcon,
  EllipsisVerticalIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

interface TeamProps {
  userName?: string;
  onBack?: () => void;
  onNavigate?: (view: string) => void;
  onLogout?: () => void;
  isAdmin?: boolean;
  userRole?: string;
}

const Team: React.FC<TeamProps> = ({ userName, onBack, onNavigate, onLogout, isAdmin = false, userRole = 'user' }) => {
  const [activeNav, setActiveNav] = useState<string>('Team');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <div className="page-container">
      {/* Background Video */}
      <video autoPlay loop muted playsInline className="background-video">
        <source src="/image/back.mp4" type="video/mp4" />
      </video>

      {/* Top Navigation Bar */}
      <nav className="top-navbar">
        <div className="navbar-left">
          <div className="logo">
            <h1>OneFlow</h1>
          </div>
          
          <div className="nav-links">
            <button
              type="button"
              className={`nav-link ${activeNav === 'Dashboard' ? 'active' : ''}`}
              onClick={() => { setActiveNav('Dashboard'); onNavigate?.('dashboard'); }}
            >
              <ChartBarIcon className="nav-icon" />
              <span>Dashboard</span>
            </button>
            <button
              type="button"
              className={`nav-link ${activeNav === 'Projects' ? 'active' : ''}`}
              onClick={() => { setActiveNav('Projects'); onNavigate?.('projects'); }}
            >
              <FolderIcon className="nav-icon" />
              <span>Projects</span>
            </button>
            <button
              type="button"
              className={`nav-link ${activeNav === 'Tasks' ? 'active' : ''}`}
              onClick={() => { setActiveNav('Tasks'); onNavigate?.('tasks'); }}
            >
              <ClipboardDocumentListIcon className="nav-icon" />
              <span>Tasks</span>
            </button>
            <button
              type="button"
              className={`nav-link ${activeNav === 'Team' ? 'active' : ''}`}
              onClick={() => { setActiveNav('Team'); onNavigate?.('team'); }}
            >
              <UsersIcon className="nav-icon" />
              <span>Team</span>
            </button>
            <button
              type="button"
              className={`nav-link ${activeNav === 'Financial' ? 'active' : ''}`}
              onClick={() => { setActiveNav('Financial'); onNavigate?.('financial'); }}
            >
              <CurrencyDollarIcon className="nav-icon" />
              <span>Financial</span>
            </button>
            <button
              type="button"
              className={`nav-link ${activeNav === 'Reports' ? 'active' : ''}`}
              onClick={() => { setActiveNav('Reports'); onNavigate?.('reports'); }}
            >
              <DocumentChartBarIcon className="nav-icon" />
              <span>Reports</span>
            </button>
          </div>
        </div>

        <div className="navbar-right">
          <button className="notification-btn">
            <BellIcon className="notification-icon" />
          </button>
          <div className="user-profile">
            <div 
              className="profile-avatar"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              style={{ cursor: 'pointer' }}
            >
              <div className="avatar-circle">VS</div>
            </div>
            <div className="profile-info">
              <span className="user-name">{userName}</span>
              <span className="user-role">Project Manager</span>
            </div>
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)} 
              className="profile-dropdown-btn" 
              title="Profile Menu"
            >
              <EllipsisVerticalIcon className="dropdown-icon" />
            </button>
            
            {showProfileMenu && (
              <div className="profile-dropdown-menu">
                <button onClick={() => { setShowProfileMenu(false); }}>
                  <svg className="menu-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Profile Settings</span>
                </button>
                {onLogout && (
                  <button onClick={() => { onLogout(); setShowProfileMenu(false); }} className="logout-menu-item">
                    <ArrowRightOnRectangleIcon className="menu-icon" />
                    <span>Logout</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="page-header">
        <h1>Team Management</h1>
      </div>
      <div className="empty-state">
        <p>Team page coming soon...</p>
      </div>
    </div>
  );
};

export default Team;
