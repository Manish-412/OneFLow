import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TaskCardProps {
  id: number;
  title: string;
  projectName?: string;
  assignedUser: string;
  userAvatar: string;
  assignedUsers?: Array<{
    name: string;
    avatar: string;
    role?: string;
  }>;
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
  subtasks?: {
    total: number;
    completed: number;
  };
  coverImage?: string;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  onChangeCover?: (id: number) => void;
  onMarkComplete?: (id: number) => void;
  onChangeTracking?: (id: number, status: string) => void;
  onAddMember?: (id: number) => void;
  onClick?: (id: number) => void;
  trackingStatus?: 'On Track' | 'At Risk' | 'Off Track' | 'On Hold' | 'Complete';
}

const TaskCard: React.FC<TaskCardProps> = ({
  id,
  title,
  projectName,
  assignedUser,
  userAvatar,
  assignedUsers = [],
  priority,
  dueDate,
  loggedHours,
  comments,
  attachments,
  status,
  tags = [],
  subtasks,
  coverImage,
  onEdit,
  onDelete,
  onChangeCover,
  onChangeTracking,
  onAddMember,
  onClick,
  trackingStatus,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return '#ef4444';
      case 'Medium':
        return '#f59e0b';
      case 'Low':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const getPriorityStars = (priority: string) => {
    switch (priority) {
      case 'High':
        return '⭐⭐⭐';
      case 'Medium':
        return '⭐⭐';
      case 'Low':
        return '⭐';
      default:
        return '';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'New':
        return { icon: '🆕', color: '#3b82f6', bg: '#dbeafe', label: 'New Task' };
      case 'In Progress':
        return { icon: '🔄', color: '#f59e0b', bg: '#fef3c7', label: 'In Progress' };
      case 'Blocked':
        return { icon: '🚫', color: '#ef4444', bg: '#fee2e2', label: 'Blocked' };
      case 'Done':
        return { icon: '✅', color: '#10b981', bg: '#d1fae5', label: 'Completed' };
      default:
        return { icon: '📋', color: '#6b7280', bg: '#f3f4f6', label: status };
    }
  };

  // Auto-calculate tracking status based on performance, due date, and priority
  const calculateTrackingStatus = (): 'On Track' | 'At Risk' | 'Off Track' | 'On Hold' | 'Complete' => {
    if (trackingStatus) return trackingStatus;
    
    if (status === 'Done') return 'Complete';
    if (status === 'Blocked') return 'On Hold';
    
    const today = new Date();
    const deadline = new Date(dueDate);
    const daysUntilDue = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    // Calculate expected progress based on time
    const totalDays = 30; // Assume 30 days project duration
    const daysPassed = totalDays - daysUntilDue;
    const expectedProgress = (daysPassed / totalDays) * 100;
    
    // Actual progress
    const actualProgress = subtasks 
      ? (subtasks.completed / subtasks.total) * 100 
      : (loggedHours / 40) * 100; // Assume 40 hours = 100%
    
    // Determine status based on progress vs expected and priority
    if (daysUntilDue < 0) {
      return 'Off Track'; // Overdue
    } else if (daysUntilDue <= 3 && priority === 'High' && actualProgress < 80) {
      return 'Off Track'; // High priority task due soon with low progress
    } else if (actualProgress < expectedProgress - 20) {
      return 'At Risk'; // Behind schedule
    } else if (daysUntilDue <= 7 && actualProgress < 70) {
      return 'At Risk'; // Less than a week and not near completion
    } else {
      return 'On Track';
    }
  };

  const getTrackingStatusConfig = (trackingStatus: string) => {
    switch (trackingStatus) {
      case 'On Track':
        return { icon: '✅', color: '#10b981', bg: '#d1fae5', label: 'On Track' };
      case 'At Risk':
        return { icon: '⚠️', color: '#f59e0b', bg: '#fef3c7', label: 'At Risk' };
      case 'Off Track':
        return { icon: '🔴', color: '#ef4444', bg: '#fee2e2', label: 'Off Track' };
      case 'On Hold':
        return { icon: '⏸️', color: '#6b7280', bg: '#f3f4f6', label: 'On Hold' };
      case 'Complete':
        return { icon: '🎉', color: '#8b5cf6', bg: '#ede9fe', label: 'Complete' };
      default:
        return { icon: '📊', color: '#6b7280', bg: '#f3f4f6', label: trackingStatus };
    }
  };

  const currentTrackingStatus = calculateTrackingStatus();
  const trackingConfig = getTrackingStatusConfig(currentTrackingStatus);

  const handleMenuAction = (action: 'edit' | 'delete' | 'cover', e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);

    switch (action) {
      case 'edit':
        onEdit?.(id);
        break;
      case 'delete':
        onDelete?.(id);
        break;
      case 'cover':
        onChangeCover?.(id);
        break;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="task-card-wrapper"
      onClick={() => onClick?.(id)}
    >
      <div className="task-card-modern">
        {/* Cover Image */}
        {coverImage && (
          <div className="task-card-cover">
            <img src={coverImage} alt="Task cover" />
          </div>
        )}

        {/* Card Content */}
        <div className="task-card-content">
          {/* Three-dot Menu */}
          <div className="task-card-menu-wrapper">
            <button
              className="task-card-menu-btn"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
            >
              ⋮
            </button>

            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="task-card-dropdown"
                  onClick={(e: React.MouseEvent) => e.stopPropagation()}
                >
                  <button
                    className="dropdown-item"
                    onClick={(e) => handleMenuAction('edit', e)}
                  >
                    ✏️ Edit Task
                  </button>
                  <button
                    className="dropdown-item"
                    onClick={(e) => handleMenuAction('cover', e)}
                  >
                    🖼️ Change Cover
                  </button>
                  <button
                    className="dropdown-item"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      onAddMember?.(id);
                    }}
                  >
                    👥 Add Team Member
                  </button>
                  <button
                    className="dropdown-item danger"
                    onClick={(e) => handleMenuAction('delete', e)}
                  >
                    🗑️ Delete Task
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Status Badge - Prominent at Top */}
          <div 
            className="task-status-badge"
            style={{
              backgroundColor: getStatusConfig(status).bg,
              color: getStatusConfig(status).color,
              borderLeft: `4px solid ${getStatusConfig(status).color}`
            }}
          >
            <span className="status-icon">{getStatusConfig(status).icon}</span>
            <span className="status-label">{getStatusConfig(status).label}</span>
          </div>

          {/* Tracking Status - Auto-calculated */}
          <div 
            className="task-tracking-badge"
            style={{
              backgroundColor: trackingConfig.bg,
              color: trackingConfig.color,
              borderLeft: `4px solid ${trackingConfig.color}`
            }}
          >
            <span className="tracking-icon">{trackingConfig.icon}</span>
            <span className="tracking-label">{trackingConfig.label}</span>
          </div>

          {/* Subtasks Progress */}
          {subtasks && subtasks.total > 0 && (
            <div className="task-subtasks-section">
              <div className="subtasks-header">
                <span className="subtasks-icon">✓</span>
                <span className="subtasks-text">
                  {subtasks.completed}/{subtasks.total} Tasks Completed
                </span>
                <span className="subtasks-percentage">
                  {Math.round((subtasks.completed / subtasks.total) * 100)}%
                </span>
              </div>
              <div className="subtasks-progress-bar">
                <div 
                  className="subtasks-progress-fill"
                  style={{ 
                    width: `${(subtasks.completed / subtasks.total) * 100}%`,
                    backgroundColor: trackingConfig.color
                  }}
                ></div>
              </div>
            </div>
          )}

          {/* Priority Badge - Visible */}
          <div className="task-priority-section">
            <div
              className="priority-badge-prominent"
              style={{ 
                backgroundColor: getPriorityColor(priority),
                boxShadow: `0 2px 8px ${getPriorityColor(priority)}40`
              }}
            >
              <span className="priority-stars-large">{getPriorityStars(priority)}</span>
              <span className="priority-label">{priority} Priority</span>
            </div>
          </div>

          {/* Tracking Status - small pill and editable select for managers */}
          <div className="task-tracking-wrapper">
            <div className="tracking-pill-small" style={{ background: trackingStatus === 'Complete' ? '#6b21a8' : getPriorityColor(priority) }}>
              {trackingStatus || 'No Status'}
            </div>
            {/* If a parent provided a handler, allow edit */}
            {onChangeTracking && (
              <select
                className="tracking-select-small"
                value={trackingStatus || ''}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => onChangeTracking(id, e.target.value)}
              >
                <option value="">--</option>
                <option value="On Track">On Track</option>
                <option value="At Risk">At Risk</option>
                <option value="Off Track">Off Track</option>
                <option value="On Hold">On Hold</option>
                <option value="Complete">Complete</option>
              </select>
            )}
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="task-card-tags">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="task-tag"
                  style={{
                    backgroundColor: tag.color,
                  }}
                >
                  {tag.label}
                </span>
              ))}
            </div>
          )}

          {/* Project Name (if provided) */}
          {projectName && (
            <div className="task-card-project">
              <span className="project-badge">📁 {projectName}</span>
            </div>
          )}

          {/* Title */}
          <div className="task-card-header-modern">
            <h4>{title}</h4>
          </div>

          {/* Multiple Assignees or Single Assignee */}
          {assignedUsers.length > 0 ? (
            <div className="task-card-team-members">
              <div className="team-members-label">
                <span className="team-icon">👥</span>
                <span className="team-text">Team Members ({assignedUsers.length})</span>
                {onAddMember && (
                  <button
                    className="add-member-btn-small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddMember(id);
                    }}
                    title="Add team member"
                  >
                    + Add
                  </button>
                )}
              </div>
              <div className="team-avatars-group">
                {assignedUsers.slice(0, 4).map((user, index) => (
                  <div 
                    key={index}
                    className="team-avatar-item"
                    title={`${user.name}${user.role ? ` - ${user.role}` : ''}`}
                    style={{ zIndex: assignedUsers.length - index }}
                  >
                    <div className="team-avatar-circle">
                      {user.avatar}
                    </div>
                  </div>
                ))}
                {assignedUsers.length > 4 && (
                  <div className="team-avatar-more" title={`+${assignedUsers.length - 4} more`}>
                    +{assignedUsers.length - 4}
                  </div>
                )}
                {onAddMember && (
                  <button
                    className="team-avatar-add"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddMember(id);
                    }}
                    title="Add team member"
                  >
                    +
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="task-card-user-modern">
              <div className="user-info">
                <div className="task-avatar-modern">{userAvatar}</div>
                <span className="task-username-modern">{assignedUser}</span>
              </div>
              {onAddMember && (
                <button
                  className="add-member-icon-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddMember(id);
                  }}
                  title="Add team member"
                >
                  👥+
                </button>
              )}
            </div>
          )}

          {/* Progress and Stats Section */}
          <div className="task-progress-section">
            <div className="progress-label">
              <span>⏱️ Logged Hours</span>
              <span className="progress-value">{loggedHours}h</span>
            </div>
            <div className="progress-bar-container">
              <div 
                className="progress-bar-fill"
                style={{ 
                  width: `${Math.min((loggedHours / 40) * 100, 100)}%`,
                  backgroundColor: getStatusConfig(status).color
                }}
              ></div>
            </div>
          </div>

          {/* Due Date */}
          <div className="task-card-meta-modern">
            <div className="meta-item-large">
              <span className="meta-icon">📅</span>
              <span className="meta-text">Due: {formatDate(dueDate)}</span>
            </div>
          </div>

          {/* Footer Stats */}
          <div className="task-card-footer-modern">
            <div className="task-stat-modern">
              <span className="stat-icon">💬</span>
              <span className="stat-value">{comments}</span>
              <span className="stat-label">Comments</span>
            </div>
            <div className="task-stat-modern">
              <span className="stat-icon">📎</span>
              <span className="stat-value">{attachments}</span>
              <span className="stat-label">Files</span>
            </div>
          </div>
        </div>

        {/* Status Indicator Bar at Bottom */}
        <div
          className="task-status-bar"
          style={{ backgroundColor: getStatusConfig(status).color }}
        ></div>
      </div>
    </motion.div>
  );
};

export default TaskCard;
