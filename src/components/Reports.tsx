import React, { useState, useEffect, useRef } from 'react';
import '../styles/Pages.css';
import '../styles/Dashboard.css';
import '../styles/Reports.css';
import {
  ChartBarIcon,
  FolderIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
  CurrencyDollarIcon,
  DocumentChartBarIcon,
  BellIcon,
  EllipsisVerticalIcon,
  ArrowRightOnRectangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

interface ReportsProps {
  userName?: string;
  onBack?: () => void;
  onNavigate?: (view: string) => void;
  onLogout?: () => void;
  isAdmin?: boolean;
  userRole?: string;
}

const Reports: React.FC<ReportsProps> = ({ userName, onBack, onNavigate, onLogout, isAdmin = false, userRole = 'user' }) => {
  const [activeNav, setActiveNav] = useState<string>('Reports');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [animatedStats, setAnimatedStats] = useState({ activeProjects: 0, totalTasks: 0, completedTasks: 0, pendingTasks: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const chartRefs = useRef<(HTMLDivElement | null)[]>([]);
  const statsRef = useRef<HTMLDivElement>(null);

  // Stats data
  const stats = {
    activeProjects: 12,
    totalTasks: 45,
    completedTasks: 32,
    pendingTasks: 13
  };

  // Animate stats on mount
  useEffect(() => {
    setIsVisible(true);
    const duration = 2000; // 2 seconds
    const steps = 60;
    const interval = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      
      setAnimatedStats({
        activeProjects: Math.floor(stats.activeProjects * progress),
        totalTasks: Math.floor(stats.totalTasks * progress),
        completedTasks: Math.floor(stats.completedTasks * progress),
        pendingTasks: Math.floor(stats.pendingTasks * progress)
      });

      if (currentStep >= steps) {
        clearInterval(timer);
        setAnimatedStats(stats);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [timeRange]);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    chartRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    if (statsRef.current) observer.observe(statsRef.current);

    return () => observer.disconnect();
  }, []);

  // Sample projects data
  const projects = [
    { id: 1, name: 'Website Redesign', status: 'In Progress', completion: 75, budget: 50000, spent: 37500, completedTasks: 18, totalTasks: 24, revenue: 42, cost: 28 },
    { id: 2, name: 'Mobile App', status: 'Planning', completion: 30, budget: 80000, spent: 24000, completedTasks: 8, totalTasks: 26, revenue: 38, cost: 22 },
    { id: 3, name: 'Marketing Campaign', status: 'Completed', completion: 100, budget: 30000, spent: 29500, completedTasks: 20, totalTasks: 20, revenue: 35, cost: 24 },
    { id: 4, name: 'Cloud Migration', status: 'In Progress', completion: 60, budget: 120000, spent: 72000, completedTasks: 15, totalTasks: 25, revenue: 48, cost: 32 },
    { id: 5, name: 'Data Analytics Platform', status: 'Planning', completion: 15, budget: 95000, spent: 14250, completedTasks: 4, totalTasks: 26, revenue: 45, cost: 18 },
  ];

  // Advanced chart data with monthly breakdown
  const monthlyData = {
    week: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      revenue: [28, 35, 42, 38, 45, 25, 22],
      cost: [18, 22, 28, 24, 32, 16, 14],
      tasks: [5, 8, 12, 9, 14, 4, 3]
    },
    month: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      revenue: [32, 38, 35, 42],
      cost: [20, 24, 22, 28],
      tasks: [8, 12, 10, 15]
    },
    year: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      revenue: [28, 32, 30, 38, 35, 42, 40, 45, 42, 48, 46, 49],
      cost: [18, 20, 19, 24, 22, 28, 26, 30, 28, 32, 30, 33],
      tasks: [8, 10, 9, 12, 11, 14, 13, 15, 14, 16, 15, 17]
    }
  };

  const currentData = monthlyData[timeRange];

  // Calculate chart dimensions
  const getChartPoints = (data: number[], maxHeight: number = 200) => {
    const max = Math.max(...data);
    const width = 100 / (data.length - 1);
    
    return data.map((value, index) => {
      const x = index * width;
      const y = maxHeight - (value / max) * maxHeight;
      return `${x},${y}`;
    }).join(' ');
  };

  // Project performance data
  const projectPerformance = projects.map(p => ({
    ...p,
    profit: p.revenue - p.cost,
    profitMargin: ((p.revenue - p.cost) / p.revenue) * 100,
    efficiency: (p.completedTasks / p.totalTasks) * 100
  }));

  // Calculate totals
  const totals = {
    revenue: projectPerformance.reduce((sum, p) => sum + p.revenue, 0),
    cost: projectPerformance.reduce((sum, p) => sum + p.cost, 0),
    profit: projectPerformance.reduce((sum, p) => sum + p.profit, 0)
  };

  const totalProfitMargin = ((totals.profit / totals.revenue) * 100).toFixed(1);

  // Export functions
  const exportToPDF = () => {
    // Create a simple HTML-based PDF download
    const reportContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Reports & Analytics - ${timeRange}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          h1 { color: #034C36; margin-bottom: 10px; }
          .subtitle { color: #6b7280; margin-bottom: 30px; }
          .section { margin: 30px 0; }
          .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 20px 0; }
          .stat-box { border: 2px solid #e5e7eb; padding: 20px; border-radius: 8px; }
          .stat-value { font-size: 32px; font-weight: bold; color: #034C36; }
          .stat-label { color: #6b7280; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
          th { background: #f9fafb; font-weight: bold; }
          .overview { background: #034C36; color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .overview-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-top: 20px; }
          .overview-item { background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; }
        </style>
      </head>
      <body>
        <h1>Reports & Analytics</h1>
        <p class="subtitle">Comprehensive insights into your projects and financial performance</p>
        <p><strong>Report Period:</strong> ${timeRange.charAt(0).toUpperCase() + timeRange.slice(1)}</p>
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        
        <div class="section">
          <h2>Quick Statistics</h2>
          <div class="stats-grid">
            <div class="stat-box">
              <div class="stat-value">${stats.activeProjects}</div>
              <div class="stat-label">Active Projects</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">${stats.totalTasks}</div>
              <div class="stat-label">Total Tasks</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">${stats.completedTasks}</div>
              <div class="stat-label">Completed Tasks</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">${stats.pendingTasks}</div>
              <div class="stat-label">Pending Tasks</div>
            </div>
          </div>
        </div>

        <div class="overview">
          <h2>Financial Overview</h2>
          <div class="overview-grid">
            <div class="overview-item">
              <div style="font-size: 24px; font-weight: bold;">$${totals.revenue.toFixed(0)}</div>
              <div>Total Revenue</div>
            </div>
            <div class="overview-item">
              <div style="font-size: 24px; font-weight: bold;">$${totals.cost.toFixed(0)}</div>
              <div>Total Cost</div>
            </div>
            <div class="overview-item">
              <div style="font-size: 24px; font-weight: bold;">$${totals.profit.toFixed(0)}</div>
              <div>Net Profit</div>
            </div>
            <div class="overview-item">
              <div style="font-size: 24px; font-weight: bold;">${totalProfitMargin}%</div>
              <div>Profit Margin</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Project Performance Details</h2>
          <table>
            <thead>
              <tr>
                <th>Project</th>
                <th>Status</th>
                <th>Tasks</th>
                <th>Progress</th>
                <th>Revenue</th>
                <th>Cost</th>
                <th>Profit</th>
                <th>Margin</th>
              </tr>
            </thead>
            <tbody>
              ${projectPerformance.map(p => `
                <tr>
                  <td>${p.name}</td>
                  <td>${p.status}</td>
                  <td>${p.completedTasks}/${p.totalTasks}</td>
                  <td>${p.efficiency.toFixed(0)}%</td>
                  <td>$${p.revenue.toFixed(1)}</td>
                  <td>$${p.cost.toFixed(1)}</td>
                  <td style="color: ${p.profit > 0 ? '#10b981' : '#ef4444'}">$${p.profit.toFixed(1)}</td>
                  <td>${p.profitMargin.toFixed(1)}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </body>
      </html>
    `;

    // Create blob and download
    const blob = new Blob([reportContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${timeRange}-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    // Show success message
    setTimeout(() => {
      alert('Report downloaded! Open the HTML file and use your browser\'s "Print to PDF" feature to save as PDF.');
    }, 100);
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Project', 'Status', 'Tasks', 'Progress', 'Revenue', 'Cost', 'Profit', 'Margin'],
      ...projectPerformance.map(p => [
        p.name,
        p.status,
        `${p.completedTasks}/${p.totalTasks}`,
        `${p.efficiency.toFixed(1)}%`,
        `$${p.revenue}`,
        `$${p.cost}`,
        `$${p.profit}`,
        `${p.profitMargin.toFixed(1)}%`
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Profit data
  const profitData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue',
        data: [28, 32, 30, 38, 35, 42],
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 1
      },
      {
        label: 'Cost',
        data: [18, 20, 19, 24, 22, 28],
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1
      }
    ]
  };

  // Chart data (keeping existing data)
  const projectProgressData = {
    labels: ['Project A', 'Project B', 'Project C', 'Project D'],
    datasets: [{
      label: 'Progress',
      data: [38, 28, 22, 45],
      backgroundColor: 'rgba(59, 130, 246, 0.5)',
      borderColor: 'rgb(59, 130, 246)',
      borderWidth: 1
    }]
  };

  const taskStatusData = {
    labels: ['Completed', 'In Progress', 'Pending', 'Blocked'],
    datasets: [{
      data: [32, 10, 5, 2],
      backgroundColor: [
        'rgba(16, 185, 129, 0.5)',
        'rgba(59, 130, 246, 0.5)',
        'rgba(245, 158, 11, 0.5)',
        'rgba(239, 68, 68, 0.5)'
      ],
      borderColor: [
        'rgb(16, 185, 129)',
        'rgb(59, 130, 246)',
        'rgb(245, 158, 11)',
        'rgb(239, 68, 68)'
      ],
      borderWidth: 1
    }]
  };

  const revenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue',
        data: [28, 32, 30, 38, 35, 42],
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 1
      },
      {
        label: 'Expenses',
        data: [18, 20, 19, 24, 22, 28],
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1
      }
    ]
  };

  return (
    <div className="page-container">
      {/* Background Video */}
      <video autoPlay loop muted playsInline className="background-video">
        <source src="/image/back.mp4" type="video/mp4" />
      </video>

      {/* Top Navigation Bar */}
      <nav className="top-navbar">
        <div className="navbar-left">
          <div className="logo">
            <h1>OneFlow</h1>
          </div>
          
          <div className="nav-links">
            <button
              type="button"
              className={`nav-link ${activeNav === 'Dashboard' ? 'active' : ''}`}
              onClick={() => { setActiveNav('Dashboard'); onNavigate?.('dashboard'); }}
            >
              <ChartBarIcon className="nav-icon" />
              <span>Dashboard</span>
            </button>
            <button
              type="button"
              className={`nav-link ${activeNav === 'Projects' ? 'active' : ''}`}
              onClick={() => { setActiveNav('Projects'); onNavigate?.('projects'); }}
            >
              <FolderIcon className="nav-icon" />
              <span>Projects</span>
            </button>
            <button
              type="button"
              className={`nav-link ${activeNav === 'Tasks' ? 'active' : ''}`}
              onClick={() => { setActiveNav('Tasks'); onNavigate?.('tasks'); }}
            >
              <ClipboardDocumentListIcon className="nav-icon" />
              <span>Tasks</span>
            </button>
            <button
              type="button"
              className={`nav-link ${activeNav === 'Financial' ? 'active' : ''}`}
              onClick={() => { setActiveNav('Financial'); onNavigate?.('financial'); }}
            >
              <CurrencyDollarIcon className="nav-icon" />
              <span>Financial</span>
            </button>
            <button
              type="button"
              className={`nav-link ${activeNav === 'Reports' ? 'active' : ''}`}
              onClick={() => { setActiveNav('Reports'); onNavigate?.('reports'); }}
            >
              <DocumentChartBarIcon className="nav-icon" />
              <span>Reports</span>
            </button>
          </div>
        </div>

        <div className="navbar-right">
          <button className="notification-btn">
            <BellIcon className="notification-icon" />
          </button>
          <div className="user-profile">
            <div 
              className="profile-avatar"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              style={{ cursor: 'pointer' }}
            >
              <div className="avatar-circle">VS</div>
            </div>
            <div className="profile-info">
              <span className="user-name">{userName}</span>
              <span className="user-role">{userRole === 'admin' ? 'Administrator' : userRole === 'project_manager' ? 'Project Manager' : 'Team Member'}</span>
            </div>
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)} 
              className="profile-dropdown-btn" 
              title="Profile Menu"
            >
              <EllipsisVerticalIcon className="dropdown-icon" />
            </button>
            
            {showProfileMenu && (
              <div className="profile-dropdown-menu">
                <button onClick={() => { setShowProfileMenu(false); }}>
                  <svg className="menu-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Profile Settings</span>
                </button>
                {onLogout && (
                  <button onClick={() => { onLogout(); setShowProfileMenu(false); }} className="logout-menu-item">
                    <ArrowRightOnRectangleIcon className="menu-icon" />
                    <span>Logout</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="reports-content">
        {/* Header with Actions */}
        <div className="reports-header">
          <div className="reports-title-section">
            <h1 className="reports-main-title">Reports & Analytics</h1>
            <p className="reports-subtitle">Comprehensive insights into your projects and financial performance</p>
          </div>
          
          <div className="reports-actions">
            <button className="action-btn filter-btn">
              <FunnelIcon className="action-icon" />
              <span>Filters</span>
            </button>
            <button className="action-btn export-csv-btn" onClick={exportToCSV}>
              <div className="btn-icon-wrapper csv-icon">
                <ArrowDownTrayIcon className="action-icon" />
              </div>
              <div className="btn-text">
                <span className="btn-label">Export</span>
                <span className="btn-format">CSV</span>
              </div>
            </button>
            <button className="action-btn export-pdf-btn" onClick={exportToPDF}>
              <div className="btn-icon-wrapper pdf-icon">
                <PrinterIcon className="action-icon" />
              </div>
              <div className="btn-text">
                <span className="btn-label">Export</span>
                <span className="btn-format">PDF</span>
              </div>
            </button>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="time-range-selector">
          <button
            onClick={() => setTimeRange('week')}
            className={`time-btn ${timeRange === 'week' ? 'active' : ''}`}
          >
            <span>Week</span>
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`time-btn ${timeRange === 'month' ? 'active' : ''}`}
          >
            <span>Month</span>
          </button>
          <button
            onClick={() => setTimeRange('year')}
            className={`time-btn ${timeRange === 'year' ? 'active' : ''}`}
          >
            <span>Year</span>
          </button>
          <div className={`time-slider ${timeRange}`}></div>
        </div>

        {/* Quick Stats with Animations */}
        <div className="stats-grid" ref={statsRef}>
          <div className="stat-card stat-card-1">
            <div className="stat-header">
              <div className="stat-icon-wrapper projects-icon">
                <ChartBarIcon className="stat-icon" />
              </div>
              <div className="stat-trend positive">
                <ArrowTrendingUpIcon className="trend-icon" />
                <span>+12%</span>
              </div>
            </div>
            <div className="stat-content">
              <div className="stat-value">{animatedStats.activeProjects}</div>
              <div className="stat-label">Active Projects</div>
            </div>
            <div className="stat-progress">
              <div className="progress-bar" style={{ width: `${(animatedStats.activeProjects / stats.activeProjects) * 100}%` }}></div>
            </div>
          </div>

          <div className="stat-card stat-card-2">
            <div className="stat-header">
              <div className="stat-icon-wrapper tasks-icon">
                <ClipboardDocumentListIcon className="stat-icon" />
              </div>
              <div className="stat-trend positive">
                <ArrowTrendingUpIcon className="trend-icon" />
                <span>+8%</span>
              </div>
            </div>
            <div className="stat-content">
              <div className="stat-value">{animatedStats.totalTasks}</div>
              <div className="stat-label">Total Tasks</div>
            </div>
            <div className="stat-progress">
              <div className="progress-bar" style={{ width: `${(animatedStats.totalTasks / stats.totalTasks) * 100}%` }}></div>
            </div>
          </div>

          <div className="stat-card stat-card-3">
            <div className="stat-header">
              <div className="stat-icon-wrapper completed-icon">
                <CheckCircleIcon className="stat-icon" />
              </div>
              <div className="stat-trend positive">
                <ArrowTrendingUpIcon className="trend-icon" />
                <span>+15%</span>
              </div>
            </div>
            <div className="stat-content">
              <div className="stat-value">{animatedStats.completedTasks}</div>
              <div className="stat-label">Completed Tasks</div>
            </div>
            <div className="stat-progress">
              <div className="progress-bar" style={{ width: `${(animatedStats.completedTasks / stats.completedTasks) * 100}%` }}></div>
            </div>
          </div>

          <div className="stat-card stat-card-4">
            <div className="stat-header">
              <div className="stat-icon-wrapper pending-icon">
                <ClockIcon className="stat-icon" />
              </div>
              <div className="stat-trend negative">
                <ArrowTrendingDownIcon className="trend-icon" />
                <span>-5%</span>
              </div>
            </div>
            <div className="stat-content">
              <div className="stat-value">{animatedStats.pendingTasks}</div>
              <div className="stat-label">Pending Tasks</div>
            </div>
            <div className="stat-progress">
              <div className="progress-bar pending" style={{ width: `${(animatedStats.pendingTasks / stats.pendingTasks) * 100}%` }}></div>
            </div>
          </div>
        </div>

        {/* Financial Overview */}
        <div className="financial-overview" ref={el => chartRefs.current[0] = el}>
          <div className="overview-header">
            <h2 className="section-title">Financial Overview</h2>
            <div className="overview-summary">
              <div className="summary-item revenue">
                <span className="summary-label">Total Revenue</span>
                <span className="summary-value">${totals.revenue.toFixed(0)}</span>
              </div>
              <div className="summary-item cost">
                <span className="summary-label">Total Cost</span>
                <span className="summary-value">${totals.cost.toFixed(0)}</span>
              </div>
              <div className="summary-item profit">
                <span className="summary-label">Net Profit</span>
                <span className="summary-value">${totals.profit.toFixed(0)}</span>
              </div>
              <div className="summary-item margin">
                <span className="summary-label">Profit Margin</span>
                <span className="summary-value">{totalProfitMargin}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Charts Grid */}
        <div className="charts-grid">
          {/* Revenue vs Cost Chart */}
          <div className="chart-card" ref={el => chartRefs.current[1] = el}>
            <div className="chart-header">
              <h3 className="chart-title">Revenue vs Cost Trend</h3>
              <div className="chart-legend">
                <span className="legend-item revenue">
                  <span className="legend-dot"></span>Revenue
                </span>
                <span className="legend-item cost">
                  <span className="legend-dot"></span>Cost
                </span>
              </div>
            </div>
            <div className="chart-container">
              <svg className="animated-chart" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="revenueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(16, 185, 129, 0.3)" />
                    <stop offset="100%" stopColor="rgba(16, 185, 129, 0.05)" />
                  </linearGradient>
                  <linearGradient id="costGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(239, 68, 68, 0.3)" />
                    <stop offset="100%" stopColor="rgba(239, 68, 68, 0.05)" />
                  </linearGradient>
                </defs>
                
                {/* Grid lines */}
                <g className="grid-lines">
                  {[0, 25, 50, 75, 100].map(y => (
                    <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="rgba(0,0,0,0.05)" strokeWidth="0.2" />
                  ))}
                </g>
                
                {/* Revenue Area */}
                <polygon
                  points={`0,100 ${getChartPoints(currentData.revenue)} 100,100`}
                  fill="url(#revenueGradient)"
                  className="chart-area revenue-area"
                />
                
                {/* Cost Area */}
                <polygon
                  points={`0,100 ${getChartPoints(currentData.cost)} 100,100`}
                  fill="url(#costGradient)"
                  className="chart-area cost-area"
                />
                
                {/* Revenue Line */}
                <polyline
                  points={getChartPoints(currentData.revenue)}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="0.5"
                  className="chart-line revenue-line"
                />
                
                {/* Cost Line */}
                <polyline
                  points={getChartPoints(currentData.cost)}
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="0.5"
                  className="chart-line cost-line"
                />
                
                {/* Data Points */}
                {getChartPoints(currentData.revenue).split(' ').map((point, i) => {
                  const [x, y] = point.split(',');
                  return (
                    <circle
                      key={`rev-${i}`}
                      cx={x}
                      cy={y}
                      r="0.8"
                      fill="#10b981"
                      className="chart-dot revenue-dot"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    />
                  );
                })}
                
                {getChartPoints(currentData.cost).split(' ').map((point, i) => {
                  const [x, y] = point.split(',');
                  return (
                    <circle
                      key={`cost-${i}`}
                      cx={x}
                      cy={y}
                      r="0.8"
                      fill="#ef4444"
                      className="chart-dot cost-dot"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    />
                  );
                })}
              </svg>
              
              {/* X-axis labels */}
              <div className="chart-labels">
                {currentData.labels.map((label, i) => (
                  <span key={i} className="chart-label">{label}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Task Completion Chart */}
          <div className="chart-card" ref={el => chartRefs.current[2] = el}>
            <div className="chart-header">
              <h3 className="chart-title">Task Completion Rate</h3>
              <div className="completion-rate">
                <span className="rate-value">{((stats.completedTasks / stats.totalTasks) * 100).toFixed(1)}%</span>
              </div>
            </div>
            <div className="chart-container">
              <div className="radial-chart">
                <svg viewBox="0 0 200 200" className="radial-svg">
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                  </defs>
                  
                  {/* Background circle */}
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="rgba(0,0,0,0.05)"
                    strokeWidth="20"
                  />
                  
                  {/* Progress circle */}
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="url(#progressGradient)"
                    strokeWidth="20"
                    strokeLinecap="round"
                    className="radial-progress"
                    style={{
                      strokeDasharray: `${2 * Math.PI * 80}`,
                      strokeDashoffset: `${2 * Math.PI * 80 * (1 - stats.completedTasks / stats.totalTasks)}`,
                      transform: 'rotate(-90deg)',
                      transformOrigin: 'center'
                    }}
                  />
                  
                  {/* Center text */}
                  <text x="100" y="90" textAnchor="middle" className="radial-value" fill="#111" fontSize="32" fontWeight="bold">
                    {stats.completedTasks}
                  </text>
                  <text x="100" y="110" textAnchor="middle" className="radial-label" fill="#666" fontSize="14">
                    Completed
                  </text>
                  <text x="100" y="130" textAnchor="middle" className="radial-total" fill="#999" fontSize="12">
                    of {stats.totalTasks}
                  </text>
                </svg>
              </div>
              
              {/* Task breakdown */}
              <div className="task-breakdown">
                <div className="breakdown-item completed">
                  <span className="breakdown-dot"></span>
                  <span className="breakdown-label">Completed</span>
                  <span className="breakdown-value">{stats.completedTasks}</span>
                </div>
                <div className="breakdown-item pending">
                  <span className="breakdown-dot"></span>
                  <span className="breakdown-label">Pending</span>
                  <span className="breakdown-value">{stats.pendingTasks}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Project Distribution */}
          <div className="chart-card full-width" ref={el => chartRefs.current[3] = el}>
            <div className="chart-header">
              <h3 className="chart-title">Project Progress Distribution</h3>
            </div>
            <div className="chart-container horizontal-bars">
              {projectPerformance.map((project, index) => (
                <div key={project.id} className="bar-item" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="bar-info">
                    <span className="bar-label">{project.name}</span>
                    <span className="bar-percentage">{project.efficiency.toFixed(0)}%</span>
                  </div>
                  <div className="bar-track">
                    <div 
                      className="bar-fill"
                      style={{ 
                        width: `${project.efficiency}%`,
                        animationDelay: `${index * 0.15}s`
                      }}
                    >
                      <div className="bar-shimmer"></div>
                    </div>
                  </div>
                  <div className="bar-stats">
                    <span className="bar-stat">{project.completedTasks}/{project.totalTasks} tasks</span>
                    <span className="bar-stat profit">${project.profit.toFixed(0)} profit</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Project Table */}
        <div className="project-table-card" ref={el => chartRefs.current[4] = el}>
          <div className="table-header">
            <h3 className="table-title">Project Performance Details</h3>
            <div className="table-stats">
              <span className="table-stat">
                <span className="stat-count">{projects.length}</span> Projects
              </span>
              <span className="table-stat">
                <span className="stat-count">${totals.profit.toFixed(0)}</span> Total Profit
              </span>
            </div>
          </div>
          <div className="table-wrapper">
            <table className="project-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Status</th>
                  <th>Tasks</th>
                  <th>Progress</th>
                  <th>Revenue</th>
                  <th>Cost</th>
                  <th>Profit</th>
                  <th>Margin</th>
                </tr>
              </thead>
              <tbody>
                {projectPerformance.map((project, index) => (
                  <tr key={project.id} className="table-row" style={{ animationDelay: `${index * 0.05}s` }}>
                    <td className="project-name-cell">
                      <div className="project-name-wrapper">
                        <div className="project-avatar">{project.name.charAt(0)}</div>
                        <span className="project-name">{project.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${project.status.toLowerCase().replace(' ', '-')}`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="tasks-cell">
                      <span className="task-count">{project.completedTasks}/{project.totalTasks}</span>
                    </td>
                    <td className="progress-cell">
                      <div className="progress-wrapper">
                        <div className="progress-track">
                          <div 
                            className="progress-fill-bar"
                            style={{ width: `${project.efficiency}%` }}
                          ></div>
                        </div>
                        <span className="progress-text">{project.efficiency.toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="amount-cell positive">
                      <span className="amount">${project.revenue.toFixed(1)}</span>
                    </td>
                    <td className="amount-cell negative">
                      <span className="amount">${project.cost.toFixed(1)}</span>
                    </td>
                    <td className={`amount-cell ${project.profit > 0 ? 'profit-positive' : 'profit-negative'}`}>
                      <div className="profit-wrapper">
                        {project.profit > 0 ? (
                          <ArrowTrendingUpIcon className="profit-icon positive" />
                        ) : (
                          <ArrowTrendingDownIcon className="profit-icon negative" />
                        )}
                        <span className="amount">${project.profit.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="margin-cell">
                      <div className={`margin-badge ${project.profitMargin > 20 ? 'high' : project.profitMargin > 10 ? 'medium' : 'low'}`}>
                        {project.profitMargin.toFixed(1)}%
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="total-row">
                  <td colSpan={4} className="total-label">TOTALS</td>
                  <td className="amount-cell positive">
                    <span className="amount total">${totals.revenue.toFixed(1)}</span>
                  </td>
                  <td className="amount-cell negative">
                    <span className="amount total">${totals.cost.toFixed(1)}</span>
                  </td>
                  <td className="amount-cell profit-positive">
                    <span className="amount total">${totals.profit.toFixed(1)}</span>
                  </td>
                  <td className="margin-cell">
                    <div className="margin-badge high total">
                      {totalProfitMargin}%
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
