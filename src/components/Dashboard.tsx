import React, { useState, useEffect } from 'react';
import AboutFooter from './AboutFooter';
import '../styles/Dashboard.css';
import '../styles/UserApprovals.css';
import '../styles/theme.css';
import '../styles/FinancialNav.css';
import {
  ChartBarIcon,
  FolderIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
  CubeIcon,
  CurrencyDollarIcon,
  DocumentChartBarIcon,
  CheckCircleIcon,
  BellIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  EllipsisVerticalIcon,
  CalendarIcon,
  ArrowRightOnRectangleIcon,
  DocumentTextIcon,
  DocumentDuplicateIcon,
  DocumentIcon,
  ReceiptRefundIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';

interface Project {
  id: number;
  name: string;
  deadline: string;
  tasks: number;
  completedTasks: number;
  status: 'Planned' | 'In Progress' | 'Completed' | 'On Hold';
  assignedUser: string;
  userAvatar: string;
  cost: number;
  revenue: number;
  tags: string[];
}

interface PendingUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  created_at: string;
}

interface DashboardProps {
  userName?: string;
  onLogout?: () => void;
  onProjectClick?: (projectId: number, projectName: string) => void;
  isAdmin?: boolean;
  onNavigate?: (view: string) => void;
  userRole?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ userName = 'Vibrant Starling', onLogout, onProjectClick, isAdmin = false, onNavigate, userRole = 'user' }) => {
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Planned' | 'In Progress' | 'Completed' | 'On Hold'>('All');
  const [taskView, setTaskView] = useState<'My Tasks' | 'All Tasks'>('All Tasks');
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [activeNav, setActiveNav] = useState<string>('Dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [currentView, setCurrentView] = useState<'projects' | 'user-approvals'>('projects');
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  
  // Profile management states
  const [adminProfile, setAdminProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [newProject, setNewProject] = useState({
    name: '',
    tags: [] as string[],
    projectManager: '',
    deadline: '',
    startDate: '',
    endDate: '',
    priority: 'Medium' as 'Low' | 'Medium' | 'High',
    image: null as File | null,
    imagePreview: '' as string,
    description: ''
  });

  // Function to fetch pending users
  const fetchPendingUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:5000/api/auth/pending-users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch pending users');
      }

      const data = await response.json();
      setPendingUsers(data.pendingUsers);
    } catch (error) {
      console.error('Error fetching pending users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load user profile
  const loadUserProfile = async () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        const names = user.name.split(' ');
        setAdminProfile(prev => ({
          ...prev,
          firstName: names[0] || '',
          lastName: names.slice(1).join(' ') || '',
          email: user.email
        }));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  // Handle profile update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage(null);

    // Validate first name and last name
    if (!adminProfile.firstName.trim() || !adminProfile.lastName.trim()) {
      setProfileMessage({ type: 'error', text: 'First name and last name are required' });
      return;
    }

    // If changing password, validate
    if (adminProfile.newPassword || adminProfile.confirmPassword || adminProfile.currentPassword) {
      if (!adminProfile.currentPassword) {
        setProfileMessage({ type: 'error', text: 'Please enter your current password' });
        return;
      }
      if (!adminProfile.newPassword) {
        setProfileMessage({ type: 'error', text: 'Please enter a new password' });
        return;
      }
      if (adminProfile.newPassword.length < 6) {
        setProfileMessage({ type: 'error', text: 'New password must be at least 6 characters' });
        return;
      }
      if (adminProfile.newPassword !== adminProfile.confirmPassword) {
        setProfileMessage({ type: 'error', text: 'New passwords do not match' });
        return;
      }
    }

    try {
      setProfileLoading(true);
      
      const updateData: any = {
        firstName: adminProfile.firstName,
        lastName: adminProfile.lastName
      };

      // Add password fields if updating password
      if (adminProfile.currentPassword && adminProfile.newPassword) {
        updateData.currentPassword = adminProfile.currentPassword;
        updateData.newPassword = adminProfile.newPassword;
      }

      const response = await fetch('http://localhost:5000/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      // Update local storage with new user data
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        user.name = `${adminProfile.firstName} ${adminProfile.lastName}`;
        localStorage.setItem('user', JSON.stringify(user));
      }

      setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      // Clear password fields
      setAdminProfile(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      
      // Reload page to update userName display
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setProfileMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    } finally {
      setProfileLoading(false);
    }
  };

  // Fetch pending users when view changes to user-approvals
  useEffect(() => {
    if (currentView === 'user-approvals' && isAdmin) {
      fetchPendingUsers();
    }
  }, [currentView]);
  
  // Load profile when settings modal is opened
  useEffect(() => {
    if (showProfileSettings) {
      loadUserProfile();
    }
  }, [showProfileSettings]);

  // Function to handle user approval/rejection
  const handleUserApproval = async (userId: number, status: 'approved' | 'rejected') => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/update-approval', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ userId, status })
      });

      if (!response.ok) {
        throw new Error('Failed to update user status');
      }

      // Refresh the pending users list
      fetchPendingUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  // Handle create project modal
  const handleCreateProject = async () => {
    try {
      // Validate required fields
      if (!newProject.name || !newProject.projectManager || !newProject.deadline) {
        alert('Please fill in all required fields');
        return;
      }

      // Convert status to database format
      const statusMap: { [key: string]: string } = {
        'Planned': 'planned',
        'In Progress': 'in_progress',
        'Completed': 'completed',
        'On Hold': 'on_hold'
      };

      // Save to database
      const response = await fetch('http://localhost:5000/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: newProject.name,
          description: newProject.description,
          status: 'planned', // New projects start as planned
          deadline: newProject.deadline,
          tags: newProject.tags.length > 0 ? newProject.tags : ['New Project'],
          cost: 0,
          revenue: 0,
          assigned_user: newProject.projectManager,
          priority: newProject.priority.toLowerCase()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create project');
      }

      const data = await response.json();
      console.log('Project created:', data);

      // Create frontend project object
      const createdProject: Project = {
        id: data.project.id,
        name: data.project.name,
        deadline: data.project.deadline,
        tasks: 0,
        completedTasks: 0,
        status: 'Planned',
        assignedUser: data.project.assigned_user,
        userAvatar: data.project.assigned_user.split(' ').map((n: string) => n[0]).join('').toUpperCase(),
        cost: 0,
        revenue: 0,
        tags: data.project.tags || []
      };

      // Add to projects list
      setProjects((prevProjects) => [createdProject, ...prevProjects]);
      
      // Refresh dashboard statistics to reflect new project
      fetchDashboardStats();
      
      // Reset form and close modal
      setNewProject({
        name: '',
        tags: [],
        projectManager: '',
        deadline: '',
        startDate: '',
        endDate: '',
        priority: 'Medium',
        image: null,
        imagePreview: '',
        description: ''
      });
      setShowCreateProjectModal(false);
      
      // Show success message
      alert('Project created successfully and saved to database!');
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project. Please try again.');
    }
  };

  
  const [billingType, setBillingType] = useState<'Fixed Price' | 'Time & Materials' | 'No Bid'>('Fixed Price');
  const [client, setClient] = useState<string>('');
  const [teamMembers, setTeamMembers] = useState<string[]>([]);
  const [budget, setBudget] = useState<number | ''>('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setNewProject({ ...newProject, image: file, imagePreview: String(reader.result) });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setNewProject({ ...newProject, image: null, imagePreview: '' });
  };

  const addTeamMember = (name: string) => {
    const trimmed = name.trim();
    if (trimmed && !teamMembers.includes(trimmed)) setTeamMembers([...teamMembers, trimmed]);
  };

  const removeTeamMember = (name: string) => {
    setTeamMembers(teamMembers.filter(m => m !== name));
  };

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
      e.preventDefault();
      const newTag = e.currentTarget.value.trim();
      if (!newProject.tags.includes(newTag)) {
        setNewProject({ ...newProject, tags: [...newProject.tags, newTag] });
      }
      e.currentTarget.value = '';
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNewProject({
      ...newProject,
      tags: newProject.tags.filter(tag => tag !== tagToRemove)
    });
  };

  // KPI data state - will be loaded from database
  const [kpiData, setKpiData] = useState({
    activeProjects: 0,
    hoursLogged: 0,
    completedTasks: 0,
    pendingTasks: 0
  });

  // Projects state - will be loaded from database
  const [projects, setProjects] = useState<Project[]>([]);

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    try {
      console.log('Fetching dashboard stats...');
      const response = await fetch('http://localhost:5000/api/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        console.error('Dashboard stats response not OK:', response.status);
        throw new Error('Failed to fetch dashboard stats');
      }

      const data = await response.json();
      console.log('Dashboard stats received:', data);
      setKpiData({
        activeProjects: data.activeProjects,
        hoursLogged: data.hoursLogged,
        completedTasks: data.completedTasks,
        pendingTasks: data.pendingTasks
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  // Fetch projects from database
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/projects', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }

        const data = await response.json();
        
        // Transform backend data to match frontend format
        const transformedProjects = data.projects.map((p: any) => ({
          id: p.id,
          name: p.name,
          deadline: p.deadline,
          tasks: 0, // Will be fetched separately if needed
          completedTasks: 0,
          status: p.status === 'planned' ? 'Planned' : 
                  p.status === 'in_progress' ? 'In Progress' :
                  p.status === 'completed' ? 'Completed' : 'On Hold',
          assignedUser: p.assigned_user || 'Unassigned',
          userAvatar: p.assigned_user ? p.assigned_user.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'NA',
          cost: parseFloat(p.cost) || 0,
          revenue: parseFloat(p.revenue) || 0,
          tags: p.tags || []
        }));
        
        setProjects(transformedProjects);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    fetchProjects();
    fetchDashboardStats();
  }, []);

  // Filter projects based on selected filter and search query
  const filteredProjects = projects.filter(p => {
    const matchesFilter = selectedFilter === 'All' || p.status === selectedFilter;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.assignedUser.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const calculateProgress = (project: Project) => {
    return (project.completedTasks / project.tasks) * 100;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return '#10b981';
      case 'In Progress': return '#3b82f6';
      case 'Planned': return '#8b5cf6';
      case 'On Hold': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getTagColor = (tag: string) => {
    const colors: { [key: string]: string } = {
      'Design': '#8b5cf6',
      'Development': '#3b82f6',
      'Client': '#10b981',
      'Urgent': '#ef4444',
      'Critical': '#dc2626',
      'High Priority': '#f59e0b',
      'Marketing': '#ec4899',
      'Infrastructure': '#06b6d4',
      'Planning': '#6366f1',
      'Completed': '#10b981',
      'On Hold': '#f59e0b',
      'Security': '#8b5cf6',
      'Compliance': '#14b8a6',
      'Analytics': '#a855f7',
      'Research': '#6366f1'
    };
    return colors[tag] || '#64748b';
  };

  const formatCurrency = (amount: number) => {
    return `$${(amount / 1000).toFixed(0)}K`;
  };

  const handleActionClick = (projectId: number, action: string) => {
    console.log(`Action: ${action} on project ${projectId}`);
    setActiveMenu(null);
    // Implement actual action logic here
  };

  return (
    <div className="dashboard-container">
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
              onClick={() => { setActiveNav('Dashboard'); setCurrentView('projects'); onNavigate?.('dashboard'); }}
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
              className={`nav-link ${activeNav === 'Products' ? 'active' : ''}`}
              onClick={() => { setActiveNav('Products'); onNavigate?.('products'); }}
            >
              <CubeIcon className="nav-icon" />
              <span>Products</span>
            </button>
            <button
              type="button"
              className={`nav-link ${activeNav === 'Financial' ? 'active' : ''}`}
              onClick={() => { 
                setActiveNav('Financial'); 
                onNavigate?.('financial');
              }}
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
            {isAdmin && (
              <button
                type="button"
                className={`nav-link ${activeNav === 'Approvals' ? 'active' : ''}`}
                onClick={() => { setActiveNav('Approvals'); setCurrentView('user-approvals'); }}
              >
                <CheckCircleIcon className="nav-icon" />
                <span>Approvals</span>
              </button>
            )}
          </div>
        </div>

        <div className="navbar-right">
          <div className="navbar-search">
            <MagnifyingGlassIcon className="navbar-search-icon" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="navbar-search-input"
            />
          </div>
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
              <span className="user-role">{userRole === 'admin' ? 'Administrator' : userRole === 'project_manager' ? 'Project Manager' : 'Team Member'}</span>
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
                <button onClick={() => { setShowProfileSettings(true); setShowProfileMenu(false); }}>
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

      {/* Main Content */}
      <main className="main-content">
        {/* Hero Section - Welcome Banner */}
        <div className="hero-banner">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                Unify Projects, Finance, and Profit. <span className="hero-highlight">Simplified.</span>
              </h1>
              <p className="hero-subtitle">
                From planning to billing — OneFlow keeps it all in sync.
              </p>
              <div className="hero-features">
                <div className="hero-feature-item">
                  <DocumentTextIcon className="feature-icon" />
                  <span>Sales Orders</span>
                </div>
                <div className="hero-feature-divider">→</div>
                <div className="hero-feature-item">
                  <FolderIcon className="feature-icon" />
                  <span>Project Tracking</span>
                </div>
                <div className="hero-feature-divider">→</div>
                <div className="hero-feature-item">
                  <ReceiptRefundIcon className="feature-icon" />
                  <span>Vendor Bills</span>
                </div>
                <div className="hero-feature-divider">→</div>
                <div className="hero-feature-item">
                  <BanknotesIcon className="feature-icon" />
                  <span>Real-Time Profit</span>
                </div>
              </div>
            </div>
            <div className="hero-visual">
              <div className="dashboard-preview">
                <div className="preview-card">
                  <div className="preview-header">
                    <span className="preview-label">Project Dashboard</span>
                    <div className="preview-status active">Live</div>
                  </div>
                  <div className="preview-stats">
                    <div className="preview-stat revenue">
                      <div className="stat-icon">📈</div>
                      <div className="stat-info">
                        <span className="stat-label">Revenue</span>
                        <span className="stat-value">$125K</span>
                      </div>
                    </div>
                    <div className="preview-stat-divider"></div>
                    <div className="preview-stat cost">
                      <div className="stat-icon">📊</div>
                      <div className="stat-info">
                        <span className="stat-label">Costs</span>
                        <span className="stat-value">$87K</span>
                      </div>
                    </div>
                    <div className="preview-stat-divider"></div>
                    <div className="preview-stat profit">
                      <div className="stat-icon">💰</div>
                      <div className="stat-info">
                        <span className="stat-label">Profit</span>
                        <span className="stat-value positive">$38K</span>
                      </div>
                    </div>
                  </div>
                  <div className="preview-chart">
                    <div className="chart-line revenue-line"></div>
                    <div className="chart-line cost-line"></div>
                    <div className="chart-line profit-line"></div>
                    <div className="chart-bars">
                      <div className="chart-bar" style={{ height: '60%' }}></div>
                      <div className="chart-bar" style={{ height: '75%' }}></div>
                      <div className="chart-bar" style={{ height: '55%' }}></div>
                      <div className="chart-bar" style={{ height: '85%' }}></div>
                      <div className="chart-bar" style={{ height: '70%' }}></div>
                    </div>
                  </div>
                </div>
                <div className="floating-badge badge-1">
                  <DocumentDuplicateIcon className="badge-icon" />
                  <span>Integrated Invoicing</span>
                </div>
                <div className="floating-badge badge-2">
                  <ChartBarIcon className="badge-icon" />
                  <span>Live Analytics</span>
                </div>
                <div className="floating-badge badge-3">
                  <CheckCircleIcon className="badge-icon" />
                  <span>Automated Tracking</span>
                </div>
              </div>
            </div>
          </div>
          <div className="hero-background-gradient"></div>
        </div>

        <header className="dashboard-header">
          <div className="header-left">
            <h1>{currentView === 'projects' ? 'Project Overview' : 'User Approvals'}</h1>
          </div>
        </header>

        {/* KPI Widgets */}
        <section className="kpi-section">
          <div className="kpi-card">
            <div className="kpi-icon">
              <FolderIcon className="kpi-icon-svg" />
            </div>
            <div className="kpi-content">
              <h3>{kpiData.activeProjects}</h3>
              <p>Active Projects</p>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon">
              <ClipboardDocumentListIcon className="kpi-icon-svg" />
            </div>
            <div className="kpi-content">
              <h3>{kpiData.hoursLogged}</h3>
              <p>Hours Logged</p>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon">
              <CheckCircleIcon className="kpi-icon-svg" />
            </div>
            <div className="kpi-content">
              <h3>{kpiData.completedTasks}</h3>
              <p>Completed Tasks</p>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon">
              <CalendarIcon className="kpi-icon-svg" />
            </div>
            <div className="kpi-content">
              <h3>{kpiData.pendingTasks}</h3>
              <p>Pending Tasks</p>
            </div>
          </div>
        </section>

        {/* Task Toggle and Filters */}
        <section className="controls-section">
          <div className="task-toggle">
            <button 
              className={taskView === 'My Tasks' ? 'toggle-btn active' : 'toggle-btn'}
              onClick={() => setTaskView('My Tasks')}
            >
              My Tasks
            </button>
            <button 
              className={taskView === 'All Tasks' ? 'toggle-btn active' : 'toggle-btn'}
              onClick={() => setTaskView('All Tasks')}
            >
              All Tasks
            </button>
          </div>

          <div className="project-filters">
            <button 
              className={selectedFilter === 'All' ? 'filter-btn active' : 'filter-btn'}
              onClick={() => setSelectedFilter('All')}
            >
              All
            </button>
            <button 
              className={selectedFilter === 'Planned' ? 'filter-btn active' : 'filter-btn'}
              onClick={() => setSelectedFilter('Planned')}
            >
              Planned
            </button>
            <button 
              className={selectedFilter === 'In Progress' ? 'filter-btn active' : 'filter-btn'}
              onClick={() => setSelectedFilter('In Progress')}
            >
              In Progress
            </button>
            <button 
              className={selectedFilter === 'Completed' ? 'filter-btn active' : 'filter-btn'}
              onClick={() => setSelectedFilter('Completed')}
            >
              Completed
            </button>
            <button 
              className={selectedFilter === 'On Hold' ? 'filter-btn active' : 'filter-btn'}
              onClick={() => setSelectedFilter('On Hold')}
            >
              On Hold
            </button>
          </div>
        </section>

        {/* Project Cards Grid */}
        <section className="projects-grid">
          {filteredProjects.map(project => (
            <div 
              key={project.id} 
              className="project-card"
              onClick={() => {
                if (onProjectClick) {
                  setActiveNav('Tasks');
                  onProjectClick(project.id, project.name);
                }
              }}
              style={{ cursor: onProjectClick ? 'pointer' : 'default' }}
            >
              <div className="project-header">
                <div className="project-title-section">
                  <div className="project-name-container">
                    <h3>{project.name}</h3>
                    <span className="project-manager-label">
                      PM: {project.assignedUser.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="user-avatar" title={`Project Manager: ${project.assignedUser}`}>
                    {project.userAvatar}
                  </div>
                </div>
                <div className="action-menu-container">
                  <button 
                    className="menu-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenu(activeMenu === project.id ? null : project.id);
                    }}
                  >
                    <EllipsisVerticalIcon className="menu-icon" />
                  </button>
                  {activeMenu === project.id && (
                    <div className="action-menu">
                      <button onClick={() => handleActionClick(project.id, 'edit')}>
                        ◉ Edit
                      </button>
                      <button onClick={() => handleActionClick(project.id, 'delete')}>
                        ◬ Delete
                      </button>
                      <div className="menu-divider"></div>
                      <div className="menu-subtitle">Financial</div>
                      <button onClick={() => handleActionClick(project.id, 'sales-order')}>
                        ◈ Sales Order
                      </button>
                      <button onClick={() => handleActionClick(project.id, 'purchase-order')}>
                        ◊ Purchase Order
                      </button>
                      <button onClick={() => handleActionClick(project.id, 'vendor-bills')}>
                        ◭ Vendor Bills
                      </button>
                      <button onClick={() => handleActionClick(project.id, 'customer-invoices')}>
                        ◎ Customer Invoices
                      </button>
                      <button onClick={() => handleActionClick(project.id, 'expenses')}>
                        ◬ Expenses
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Budget Information */}
              <div className="budget-info">
                <div className="budget-item">
                  <span className="budget-label">COST</span>
                  <span className="budget-value cost">{formatCurrency(project.cost)}</span>
                </div>
                <div className="budget-divider">/</div>
                <div className="budget-item">
                  <span className="budget-label">REVENUE</span>
                  <span className="budget-value revenue">{formatCurrency(project.revenue)}</span>
                </div>
              </div>

              {/* Project Metadata - Status and Deadline */}
              <div className="project-meta">
                <div className="status-badge" style={{ backgroundColor: getStatusColor(project.status) }}>
                  {project.status}
                </div>
                <div className="deadline">
                  <CalendarIcon className="deadline-icon" />
                  {new Date(project.deadline).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </div>
              </div>

              {/* Status Tags */}
              <div className="tags-container">
                {project.tags.map((tag, index) => (
                  <span 
                    key={index} 
                    className="tag" 
                    style={{ backgroundColor: getTagColor(tag) }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="project-tasks">
                <span>{project.completedTasks}/{project.tasks} Tasks</span>
              </div>

              <div className="progress-section">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ 
                      width: `${calculateProgress(project)}%`,
                      backgroundColor: getStatusColor(project.status)
                    }}
                  ></div>
                </div>
                <span className="progress-label">{Math.round(calculateProgress(project))}%</span>
              </div>
            </div>
          ))}
        </section>

        {/* Render approval section when in user-approvals view */}
        {currentView === 'user-approvals' && (
          <div className="user-approvals">
            <h2>Pending User Approvals</h2>
            {isLoading ? (
              <div className="loading">Loading pending users...</div>
            ) : (
              <div className="pending-users-list">
                {pendingUsers.length > 0 ? (
                  pendingUsers.map((user) => (
                    <div key={user.id} className="user-approval-card">
                      <div className="user-info">
                        <h3>{user.first_name} {user.last_name}</h3>
                        <p>{user.email}</p>
                        <p className="text-sm text-gray-500">
                          Requested: {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="user-actions">
                        <button
                          className="approve-btn"
                          onClick={() => handleUserApproval(user.id, 'approved')}
                        >
                          Approve
                        </button>
                        <button
                          className="reject-btn"
                          onClick={() => handleUserApproval(user.id, 'rejected')}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-approvals">
                    <p>No pending user approvals</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Show empty state for projects view */}
        {currentView === 'projects' && filteredProjects.length === 0 && (
          <div className="empty-state">
            <p>No projects found matching the selected filter.</p>
          </div>
        )}
      </main>

      {/* Create Project Modal */}
      {showCreateProjectModal && (
        <div className="modal-overlay" onClick={() => setShowCreateProjectModal(false)}>
          <div className="modal-content create-project-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Projects &gt; New Project</h2>
              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setShowCreateProjectModal(false)}>
                  Discard
                </button>
                <button className="btn-primary" onClick={handleCreateProject}>
                  Save
                </button>
              </div>
            </div>

            <div className="modal-body">
              {/* Project Name */}
              <div className="form-group">
                <label>Project Name *</label>
                <input
                  type="text"
                  placeholder="Enter project name"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="form-input"
                />
              </div>

              {/* Tags - Multi Selection */}
              <div className="form-group">
                <label>Tags</label>
                <div className="tags-input-container">
                  <div className="tags-list">
                    {newProject.tags.map((tag, index) => (
                      <span key={index} className="tag">
                        {tag}
                        <button onClick={() => removeTag(tag)} className="tag-remove">×</button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Type and press Enter to add tags"
                    onKeyDown={handleTagInput}
                    className="form-input"
                  />
                </div>
              </div>

              {/* Project Manager - Single Selection Dropdown */}
              <div className="form-group">
                <label>Project Manager *</label>
                <select
                  value={newProject.projectManager}
                  onChange={(e) => setNewProject({ ...newProject, projectManager: e.target.value })}
                  className="form-select"
                >
                  <option value="">Select a project manager</option>
                  <option value="John Doe">John Doe</option>
                  <option value="Jane Smith">Jane Smith</option>
                  <option value="Mike Johnson">Mike Johnson</option>
                  <option value="Sarah Williams">Sarah Williams</option>
                </select>
              </div>

              {/* Deadline - Date Selection */}
              <div className="form-group">
                <label>Deadline *</label>
                <input
                  type="date"
                  value={newProject.deadline}
                  onChange={(e) => setNewProject({ ...newProject, deadline: e.target.value })}
                  className="form-input"
                />
              </div>

              {/* Priority - Single Radio Selection */}
              <div className="form-group">
                <label>Priority</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="priority"
                      value="Low"
                      checked={newProject.priority === 'Low'}
                      onChange={(e) => setNewProject({ ...newProject, priority: 'Low' })}
                    />
                    <span>Low</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="priority"
                      value="Medium"
                      checked={newProject.priority === 'Medium'}
                      onChange={(e) => setNewProject({ ...newProject, priority: 'Medium' })}
                    />
                    <span>Medium</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="priority"
                      value="High"
                      checked={newProject.priority === 'High'}
                      onChange={(e) => setNewProject({ ...newProject, priority: 'High' })}
                    />
                    <span>High</span>
                  </label>
                </div>
              </div>

              {/* Image Upload */}
              <div className="form-group">
                <label>Image</label>
                <div className="upload-section">
                  <label htmlFor="image-upload" className="upload-btn">
                    <PlusIcon className="upload-icon" />
                    Upload Image
                  </label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                  {newProject.image && (
                    <span className="file-name">{newProject.image.name}</span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="form-group">
                <label>Description</label>
                <textarea
                  placeholder="Enter project description"
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="form-textarea"
                  rows={5}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Settings Modal */}
      {showProfileSettings && (
        <div className="modal-overlay" onClick={() => setShowProfileSettings(false)}>
          <div className="modal-content profile-settings-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>👤 Profile Settings</h2>
              <button className="close-btn" onClick={() => setShowProfileSettings(false)}>
                ✕
              </button>
            </div>

            {profileMessage && (
              <div className={`profile-message ${profileMessage.type}`}>
                {profileMessage.text}
              </div>
            )}

            <form onSubmit={handleProfileUpdate} className="profile-form">
              <div className="form-section">
                <h3>Personal Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName">First Name *</label>
                    <input
                      type="text"
                      id="firstName"
                      value={adminProfile.firstName}
                      onChange={(e) => setAdminProfile(prev => ({ ...prev, firstName: e.target.value }))}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="lastName">Last Name *</label>
                    <input
                      type="text"
                      id="lastName"
                      value={adminProfile.lastName}
                      onChange={(e) => setAdminProfile(prev => ({ ...prev, lastName: e.target.value }))}
                      required
                      className="form-input"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    value={adminProfile.email}
                    disabled
                    className="form-input disabled"
                    title="Email cannot be changed"
                  />
                  <small className="form-hint">Email address cannot be changed</small>
                </div>
              </div>

              <div className="form-section">
                <h3>Change Password</h3>
                <p className="section-hint">Leave blank to keep current password</p>
                <div className="form-group">
                  <label htmlFor="currentPassword">Current Password</label>
                  <input
                    type="password"
                    id="currentPassword"
                    value={adminProfile.currentPassword}
                    onChange={(e) => setAdminProfile(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="form-input"
                    placeholder="Enter current password"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="newPassword">New Password</label>
                    <input
                      type="password"
                      id="newPassword"
                      value={adminProfile.newPassword}
                      onChange={(e) => setAdminProfile(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="form-input"
                      placeholder="Enter new password"
                      minLength={6}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm New Password</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={adminProfile.confirmPassword}
                      onChange={(e) => setAdminProfile(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="form-input"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowProfileSettings(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-save"
                  disabled={profileLoading}
                >
                  {profileLoading ? 'Updating...' : '💾 Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <AboutFooter />
    </div>
  );
};

export default Dashboard;
