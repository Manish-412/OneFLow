import React, { useEffect } from 'react';
import axios from 'axios';
import AboutFooter from './AboutFooter';
import '../styles/Dashboard.css';
import '../styles/theme.css';

interface PendingApprovalProps {
  onLogout: () => void;
}

const PendingApproval: React.FC<PendingApprovalProps> = ({ onLogout }) => {
  useEffect(() => {
    const checkApprovalStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/auth/check-approval', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.status === 'approved') {
          // Refresh the page to load the dashboard
          window.location.reload();
        } else if (response.data.status === 'rejected') {
          // If rejected, clear token and logout
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          alert('Your account has been rejected. Please contact administrator.');
          onLogout();
        }
      } catch (error) {
        console.error('Error checking approval status:', error);
        onLogout();
      }
    };

    const interval = setInterval(checkApprovalStatus, 30000); // Check every 30 seconds
    checkApprovalStatus(); // Check immediately

    return () => clearInterval(interval);
  }, [onLogout]);

  return (
    <div className="dashboard-container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '24px' }}>
        <div style={{ 
          maxWidth: '550px', 
          width: '100%', 
          background: 'rgba(255, 255, 255, 0.25)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '16px',
          border: '2px solid rgba(255, 129, 43, 0.2)',
          boxShadow: '0 8px 32px rgba(255, 129, 43, 0.3)',
          padding: '48px 40px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{
              fontSize: '32px',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #034C36 0%, #FF812B 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: '24px',
              filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))'
            }}>OneFlow</h1>
            
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: '700', 
              color: '#001110', 
              marginBottom: '24px',
              textShadow: '0 0 1px rgba(255, 255, 255, 0.5)'
            }}>
              Account Pending Approval
            </h2>
            
            <div style={{ margin: '32px auto' }}>
              <div style={{ 
                width: '56px', 
                height: '56px', 
                border: '4px solid rgba(255, 129, 43, 0.2)',
                borderTop: '4px solid #FF812B',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto'
              }}></div>
            </div>
            
            <p style={{ 
              marginTop: '24px', 
              color: '#001110', 
              fontSize: '16px', 
              lineHeight: '1.6',
              textShadow: '0 0 1px rgba(255, 255, 255, 0.5)',
              marginBottom: '12px'
            }}>
              Your account is currently pending administrator approval. 
              This page will automatically redirect you once your account is approved.
            </p>
            
            <p style={{ 
              fontSize: '14px', 
              color: '#001110', 
              opacity: 0.8,
              textShadow: '0 0 1px rgba(255, 255, 255, 0.5)'
            }}>
              Please be patient, this may take some time.
            </p>
            
            <button
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                onLogout();
              }}
              style={{
                marginTop: '32px',
                width: '100%',
                background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 20px rgba(220, 38, 38, 0.4)',
                textShadow: '0 0 5px rgba(0, 0, 0, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 25px rgba(220, 38, 38, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(220, 38, 38, 0.4)';
              }}
            >
              Return to Login
            </button>
          </div>
        </div>
      </div>
      <AboutFooter />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default PendingApproval;