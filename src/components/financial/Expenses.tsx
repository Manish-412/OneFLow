import React, { useState } from 'react';

interface ExpensesProps {
  projectId: number;
  onBack: () => void;
}

const Expenses: React.FC<ExpensesProps> = ({ projectId, onBack }) => {
  const [formData, setFormData] = useState({
    category: '',
    expenseDate: '',
    amount: '',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/financial/expenses', {
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
      
      if (!response.ok) throw new Error('Failed to create expense');
      
      alert('Expense created successfully!');
      onBack();
    } catch (error) {
      console.error('Error creating expense:', error);
      alert('Failed to create expense');
    }
  };

  return (
    <div className="financial-page">
      <button className="back-btn" onClick={onBack}>
        ← Back to Project
      </button>
      
      <div className="financial-content">
        <h2>Expenses</h2>
        <div className="financial-tabs">
          <button className="tab active">Create New</button>
          <button className="tab">View All</button>
        </div>
        
        <div className="financial-form">
          <h3>Create New Expense</h3>
          <form onSubmit={handleSubmit} className="financial-detail-form">
            <div className="form-group">
              <label>Category</label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                required
              >
                <option value="">Select category...</option>
                <option value="travel">Travel</option>
                <option value="supplies">Supplies</option>
                <option value="services">Services</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Date</label>
              <input 
                type="date" 
                value={formData.expenseDate}
                onChange={(e) => setFormData({...formData, expenseDate: e.target.value})}
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
                placeholder="Enter expense description..." 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
              />
            </div>
            <button type="submit" className="btn-primary">Add Expense</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Expenses;