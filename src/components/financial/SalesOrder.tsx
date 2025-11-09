import React, { useState } from 'react';

interface SalesOrderProps {
  projectId: number;
  onBack: () => void;
}

const SalesOrder: React.FC<SalesOrderProps> = ({ projectId, onBack }) => {
  const [formData, setFormData] = useState({
    customer: '',
    orderDate: '',
    amount: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/financial/sales-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          projectId,
          ...formData
        })
      });
      
      if (!response.ok) throw new Error('Failed to create sales order');
      
      alert('Sales order created successfully!');
      onBack();
    } catch (error) {
      console.error('Error creating sales order:', error);
      alert('Failed to create sales order');
    }
  };

  return (
    <div className="financial-page">
      <button className="back-btn" onClick={onBack}>
        ← Back to Project
      </button>
      
      <div className="financial-content">
        <h2>Sales Orders</h2>
        <div className="financial-tabs">
          <button className="tab active">Create New</button>
          <button className="tab">View All</button>
        </div>
        
        <div className="financial-form">
          <h3>Create New Sales Order</h3>
          <form onSubmit={handleSubmit} className="financial-detail-form">
            <div className="form-group">
              <label>Customer</label>
              <input 
                type="text" 
                placeholder="Select customer..." 
                value={formData.customer}
                onChange={(e) => setFormData({...formData, customer: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Order Date</label>
              <input 
                type="date" 
                value={formData.orderDate}
                onChange={(e) => setFormData({...formData, orderDate: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Amount</label>
              <input 
                type="number" 
                placeholder="Enter amount..." 
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                required
              />
            </div>
            <button type="submit" className="btn-primary">Create Sales Order</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SalesOrder;