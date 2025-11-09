import React, { useState } from "react";
import axios from "axios";
import AboutFooter from './AboutFooter';
import '../styles/Dashboard.css';
import '../styles/theme.css';

interface LoginProps {
  onSwitchToSignup: () => void;
  onLoginSuccess: (user: any, token: string) => void;
}

const Login: React.FC<LoginProps> = ({ onSwitchToSignup, onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!email || !password) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    try {
      const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });

      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        onLoginSuccess(response.data.user, response.data.token);
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '24px' }}>
        <div style={{ 
          maxWidth: '450px', 
          width: '100%', 
          background: 'rgba(255, 255, 255, 0.25)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '16px',
          border: '2px solid rgba(255, 129, 43, 0.2)',
          boxShadow: '0 8px 32px rgba(255, 129, 43, 0.3)',
          padding: '40px'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 style={{
              fontSize: '32px',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #034C36 0%, #FF812B 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: '8px',
              filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))'
            }}>OneFlow</h1>
            <p style={{ color: '#001110', opacity: 0.8, textShadow: '0 0 1px rgba(255, 255, 255, 0.5)' }}>Login to Your Account</p>
          </div>
        
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label htmlFor="email" style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#001110', marginBottom: '8px', textShadow: '0 0 1px rgba(255, 255, 255, 0.5)' }}>
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid rgba(3, 76, 54, 0.3)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: 'rgba(255, 255, 255, 0.25)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  color: '#001110',
                  textShadow: '0 0 1px rgba(255, 255, 255, 0.5)',
                  transition: 'all 0.2s ease',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(255, 129, 43, 0.5)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(255, 129, 43, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(3, 76, 54, 0.3)';
                  e.target.style.boxShadow = 'none';
                }}
                required
              />
            </div>

            <div>
              <label htmlFor="password" style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#001110', marginBottom: '8px', textShadow: '0 0 1px rgba(255, 255, 255, 0.5)' }}>
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid rgba(3, 76, 54, 0.3)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: 'rgba(255, 255, 255, 0.25)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  color: '#001110',
                  textShadow: '0 0 1px rgba(255, 255, 255, 0.5)',
                  transition: 'all 0.2s ease',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(255, 129, 43, 0.5)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(255, 129, 43, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(3, 76, 54, 0.3)';
                  e.target.style.boxShadow = 'none';
                }}
                required
              />
            </div>

            {error && (
              <div style={{ 
                background: 'rgba(239, 68, 68, 0.2)', 
                border: '2px solid rgba(239, 68, 68, 0.4)', 
                color: '#dc2626', 
                padding: '12px 16px', 
                borderRadius: '8px',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                fontWeight: '500'
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #034C36 0%, #FF812B 100%)',
                color: 'white',
                padding: '14px 24px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 129, 43, 0.3)',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 20px rgba(255, 129, 43, 0.4)',
                opacity: isLoading ? 0.7 : 1,
                textShadow: '0 0 5px rgba(0, 0, 0, 0.3)'
              }}
              onMouseEnter={(e) => !isLoading && (e.currentTarget.style.transform = 'translateY(-2px)', e.currentTarget.style.boxShadow = '0 6px 25px rgba(255, 129, 43, 0.6)')}
              onMouseLeave={(e) => !isLoading && (e.currentTarget.style.transform = 'translateY(0)', e.currentTarget.style.boxShadow = '0 4px 20px rgba(255, 129, 43, 0.4)')}
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: '#001110', textShadow: '0 0 1px rgba(255, 255, 255, 0.5)' }}>
            Don't have an account?{" "}
            <button
              onClick={onSwitchToSignup}
              style={{
                color: '#FF812B',
                fontWeight: '600',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline',
                textShadow: '0 0 1px rgba(255, 255, 255, 0.5)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#034C36'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#FF812B'}
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
      <AboutFooter />
    </div>
  );
};

export default Login;
