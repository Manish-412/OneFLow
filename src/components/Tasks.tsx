import React, { useState } from 'react';
import '../styles/Tasks.css';
import '../styles/Dashboard.css';
import Modal from './Modal';
import TaskCard from './TaskCard';
import AddMemberModal from './AddMemberModal';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ClockIcon,
  UserIcon,
  CalendarIcon,
  ChartBarIcon,
  EllipsisVerticalIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowsUpDownIcon,
  ViewColumnsIcon,
  Squares2X2Icon,
  ExclamationTriangleIcon,
  FolderIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
  CurrencyDollarIcon,
  DocumentChartBarIcon,
  BellIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

interface Task {
  id: number;
  title: string;
  description: string;
  status: 'New' | 'In Progress' | 'Blocked' | 'Done';
  priority: 'High' | 'Medium' | 'Low';
  assignee: string;
  assigneeImage?: string;
  dueDate: string;
  tags: string[];
  project: string;
  progress?: number;
  coverImage?: string;
  priorityStars?: number;
}

interface TasksProps {
  userName?: string;
  onBack?: () => void;
  projectId?: number;
  projectName?: string;
  onNavigate?: (view: string) => void;
  onLogout?: () => void;
  isAdmin?: boolean;
  userRole?: string;
}

const Tasks: React.FC<TasksProps> = ({ userName, onBack, projectId, projectName, onNavigate, onLogout, isAdmin = false, userRole = 'user' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [projectSearchQuery, setProjectSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<string>(projectName || 'All Projects');
  const [selectedPriority, setSelectedPriority] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');
  const [showFilters, setShowFilters] = useState(false);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'kanban' | 'grid'>('grid');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCoverModal, setShowCoverModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [tasksList, setTasksList] = useState<Task[]>([]);
  const [activeNav, setActiveNav] = useState<string>('Tasks');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [availableProjects, setAvailableProjects] = useState<string[]>([]);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedTaskForMember, setSelectedTaskForMember] = useState<number | null>(null);
  
  // Check if user has edit permissions (admin or project_manager only)
  const canEdit = userRole === 'admin' || userRole === 'project_manager';

  // Fetch tasks from database
  React.useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Fetching tasks from database...');
        const response = await fetch('http://localhost:5000/api/tasks', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('Tasks response status:', response.status);
        if (response.ok) {
          const data = await response.json();
          console.log('Tasks data received:', data);
          // Transform database tasks to match component format
          const transformedTasks = data.tasks.map((task: any) => ({
            id: task.id,
            title: task.title,
            description: task.description || '',
            status: task.status === 'new' ? 'New' : 
                    task.status === 'in_progress' ? 'In Progress' : 
                    task.status === 'blocked' ? 'Blocked' : 'Done',
            priority: task.priority === 'high' ? 'High' : 
                     task.priority === 'medium' ? 'Medium' : 'Low',
            assignee: task.assigned_user || 'Unassigned',
            assigneeImage: task.assignee_image || '',
            dueDate: task.due_date || new Date().toISOString().split('T')[0],
            tags: task.tags || [],
            project: task.project_name || '',
            progress: task.progress || 0,
            coverImage: task.cover_image || '',
            priorityStars: task.priority_stars || 2
          }));
          console.log('Transformed tasks:', transformedTasks);
          setTasksList(transformedTasks);
        } else {
          const error = await response.json();
          console.error('Failed to fetch tasks:', error);
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks();
  }, []);

  // Fetch projects from API
  React.useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/projects', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          const projectNames = data.projects.map((p: any) => p.name);
          setAvailableProjects(projectNames);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    fetchProjects();
  }, []);

  // Close project dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showProjectDropdown && !target.closest('.project-selector-wrapper')) {
        setShowProjectDropdown(false);
        setProjectSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProjectDropdown]);

  // Close task menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Close menu if clicking outside the menu button and dropdown
      if (openMenuId !== null && 
          !target.closest('.task-menu-btn') && 
          !target.closest('.task-menu-dropdown')) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId]);

  // Tasks will only show user-created tasks
  const tasks = tasksList;

  const handleMenuToggle = (taskId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const button = e.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();
    
    if (openMenuId === taskId) {
      setOpenMenuId(null);
      setMenuPosition(null);
    } else {
      setOpenMenuId(taskId);
      setMenuPosition({
        top: rect.bottom + 4,
        left: rect.right - 180 // 180 is min-width of dropdown
      });
    }
  };

  const handleEdit = (taskId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canEdit) {
      alert('You do not have permission to edit tasks. Only admins and project managers can edit.');
      return;
    }
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setSelectedTask(task);
      setShowEditModal(true);
    }
    setOpenMenuId(null);
  };

  const handleDelete = (taskId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canEdit) {
      alert('You do not have permission to delete tasks. Only admins and project managers can delete.');
      return;
    }
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setSelectedTask(task);
      setShowDeleteModal(true);
    }
    setOpenMenuId(null);
  };

  const handleChangeCover = (taskId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canEdit) {
      alert('You do not have permission to change task covers. Only admins and project managers can edit.');
      return;
    }
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setSelectedTask(task);
      setShowCoverModal(true);
    }
    setOpenMenuId(null);
  };

  const handleAddNewTask = () => {
    if (!canEdit) {
      alert('You do not have permission to create tasks. Only admins and project managers can create tasks.');
      return;
    }
    const newTask: Task = {
      id: Date.now(), // Generate unique ID
      title: '',
      description: '',
      status: 'New',
      priority: 'Medium',
      assignee: userName || 'Unassigned',
      assigneeImage: '',
      dueDate: new Date().toISOString().split('T')[0],
      tags: [],
      project: selectedProject === 'All Projects' ? '' : selectedProject,
      progress: 0,
      coverImage: '',
      priorityStars: 2
    };
    setSelectedTask(newTask);
    setShowEditModal(true);
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    try {
      const token = localStorage.getItem('token');
      const existingTask = tasks.find(t => t.id === selectedTask.id);
      console.log('Saving task:', selectedTask);
      console.log('Is existing task:', !!existingTask);
      
      // Get project ID from project name
      const projectResponse = await fetch('http://localhost:5000/api/projects', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const projectsData = await projectResponse.json();
      console.log('Projects data:', projectsData);
      const project = projectsData.projects.find((p: any) => p.name === selectedTask.project);
      console.log('Found project:', project);
      
      if (!project) {
        alert('Please select a valid project');
        return;
      }

      const taskData = {
        project_id: project.id,
        title: selectedTask.title,
        description: selectedTask.description,
        assigned_user: selectedTask.assignee,
        priority: selectedTask.priority.toLowerCase(),
        status: selectedTask.status === 'New' ? 'new' : 
                selectedTask.status === 'In Progress' ? 'in_progress' : 
                selectedTask.status === 'Blocked' ? 'blocked' : 'done',
        due_date: selectedTask.dueDate,
        tags: selectedTask.tags,
        cover_image: selectedTask.coverImage,
        assignee_image: selectedTask.assigneeImage,
        progress: selectedTask.progress !== undefined ? selectedTask.progress : 0,
        priority_stars: selectedTask.priorityStars !== undefined ? selectedTask.priorityStars : 2
      };
      
      console.log('Task data to send:', taskData);
      console.log('Progress value being sent:', taskData.progress);
      console.log('Task ID:', selectedTask.id);
      console.log('Is update?', !!existingTask);

      let response;
      if (existingTask) {
        // Update existing task
        console.log(`Sending PUT request to: http://localhost:5000/api/tasks/${selectedTask.id}`);
        response = await fetch(`http://localhost:5000/api/tasks/${selectedTask.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(taskData)
        });
        console.log('PUT response status:', response.status);
        const responseData = await response.json();
        console.log('PUT response data:', responseData);
        response = new Response(JSON.stringify(responseData), { status: response.status, headers: response.headers });
      } else {
        // Create new task
        response = await fetch('http://localhost:5000/api/tasks', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(taskData)
        });
      }

      if (response.ok) {
        // Refresh tasks list
        const tasksResponse = await fetch('http://localhost:5000/api/tasks', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await tasksResponse.json();
        const transformedTasks = data.tasks.map((task: any) => ({
          id: task.id,
          title: task.title,
          description: task.description || '',
          status: task.status === 'new' ? 'New' : 
                  task.status === 'in_progress' ? 'In Progress' : 
                  task.status === 'blocked' ? 'Blocked' : 'Done',
          priority: task.priority === 'high' ? 'High' : 
                   task.priority === 'medium' ? 'Medium' : 'Low',
          assignee: task.assigned_user || 'Unassigned',
          assigneeImage: task.assignee_image || '',
          dueDate: task.due_date || new Date().toISOString().split('T')[0],
          tags: task.tags || [],
          project: task.project_name || '',
          progress: task.progress || 0,
          coverImage: task.cover_image || '',
          priorityStars: task.priority_stars || 2
        }));
        setTasksList(transformedTasks);
        setShowEditModal(false);
        setSelectedTask(null);
      } else {
        const error = await response.json();
        alert(`Failed to save task: ${error.message}`);
      }
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Failed to save task. Please try again.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedTask) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/tasks/${selectedTask.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setTasksList(tasks.filter(t => t.id !== selectedTask.id));
        setShowDeleteModal(false);
        setSelectedTask(null);
      } else {
        alert('Failed to delete task');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task. Please try again.');
    }
  };

  const handleSaveCover = (coverUrl: string) => {
    if (selectedTask) {
      setTasksList(tasks.map(t => 
        t.id === selectedTask.id ? { ...t, coverImage: coverUrl } : t
      ));
      setShowCoverModal(false);
      setSelectedTask(null);
    }
  };

  const handleInputChange = (field: keyof Task, value: any) => {
    if (selectedTask) {
      setSelectedTask({
        ...selectedTask,
        [field]: value
      });
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return '#8b5cf6';
      case 'In Progress': return '#3b82f6';
      case 'Blocked': return '#ef4444';
      case 'Done': return '#10b981';
      default: return '#6b7280';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getDaysRemaining = (dueDate: string) => {
    const today = new Date();
    const deadline = new Date(dueDate);
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Get unique projects from both tasks and available projects
  const taskProjects = tasks.map(task => task.project).filter(p => p);
  const allProjects = Array.from(new Set([...availableProjects, ...taskProjects]));
  const uniqueProjects = ['All Projects', ...allProjects];
  
  // Filter projects based on search query
  const filteredProjects = uniqueProjects.filter(project => 
    project.toLowerCase().includes(projectSearchQuery.toLowerCase())
  );
  
  // Projects list for dropdown (excluding "All Projects")
  const projectsForDropdown = availableProjects.length > 0 ? availableProjects : allProjects;

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.project.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = selectedPriority === 'All' || task.priority === selectedPriority;
    const matchesProject = selectedProject === 'All Projects' || task.project === selectedProject;
    
    return matchesSearch && matchesPriority && matchesProject;
  });

  const tasksByStatus = {
    'New': filteredTasks.filter(t => t.status === 'New'),
    'In Progress': filteredTasks.filter(t => t.status === 'In Progress'),
    'Blocked': filteredTasks.filter(t => t.status === 'Blocked'),
    'Done': filteredTasks.filter(t => t.status === 'Done')
  };

  const taskStats = {
    total: tasks.length,
    new: tasks.filter(t => t.status === 'New').length,
    inProgress: tasks.filter(t => t.status === 'In Progress').length,
    blocked: tasks.filter(t => t.status === 'Blocked').length,
    done: tasks.filter(t => t.status === 'Done').length
  };

  const renderTaskCard = (task: Task) => {
    // Convert task data to TaskCard props format
    const getInitials = (name: string) => {
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    };

    // Generate mock team members (you can replace with actual data from backend)
    const generateTeamMembers = (assignee: string) => {
      // For demo, split assignee by comma if multiple names
      const names = assignee.includes(',') ? assignee.split(',') : [assignee];
      return names.map(name => ({
        name: name.trim(),
        avatar: getInitials(name.trim()),
        role: Math.random() > 0.5 ? 'Developer' : 'Designer'
      }));
    };

    // Calculate subtasks (you can replace with actual data)
    const calculateSubtasks = () => {
      if (task.progress !== undefined) {
        const total = Math.floor(Math.random() * 8) + 3; // 3-10 subtasks
        const completed = Math.floor((task.progress / 100) * total);
        return { total, completed };
      }
      return undefined;
    };

    return (
      <TaskCard
        key={task.id}
        id={task.id}
        title={task.title}
        projectName={task.project}
        assignedUser={task.assignee}
        userAvatar={getInitials(task.assignee)}
        assignedUsers={generateTeamMembers(task.assignee)}
        priority={task.priority}
        dueDate={task.dueDate}
        loggedHours={task.progress || 0}
        comments={Math.floor(Math.random() * 10)} // Replace with actual data
        attachments={Math.floor(Math.random() * 5)} // Replace with actual data
        status={task.status}
        subtasks={calculateSubtasks()}
        tags={task.tags.map(tag => ({
          label: tag,
          color: getTagColor(tag)
        }))}
        coverImage={task.coverImage}
        onEdit={canEdit ? (id) => handleEdit(id, new MouseEvent('click') as any) : undefined}
        onDelete={canEdit ? (id) => handleDelete(id, new MouseEvent('click') as any) : undefined}
        onAddMember={canEdit ? handleAddMember : undefined}
        onClick={(id) => {
          // Handle task click if needed
          console.log('Task clicked:', id);
        }}
      />
    );
  };

  // Handle adding members to task
  const handleAddMember = (taskId: number) => {
    setSelectedTaskForMember(taskId);
    setShowAddMemberModal(true);
  };

  // Handle members added
  const handleMembersAdded = async (members: any[]) => {
    if (selectedTaskForMember) {
      try {
        // Update task with new members in backend
        const response = await fetch(`http://localhost:5000/api/tasks/${selectedTaskForMember}/members`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ members: members.map(m => m.id) })
        });

        if (response.ok) {
          // Refresh tasks list
          const tasksResponse = await fetch('http://localhost:5000/api/tasks', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          if (tasksResponse.ok) {
            const data = await tasksResponse.json();
            // Transform and update tasks list
            // (Add transformation logic here)
          }
          
          alert(`Successfully added ${members.length} member(s) to the task!`);
        }
      } catch (error) {
        console.error('Error adding members:', error);
        alert('Failed to add members. Please try again.');
      }
    }
    setShowAddMemberModal(false);
    setSelectedTaskForMember(null);
  };

  // Helper function to get tag colors
  const getTagColor = (tag: string) => {
    const colors: { [key: string]: string } = {
      'Frontend': '#3b82f6',
      'Backend': '#8b5cf6',
      'Design': '#ec4899',
      'Bug': '#ef4444',
      'Feature': '#10b981',
      'Testing': '#f59e0b',
      'Documentation': '#6366f1',
      'High Priority': '#dc2626',
      'Medium Priority': '#f59e0b',
      'Low Priority': '#10b981'
    };
    return colors[tag] || '#6b7280';
  };

  return (
    <div className="tasks-page">
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
      <div className="tasks-header">
        <div className="header-left">
          {projectName && (
            <button className="back-btn" onClick={onBack}>
              ← Back
            </button>
          )}
          <div>
            <h1>{selectedProject === 'All Projects' ? 'Tasks' : `${selectedProject} - Tasks`}</h1>
            <p className="subtitle">
              {selectedProject === 'All Projects'
                ? 'Manage and track all your tasks' 
                : `Manage tasks for ${selectedProject} project`}
            </p>
          </div>
        </div>
        <div className="header-actions">
          {/* Project Selector with Search */}
          <div className="project-selector-wrapper" style={{ position: 'relative', marginRight: '12px' }}>
            <button 
              className="project-selector-btn"
              onClick={() => setShowProjectDropdown(!showProjectDropdown)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                background: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                color: '#1f2937',
                transition: 'all 0.2s',
                minWidth: '200px',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FolderIcon style={{ width: '18px', height: '18px', color: '#6b7280' }} />
                <span>{selectedProject}</span>
              </div>
              <svg 
                style={{ width: '16px', height: '16px', color: '#6b7280', transform: showProjectDropdown ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showProjectDropdown && (
              <div 
                className="project-dropdown"
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  left: 0,
                  right: 0,
                  background: 'white',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  borderRadius: '8px',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                  zIndex: 1000,
                  maxHeight: '320px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{ padding: '12px', borderBottom: '1px solid rgba(0, 0, 0, 0.06)' }}>
                  <div style={{ position: 'relative' }}>
                    <MagnifyingGlassIcon style={{ 
                      position: 'absolute', 
                      left: '12px', 
                      top: '50%', 
                      transform: 'translateY(-50%)',
                      width: '16px', 
                      height: '16px', 
                      color: '#9ca3af' 
                    }} />
                    <input
                      type="text"
                      placeholder="Search projects..."
                      value={projectSearchQuery}
                      onChange={(e) => setProjectSearchQuery(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        width: '100%',
                        padding: '8px 12px 8px 36px',
                        border: '1px solid rgba(0, 0, 0, 0.1)',
                        borderRadius: '6px',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>
                
                <div style={{ overflowY: 'auto', maxHeight: '250px' }}>
                  {filteredProjects.length > 0 ? (
                    filteredProjects.map(project => (
                      <button
                        key={project}
                        onClick={() => {
                          setSelectedProject(project);
                          setShowProjectDropdown(false);
                          setProjectSearchQuery('');
                        }}
                        style={{
                          width: '100%',
                          padding: '10px 16px',
                          textAlign: 'left',
                          border: 'none',
                          background: selectedProject === project ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                          color: selectedProject === project ? '#6366f1' : '#1f2937',
                          fontSize: '14px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontWeight: selectedProject === project ? '600' : '400'
                        }}
                        onMouseEnter={(e) => {
                          if (selectedProject !== project) {
                            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.03)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedProject !== project) {
                            e.currentTarget.style.background = 'transparent';
                          }
                        }}
                      >
                        <FolderIcon style={{ width: '16px', height: '16px', flexShrink: 0 }} />
                        <span>{project}</span>
                        {selectedProject === project && (
                          <svg 
                            style={{ width: '16px', height: '16px', marginLeft: 'auto' }}
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                          >
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    ))
                  ) : (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
                      No projects found
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {canEdit && (
            <button className="btn-primary" onClick={handleAddNewTask}>
              <PlusIcon className="btn-icon" />
              <span>Add Task</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="tasks-stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(139, 92, 246, 0.1)' }}>
            <ChartBarIcon className="stat-icon" style={{ color: '#8b5cf6' }} />
          </div>
          <div className="stat-info">
            <p className="stat-label">New Tasks</p>
            <h3 className="stat-value">{taskStats.new}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
            <ClockIcon className="stat-icon" style={{ color: '#3b82f6' }} />
          </div>
          <div className="stat-info">
            <p className="stat-label">In Progress</p>
            <h3 className="stat-value">{taskStats.inProgress}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
            <ArrowsUpDownIcon className="stat-icon" style={{ color: '#ef4444' }} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Blocked</p>
            <h3 className="stat-value">{taskStats.blocked}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
            <ChartBarIcon className="stat-icon" style={{ color: '#10b981' }} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Completed</p>
            <h3 className="stat-value">{taskStats.done}</h3>
          </div>
        </div>
      </div>



      {/* Grid View */}
      <div className="tasks-grid">
        {filteredTasks.map(task => renderTaskCard(task))}
        {filteredTasks.length === 0 && (
          <div className="empty-state">
            <ChartBarIcon className="empty-icon" />
            <h3>No tasks found</h3>
            <p>Try adjusting your filters or search query</p>
          </div>
        )}
      </div>

      {/* Edit/Add Task Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedTask(null);
        }}
        title={selectedTask && tasks.find(t => t.id === selectedTask.id) ? "Edit Task" : "Add New Task"}
        maxWidth="700px"
      >
        {selectedTask && (
          <form onSubmit={handleSaveTask}>
            <div className="form-group">
              <label className="form-label">Task Title</label>
              <input
                type="text"
                className="form-input"
                value={selectedTask.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                value={selectedTask.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={selectedTask.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                >
                  <option value="New">New</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Blocked">Blocked</option>
                  <option value="Done">Done</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Priority</label>
                <select
                  className="form-select"
                  value={selectedTask.priority}
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
                <label className="form-label">Due Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={selectedTask.dueDate}
                  onChange={(e) => handleInputChange('dueDate', e.target.value)}
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
                  value={selectedTask.progress || 0}
                  onChange={(e) => handleInputChange('progress', parseInt(e.target.value))}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Assignee</label>
                <input
                  type="text"
                  className="form-input"
                  value={selectedTask.assignee}
                  onChange={(e) => handleInputChange('assignee', e.target.value)}
                  placeholder="Enter assignee name"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Project</label>
                <select
                  className="form-select"
                  value={selectedTask.project}
                  onChange={(e) => handleInputChange('project', e.target.value)}
                  required
                >
                  <option value="">Select a project</option>
                  {projectsForDropdown.map((project) => (
                    <option key={project} value={project}>
                      {project}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Tags (comma separated)</label>
              <input
                type="text"
                className="form-input"
                value={selectedTask.tags.join(', ')}
                onChange={(e) => handleInputChange('tags', e.target.value.split(',').map(t => t.trim()))}
                placeholder="e.g., Design, Frontend, API"
              />
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedTask(null);
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

      {/* Delete Task Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedTask(null);
        }}
        title="Delete Task"
        maxWidth="500px"
      >
        {selectedTask && (
          <div className="delete-confirmation">
            <ExclamationTriangleIcon className="delete-icon" />
            <h3>Are you sure?</h3>
            <p>
              Do you really want to delete <span className="delete-item-name">"{selectedTask.title}"</span>?
              <br />
              This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedTask(null);
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleConfirmDelete}
              >
                <TrashIcon style={{ width: 18, height: 18 }} />
                Delete Task
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Change Cover Modal */}
      <Modal
        isOpen={showCoverModal}
        onClose={() => {
          setShowCoverModal(false);
          setSelectedTask(null);
        }}
        title="Change Task Cover"
        maxWidth="600px"
      >
        {selectedTask && (
          <div>
            <div className="form-group">
              <label className="form-label">Cover Image URL</label>
              <input
                type="text"
                className="form-input"
                value={selectedTask.coverImage || ''}
                onChange={(e) => handleInputChange('coverImage', e.target.value)}
                placeholder="Enter image URL"
              />
            </div>

            {selectedTask.coverImage && (
              <div className="cover-preview">
                <label className="form-label">Preview:</label>
                <img 
                  src={selectedTask.coverImage} 
                  alt="Cover preview" 
                  style={{ width: '100%', borderRadius: '8px', marginTop: '8px' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x250?text=Invalid+Image+URL';
                  }}
                />
              </div>
            )}

            <div className="form-group" style={{ marginTop: '20px' }}>
              <label className="form-label">Or choose from popular options:</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '12px' }}>
                {[
                  'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=250&fit=crop',
                  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=250&fit=crop',
                  'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=400&h=250&fit=crop',
                  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop',
                  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=250&fit=crop',
                  'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=250&fit=crop'
                ].map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Option ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '80px',
                      objectFit: 'cover',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      border: selectedTask.coverImage === url ? '3px solid #1e3a8a' : '2px solid #e5e7eb',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => handleInputChange('coverImage', url)}
                  />
                ))}
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowCoverModal(false);
                  setSelectedTask(null);
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={() => handleSaveCover(selectedTask.coverImage || '')}
              >
                <PencilSquareIcon style={{ width: 18, height: 18 }} />
                Save Cover
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Member Modal */}
      <AddMemberModal
        isOpen={showAddMemberModal}
        onClose={() => {
          setShowAddMemberModal(false);
          setSelectedTaskForMember(null);
        }}
        onAddMembers={handleMembersAdded}
        title="Add Team Members to Task"
        currentMembers={[]} // You can pass current task members here
        entityType="task"
      />
    </div>
  );
};

export default Tasks;