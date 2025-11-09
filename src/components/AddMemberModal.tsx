import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/AddMemberModal.css';

interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMembers: (members: TeamMember[]) => void;
  title?: string;
  currentMembers?: TeamMember[];
  entityType?: 'task' | 'project';
}

const AddMemberModal: React.FC<AddMemberModalProps> = ({
  isOpen,
  onClose,
  onAddMembers,
  title = 'Add Team Members',
  currentMembers = [],
  entityType = 'task'
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<TeamMember[]>([]);
  const [availableMembers, setAvailableMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch available team members from backend
  useEffect(() => {
    if (isOpen) {
      fetchAvailableMembers();
    }
  }, [isOpen]);

  const fetchAvailableMembers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Filter out members already assigned
        const currentMemberIds = currentMembers.map(m => m.id);
        const available = data.users.filter((user: any) => 
          !currentMemberIds.includes(user.id)
        ).map((user: any) => ({
          id: user.id,
          name: user.full_name || user.username,
          email: user.email,
          role: user.role || 'Team Member',
          avatar: getInitials(user.full_name || user.username)
        }));
        setAvailableMembers(available);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredMembers = availableMembers.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleMember = (member: TeamMember) => {
    setSelectedMembers(prev => {
      const isSelected = prev.some(m => m.id === member.id);
      if (isSelected) {
        return prev.filter(m => m.id !== member.id);
      } else {
        return [...prev, member];
      }
    });
  };

  const handleAddMembers = () => {
    if (selectedMembers.length > 0) {
      onAddMembers(selectedMembers);
      setSelectedMembers([]);
      setSearchQuery('');
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedMembers([]);
    setSearchQuery('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="add-member-modal-overlay" onClick={handleClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3 }}
          className="add-member-modal"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="add-member-header">
            <div className="header-content">
              <span className="header-icon">👥</span>
              <h2>{title}</h2>
            </div>
            <button className="close-btn" onClick={handleClose}>
              ✕
            </button>
          </div>

          {/* Search Bar */}
          <div className="add-member-search">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by name, email, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
              autoFocus
            />
          </div>

          {/* Selected Members Preview */}
          {selectedMembers.length > 0 && (
            <div className="selected-members-preview">
              <div className="preview-label">
                Selected ({selectedMembers.length})
              </div>
              <div className="preview-avatars">
                {selectedMembers.map((member) => (
                  <div
                    key={member.id}
                    className="preview-avatar"
                    title={member.name}
                    onClick={() => toggleMember(member)}
                  >
                    <div className="preview-avatar-circle">
                      {member.avatar}
                    </div>
                    <button className="remove-preview-btn">✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Members List */}
          <div className="add-member-list">
            {isLoading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading team members...</p>
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">👤</span>
                <h3>No members found</h3>
                <p>
                  {searchQuery
                    ? 'Try adjusting your search query'
                    : 'All team members are already assigned'}
                </p>
              </div>
            ) : (
              filteredMembers.map((member) => {
                const isSelected = selectedMembers.some(m => m.id === member.id);
                return (
                  <div
                    key={member.id}
                    className={`member-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleMember(member)}
                  >
                    <div className="member-avatar">
                      {member.avatar}
                    </div>
                    <div className="member-info">
                      <div className="member-name">{member.name}</div>
                      <div className="member-details">
                        <span className="member-role">{member.role}</span>
                        <span className="member-email">{member.email}</span>
                      </div>
                    </div>
                    <div className="member-checkbox">
                      {isSelected && <span className="check-icon">✓</span>}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Actions */}
          <div className="add-member-footer">
            <button className="cancel-btn" onClick={handleClose}>
              Cancel
            </button>
            <button
              className="add-btn"
              onClick={handleAddMembers}
              disabled={selectedMembers.length === 0}
            >
              <span className="btn-icon">+</span>
              Add {selectedMembers.length > 0 ? `(${selectedMembers.length})` : 'Members'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddMemberModal;
