import React, { useState } from 'react';
import '../styles/Projects.css';
import '../styles/Dashboard.css';
import Modal from './Modal';
import {
  FolderIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlayIcon,
  CalendarIcon,
  UserIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  EllipsisVerticalIcon,
  PencilSquareIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
  DocumentChartBarIcon,
  BellIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

interface Project {
  id: number;
  name: string;
  status: 'Upcoming' | 'Ongoing' | 'Pending' | 'Completed' | 'On Hold';
  trackingStatus?: 'On Track' | 'At Risk' | 'Off Track' | 'On Hold' | 'Complete';
  deadline: string;
  progress: number;
  assignedTo: string;
  isAssigned: boolean;
  budget: number;
  spent: number;
  tasks?: {
    total: number;
    completed: number;
  };
  priority: 'High' | 'Medium' | 'Low';
  description: string;
  managerImage?: string;
  tags?: string[];
}

interface ProjectsProps {
  userName?: string;
  onBack?: () => void;
  onProjectClick?: (projectId: number, projectName: string) => void;
  onNavigate?: (view: string) => void;
  onLogout?: () => void;
  isAdmin?: boolean;
  userRole?: string;
}

const Projects: React.FC<ProjectsProps> = ({ userName, onBack, onProjectClick, onNavigate, onLogout, isAdmin = false, userRole = 'user' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'All' | 'Upcoming' | 'Ongoing' | 'Pending' | 'Completed' | 'On Hold'>('All');
  const [selectedAssignment, setSelectedAssignment] = useState<'All' | 'Assigned' | 'Unassigned'>('All');
  const [activeNav, setActiveNav] = useState<string>('Projects');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectsList, setProjectsList] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [projectManagers, setProjectManagers] = useState<Array<{ id: number; name: string; email: string }>>([]);
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
  
  // Check if user has edit permissions (admin or project_manager only)
  const canEdit = userRole === 'admin' || userRole === 'project_manager';

  // Fetch projects from database
  React.useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('http://localhost:5000/api/projects', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }

        const data = await response.json();
        
        // Transform backend data to match Projects component format
        const transformedProjects: Project[] = (data.projects || []).map((p: any) => ({
          id: p.id,
          name: p.name || 'Untitled Project',
          status: p.status === 'planned' ? 'Upcoming' : 
                  p.status === 'in_progress' ? 'Ongoing' :
                  p.status === 'completed' ? 'Completed' : 
                  p.status === 'on_hold' ? 'On Hold' : 'Pending',
          deadline: p.deadline || new Date().toISOString().split('T')[0],
          progress: p.progress || 0,
          assignedTo: p.assigned_user || '',
          isAssigned: !!p.assigned_user,
          budget: parseFloat(p.cost) || 0,
          spent: parseFloat(p.revenue) || 0,
          tasks: {
            total: p.total_tasks || 0,
            completed: p.completed_tasks || 0
          },
          priority: (p.priority || 'Medium') as 'High' | 'Medium' | 'Low',
          description: p.description || '',
          trackingStatus: p.trackingStatus || p.tracking_status || undefined,
          managerImage: undefined
        }));
        
        setProjectsList(transformedProjects);
      } catch (error) {
        console.error('Error fetching projects:', error);
        setProjectsList([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Fetch project managers from database
  React.useEffect(() => {
    const fetchProjectManagers = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/admin/users?role=project_manager,admin', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch project managers');
        }

        const data = await response.json();
        const managers = data.users || data || [];
        setProjectManagers(managers.map((user: any) => ({
          id: user.id,
          name: user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
          email: user.email
        })));
      } catch (error) {
        console.error('Error fetching project managers:', error);
        setProjectManagers([]);
      }
    };

    fetchProjectManagers();
  }, []);

  // Handle creating new project
  const handleCreateProject = async () => {
    try {
      // Validate required fields
      if (!newProject.name || !newProject.projectManager || !newProject.deadline) {
        alert('Please fill in all required fields');
        return;
      }

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
          status: 'planned',
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
      
      // Refresh projects list
      const fetchResponse = await fetch('http://localhost:5000/api/projects', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (fetchResponse.ok) {
        const fetchData = await fetchResponse.json();
        setProjectsList(fetchData.projects || []);
      }
      
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
      
      alert('Project created successfully!');
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project. Please try again.');
    }
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ongoing': return '#3b82f6';
      case 'Upcoming': return '#8b5cf6';
      case 'Pending': return '#f59e0b';
      case 'Completed': return '#10b981';
      case 'On Hold': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Ongoing': return <PlayIcon className="status-icon" />;
      case 'Upcoming': return <ClockIcon className="status-icon" />;
      case 'Pending': return <ClockIcon className="status-icon" />;
      case 'Completed': return <CheckCircleIcon className="status-icon" />;
      case 'On Hold': return <XCircleIcon className="status-icon" />;
      default: return <FolderIcon className="status-icon" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return '#ef4444';
      case 'Medium': return '#f59e0b';
      case 'Low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getDaysRemaining = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Use the projects list from state
  const projects = projectsList;

  const handleMenuToggle = (projectId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === projectId ? null : projectId);
  };

  const handleEdit = (projectId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canEdit) {
      alert('You do not have permission to edit projects. Only admins and project managers can edit.');
      return;
    }
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setSelectedProject(project);
      setShowEditModal(true);
    }
    setOpenMenuId(null);
  };

  const handleDelete = (projectId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canEdit) {
      alert('You do not have permission to delete projects. Only admins and project managers can delete.');
      return;
    }
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setSelectedProject(project);
      setShowDeleteModal(true);
    }
    setOpenMenuId(null);
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    try {
      const token = localStorage.getItem('token');
      console.log('Saving project:', selectedProject);
      
      const projectData = {
        name: selectedProject.name,
        description: selectedProject.description,
        status: selectedProject.status === 'Upcoming' ? 'planned' :
                selectedProject.status === 'Ongoing' ? 'in_progress' :
                selectedProject.status === 'Completed' ? 'completed' :
                selectedProject.status === 'On Hold' ? 'on_hold' : 'pending',
        deadline: selectedProject.deadline,
        tags: selectedProject.tags || [],
        cost: selectedProject.budget,
        revenue: 0,
        assigned_user: selectedProject.assignedTo,
        priority: selectedProject.priority.toLowerCase(),
        progress: selectedProject.progress !== undefined ? selectedProject.progress : 0
      };
      
      console.log('Project data to send:', projectData);
      console.log('Progress value being sent:', projectData.progress);

      const response = await fetch(`http://localhost:5000/api/projects/${selectedProject.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(projectData)
      });

      console.log('PUT response status:', response.status);
      const responseData = await response.json();
      console.log('PUT response data:', responseData);

      if (response.ok) {
        // Refresh projects list from database
        const projectsResponse = await fetch('http://localhost:5000/api/projects', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await projectsResponse.json();
        
        const transformedProjects: Project[] = data.projects.map((p: any) => ({
          id: p.id,
          name: p.name,
          status: p.status === 'planned' ? 'Upcoming' : 
                  p.status === 'in_progress' ? 'Ongoing' :
                  p.status === 'completed' ? 'Completed' : 
                  p.status === 'on_hold' ? 'On Hold' : 'Pending',
          deadline: p.deadline,
          progress: p.progress || 0,
          assignedTo: p.assigned_user || '',
          isAssigned: !!p.assigned_user,
          budget: p.cost || 0,
          spent: 0,
          tasks: {
            total: 0,
            completed: 0
          },
          priority: p.priority === 'high' ? 'High' : 
                   p.priority === 'medium' ? 'Medium' : 'Low',
          description: p.description || '',
          trackingStatus: p.trackingStatus || p.tracking_status || undefined,
          managerImage: ''
        }));
        
        setProjectsList(transformedProjects);
        setShowEditModal(false);
        setSelectedProject(null);
      } else {
        alert(`Failed to save project: ${responseData.message}`);
      }
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Failed to save project. Please try again.');
    }
  };

  const handleConfirmDelete = () => {
    if (selectedProject) {
      setProjectsList(projects.filter(p => p.id !== selectedProject.id));
      setShowDeleteModal(false);
      setSelectedProject(null);
    }
  };

  const handleInputChange = (field: keyof Project, value: any) => {
    if (selectedProject) {
      setSelectedProject({
        ...selectedProject,
        [field]: value
      });
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || project.status === selectedStatus;
    const matchesAssignment = selectedAssignment === 'All' || 
                             (selectedAssignment === 'Assigned' && project.isAssigned) ||
                             (selectedAssignment === 'Unassigned' && !project.isAssigned);
    
    return matchesSearch && matchesStatus && matchesAssignment;
  });

  const projectStats = {
    total: projects.length,
    upcoming: projects.filter(p => p.status === 'Upcoming').length,
    ongoing: projects.filter(p => p.status === 'Ongoing').length,
    pending: projects.filter(p => p.status === 'Pending').length,
    completed: projects.filter(p => p.status === 'Completed').length,
    assigned: projects.filter(p => p.isAssigned).length,
    unassigned: projects.filter(p => !p.isAssigned).length
  };

  return (
    <div className="projects-page">
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

      {/* Header */}
      <div className="projects-header">
        <div className="header-left">
          <div>
            <h1>Projects</h1>
            <p className="subtitle">Manage and track all your projects</p>
          </div>
        </div>
        {canEdit && (
          <button 
            className="btn-primary navbar-new-project"
            onClick={() => setShowCreateProjectModal(true)}
          >
            <PlusIcon className="btn-icon" />
            <span>Add Project</span>
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
            <FolderIcon className="stat-icon" style={{ color: '#3b82f6' }} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Total Projects</p>
            <h3 className="stat-value">{projectStats.total}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
            <PlayIcon className="stat-icon" style={{ color: '#10b981' }} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Ongoing</p>
            <h3 className="stat-value">{projectStats.ongoing}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(139, 92, 246, 0.1)' }}>
            <ClockIcon className="stat-icon" style={{ color: '#8b5cf6' }} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Upcoming</p>
            <h3 className="stat-value">{projectStats.upcoming}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(34, 197, 94, 0.1)' }}>
            <CheckCircleIcon className="stat-icon" style={{ color: '#22c55e' }} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Completed</p>
            <h3 className="stat-value">{projectStats.completed}</h3>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-bar">
          <MagnifyingGlassIcon className="search-icon" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        
        <button 
          className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <FunnelIcon className="filter-icon" />
          <span>Filters</span>
        </button>
      </div>

      {/* Filter Chips */}
      {showFilters && (
        <div className="filter-chips">
          <div className="filter-group">
            <label>Status:</label>
            <div className="chips">
              {['All', 'Upcoming', 'Ongoing', 'Pending', 'Completed', 'On Hold'].map(status => (
                <button
                  key={status}
                  className={`chip ${selectedStatus === status ? 'active' : ''}`}
                  onClick={() => setSelectedStatus(status as any)}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-group">
            <label>Assignment:</label>
            <div className="chips">
              {['All', 'Assigned', 'Unassigned'].map(assignment => (
                <button
                  key={assignment}
                  className={`chip ${selectedAssignment === assignment ? 'active' : ''}`}
                  onClick={() => setSelectedAssignment(assignment as any)}
                >
                  {assignment}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Projects Grid */}
      <div className="projects-grid">
        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading projects...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="empty-state">
            <FolderIcon className="empty-icon" />
            <h3>No Projects Found</h3>
            <p>
              {projects.length === 0 
                ? "You haven't created any projects yet. Click 'New Project' to get started!"
                : "No projects match your current filters. Try adjusting your search or filters."}
            </p>
          </div>
        ) : (
          filteredProjects.map(project => {
            const daysRemaining = getDaysRemaining(project.deadline);
            const budgetPercentage = (project.spent / project.budget) * 100;

            return (
            <div 
              key={project.id} 
              className="project-card"
              onClick={() => onProjectClick?.(project.id, project.name)}
            >
              {/* Card Header */}
              <div className="project-card-header">
                <div className="project-title-section">
                  {project.managerImage && (
                    <img 
                      src={project.managerImage} 
                      alt={`${project.assignedTo} avatar`}
                      className="manager-avatar"
                      title={`Project Manager: ${project.assignedTo}`}
                    />
                  )}
                  <div className="title-status-wrapper">
                    <h3 className="project-title">{project.name}</h3>
                    <div 
                      className="status-badge"
                      style={{ 
                        background: `${getStatusColor(project.status)}20`,
                        color: getStatusColor(project.status),
                        border: `1px solid ${getStatusColor(project.status)}40`
                      }}
                    >
                      {getStatusIcon(project.status)}
                      <span>{project.status}</span>
                    </div>

                    {/* Tracking Status Pill (like the provided figure) */}
                    <div className="tracking-wrapper">
                      <div
                        className="tracking-pill"
                        style={{
                          background: project.trackingStatus ? `${getStatusColor(project.status)}15` : 'transparent',
                          border: `1px solid ${getStatusColor(project.status)}30`,
                          color: getStatusColor(project.status)
                        }}
                      >
                        <span className="tracking-dot" style={{ background: project.trackingStatus === 'Complete' ? '#6b21a8' : getStatusColor(project.status) }} />
                        <span className="tracking-label">{project.trackingStatus || 'No Status'}</span>
                      </div>

                      {canEdit && (
                        <select
                          className="tracking-select"
                          value={project.trackingStatus || ''}
                          onClick={(e) => e.stopPropagation()}
                          onChange={async (e) => {
                            const newStatus = e.target.value as any;
                            // Optimistic UI update
                            setProjectsList(prev => prev.map(p => p.id === project.id ? { ...p, trackingStatus: newStatus } : p));
                            try {
                              const token = localStorage.getItem('token');
                              await fetch(`http://localhost:5000/api/projects/${project.id}`, {
                                method: 'PUT',
                                headers: {
                                  'Authorization': `Bearer ${token}`,
                                  'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({ trackingStatus: newStatus })
                              });
                            } catch (err) {
                              console.error('Failed to update tracking status', err);
                            }
                          }}
                        >
                          <option value="">-- Set Track --</option>
                          <option value="On Track">On Track</option>
                          <option value="At Risk">At Risk</option>
                          <option value="Off Track">Off Track</option>
                          <option value="On Hold">On Hold</option>
                          <option value="Complete">Complete</option>
                        </select>
                      )}
                    </div>
                  </div>
                </div>
                <div className="project-card-actions">
                  <div 
                    className="priority-badge"
                    style={{ 
                      background: `${getPriorityColor(project.priority)}20`,
                      color: getPriorityColor(project.priority)
                    }}
                  >
                    {project.priority}
                  </div>
                  {canEdit && (
                    <>
                      <button 
                        className="menu-btn"
                        onClick={(e) => handleMenuToggle(project.id, e)}
                        aria-label="Project options"
                      >
                        <EllipsisVerticalIcon className="menu-icon" />
                      </button>
                      {openMenuId === project.id && (
                        <div className="menu-dropdown">
                          <button 
                            className="menu-item"
                            onClick={(e) => handleEdit(project.id, e)}
                          >
                            <PencilSquareIcon className="menu-item-icon" />
                            <span>Edit</span>
                          </button>
                          <button 
                            className="menu-item delete"
                            onClick={(e) => handleDelete(project.id, e)}
                          >
                            <TrashIcon className="menu-item-icon" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Project Description */}
              <p className="project-description">{project.description}</p>

              {/* Progress Bar */}
              <div className="progress-section">
                <div className="progress-header">
                  <span className="progress-label">Progress</span>
                  <span className="progress-value">{project.progress}%</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${project.progress}%`,
                      background: getStatusColor(project.status)
                    }}
                  />
                </div>
              </div>

              {/* Project Stats */}
              <div className="project-stats">
                <div className="stat-item">
                  <CalendarIcon className="stat-item-icon" />
                  <div className="stat-item-content">
                    <span className="stat-item-label">Deadline</span>
                    <span className="stat-item-value">{formatDate(project.deadline)}</span>
                    {daysRemaining > 0 && (
                      <span className="days-remaining">{daysRemaining} days left</span>
                    )}
                    {daysRemaining < 0 && (
                      <span className="days-remaining overdue">Overdue</span>
                    )}
                  </div>
                </div>

                <div className="stat-item">
                  <ChartBarIcon className="stat-item-icon" />
                  <div className="stat-item-content">
                    <span className="stat-item-label">Tasks</span>
                    <span className="stat-item-value">
                      {project.tasks?.completed || 0}/{project.tasks?.total || 0}
                    </span>
                  </div>
                </div>

                <div className="stat-item">
                  <UserIcon className="stat-item-icon" />
                  <div className="stat-item-content">
                    <span className="stat-item-label">Assigned To</span>
                    <span className="stat-item-value">
                      {project.isAssigned ? project.assignedTo : 'Unassigned'}
                    </span>
                  </div>
                </div>

                <div className="stat-item">
                  <CurrencyDollarIcon className="stat-item-icon" />
                  <div className="stat-item-content">
                    <span className="stat-item-label">Budget</span>
                    <span className="stat-item-value">
                      {formatCurrency(project.spent)} / {formatCurrency(project.budget)}
                    </span>
                    <div className="budget-bar">
                      <div 
                        className="budget-fill"
                        style={{ 
                          width: `${Math.min(budgetPercentage, 100)}%`,
                          background: budgetPercentage > 90 ? '#ef4444' : '#10b981'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })
        )}
      </div>

      {/* Empty State (now handled inline above) */}
      {false && filteredProjects.length === 0 && (
        <div className="empty-state">
          <FolderIcon className="empty-icon" />
          <h3>No projects found</h3>
          <p>Try adjusting your filters or search query</p>
        </div>
      )}

      {/* Edit Project Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedProject(null);
        }}
        title="Edit Project"
        maxWidth="700px"
      >
        {selectedProject && (
          <form onSubmit={handleSaveProject}>
            <div className="form-group">
              <label className="form-label">Project Name</label>
              <input
                type="text"
                className="form-input"
                value={selectedProject.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                value={selectedProject.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={selectedProject.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                >
                  <option value="Upcoming">Upcoming</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Priority</label>
                <select
                  className="form-select"
                  value={selectedProject.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Tracking Status</label>
                <select
                  className="form-select"
                  value={selectedProject.trackingStatus || ''}
                  onChange={(e) => handleInputChange('trackingStatus', e.target.value)}
                >
                  <option value="">-- Select --</option>
                  <option value="On Track">On Track</option>
                  <option value="At Risk">At Risk</option>
                  <option value="Off Track">Off Track</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Complete">Complete</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Deadline</label>
                <input
                  type="date"
                  className="form-input"
                  value={selectedProject.deadline}
                  onChange={(e) => handleInputChange('deadline', e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Progress (%)</label>
                <input
                  type="number"
                  className="form-input"
                  min="0"
                  max="100"
                  value={selectedProject.progress}
                  onChange={(e) => handleInputChange('progress', parseInt(e.target.value))}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Budget ($)</label>
                <input
                  type="number"
                  className="form-input"
                  min="0"
                  value={selectedProject.budget}
                  onChange={(e) => handleInputChange('budget', parseInt(e.target.value))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Spent ($)</label>
                <input
                  type="number"
                  className="form-input"
                  min="0"
                  value={selectedProject.spent}
                  onChange={(e) => handleInputChange('spent', parseInt(e.target.value))}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Assigned To</label>
              <input
                type="text"
                className="form-input"
                value={selectedProject.assignedTo}
                onChange={(e) => {
                  handleInputChange('assignedTo', e.target.value);
                  handleInputChange('isAssigned', e.target.value.trim() !== '');
                }}
                placeholder="Enter manager name"
              />
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedProject(null);
                }}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <PencilSquareIcon style={{ width: 18, height: 18 }} />
                Save Changes
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Project Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedProject(null);
        }}
        title="Delete Project"
        maxWidth="500px"
      >
        {selectedProject && (
          <div className="delete-confirmation">
            <ExclamationTriangleIcon className="delete-icon" />
            <h3>Are you sure?</h3>
            <p>
              Do you really want to delete <span className="delete-item-name">"{selectedProject.name}"</span>?
              <br />
              This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedProject(null);
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleConfirmDelete}
              >
                <TrashIcon style={{ width: 18, height: 18 }} />
                Delete Project
              </button>
            </div>
          </div>
        )}
      </Modal>

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

              {/* Tags */}
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

              {/* Project Manager */}
              <div className="form-group">
                <label>Project Manager *</label>
                <select
                  value={newProject.projectManager}
                  onChange={(e) => setNewProject({ ...newProject, projectManager: e.target.value })}
                  className="form-select"
                >
                  <option value="">Select a project manager</option>
                  {projectManagers.map((manager) => (
                    <option key={manager.id} value={manager.name}>
                      {manager.name} ({manager.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Deadline */}
              <div className="form-group">
                <label>Deadline *</label>
                <input
                  type="date"
                  value={newProject.deadline}
                  onChange={(e) => setNewProject({ ...newProject, deadline: e.target.value })}
                  className="form-input"
                />
              </div>

              {/* Priority */}
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
                  {newProject.imagePreview && (
                    <div className="image-preview">
                      <img src={newProject.imagePreview} alt="Preview" />
                      <button onClick={removeImage} className="remove-image-btn">×</button>
                    </div>
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
                  rows={4}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
