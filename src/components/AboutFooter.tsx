import React from 'react';
import '../styles/AboutFooter.css';

const AboutFooter: React.FC = () => {
  return (
    <footer className="about-footer">
      <div className="about-footer-container">
        {/* About Section */}
        <div className="about-footer-section">
          <h3 className="about-footer-title">About OneFLow</h3>
          <p className="about-footer-text">
            Professional project management platform designed to streamline workflows, 
            enhance team collaboration, and drive measurable results.
          </p>
        </div>

        {/* Features Section */}
        <div className="about-footer-section">
          <h3 className="about-footer-title">Key Features</h3>
          <ul className="about-footer-list">
            <li>Project Planning & Tracking</li>
            <li>Team Collaboration</li>
            <li>Analytics & Reports</li>
            <li>Financial Management</li>
          </ul>
        </div>

        {/* Stats Section */}
        <div className="about-footer-section">
          <h3 className="about-footer-title">Trusted By</h3>
          <div className="about-footer-stats">
            <div className="footer-stat">
              <span className="stat-value">10K+</span>
              <span className="stat-label">Users</span>
            </div>
            <div className="footer-stat">
              <span className="stat-value">50K+</span>
              <span className="stat-label">Projects</span>
            </div>
            <div className="footer-stat">
              <span className="stat-value">99.9%</span>
              <span className="stat-label">Uptime</span>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="about-footer-section">
          <h3 className="about-footer-title">Contact</h3>
          <div className="about-footer-links">
            <a href="mailto:support@oneflow.com" className="footer-link">support@oneflow.com</a>
            <a href="tel:+1234567890" className="footer-link">+1 (234) 567-890</a>
            <a href="#" className="footer-link">www.oneflow.com</a>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="about-footer-bottom">
        <p>&copy; 2025 OneFLow - Professional Project Management Platform</p>
      </div>
    </footer>
  );
};

export default AboutFooter;

