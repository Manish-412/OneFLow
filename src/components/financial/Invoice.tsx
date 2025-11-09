import React, { useState } from 'react';

interface InvoiceProps {
  projectId: number;
  onBack: () => void;
}

const Invoice: React.FC<InvoiceProps> = ({ projectId, onBack }) => {
  const [formData, setFormData] = useState({
    customer: '',
    invoiceDate: '',
    amount: '',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/financial/invoice', {
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
      
      if (!response.ok) throw new Error('Failed to create invoice');
      
      alert('Invoice created successfully!');
      onBack();
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Failed to create invoice');
    }
  };

  return (
    <div className="financial-page">
      <button className="back-btn" onClick={onBack}>
        ← Back to Project
      </button>
      
      <div className="financial-content">
        <h2>Invoices</h2>
        <div className="financial-tabs">
          <button className="tab active">Create New</button>
          <button className="tab">View All</button>
        </div>
        
        <div className="financial-form">
          <h3>Create New Invoice</h3>
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
              <label>Invoice Date</label>
              <input 
                type="date" 
                value={formData.invoiceDate}
                onChange={(e) => setFormData({...formData, invoiceDate: e.target.value})}
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
                placeholder="Enter invoice description..." 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
            <button type="submit" className="btn-primary">Generate Invoice</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Invoice;