import React, { useState } from "react";
import axios from "axios";
import AboutFooter from './AboutFooter';
import '../styles/Dashboard.css';
import '../styles/theme.css';

interface SignupProps {
  onSwitchToLogin: () => void;
  onSignupSuccess: (user: any, token: string) => void;
}

const Signup: React.FC<SignupProps> = ({ onSwitchToLogin, onSignupSuccess }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const { firstName, lastName, email, password, confirmPassword } = formData;

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    try {
      const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
      const response = await axios.post(`${API_URL}/auth/signup`, {
        firstName,
        lastName,
        email,
        password
      });

      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        onSignupSuccess(response.data.user, response.data.token);
      }
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = {
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
    outline: 'none' as const
  };

  return (
    <div className="dashboard-container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '24px' }}>
        <div style={{ 
          maxWidth: '500px', 
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
            <p style={{ color: '#001110', opacity: 0.8, textShadow: '0 0 1px rgba(255, 255, 255, 0.5)' }}>Create Your Account</p>
          </div>
        
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label htmlFor="firstName" style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#001110', marginBottom: '8px', textShadow: '0 0 1px rgba(255, 255, 255, 0.5)' }}>
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="John"
                  style={inputStyle}
                  onFocus={(e) => { e.target.style.borderColor = 'rgba(255, 129, 43, 0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(255, 129, 43, 0.2)'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'rgba(3, 76, 54, 0.3)'; e.target.style.boxShadow = 'none'; }}
                  required
                />
              </div>

              <div>
                <label htmlFor="lastName" style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#001110', marginBottom: '8px', textShadow: '0 0 1px rgba(255, 255, 255, 0.5)' }}>
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  style={inputStyle}
                  onFocus={(e) => { e.target.style.borderColor = 'rgba(255, 129, 43, 0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(255, 129, 43, 0.2)'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'rgba(3, 76, 54, 0.3)'; e.target.style.boxShadow = 'none'; }}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#001110', marginBottom: '8px', textShadow: '0 0 1px rgba(255, 255, 255, 0.5)' }}>
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = 'rgba(255, 129, 43, 0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(255, 129, 43, 0.2)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(3, 76, 54, 0.3)'; e.target.style.boxShadow = 'none'; }}
                required
              />
            </div>

            <div>
              <label htmlFor="password" style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#001110', marginBottom: '8px', textShadow: '0 0 1px rgba(255, 255, 255, 0.5)' }}>
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = 'rgba(255, 129, 43, 0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(255, 129, 43, 0.2)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(3, 76, 54, 0.3)'; e.target.style.boxShadow = 'none'; }}
                required
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#001110', marginBottom: '8px', textShadow: '0 0 1px rgba(255, 255, 255, 0.5)' }}>
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = 'rgba(255, 129, 43, 0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(255, 129, 43, 0.2)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(3, 76, 54, 0.3)'; e.target.style.boxShadow = 'none'; }}
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
              {isLoading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: '#001110', textShadow: '0 0 1px rgba(255, 255, 255, 0.5)' }}>
            Already have an account?{" "}
            <button
              onClick={onSwitchToLogin}
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
              Login
            </button>
          </p>
        </div>
      </div>
      <AboutFooter />
    </div>
  );
};

export default Signup;
