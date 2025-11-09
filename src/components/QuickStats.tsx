import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface QuickStatsProps {
  className?: string;
}

interface Stats {
  activeProjects: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
}

const QuickStats: React.FC<QuickStatsProps> = ({ className = '' }) => {
  const [stats, setStats] = useState<Stats>({
    activeProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/dashboard/stats', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) throw new Error('Failed to fetch stats');

        const data = await response.json();
        setStats({
          activeProjects: data.activeProjects,
          totalTasks: data.pendingTasks + data.completedTasks,
          completedTasks: data.completedTasks,
          pendingTasks: data.pendingTasks
        });
      } catch (error) {
        console.error('Error fetching quick stats:', error);
      }
    };

    fetchStats();
    // Refresh stats every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const stats_items = [
    {
      icon: <ChartBarIcon className="w-5 h-5" />,
      label: 'Active Projects',
      value: stats.activeProjects,
      color: 'text-blue-600'
    },
    {
      icon: <ClipboardDocumentListIcon className="w-5 h-5" />,
      label: 'Total Tasks',
      value: stats.totalTasks,
      color: 'text-purple-600'
    },
    {
      icon: <CheckCircleIcon className="w-5 h-5" />,
      label: 'Completed',
      value: stats.completedTasks,
      color: 'text-green-600'
    },
    {
      icon: <ClockIcon className="w-5 h-5" />,
      label: 'Pending',
      value: stats.pendingTasks,
      color: 'text-yellow-600'
    }
  ];

  return (
    <div className={`flex items-center space-x-6 ${className}`}>
      {stats_items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <div className={`${item.color}`}>
            {item.icon}
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-500">{item.label}</span>
            <span className="text-sm font-semibold">{item.value}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuickStats;