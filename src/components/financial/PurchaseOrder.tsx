import React, { useState } from 'react';

interface PurchaseOrderProps {
  projectId: number;
  onBack: () => void;
}

const PurchaseOrder: React.FC<PurchaseOrderProps> = ({ projectId, onBack }) => {
  const [formData, setFormData] = useState({
    vendor: '',
    orderDate: '',
    amount: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/financial/purchase-order', {
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
      
      if (!response.ok) throw new Error('Failed to create purchase order');
      
      alert('Purchase order created successfully!');
      onBack();
    } catch (error) {
      console.error('Error creating purchase order:', error);
      alert('Failed to create purchase order');
    }
  };

  return (
    <div className="financial-page">
      <button className="back-btn" onClick={onBack}>
        ← Back to Project
      </button>
      
      <div className="financial-content">
        <h2>Purchase Orders</h2>
        <div className="financial-tabs">
          <button className="tab active">Create New</button>
          <button className="tab">View All</button>
        </div>
        
        <div className="financial-form">
          <h3>Create New Purchase Order</h3>
          <form onSubmit={handleSubmit} className="financial-detail-form">
            <div className="form-group">
              <label>Vendor</label>
              <input 
                type="text" 
                placeholder="Select vendor..." 
                value={formData.vendor}
                onChange={(e) => setFormData({...formData, vendor: e.target.value})}
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
            <button type="submit" className="btn-primary">Create Purchase Order</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrder;