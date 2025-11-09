import React, { useState } from 'react';

interface VendorBillsProps {
  projectId: number;
  onBack: () => void;
}

const VendorBills: React.FC<VendorBillsProps> = ({ projectId, onBack }) => {
  const [formData, setFormData] = useState({
    vendor: '',
    billDate: '',
    amount: '',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/financial/vendor-bills', {
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
      
      if (!response.ok) throw new Error('Failed to create vendor bill');
      
      alert('Vendor bill created successfully!');
      onBack();
    } catch (error) {
      console.error('Error creating vendor bill:', error);
      alert('Failed to create vendor bill');
    }
  };

  return (
    <div className="financial-page">
      <button className="back-btn" onClick={onBack}>
        ← Back to Project
      </button>
      
      <div className="financial-content">
        <h2>Vendor Bills</h2>
        <div className="financial-tabs">
          <button className="tab active">Create New</button>
          <button className="tab">View All</button>
        </div>
        
        <div className="financial-form">
          <h3>Create New Vendor Bill</h3>
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
              <label>Bill Date</label>
              <input 
                type="date" 
                value={formData.billDate}
                onChange={(e) => setFormData({...formData, billDate: e.target.value})}
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
            <div className="form-group">
              <label>Description</label>
              <textarea 
                placeholder="Enter bill description..." 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
            <button type="submit" className="btn-primary">Add Vendor Bill</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VendorBills;