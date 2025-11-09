import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CustomerInvoices = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<'list' | 'create'>('list');
  const [invoices, setInvoices] = useState([]);

  return (
    <div className="financial-page">
      <div className="page-header">
        <div className="page-title">
          <button className="btn-icon" onClick={() => navigate('/financial')}>
            ←
          </button>
          <h1>Customer Invoices</h1>
        </div>
        <div className="page-actions">
          {view === 'list' && (
            <button className="btn btn-primary" onClick={() => setView('create')}>
              Create New Invoice
            </button>
          )}
          {view === 'create' && (
            <button className="btn btn-secondary" onClick={() => setView('list')}>
              View All Invoices
            </button>
          )}
        </div>
      </div>

      {view === 'list' ? (
        <div className="content-section">
          <table className="financial-table">
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice: any) => (
                <tr key={invoice.id}>
                  <td>{invoice.id}</td>
                  <td>{invoice.customer}</td>
                  <td>{invoice.date}</td>
                  <td>${invoice.amount}</td>
                  <td>
                    <span className={`status-badge status-${invoice.status.toLowerCase()}`}>
                      {invoice.status}
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
              <label>Invoice Date</label>
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
            <div className="form-group">
              <label>Due Date</label>
              <input type="date" />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Create Invoice
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default CustomerInvoices;