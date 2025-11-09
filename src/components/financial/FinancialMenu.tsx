import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Financial.css';

const FinancialMenu = () => {
  const navigate = useNavigate();

  const menuItems = [
    { 
      icon: '📄', 
      title: 'Sales Order', 
      path: 'sales-order',
      description: 'Create and manage customer sales orders'
    },
    { 
      icon: '🧾', 
      title: 'Purchase Order', 
      path: 'purchase-order',
      description: 'Manage vendor purchase orders and tracking'
    },
    { 
      icon: '💳', 
      title: 'Customer Invoices', 
      path: 'invoices',
      description: 'Handle customer invoicing and payments'
    },
    { 
      icon: '📋', 
      title: 'Vendor Bills', 
      path: 'vendor-bills',
      description: 'Manage and track vendor bills'
    },
    { 
      icon: '⚙️', 
      title: 'Expenses', 
      path: 'expenses',
      description: 'Track and manage project expenses'
    }
  ];

  return (
    <div className="financial-menu-container">
      <div className="financial-header">
        <h1>Financial Management</h1>
        <p>Manage all your financial documents and transactions</p>
      </div>

      <div className="financial-grid">
        {menuItems.map((item) => (
          <div 
            key={item.path}
            className="financial-menu-item"
            onClick={() => navigate(item.path)}
          >
            <span className="item-icon">{item.icon}</span>
            <span className="item-title">{item.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FinancialMenu;