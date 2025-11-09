import React, { useState } from 'react';

interface ProductionProps {
  projectId: number;
  onBack: () => void;
}

const Production: React.FC<ProductionProps> = ({ projectId, onBack }) => {
  const [formData, setFormData] = useState({
    product: '',
    productionDate: '',
    quantity: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/financial/production', {
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
      
      if (!response.ok) throw new Error('Failed to create production record');
      
      alert('Production record created successfully!');
      onBack();
    } catch (error) {
      console.error('Error creating production record:', error);
      alert('Failed to create production record');
    }
  };

  return (
    <div className="financial-page">
      <button className="back-btn" onClick={onBack}>
        ← Back to Project
      </button>
      
      <div className="financial-content">
        <h2>Production Records</h2>
        <div className="financial-tabs">
          <button className="tab active">Create New</button>
          <button className="tab">View All</button>
        </div>
        
        <div className="financial-form">
          <h3>Create New Production Record</h3>
          <form onSubmit={handleSubmit} className="financial-detail-form">
            <div className="form-group">
              <label>Product</label>
              <input 
                type="text" 
                placeholder="Select product..." 
                value={formData.product}
                onChange={(e) => setFormData({...formData, product: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Production Date</label>
              <input 
                type="date" 
                value={formData.productionDate}
                onChange={(e) => setFormData({...formData, productionDate: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Quantity</label>
              <input 
                type="number" 
                placeholder="Enter quantity..." 
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Notes</label>
              <textarea 
                placeholder="Enter production notes..." 
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </div>
            <button type="submit" className="btn-primary">Add Production Record</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Production;