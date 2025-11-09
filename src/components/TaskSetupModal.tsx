import React, { useState, useEffect } from 'react';
import '../styles/TaskSetupModal.css';

interface SubTask {
  id: number;
  title: string;
  completed: boolean;
}

interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface TaskSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName?: string;
  onCreateTask?: (taskData: any) => void;
  editMode?: boolean;
  editTaskId?: number | null;
  editTaskData?: any;
  onUpdateTask?: (id: number, taskData: any) => void;
}

const TaskSetupModal: React.FC<TaskSetupModalProps> = ({
  isOpen,
  onClose,
  projectName = 'RD Services',
  onCreateTask,
  editMode = false,
  editTaskId = null,
  editTaskData = null,
  onUpdateTask
}) => {
  const [taskTitle, setTaskTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [dueDate, setDueDate] = useState('');
  const [assignees, setAssignees] = useState<string[]>([]);
  const [status, setStatus] = useState('New');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [subTasks, setSubTasks] = useState<SubTask[]>([
    { id: 1, title: 'Create wireframes', completed: true },
    { id: 2, title: 'Mockup UI', completed: true }
  ]);
  const [newSubTaskTitle, setNewSubTaskTitle] = useState('');

  // Fetch team members and populate edit data when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchTeamMembers();
      
      // If in edit mode, populate form with existing data
      if (editMode && editTaskData) {
        setTaskTitle(editTaskData.title || '');
        setDescription(editTaskData.description || '');
        setPriority(editTaskData.priority || 'Medium');
        setDueDate(editTaskData.dueDate || '');
        setAssignees(editTaskData.assignees || (editTaskData.assignedUser ? [editTaskData.assignedUser] : []));
        setStatus(editTaskData.status || 'New');
      } else {
        // Reset form for create mode
        setTaskTitle('');
        setDescription('');
        setPriority('Medium');
        setDueDate('');
        setAssignees([]);
        setStatus('New');
      }
    }
  }, [isOpen, editMode, editTaskData]);

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch team members');
      }

      const data = await response.json();
      // Filter to only show team_members and remove duplicates
      const uniqueTeamMembers = (data.users || [])
        .filter((user: TeamMember) => user.role === 'team_member')
        .filter((user: TeamMember, index: number, self: TeamMember[]) => 
          index === self.findIndex((u) => u.email === user.email)
        );
      setTeamMembers(uniqueTeamMembers);
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const toggleAssignee = (memberName: string) => {
    if (assignees.includes(memberName)) {
      setAssignees(assignees.filter(a => a !== memberName));
    } else {
      setAssignees([...assignees, memberName]);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = () => {
    const taskData = {
      title: taskTitle,
      description,
      priority,
      dueDate,
      assignedUser: assignees.length > 0 ? assignees[0] : '',
      assignees,
      status,
      subTasks: subTasks.filter(st => st.title.trim() !== '')
    };
    
    if (editMode && editTaskId && onUpdateTask) {
      onUpdateTask(editTaskId, taskData);
    } else if (onCreateTask) {
      onCreateTask(taskData);
    }
    
    // Reset form
    setTaskTitle('');
    setDescription('');
    setPriority('Medium');
    setDueDate('');
    setAssignees([]);
    setStatus('New');
    setSubTasks([]);
    onClose();
  };

  const handleAddSubTask = () => {
    if (newSubTaskTitle.trim()) {
      setSubTasks([
        ...subTasks,
        {
          id: Date.now(),
          title: newSubTaskTitle,
          completed: false
        }
      ]);
      setNewSubTaskTitle('');
    }
  };

  const toggleSubTask = (id: number) => {
    setSubTasks(subTasks.map(st =>
      st.id === id ? { ...st, completed: !st.completed } : st
    ));
  };

  const removeSubTask = (id: number) => {
    setSubTasks(subTasks.filter(st => st.id !== id));
  };

  const getPriorityColor = (priorityLevel: string) => {
    switch (priorityLevel) {
      case 'Low': return '#10b981';
      case 'Medium': return '#f59e0b';
      case 'High': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <h2>{editMode ? 'Edit Task' : 'Project Task Setup'}</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Task Title */}
          <div className="form-group">
            <label className="form-label">Task Title</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g, Design user onboarding flow"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              placeholder="Detailed breakbrowe flon..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Project Link */}
          <div className="form-group">
            <div className="project-link">
              <div className="project-avatar">
                <span className="avatar-icon">👤</span>
              </div>
              <span className="project-name">{projectName}</span>
            </div>
          </div>

          {/* Assignees Section */}
          <div className="form-group">
            <label className="form-label">Assignees</label>
            <div className="assignees-section">
              {assignees.length > 0 && (
                <div className="selected-assignees">
                  {assignees.map((assignee, idx) => (
                    <span key={idx} className="assignee-chip">
                      {assignee}
                      <button 
                        type="button"
                        className="remove-assignee"
                        onClick={() => toggleAssignee(assignee)}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="assignee-dropdown-container">
                <button 
                  type="button"
                  className="select-members-btn"
                  onClick={() => setShowAssigneeDropdown(!showAssigneeDropdown)}
                >
                  <span className="btn-icon">👥</span>
                  {assignees.length > 0 ? 'Add more members' : 'Select team members'}
                </button>
                {showAssigneeDropdown && (
                  <div className="assignee-dropdown">
                    {teamMembers.filter(member => !assignees.includes(member.name)).length > 0 ? (
                      teamMembers
                        .filter(member => !assignees.includes(member.name))
                        .map((member) => (
                          <div 
                            key={member.id} 
                            className="assignee-option"
                            onClick={() => toggleAssignee(member.name)}
                          >
                            <input 
                              type="checkbox" 
                              checked={false}
                              onChange={() => {}}
                            />
                            <div className="member-info">
                              <span className="member-name">{member.name}</span>
                              <span className="member-role">{member.role}</span>
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="no-members">All team members assigned</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Priority and Status Row */}
          <div className="form-row">
            <div className="form-group flex-1">
              <label className="form-label">Assignees</label>
              <div className="priority-selector">
                {['Low', 'Medium', 'High'].map((level) => (
                  <button
                    key={level}
                    className={`priority-btn ${priority === level ? 'active' : ''}`}
                    onClick={() => setPriority(level as 'Low' | 'Medium' | 'High')}
                  >
                    <span className={`priority-dot ${priority === level ? 'active' : ''}`}></span>
                  </button>
                ))}
                <span className="priority-label">{priority === 'High' ? 'High' : ''}</span>
                <span 
                  className={`priority-badge-inline ${priority === 'High' ? 'high' : ''}`}
                >
                  {priority === 'High' ? 'Hot' : ''}
                </span>
              </div>
            </div>

            <div className="form-group flex-1">
              <div className="status-dropdown">
                <button className="dropdown-btn status-btn">
                  <span className="status-icon">📊</span>
                  {status}
                  <span className="dropdown-arrow">▾</span>
                </button>
              </div>
            </div>
          </div>

          {/* Priority, Add Sub-task, and Date Row */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Priority</label>
            </div>
            <div className="form-group">
              <button className="add-subtask-btn" onClick={() => setNewSubTaskTitle('New subtask')}>
                Add Sub-task
              </button>
            </div>
            <div className="form-group flex-1">
              <select 
                className="date-select"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              >
                <option value="">Select a date</option>
                <option value="2025-11-15">Nov 15, 2025</option>
                <option value="2025-11-20">Nov 20, 2025</option>
                <option value="2025-11-25">Nov 25, 2025</option>
                <option value="2025-11-30">Nov 30, 2025</option>
              </select>
            </div>
          </div>

          {/* Sub-tasks */}
          <div className="form-group">
            <label className="form-label">Sub-tasks</label>
            <div className="subtasks-list">
              {subTasks.map((subTask) => (
                <div key={subTask.id} className="subtask-item">
                  <label className="subtask-checkbox">
                    <input
                      type="checkbox"
                      checked={subTask.completed}
                      onChange={() => toggleSubTask(subTask.id)}
                    />
                    <span className="checkbox-custom"></span>
                    <span className={`subtask-text ${subTask.completed ? 'completed' : ''}`}>
                      {subTask.title}
                    </span>
                  </label>
                  <button 
                    className="remove-subtask-btn"
                    onClick={() => removeSubTask(subTask.id)}
                  >
                    ✕
                  </button>
                </div>
              ))}
              
              {/* Add New Subtask Input */}
              <div className="add-subtask-input">
                <input
                  type="text"
                  placeholder="Add new sub-task..."
                  value={newSubTaskTitle}
                  onChange={(e) => setNewSubTaskTitle(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddSubTask();
                    }
                  }}
                  className="subtask-input"
                />
                {newSubTaskTitle && (
                  <button className="add-subtask-confirm" onClick={handleAddSubTask}>
                    +
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="btn-create" 
            onClick={handleSubmit}
            disabled={!taskTitle.trim()}
          >
            {editMode ? 'Update Task' : 'Create Task'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskSetupModal;
