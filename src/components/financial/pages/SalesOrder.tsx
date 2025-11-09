import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SalesOrder = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<'list' | 'create'>('list');
  const [orders, setOrders] = useState([]);

  return (
    <div className="financial-page">
      <div className="page-header">
        <div className="page-title">
          <button className="btn-icon" onClick={() => navigate('/financial')}>
            ←
          </button>
          <h1>Sales Orders</h1>
        </div>
        <div className="page-actions">
          {view === 'list' && (
            <button className="btn btn-primary" onClick={() => setView('create')}>
              Create New Order
            </button>
          )}
          {view === 'create' && (
            <button className="btn btn-secondary" onClick={() => setView('list')}>
              View All Orders
            </button>
          )}
        </div>
      </div>

      {view === 'list' ? (
        <div className="content-section">
          <table className="financial-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order: any) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.customer}</td>
                  <td>{order.date}</td>
                  <td>${order.amount}</td>
                  <td>
                    <span className={`status-badge status-${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-secondary btn-sm">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="content-section">
          <form className="form-grid">
            <div className="form-group">
              <label>Customer</label>
              <input type="text" placeholder="Select customer..." />
            </div>
            <div className="form-group">
              <label>Order Date</label>
              <input type="date" />
            </div>
            <div className="form-group">
              <label>Amount</label>
              <input type="number" placeholder="Enter amount..." />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea placeholder="Enter description..." />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Create Order
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default SalesOrder;