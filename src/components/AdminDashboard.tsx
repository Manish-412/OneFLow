import React, { useState, useEffect } from 'react';
import AboutFooter from './AboutFooter';
import '../styles/AdminDashboard.css';
import '../styles/UserApprovals.css';

interface PendingUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  created_at: string;
}

interface User {
  id: number;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
}

interface AdminProfile {
  firstName: string;
  lastName: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface AdminDashboardProps {
  onLogout?: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSection, setCurrentSection] = useState<'approvals' | 'users' | 'settings'>('approvals');
  const [selectedRoles, setSelectedRoles] = useState<{ [userId: number]: string }>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newRole, setNewRole] = useState('');
  
  // Profile management states
  const [adminProfile, setAdminProfile] = useState<AdminProfile>({
    firstName: '',
    lastName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

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
      console.log('Fetched pending users:', data);
      setPendingUsers(data.pendingUsers || []);
    } catch (error) {
      console.error('Error fetching pending users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch all users
  const fetchAllUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:5000/api/auth/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      console.log('Fetched all users:', data);
      setAllUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle user approval/rejection
  const handleUserApproval = async (userId: number, status: 'approved' | 'rejected') => {
    try {
      // Get the selected role for this user, default to 'team_member'
      const role = selectedRoles[userId] || 'team_member';

      // Validate role is selected when approving
      if (status === 'approved' && !selectedRoles[userId]) {
        alert('Please select a role before approving the user');
        return;
      }

      const response = await fetch('http://localhost:5000/api/auth/update-approval', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ userId, status, role })
      });

      if (!response.ok) {
        throw new Error('Failed to update user status');
      }

      const data = await response.json();
      console.log('Update response:', data);
      
      // Clear the selected role for this user
      setSelectedRoles(prev => {
        const updated = { ...prev };
        delete updated[userId];
        return updated;
      });
      
      // Refresh the pending users list
      fetchPendingUsers();
      
      // Show success message
      alert(`User ${status === 'approved' ? 'approved as ' + role : 'rejected'} successfully!`);
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Failed to update user status. Please try again.');
    }
  };

  // Function to handle role selection
  const handleRoleChange = (userId: number, role: string) => {
    setSelectedRoles(prev => ({
      ...prev,
      [userId]: role
    }));
  };

  // Function to open edit modal
  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setNewRole(user.role);
    setShowEditModal(true);
  };

  // Function to update user role
  const handleUpdateUserRole = async () => {
    if (!editingUser || !newRole) {
      alert('Please select a role');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/update-user-role', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userId: editingUser.id,
          role: newRole
        })
      });

      const data = await response.json();
      console.log('Response:', data);

      if (!response.ok) {
        const errorMessage = data.message || 'Failed to update user role';
        throw new Error(errorMessage);
      }

      // Update the user in the local state
      setAllUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === editingUser.id ? { ...user, role: newRole } : user
        )
      );

      // Close modal and show success message
      setShowEditModal(false);
      setEditingUser(null);
      setNewRole('');
      alert('User role updated successfully!');
    } catch (error: any) {
      console.error('Error updating user role:', error);
      alert(error.message || 'Failed to update user role. Please try again.');
    }
  };

  // Function to delete user
  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/auth/user/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      // Remove user from local state
      setAllUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      alert('User deleted successfully!');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user. Please try again.');
    }
  };

  // Load admin profile
  const loadAdminProfile = async () => {
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

  // Handle logout
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (onLogout) {
        onLogout();
      } else {
        // Fallback: reload the page to trigger auth check
        window.location.reload();
      }
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
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setProfileMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    } finally {
      setProfileLoading(false);
    }
  };

  // Fetch data based on current section
  useEffect(() => {
    if (currentSection === 'approvals') {
      fetchPendingUsers();
    } else if (currentSection === 'users') {
      fetchAllUsers();
    } else if (currentSection === 'settings') {
      loadAdminProfile();
    }
  }, [currentSection]);

  return (
    <div className="admin-dashboard">
      {/* Main Content */}
      <main className="admin-content">
        <header className="admin-header">
          <div className="admin-header-top">
            <h1>{currentSection === 'approvals' ? 'User Approvals' : 
                currentSection === 'users' ? 'User Management' : 'Settings'}</h1>
            <button className="logout-btn" onClick={handleLogout}>
              🚪 Logout
            </button>
          </div>
          <nav className="admin-nav">
            <button 
              className={`nav-button ${currentSection === 'approvals' ? 'active' : ''}`}
              onClick={() => setCurrentSection('approvals')}
            >
              <span className="icon">✅</span>
              User Approvals
            </button>
            <button 
              className={`nav-button ${currentSection === 'users' ? 'active' : ''}`}
              onClick={() => setCurrentSection('users')}
            >
              <span className="icon">👥</span>
              User Management
            </button>
            <button 
              className={`nav-button ${currentSection === 'settings' ? 'active' : ''}`}
              onClick={() => setCurrentSection('settings')}
            >
              <span className="icon">⚙️</span>
              Settings
            </button>
          </nav>
        </header>

        {/* User Approvals Section */}
        {currentSection === 'approvals' && (
          <div className="user-approvals">
            <div className="section-header">
              <h2>Pending User Approvals</h2>
              <button onClick={fetchPendingUsers} className="refresh-btn">
                🔄 Refresh
              </button>
            </div>

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
                      <div className="user-role-selection">
                        <label htmlFor={`role-${user.id}`} className="role-label">
                          Assign Role:
                        </label>
                        <select
                          id={`role-${user.id}`}
                          className="role-select"
                          value={selectedRoles[user.id] || ''}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        >
                          <option value="">Select Role</option>
                          <option value="team_member">Team Member</option>
                          <option value="project_manager">Project Manager</option>
                          <option value="finance">Finance</option>
                          <option value="admin">Admin</option>
                        </select>
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

        {/* User Management Section */}
        {currentSection === 'users' && (
          <div className="user-management">
            <div className="section-header">
              <h2>All Users</h2>
              <div className="header-actions">
                <input
                  type="text"
                  placeholder="Search users..."
                  className="search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button onClick={fetchAllUsers} className="refresh-btn">
                  🔄 Refresh
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="loading">Loading users...</div>
            ) : (
              <div className="users-table-container">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers
                      .filter(user => 
                        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        user.role.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((user) => (
                        <tr key={user.id}>
                          <td>
                            <div className="user-name-cell">
                              <div className="user-avatar">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <span>{user.name}</span>
                            </div>
                          </td>
                          <td>{user.email}</td>
                          <td>
                            <span className={`role-badge role-${user.role.replace('_', '-')}`}>
                              {user.role.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button 
                                className="edit-btn" 
                                title="Edit user role"
                                onClick={() => handleEditUser(user)}
                              >
                                ✏️
                              </button>
                              <button 
                                className="delete-btn" 
                                title="Delete user"
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {allUsers.length === 0 && (
                  <div className="empty-state">
                    <p>No users found</p>
                  </div>
                )}
                {allUsers.length > 0 && allUsers.filter(user => 
                  user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  user.role.toLowerCase().includes(searchQuery.toLowerCase())
                ).length === 0 && (
                  <div className="empty-state">
                    <p>No users match your search</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Settings Section - Profile Management */}
        {currentSection === 'settings' && (
          <div className="settings-section">
            <div className="profile-card">
              <h2>👤 My Profile</h2>
              <p className="section-description">Update your personal information and password</p>
              
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
                    type="submit" 
                    className="btn-save-profile"
                    disabled={profileLoading}
                  >
                    {profileLoading ? 'Updating...' : '💾 Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Edit User Role Modal */}
      {showEditModal && editingUser && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit User Role</h2>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="user-details">
                <p><strong>Name:</strong> {editingUser.name}</p>
                <p><strong>Email:</strong> {editingUser.email}</p>
                <p><strong>Current Role:</strong> {editingUser.role.replace('_', ' ').toUpperCase()}</p>
              </div>
              <div className="form-group">
                <label htmlFor="new-role">New Role:</label>
                <select
                  id="new-role"
                  className="role-select-modal"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                >
                  <option value="">Select Role</option>
                  <option value="team_member">Team Member</option>
                  <option value="project_manager">Project Manager</option>
                  <option value="finance">Finance</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-cancel" 
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-save" 
                onClick={handleUpdateUserRole}
                disabled={!newRole || newRole === editingUser.role}
              >
                Update Role
              </button>
            </div>
          </div>
        </div>
      )}
      <AboutFooter />
    </div>
  );
};

export default AdminDashboard;