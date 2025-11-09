import React, { useState, useEffect } from 'react';
import '../styles/ProjectView.css';
import '../styles/TaskCard.css';
import TaskSetupModal from './TaskSetupModal';
import TaskCard from './TaskCard';

interface Task {
  id: number;
  title: string;
  projectName?: string;
  assignedUser: string;
  userAvatar: string;
  priority: 'Low' | 'Medium' | 'High';
  dueDate: string;
  loggedHours: number;
  comments: number;
  attachments: number;
  status: 'New' | 'In Progress' | 'Blocked' | 'Done';
  tags?: Array<{
    label: string;
    color: string;
  }>;
  coverImage?: string;
}

interface FinancialDocument {
  id: number;
  type: 'Sales Order' | 'Purchase Order' | 'Customer Invoice' | 'Vendor Bill' | 'Expense';
  number: string;
  amount: number;
  date: string;
  status: string;
}

interface FinancialAction {
  type: 'Sales Order' | 'Invoice' | 'Purchase Order' | 'Vendor Bills' | 'Produces' | 'Expenses';
  action: () => void;
}

interface ProjectViewProps {
  projectId: number;
  projectName?: string;
  onBack?: () => void;
  userName?: string;
}

const ProjectView: React.FC<ProjectViewProps> = ({ 
  projectId, 
  projectName = 'RD Services',
  onBack,
  userName = 'Vibrant Starling'
}) => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'financial'>('tasks');
  const [searchQuery, setSearchQuery] = useState('');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isAddHoursModalOpen, setIsAddHoursModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editTaskData, setEditTaskData] = useState<any>(null);
  const [activeFinancialView, setActiveFinancialView] = useState<'main' | 'sales-order' | 'invoice' | 'purchase-order' | 'vendor-bills' | 'produces' | 'expenses'>('main');

  // Financial handlers that manage both UI state and API calls
  const handleSalesOrder = () => {
    setActiveFinancialView('sales-order');
    setIsSettingsOpen(false);
    setActiveTab('financial');
  };

  const handleInvoice = () => {
    setActiveFinancialView('invoice');
    setIsSettingsOpen(false);
    setActiveTab('financial');
  };

  const handlePurchaseOrder = async () => {
    // Update UI state
    setActiveFinancialView('purchase-order');
    setIsSettingsOpen(false);
    setActiveTab('financial');

    try {
      // Create new purchase order
      const response = await fetch('http://localhost:5000/api/financial/purchase-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ projectId })
      });
      
      if (!response.ok) throw new Error('Failed to create purchase order');
      alert('Purchase order created successfully!');
    } catch (error) {
      console.error('Error creating purchase order:', error);
      alert('Failed to create purchase order');
    }
  };

  const handleVendorBills = async () => {
    // Update UI state
    setActiveFinancialView('vendor-bills');
    setIsSettingsOpen(false);
    setActiveTab('financial');

    try {
      // Create new vendor bill
      const response = await fetch('http://localhost:5000/api/financial/vendor-bill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ projectId })
      });
      
      if (!response.ok) throw new Error('Failed to create vendor bill');
      alert('Vendor bill created successfully!');
    } catch (error) {
      console.error('Error creating vendor bill:', error);
      alert('Failed to create vendor bill');
    }
  };

  const handleProduces = async () => {
    // Update UI state
    setActiveFinancialView('produces');
    setIsSettingsOpen(false);
    setActiveTab('financial');

    try {
      // Create new production record
      const response = await fetch('http://localhost:5000/api/financial/produces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ projectId })
      });
      
      if (!response.ok) throw new Error('Failed to create production record');
      alert('Production record created successfully!');
    } catch (error) {
      console.error('Error creating production record:', error);
      alert('Failed to create production record');
    }
  };

  const handleExpenses = async () => {
    // Update UI state
    setActiveFinancialView('expenses');
    setIsSettingsOpen(false);
    setActiveTab('financial');

    try {
      // Create new expense record
      const response = await fetch('http://localhost:5000/api/financial/expense', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ projectId })
      });
      
      if (!response.ok) throw new Error('Failed to create expense record');
      alert('Expense record created successfully!');
    } catch (error) {
      console.error('Error creating expense record:', error);
      alert('Failed to create expense record');
    }
  };

  const [hoursFormData, setHoursFormData] = useState({
    taskId: '',
    hours: '',
    date: new Date().toISOString().split('T')[0],
    billable: true,
    description: ''
  });

  // Fetch tasks from database
  const fetchTasks = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/tasks/project/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const data = await response.json();
      
      // Transform database tasks to match Task interface
      const transformedTasks: Task[] = data.tasks.map((task: any) => ({
        id: task.id,
        title: task.title,
        projectName: task.project_name,
        assignedUser: task.assigned_user,
        userAvatar: task.assigned_user.split(' ').map((n: string) => n[0]).join(''),
        priority: task.priority.charAt(0).toUpperCase() + task.priority.slice(1) as 'Low' | 'Medium' | 'High',
        dueDate: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        loggedHours: 0,
        comments: 0,
        attachments: 0,
        status: task.status === 'new' ? 'New' : 
                task.status === 'in_progress' ? 'In Progress' : 
                task.status === 'blocked' ? 'Blocked' : 'Done',
        tags: task.tags || [],
        coverImage: task.cover_image
      }));

      setTasks(transformedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleCreateTask = async (taskData: any) => {
    console.log('New task created:', taskData);
    
    try {
      const response = await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          project_id: projectId,
          title: taskData.title || 'Untitled Task',
          description: taskData.description || '',
          assigned_user: taskData.assignedUser || userName,
          priority: (taskData.priority || 'medium').toLowerCase(),
          status: (taskData.status || 'new').toLowerCase().replace(' ', '_'),
          due_date: taskData.dueDate || new Date().toISOString().split('T')[0],
          tags: taskData.tags || [],
          cover_image: taskData.coverImage
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      const data = await response.json();
      console.log('Task created successfully:', data);
      
      fetchTasks();
      setIsTaskModalOpen(false);
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task. Please try again.');
    }
  };

  const handleEditTask = (id: number) => {
    const taskToEdit = tasks.find(t => t.id === id);
    if (taskToEdit) {
      setEditingTaskId(id);
      setEditTaskData({
        title: taskToEdit.title,
        assignedUser: taskToEdit.assignedUser,
        priority: taskToEdit.priority,
        dueDate: taskToEdit.dueDate,
        status: taskToEdit.status,
        tags: taskToEdit.tags,
        coverImage: taskToEdit.coverImage
      });
      setIsTaskModalOpen(true);
    }
  };

  const handleUpdateTask = async (id: number, taskData: any) => {
    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          title: taskData.title,
          description: taskData.description || '',
          assigned_user: taskData.assignedUser,
          priority: taskData.priority.toLowerCase(),
          status: taskData.status.toLowerCase().replace(' ', '_'),
          due_date: taskData.dueDate,
          tags: taskData.tags || [],
          cover_image: taskData.coverImage
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      const data = await response.json();
      console.log('Task updated successfully:', data);
      
      fetchTasks();
      setEditingTaskId(null);
      setEditTaskData(null);
      setIsTaskModalOpen(false);
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task. Please try again.');
    }
  };

  const handleMarkComplete = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${id}/complete`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to mark task as complete');
      }

      const data = await response.json();
      console.log('Task marked as complete:', data);
      
      fetchTasks();
    } catch (error) {
      console.error('Error marking task complete:', error);
      alert('Failed to mark task as complete. Please try again.');
    }
  };

  const handleDeleteTask = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      const data = await response.json();
      console.log('Task deleted successfully:', data);
      
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task. Please try again.');
    }
  };

  const handleChangeCover = (id: number) => {
    console.log('Change cover for task:', id);
    // Implement cover change functionality
  };

  const handleTaskClick = (id: number) => {
    console.log('Task clicked:', id);
    // Implement task detail view
  };

  const handleAddHours = async () => {
    // Validate form
    const hours = parseFloat(hoursFormData.hours);
    if (!hoursFormData.taskId) {
      alert('Please select a task');
      return;
    }
    if (!hours || hours <= 0 || hours > 24) {
      alert('Please enter valid hours (between 0 and 24)');
      return;
    }
    if (!hoursFormData.date) {
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
          taskId: parseInt(hoursFormData.taskId),
          projectId: projectId,
          hours: hours,
          date: hoursFormData.date,
          billable: hoursFormData.billable
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add hours');
      }

      const data = await response.json();
      console.log('Hours logged:', data);

      // Update the task's logged hours in local state
      setTasks(tasks.map(task => 
        task.id === parseInt(hoursFormData.taskId)
          ? { ...task, loggedHours: task.loggedHours + hours }
          : task
      ));

      // Reset form and close modal
      setHoursFormData({
        taskId: '',
        hours: '',
        date: new Date().toISOString().split('T')[0],
        billable: true,
        description: ''
      });
      setIsAddHoursModalOpen(false);

      alert('Hours logged successfully!');
    } catch (error: any) {
      console.error('Error adding hours:', error);
      alert(error.message || 'Failed to log hours. Please try again.');
    }
  };

  // Initialize with sample task data
  React.useEffect(() => {
    if (tasks.length === 0) {
      const sampleTasks: Task[] = [
        {
          id: 1,
          title: 'Design Landing Page',
          assignedUser: 'Sarah Johnson',
          userAvatar: 'SJ',
          priority: 'High',
          dueDate: '2025-11-15',
          loggedHours: 6,
          comments: 3,
          attachments: 2,
          status: 'In Progress',
          tags: [
            { label: 'Design', color: '#8b5cf6' },
            { label: 'UI/UX', color: '#06b6d4' }
          ]
        },
        {
          id: 2,
          title: 'Setup Database Schema',
          assignedUser: 'Mike Chen',
          userAvatar: 'MC',
          priority: 'High',
          dueDate: '2025-11-12',
          loggedHours: 4,
          comments: 1,
          attachments: 0,
          status: 'In Progress',
          tags: [
            { label: 'Backend', color: '#10b981' }
          ]
        },
        {
          id: 3,
          title: 'API Documentation',
          assignedUser: 'Emily Davis',
          userAvatar: 'ED',
          priority: 'Medium',
          dueDate: '2025-11-20',
          loggedHours: 2,
          comments: 0,
          attachments: 1,
          status: 'New',
          tags: [
            { label: 'Documentation', color: '#f59e0b' }
          ]
        },
        {
          id: 4,
          title: 'User Authentication',
          assignedUser: 'James Wilson',
          userAvatar: 'JW',
          priority: 'High',
          dueDate: '2025-11-10',
          loggedHours: 0,
          comments: 2,
          attachments: 0,
          status: 'Blocked',
          tags: [
            { label: 'Bug', color: '#ef4444' },
            { label: 'Security', color: '#dc2626' }
          ]
        },
        {
          id: 5,
          title: 'Initial Project Setup',
          assignedUser: 'Sarah Johnson',
          userAvatar: 'SJ',
          priority: 'Low',
          dueDate: '2025-11-05',
          loggedHours: 8,
          comments: 5,
          attachments: 3,
          status: 'Done',
          tags: [
            { label: 'Setup', color: '#6b7280' }
          ]
        },
        {
          id: 6,
          title: 'Client Requirements Review',
          assignedUser: 'Lisa Anderson',
          userAvatar: 'LA',
          priority: 'Medium',
          dueDate: '2025-11-08',
          loggedHours: 12,
          comments: 8,
          attachments: 5,
          status: 'Done',
          tags: [
            { label: 'Feedback', color: '#3b82f6' }
          ]
        }
      ];
      setTasks(sampleTasks);
    }
  }, []);

  // Sample financial documents
  const financialDocs: FinancialDocument[] = [
    {
      id: 1,
      type: 'Sales Order',
      number: 'SO-2025-001',
      amount: 60000,
      date: '2025-11-01',
      status: 'Approved'
    },
    {
      id: 2,
      type: 'Purchase Order',
      number: 'PO-2025-012',
      amount: 40000,
      date: '2025-11-02',
      status: 'Pending'
    },
    {
      id: 3,
      type: 'Customer Invoice',
      number: 'INV-2025-045',
      amount: 30000,
      date: '2025-11-10',
      status: 'Paid'
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return '#ef4444';
      case 'Medium': return '#f59e0b';
      case 'Low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.assignedUser.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTasksByStatus = (status: Task['status']) => {
    return filteredTasks.filter(task => task.status === status);
  };

  const formatCurrency = (amount: number) => {
    return `$${(amount / 1000).toFixed(0)}K`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Add click outside listener to close settings dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.settings-dropdown')) {
        setIsSettingsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="project-view-container">
        {/* Main Content */}
      <main className="project-main-content">
        {/* Header */}
        <header className="project-header">
          <div className="project-header-left">
            <button className="back-btn" onClick={onBack}>
              ← Back
            </button>
            <div>
              <h1>{projectName}</h1>
              <p className="project-subtitle">Project Management • Active</p>
            </div>
          </div>
          <div className="project-header-actions">
            <button className="btn-secondary" onClick={() => setIsAddHoursModalOpen(true)}>
              + Add Hours
            </button>
            <button className="btn-primary" onClick={() => setIsTaskModalOpen(true)}>
              + Add Task
            </button>
            <div className="settings-dropdown">
              <button 
                className="btn-secondary"
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                aria-haspopup="true"
                aria-expanded={isSettingsOpen}
              >
                Settings
              </button>
              {isSettingsOpen && (
                <div className="settings-menu">
                  <button onClick={handleSalesOrder}>Sales Order</button>
                  <button onClick={handleInvoice}>Invoice</button>
                  <button onClick={handlePurchaseOrder}>Purchase Order</button>
                  <button onClick={handleVendorBills}>Vendor Bills</button>
                  <button onClick={handleProduces}>Produces</button>
                  <button onClick={handleExpenses}>Expenses</button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="project-tabs">
          <button
            className={activeTab === 'tasks' ? 'tab-btn active' : 'tab-btn'}
            onClick={() => setActiveTab('tasks')}
          >
            📋 Tasks View
          </button>
          <button
            className={activeTab === 'financial' ? 'tab-btn active' : 'tab-btn'}
            onClick={() => setActiveTab('financial')}
          >
            💰 Financial Links
          </button>
        </div>

        {/* Tasks View - Kanban Board */}
        {activeTab === 'tasks' && (
          <div className="tasks-view">
            {/* Search Bar */}
            <div className="kanban-search">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="kanban-search-input"
              />
            </div>

            {/* Kanban Board */}
            <div className="kanban-board">
              {/* New Column */}
              <div className="kanban-column">
                <div className="kanban-column-header">
                  <h3>New</h3>
                  <span className="task-count">{getTasksByStatus('New').length}</span>
                </div>
                <div className="kanban-column-content">
                  {getTasksByStatus('New').map(task => (
                    <TaskCard
                      key={task.id}
                      {...task}
                      onEdit={handleEditTask}
                      onDelete={handleDeleteTask}
                      onChangeCover={handleChangeCover}
                      onMarkComplete={handleMarkComplete}
                      onClick={handleTaskClick}
                    />
                  ))}
                </div>
              </div>

              {/* In Progress Column */}
              <div className="kanban-column">
                <div className="kanban-column-header in-progress">
                  <h3>In Progress</h3>
                  <span className="task-count">{getTasksByStatus('In Progress').length}</span>
                </div>
                <div className="kanban-column-content">
                  {getTasksByStatus('In Progress').map(task => (
                    <TaskCard
                      key={task.id}
                      {...task}
                      onEdit={handleEditTask}
                      onDelete={handleDeleteTask}
                      onChangeCover={handleChangeCover}
                      onMarkComplete={handleMarkComplete}
                      onClick={handleTaskClick}
                    />
                  ))}
                </div>
              </div>

              {/* Blocked Column */}
              <div className="kanban-column">
                <div className="kanban-column-header blocked">
                  <h3>Blocked</h3>
                  <span className="task-count">{getTasksByStatus('Blocked').length}</span>
                </div>
                <div className="kanban-column-content">
                  {getTasksByStatus('Blocked').map(task => (
                    <TaskCard
                      key={task.id}
                      {...task}
                      onEdit={handleEditTask}
                      onDelete={handleDeleteTask}
                      onChangeCover={handleChangeCover}
                      onMarkComplete={handleMarkComplete}
                      onClick={handleTaskClick}
                    />
                  ))}
                </div>
              </div>

              {/* Done Column */}
              <div className="kanban-column">
                <div className="kanban-column-header done">
                  <h3>Done</h3>
                  <span className="task-count">{getTasksByStatus('Done').length}</span>
                </div>
                <div className="kanban-column-content">
                  {getTasksByStatus('Done').map(task => (
                    <TaskCard
                      key={task.id}
                      {...task}
                      onEdit={handleEditTask}
                      onDelete={handleDeleteTask}
                      onChangeCover={handleChangeCover}
                      onMarkComplete={handleMarkComplete}
                      onClick={handleTaskClick}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Financial Links View */}
        {activeTab === 'financial' && (
          <div className="financial-view">
            <div className="financial-header">
              <h2>Financial Documents</h2>
              <p>Manage all financial documents related to this project</p>
            </div>

            <div className="financial-grid">
              {/* Sales Orders */}
              <div className="financial-section">
                <div className="financial-section-header">
                  <div className="section-title">
                    <span className="section-icon">📄</span>
                    <h3>Sales Orders</h3>
                  </div>
                  <button className="add-doc-btn">+ New</button>
                </div>
                <div className="financial-list">
                  {financialDocs
                    .filter(doc => doc.type === 'Sales Order')
                    .map(doc => (
                      <div key={doc.id} className="financial-item">
                        <div className="financial-item-info">
                          <span className="doc-number">{doc.number}</span>
                          <span className="doc-date">{formatDate(doc.date)}</span>
                        </div>
                        <div className="financial-item-details">
                          <span className="doc-amount">{formatCurrency(doc.amount)}</span>
                          <span className={`doc-status ${doc.status.toLowerCase()}`}>
                            {doc.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  {financialDocs.filter(doc => doc.type === 'Sales Order').length === 0 && (
                    <div className="empty-financial">No sales orders yet</div>
                  )}
                </div>
              </div>

              {/* Purchase Orders */}
              <div className="financial-section">
                <div className="financial-section-header">
                  <div className="section-title">
                    <span className="section-icon">📋</span>
                    <h3>Purchase Orders</h3>
                  </div>
                  <button className="add-doc-btn">+ New</button>
                </div>
                <div className="financial-list">
                  {financialDocs
                    .filter(doc => doc.type === 'Purchase Order')
                    .map(doc => (
                      <div key={doc.id} className="financial-item">
                        <div className="financial-item-info">
                          <span className="doc-number">{doc.number}</span>
                          <span className="doc-date">{formatDate(doc.date)}</span>
                        </div>
                        <div className="financial-item-details">
                          <span className="doc-amount">{formatCurrency(doc.amount)}</span>
                          <span className={`doc-status ${doc.status.toLowerCase()}`}>
                            {doc.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  {financialDocs.filter(doc => doc.type === 'Purchase Order').length === 0 && (
                    <div className="empty-financial">No purchase orders yet</div>
                  )}
                </div>
              </div>

              {/* Customer Invoices */}
              <div className="financial-section">
                <div className="financial-section-header">
                  <div className="section-title">
                    <span className="section-icon">💳</span>
                    <h3>Customer Invoices</h3>
                  </div>
                  <button className="add-doc-btn">+ New</button>
                </div>
                <div className="financial-list">
                  {financialDocs
                    .filter(doc => doc.type === 'Customer Invoice')
                    .map(doc => (
                      <div key={doc.id} className="financial-item">
                        <div className="financial-item-info">
                          <span className="doc-number">{doc.number}</span>
                          <span className="doc-date">{formatDate(doc.date)}</span>
                        </div>
                        <div className="financial-item-details">
                          <span className="doc-amount">{formatCurrency(doc.amount)}</span>
                          <span className={`doc-status ${doc.status.toLowerCase()}`}>
                            {doc.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  {financialDocs.filter(doc => doc.type === 'Customer Invoice').length === 0 && (
                    <div className="empty-financial">No customer invoices yet</div>
                  )}
                </div>
              </div>

              {/* Vendor Bills */}
              <div className="financial-section">
                <div className="financial-section-header">
                  <div className="section-title">
                    <span className="section-icon">🧾</span>
                    <h3>Vendor Bills</h3>
                  </div>
                  <button className="add-doc-btn">+ New</button>
                </div>
                <div className="financial-list">
                  <div className="empty-financial">No vendor bills yet</div>
                </div>
              </div>

              {/* Expenses */}
              <div className="financial-section">
                <div className="financial-section-header">
                  <div className="section-title">
                    <span className="section-icon">💰</span>
                    <h3>Expenses</h3>
                  </div>
                  <button className="add-doc-btn">+ New</button>
                </div>
                <div className="financial-list">
                  <div className="empty-financial">No expenses yet</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Task Setup Modal */}
      <TaskSetupModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTaskId(null);
          setEditTaskData(null);
        }}
        projectName={projectName}
        onCreateTask={handleCreateTask}
        editMode={editingTaskId !== null}
        editTaskId={editingTaskId}
        editTaskData={editTaskData}
        onUpdateTask={handleUpdateTask}
      />
    </div>
  );
};

export default ProjectView;
