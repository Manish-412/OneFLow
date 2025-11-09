import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import ProjectView from './components/ProjectView';
import PendingApproval from './components/PendingApproval';
import Projects from './components/Projects';
import Tasks from './components/Tasks';
import Team from './components/Team';
import Products from './components/Products';
import Financial from './components/Financial';
import Reports from './components/Reports';

interface UserData {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  approval_status: string;
}

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Main App Content Component
const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(1);
  const [selectedProjectName, setSelectedProjectName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');

      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          setUserName(user.name || `${user.first_name} ${user.last_name}` || 'User');
          setUserRole(user.role || '');
        } catch (error) {
          console.error('Error parsing stored user data:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleLoginSuccess = (user: any, token: string) => {
    const fullName = user.name || `${user.first_name} ${user.last_name}` || 'User';
    setUserName(fullName);
    setUserRole(user.role || '');
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    // Navigate based on user status
    if (user.approvalStatus === 'pending' || user.approval_status === 'pending') {
      navigate('/pending-approval');
    } else if (user.approvalStatus === 'approved' || user.approval_status === 'approved') {
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } else {
      navigate('/dashboard');
    }
  };

  const handleSignupSuccess = (user: any, token: string) => {
    const fullName = user.name || `${user.first_name} ${user.last_name}` || 'User';
    setUserName(fullName);
    setUserRole(user.role || '');
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    navigate('/pending-approval');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUserName('');
    setUserRole('');
    navigate('/login');
  };

  const handleProjectClick = (projectId: number, projectName: string) => {
    setSelectedProjectId(projectId);
    setSelectedProjectName(projectName);
    navigate('/tasks');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login onSwitchToSignup={() => navigate('/signup')} onLoginSuccess={handleLoginSuccess} />} />
      <Route path="/signup" element={<Signup onSwitchToLogin={() => navigate('/login')} onSignupSuccess={handleSignupSuccess} />} />
      
      {/* Protected Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard 
            userName={userName}
            onLogout={handleLogout}
            onProjectClick={handleProjectClick}
            onNavigate={(view) => navigate(`/${view}`)}
            isAdmin={userRole === 'admin'}
            userRole={userRole}
          />
        </ProtectedRoute>
      } />
      
      <Route path="/projects" element={
        <ProtectedRoute>
          <Projects 
            userName={userName}
            onBack={() => navigate('/dashboard')}
            onProjectClick={handleProjectClick}
            onNavigate={(view) => navigate(`/${view}`)}
            onLogout={handleLogout}
            isAdmin={userRole === 'admin'}
            userRole={userRole}
          />
        </ProtectedRoute>
      } />
      
      <Route path="/tasks" element={
        <ProtectedRoute>
          <Tasks 
            userName={userName}
            onBack={() => navigate('/dashboard')}
            projectId={selectedProjectId}
            projectName={selectedProjectName}
            onNavigate={(view) => navigate(`/${view}`)}
            onLogout={handleLogout}
            isAdmin={userRole === 'admin'}
            userRole={userRole}
          />
        </ProtectedRoute>
      } />
      
      <Route path="/team" element={
        <ProtectedRoute>
          <Team 
            userName={userName}
            onBack={() => navigate('/dashboard')}
            onNavigate={(view) => navigate(`/${view}`)}
            onLogout={handleLogout}
            isAdmin={userRole === 'admin'}
            userRole={userRole}
          />
        </ProtectedRoute>
      } />
      
      <Route path="/products" element={
        <ProtectedRoute>
          <Products 
            userName={userName}
            onBack={() => navigate('/dashboard')}
            onNavigate={(view) => navigate(`/${view}`)}
            onLogout={handleLogout}
            isAdmin={userRole === 'admin'}
            userRole={userRole}
          />
        </ProtectedRoute>
      } />
      
      <Route path="/financial" element={
        <ProtectedRoute>
          <Financial 
            userName={userName}
            onBack={() => navigate('/dashboard')}
            onNavigate={(view) => navigate(`/${view}`)}
            onLogout={handleLogout}
            isAdmin={userRole === 'admin'}
            userRole={userRole}
          />
        </ProtectedRoute>
      } />
      
      <Route path="/reports" element={
        <ProtectedRoute>
          <Reports 
            userName={userName}
            onBack={() => navigate('/dashboard')}
            onNavigate={(view) => navigate(`/${view}`)}
            onLogout={handleLogout}
            isAdmin={userRole === 'admin'}
            userRole={userRole}
          />
        </ProtectedRoute>
      } />
      
      <Route path="/admin" element={
        <ProtectedRoute>
          <AdminDashboard onLogout={handleLogout} />
        </ProtectedRoute>
      } />
      
      <Route path="/pending-approval" element={
        <ProtectedRoute>
          <PendingApproval onLogout={handleLogout} />
        </ProtectedRoute>
      } />
      
      <Route path="/project-view" element={
        <ProtectedRoute>
          <ProjectView
            projectId={selectedProjectId}
            projectName={selectedProjectName}
            userName={userName}
            onBack={() => navigate('/dashboard')}
          />
        </ProtectedRoute>
      } />
      
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

// Main App Component with Router
const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;