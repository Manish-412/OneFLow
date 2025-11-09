import React, { useState } from 'react';
import '../styles/TaskExtendedView.css';

interface Task {
  id: number;
  title: string;
  projectName: string;
  assignee: {
    name: string;
    avatar: string;
  };
  tags: string[];
  priority: 1 | 2 | 3;
  coverImage?: string;
  dueDate: string;
  status: 'new' | 'in-progress' | 'blocked' | 'done';
  description?: string;
  timesheets?: Timesheet[];
  createdBy?: string;
  updatedOn?: string;
  linkedItems?: {
    salesOrders?: string[];
    invoices?: string[];
    purchaseOrders?: string[];
    expenses?: string[];
  };
}

interface Timesheet {
  id: number;
  employee: string;
  hours: number;
  date: string;
}

interface TaskExtendedViewProps {
  onBack?: () => void;
}

const TaskExtendedView: React.FC<TaskExtendedViewProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'project' | 'tasks' | 'settings'>('tasks');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showLinkedItems, setShowLinkedItems] = useState(true);
  const [detailTab, setDetailTab] = useState<'description' | 'timesheets' | 'info'>('description');
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showTimesheetModal, setShowTimesheetModal] = useState(false);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    projectName: 'RD Sales',
    assignee: 'Sarah Chen',
    tags: [] as string[],
    priority: 2 as 1 | 2 | 3,
    dueDate: '',
    coverImage: '',
  });
  const [newTimesheet, setNewTimesheet] = useState({
    hours: '',
    date: new Date().toISOString().split('T')[0],
    billable: true
  });

  // Sample tasks data
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      title: 'Optimize Website Controllers',
      projectName: 'RD Sales',
      assignee: { name: 'Sarah Chen', avatar: 'SC' },
      tags: ['Feedback', 'Bug'],
      priority: 3,
      coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
      dueDate: '2025-11-21',
      status: 'new',
      description: 'Refactor and optimize the main controllers for better performance.',
      timesheets: [],
      createdBy: 'John Doe',
      updatedOn: '2025-11-08',
    },
    {
      id: 2,
      title: 'Design New Dashboard Layout',
      projectName: 'RD Sales',
      assignee: { name: 'Mike Johnson', avatar: 'MJ' },
      tags: ['Design', 'UI/UX'],
      priority: 2,
      coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
      dueDate: '2025-11-15',
      status: 'in-progress',
      description: 'Create a modern dashboard with dark mode support.',
      timesheets: [
        { id: 1, employee: 'Mike Johnson', hours: 8, date: '2025-11-07' },
        { id: 2, employee: 'Mike Johnson', hours: 6, date: '2025-11-08' },
      ],
      createdBy: 'Admin User',
      updatedOn: '2025-11-08',
    },
    {
      id: 3,
      title: 'API Integration for Payment Gateway',
      projectName: 'RD Sales',
      assignee: { name: 'Emily Davis', avatar: 'ED' },
      tags: ['Backend', 'Integration'],
      priority: 3,
      dueDate: '2025-11-18',
      status: 'blocked',
      description: 'Integrate Stripe payment gateway with the backend API.',
      timesheets: [],
      createdBy: 'Sarah Chen',
      updatedOn: '2025-11-06',
    },
    {
      id: 4,
      title: 'User Authentication System',
      projectName: 'RD Sales',
      assignee: { name: 'David Lee', avatar: 'DL' },
      tags: ['Security', 'Backend'],
      priority: 1,
      coverImage: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=400',
      dueDate: '2025-11-10',
      status: 'done',
      description: 'Implement JWT-based authentication with refresh tokens.',
      timesheets: [
        { id: 1, employee: 'David Lee', hours: 12, date: '2025-11-05' },
        { id: 2, employee: 'David Lee', hours: 10, date: '2025-11-06' },
      ],
      createdBy: 'Admin User',
      updatedOn: '2025-11-07',
    },
    {
      id: 5,
      title: 'Mobile Responsive Updates',
      projectName: 'RD Sales',
      assignee: { name: 'Lisa Wang', avatar: 'LW' },
      tags: ['Frontend', 'Mobile'],
      priority: 2,
      dueDate: '2025-11-25',
      status: 'in-progress',
      description: 'Make all pages responsive for mobile devices.',
      timesheets: [
        { id: 1, employee: 'Lisa Wang', hours: 4, date: '2025-11-08' },
      ],
      createdBy: 'John Doe',
      updatedOn: '2025-11-08',
    },
  ]);

  const getTasksByStatus = (status: Task['status']) => {
    return tasks.filter(task => 
      task.status === status && 
      (task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
       task.projectName.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  const getTagColor = (tag: string) => {
    const colors: { [key: string]: string } = {
      'Feedback': 'bg-blue-500/20 text-blue-300',
      'Bug': 'bg-red-500/20 text-red-300',
      'Design': 'bg-purple-500/20 text-purple-300',
      'UI/UX': 'bg-pink-500/20 text-pink-300',
      'Backend': 'bg-green-500/20 text-green-300',
      'Integration': 'bg-yellow-500/20 text-yellow-300',
      'Security': 'bg-orange-500/20 text-orange-300',
      'Frontend': 'bg-cyan-500/20 text-cyan-300',
      'Mobile': 'bg-indigo-500/20 text-indigo-300',
    };
    return colors[tag] || 'bg-gray-500/20 text-gray-300';
  };

  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (status: Task['status']) => {
    if (draggedTask) {
      setTasks(tasks.map(task => 
        task.id === draggedTask.id ? { ...task, status } : task
      ));
      setDraggedTask(null);
    }
  };

  const handleCreateTask = () => {
    if (!newTask.title.trim()) {
      alert('Please enter a task title');
      return;
    }

    const task: Task = {
      id: tasks.length + 1,
      title: newTask.title,
      projectName: newTask.projectName,
      assignee: {
        name: newTask.assignee,
        avatar: newTask.assignee.split(' ').map(n => n[0]).join(''),
      },
      tags: newTask.tags,
      priority: newTask.priority,
      coverImage: newTask.coverImage || undefined,
      dueDate: newTask.dueDate,
      status: 'new',
      description: '',
      timesheets: [],
      createdBy: 'Current User',
      updatedOn: new Date().toISOString().split('T')[0],
    };

    setTasks([...tasks, task]);
    setShowNewTaskModal(false);
    setNewTask({
      title: '',
      projectName: 'RD Sales',
      assignee: 'Sarah Chen',
      tags: [],
      priority: 2,
      dueDate: '',
      coverImage: '',
    });
  };

  const handleAddTag = (tag: string) => {
    if (tag && !newTask.tags.includes(tag)) {
      setNewTask({ ...newTask, tags: [...newTask.tags, tag] });
    }
  };

  const handleAddTimesheet = async () => {
    if (!selectedTask) return;

    // Validate hours
    const hours = parseFloat(newTimesheet.hours);
    if (!hours || hours <= 0 || hours > 24) {
      alert('Please enter valid hours (between 0 and 24)');
      return;
    }

    if (!newTimesheet.date) {
      alert('Please select a date');
      return;
    }

    try {
      // Save to database
      const response = await fetch('http://localhost:5000/api/timesheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          taskId: selectedTask.id,
          projectId: 1, // You'll need to get the actual project ID
          hours: hours,
          date: newTimesheet.date,
          billable: newTimesheet.billable
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add timesheet');
      }

      const data = await response.json();
      console.log('Timesheet added:', data);

      // Add to local state
      const newTimesheetEntry: Timesheet = {
        id: data.timesheet.id,
        employee: data.timesheet.employee,
        hours: data.timesheet.hours,
        date: data.timesheet.date
      };

      setSelectedTask({
        ...selectedTask,
        timesheets: [newTimesheetEntry, ...(selectedTask.timesheets || [])]
      });

      // Update tasks array
      setTasks(tasks.map(task => 
        task.id === selectedTask.id 
          ? { ...task, timesheets: [newTimesheetEntry, ...(task.timesheets || [])] }
          : task
      ));

      // Reset form and close modal
      setNewTimesheet({
        hours: '',
        date: new Date().toISOString().split('T')[0],
        billable: true
      });
      setShowTimesheetModal(false);

      alert('Timesheet added successfully!');
    } catch (error) {
      console.error('Error adding timesheet:', error);
      alert('Failed to add timesheet. Please try again.');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setNewTask({ ...newTask, tags: newTask.tags.filter(t => t !== tagToRemove) });
  };

  const handleDeleteTask = (taskId: number) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setTasks(tasks.filter(t => t.id !== taskId));
      setActiveMenu(null);
    }
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setActiveMenu(null);
  };

  const handleChangeCover = (taskId: number) => {
    const newCoverUrl = prompt('Enter new cover image URL:');
    if (newCoverUrl !== null) {
      setTasks(tasks.map(t => 
        t.id === taskId ? { ...t, coverImage: newCoverUrl || undefined } : t
      ));
      setActiveMenu(null);
    }
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const completionRate = Math.round((completedTasks / totalTasks) * 100);

  const availableTags = ['Feedback', 'Bug', 'Design', 'UI/UX', 'Backend', 'Integration', 'Security', 'Frontend', 'Mobile'];
  const availableAssignees = ['Sarah Chen', 'Mike Johnson', 'Emily Davis', 'David Lee', 'Lisa Wang', 'John Doe'];
  const availableProjects = ['RD Sales', 'Marketing Campaign', 'Product Launch', 'Infrastructure Upgrade'];

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => setActiveMenu(null);
    if (activeMenu !== null) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [activeMenu]);

  // Reusable Task Card Component
  const renderTaskCard = (task: Task) => (
    <div
      key={task.id}
      className="task-card"
      draggable
      onDragStart={() => handleDragStart(task)}
      onClick={(e) => {
        // Don't open detail panel if clicking on menu
        if (!(e.target as HTMLElement).closest('.task-menu-btn, .task-menu-dropdown')) {
          setSelectedTask(task);
        }
      }}
    >
      {task.coverImage && (
        <div className="task-cover" style={{ backgroundImage: `url(${task.coverImage})` }} />
      )}
      <div className="task-card-content">
        <span className="task-project-name">{task.projectName}</span>
        <h4 className="task-title">{task.title}</h4>
        {task.tags.length > 0 && (
          <div className="task-tags">
            {task.tags.map((tag, idx) => (
              <span key={idx} className={`task-tag ${getTagColor(tag)}`}>
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className="task-priority">
          {Array.from({ length: task.priority }).map((_, idx) => (
            <span key={idx}>⭐</span>
          ))}
        </div>
        <div className="task-footer">
          <div className="task-footer-left">
            <div className="task-assignee">
              <div className="assignee-avatar">{task.assignee.avatar}</div>
            </div>
            {task.dueDate && (
              <span className="task-due-date">📅 {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            )}
          </div>
        </div>
      </div>
      <div className="task-menu">
        <button 
          className="task-menu-btn"
          onClick={(e) => {
            e.stopPropagation();
            setActiveMenu(activeMenu === task.id ? null : task.id);
          }}
        >
          ⋯
        </button>
        {activeMenu === task.id && (
          <div className="task-menu-dropdown">
            <button onClick={(e) => { e.stopPropagation(); handleEditTask(task); }}>
              ✏️ Edit
            </button>
            <button onClick={(e) => { e.stopPropagation(); handleChangeCover(task.id); }}>
              🖼️ Change Cover
            </button>
            <button onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }} className="delete-option">
              🗑️ Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="task-extended-view">
      {/* Header / Top Bar */}
      <header className="task-header">
        <div className="task-header-left">
          <button className="back-button" onClick={onBack}>← Back</button>
          <nav className="task-nav-tabs">
            <button 
              className={`nav-tab ${activeTab === 'project' ? 'active' : ''}`}
              onClick={() => setActiveTab('project')}
            >
              Project
            </button>
            <button 
              className={`nav-tab ${activeTab === 'tasks' ? 'active' : ''}`}
              onClick={() => setActiveTab('tasks')}
            >
              Tasks
            </button>
            <button 
              className={`nav-tab ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              Settings
            </button>
          </nav>
          <div className="linked-panels">
            <button className="linked-panel-btn">📄 Sales Order</button>
            <button className="linked-panel-btn">💳 Invoices</button>
            <button className="linked-panel-btn">📦 Purchase Orders</button>
            <button className="linked-panel-btn">💰 Expenses</button>
            <button className="linked-panel-btn">📊 Dashboard</button>
          </div>
        </div>
        <div className="task-header-right">
          <div className="task-search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="task-stats">
            <div className="stat-item">
              <span className="stat-label">Total</span>
              <span className="stat-value">{totalTasks}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Completed</span>
              <span className="stat-value">{completionRate}%</span>
            </div>
          </div>
        </div>
      </header>

      {/* Linked Items Bar */}
      {showLinkedItems && (
        <div className="linked-items-bar">
          <button className="toggle-linked" onClick={() => setShowLinkedItems(false)}>
            ▼ Linked Items
          </button>
          <div className="linked-badges">
            <span className="linked-badge">📄 SO-2025-001</span>
            <span className="linked-badge">💳 INV-2025-045</span>
            <span className="linked-badge">📦 PO-2025-012</span>
            <span className="linked-badge">💰 EXP-2025-008</span>
          </div>
        </div>
      )}

      {/* Main Workspace */}
      <div className="task-workspace">
        {/* Left Side - Controls */}
        <div className="workspace-left">
          <button className="new-task-btn" onClick={() => setShowNewTaskModal(true)}>+ New Task</button>
          <div className="project-info">
            <h2 className="project-name">RD Sales</h2>
            <select className="filter-dropdown">
              <option>All Tasks</option>
              <option>My Tasks</option>
              <option>High Priority</option>
              <option>Due This Week</option>
            </select>
          </div>
        </div>

        {/* Center - Kanban Board */}
        <div className="kanban-container">
          {/* New Column */}
          <div 
            className="kanban-column"
            onDragOver={handleDragOver}
            onDrop={() => handleDrop('new')}
          >
            <div className="column-header">
              <h3>New</h3>
              <span className="column-count">{getTasksByStatus('new').length}</span>
            </div>
            <button className="column-new-btn" onClick={() => setShowNewTaskModal(true)}>
              + New
            </button>
            <div className="column-content">
              {getTasksByStatus('new').map(task => renderTaskCard(task))}
            </div>
          </div>

          {/* In Progress Column */}
          <div 
            className="kanban-column"
            onDragOver={handleDragOver}
            onDrop={() => handleDrop('in-progress')}
          >
            <div className="column-header in-progress">
              <h3>In Progress</h3>
              <span className="column-count">{getTasksByStatus('in-progress').length}</span>
            </div>
            <div className="column-content">
              {getTasksByStatus('in-progress').map(task => renderTaskCard(task))}
            </div>
          </div>

          {/* Blocked Column */}
          <div 
            className="kanban-column"
            onDragOver={handleDragOver}
            onDrop={() => handleDrop('blocked')}
          >
            <div className="column-header blocked">
              <h3>Blocked</h3>
              <span className="column-count">{getTasksByStatus('blocked').length}</span>
            </div>
            <div className="column-content">
              {getTasksByStatus('blocked').map(task => renderTaskCard(task))}
            </div>
          </div>

          {/* Done Column */}
          <div 
            className="kanban-column"
            onDragOver={handleDragOver}
            onDrop={() => handleDrop('done')}
          >
            <div className="column-header done">
              <h3>Done</h3>
              <span className="column-count">{getTasksByStatus('done').length}</span>
            </div>
            <div className="column-content">
              {getTasksByStatus('done').map(task => renderTaskCard(task))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Task Detail */}
      {selectedTask && (
        <div className="task-detail-panel">
          <div className="panel-overlay" onClick={() => setSelectedTask(null)} />
          <div className="panel-content">
            <div className="panel-header">
              <h2>Task Details</h2>
              <button className="close-panel" onClick={() => setSelectedTask(null)}>✕</button>
            </div>
            
            <div className="panel-body">
              <div className="form-group">
                <label>Task Name</label>
                <input type="text" value={selectedTask.title} className="form-input" />
              </div>

              <div className="form-group">
                <label>Assignee</label>
                <select className="form-select">
                  <option>{selectedTask.assignee.name}</option>
                  <option>Sarah Chen</option>
                  <option>Mike Johnson</option>
                  <option>Emily Davis</option>
                </select>
              </div>

              <div className="form-group">
                <label>Tags</label>
                <div className="tags-input">
                  {selectedTask.tags.map((tag, idx) => (
                    <span key={idx} className={`tag-chip ${getTagColor(tag)}`}>
                      {tag} <button className="remove-tag">✕</button>
                    </span>
                  ))}
                  <button className="add-tag-btn">+ Add Tag</button>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Project</label>
                  <select className="form-select">
                    <option>{selectedTask.projectName}</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Due Date</label>
                  <input type="date" value={selectedTask.dueDate} className="form-input" />
                </div>
              </div>

              <div className="form-group">
                <label>Priority</label>
                <div className="priority-selector">
                  <label className={selectedTask.priority === 1 ? 'active' : ''}>
                    <input type="radio" name="priority" value="1" /> ⭐ Low
                  </label>
                  <label className={selectedTask.priority === 2 ? 'active' : ''}>
                    <input type="radio" name="priority" value="2" /> ⭐⭐ Medium
                  </label>
                  <label className={selectedTask.priority === 3 ? 'active' : ''}>
                    <input type="radio" name="priority" value="3" /> ⭐⭐⭐ High
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Cover Image</label>
                <button className="upload-btn">📷 Upload Image</button>
              </div>

              <div className="detail-tabs">
                <button 
                  className={`detail-tab ${detailTab === 'description' ? 'active' : ''}`}
                  onClick={() => setDetailTab('description')}
                >
                  Description
                </button>
                <button 
                  className={`detail-tab ${detailTab === 'timesheets' ? 'active' : ''}`}
                  onClick={() => setDetailTab('timesheets')}
                >
                  Timesheets
                </button>
                <button 
                  className={`detail-tab ${detailTab === 'info' ? 'active' : ''}`}
                  onClick={() => setDetailTab('info')}
                >
                  Task Info
                </button>
              </div>

              {detailTab === 'description' && (
                <div className="tab-content">
                  <textarea 
                    className="description-textarea" 
                    rows={8}
                    placeholder="Enter task description..."
                    defaultValue={selectedTask.description}
                  />
                </div>
              )}

              {detailTab === 'timesheets' && (
                <div className="tab-content">
                  <table className="timesheets-table">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Hours</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedTask.timesheets && selectedTask.timesheets.length > 0 ? (
                        selectedTask.timesheets.map((ts) => (
                          <tr key={ts.id}>
                            <td>{ts.employee}</td>
                            <td>{ts.hours}h</td>
                            <td>{new Date(ts.date).toLocaleDateString()}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="empty-timesheets">No timesheets logged yet</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  <button className="add-timesheet-btn" onClick={() => setShowTimesheetModal(true)}>+ Add Timesheet</button>
                </div>
              )}

              {detailTab === 'info' && (
                <div className="tab-content task-info">
                  <div className="info-row">
                    <span className="info-label">Created By:</span>
                    <span className="info-value">{selectedTask.createdBy}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Updated On:</span>
                    <span className="info-value">{selectedTask.updatedOn}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Status:</span>
                    <span className="info-value status-badge">{selectedTask.status}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Task ID:</span>
                    <span className="info-value">#{selectedTask.id}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="panel-footer">
              <button className="btn-cancel" onClick={() => setSelectedTask(null)}>Cancel</button>
              <button className="btn-save">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* New Task Modal */}
      {showNewTaskModal && (
        <div className="task-detail-panel">
          <div className="panel-overlay" onClick={() => setShowNewTaskModal(false)} />
          <div className="panel-content">
            <div className="panel-header">
              <h2>Create New Task</h2>
              <button className="close-panel" onClick={() => setShowNewTaskModal(false)}>✕</button>
            </div>
            
            <div className="panel-body">
              <div className="form-group">
                <label>Task Title *</label>
                <input 
                  type="text" 
                  value={newTask.title} 
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Enter task title..."
                  className="form-input" 
                />
              </div>

              <div className="form-group">
                <label>Project Name</label>
                <select 
                  className="form-select"
                  value={newTask.projectName}
                  onChange={(e) => setNewTask({ ...newTask, projectName: e.target.value })}
                >
                  {availableProjects.map((project) => (
                    <option key={project} value={project}>{project}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Tags</label>
                <div className="tags-input">
                  {newTask.tags.map((tag, idx) => (
                    <span key={idx} className={`tag-chip ${getTagColor(tag)}`}>
                      {tag} <button type="button" className="remove-tag" onClick={() => handleRemoveTag(tag)}>✕</button>
                    </span>
                  ))}
                  <select 
                    className="add-tag-select"
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAddTag(e.target.value);
                        e.target.value = '';
                      }
                    }}
                  >
                    <option value="">+ Add Tag</option>
                    {availableTags.filter(t => !newTask.tags.includes(t)).map((tag) => (
                      <option key={tag} value={tag}>{tag}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Assignee</label>
                  <select 
                    className="form-select"
                    value={newTask.assignee}
                    onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                  >
                    {availableAssignees.map((assignee) => (
                      <option key={assignee} value={assignee}>{assignee}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Due Date</label>
                  <input 
                    type="date" 
                    value={newTask.dueDate} 
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="form-input" 
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Priority</label>
                <div className="priority-selector">
                  <label className={newTask.priority === 1 ? 'active' : ''}>
                    <input 
                      type="radio" 
                      name="priority" 
                      value="1"
                      checked={newTask.priority === 1}
                      onChange={() => setNewTask({ ...newTask, priority: 1 })}
                    /> ⭐ Low
                  </label>
                  <label className={newTask.priority === 2 ? 'active' : ''}>
                    <input 
                      type="radio" 
                      name="priority" 
                      value="2"
                      checked={newTask.priority === 2}
                      onChange={() => setNewTask({ ...newTask, priority: 2 })}
                    /> ⭐⭐ Medium
                  </label>
                  <label className={newTask.priority === 3 ? 'active' : ''}>
                    <input 
                      type="radio" 
                      name="priority" 
                      value="3"
                      checked={newTask.priority === 3}
                      onChange={() => setNewTask({ ...newTask, priority: 3 })}
                    /> ⭐⭐⭐ High
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Cover Image URL (Optional)</label>
                <input 
                  type="text" 
                  value={newTask.coverImage} 
                  onChange={(e) => setNewTask({ ...newTask, coverImage: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="form-input" 
                />
                {newTask.coverImage && (
                  <div className="cover-preview" style={{ backgroundImage: `url(${newTask.coverImage})` }}>
                    <button 
                      type="button" 
                      className="remove-cover"
                      onClick={() => setNewTask({ ...newTask, coverImage: '' })}
                    >
                      ✕ Remove
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="panel-footer">
              <button className="btn-cancel" onClick={() => setShowNewTaskModal(false)}>Cancel</button>
              <button className="btn-save" onClick={handleCreateTask}>Create Task</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Timesheet Modal */}
      {showTimesheetModal && (
        <div className="task-detail-panel">
          <div className="panel-overlay" onClick={() => setShowTimesheetModal(false)} />
          <div className="panel-content" style={{ maxWidth: '500px' }}>
            <div className="panel-header">
              <h2>Add Timesheet Entry</h2>
              <button className="close-panel" onClick={() => setShowTimesheetModal(false)}>✕</button>
            </div>
            
            <div className="panel-body">
              <div className="form-group">
                <label>Task</label>
                <input 
                  type="text" 
                  value={selectedTask?.title || ''} 
                  className="form-input" 
                  disabled
                  style={{ backgroundColor: '#2a2a2a', cursor: 'not-allowed' }}
                />
              </div>

              <div className="form-group">
                <label>Hours Worked *</label>
                <input 
                  type="number" 
                  value={newTimesheet.hours} 
                  onChange={(e) => setNewTimesheet({ ...newTimesheet, hours: e.target.value })}
                  placeholder="e.g. 8"
                  className="form-input"
                  min="0.5"
                  max="24"
                  step="0.5"
                />
                <small style={{ color: '#888', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                  Enter hours between 0.5 and 24
                </small>
              </div>

              <div className="form-group">
                <label>Date *</label>
                <input 
                  type="date" 
                  value={newTimesheet.date} 
                  onChange={(e) => setNewTimesheet({ ...newTimesheet, date: e.target.value })}
                  className="form-input"
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={newTimesheet.billable}
                    onChange={(e) => setNewTimesheet({ ...newTimesheet, billable: e.target.checked })}
                    style={{ marginRight: '8px' }}
                  />
                  Billable
                </label>
              </div>
            </div>

            <div className="panel-footer">
              <button className="btn-cancel" onClick={() => setShowTimesheetModal(false)}>Cancel</button>
              <button className="btn-save" onClick={handleAddTimesheet}>Add Timesheet</button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button className="fab" onClick={() => setShowNewTaskModal(true)}>
        + New Task
      </button>
    </div>
  );
};

export default TaskExtendedView;
