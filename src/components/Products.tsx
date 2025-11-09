import React, { useState, useEffect } from 'react';
import '../styles/Products.css';
import '../styles/Dashboard.css';
import Modal from './Modal';
import {
  ChartBarIcon,
  FolderIcon,
  ClipboardDocumentListIcon,
  CubeIcon,
  CurrencyDollarIcon,
  DocumentChartBarIcon,
  BellIcon,
  ArrowRightOnRectangleIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface ProductsProps {
  userName?: string;
  onBack?: () => void;
  onNavigate?: (view: string) => void;
  onLogout?: () => void;
  isAdmin?: boolean;
  userRole?: string;
}

interface Product {
  id: string;
  name: string;
  category: 'Sales' | 'Purchase' | 'Expenses';
  salesPrice: number;
  cost: number;
  salesTaxes: number;
}

const Products: React.FC<ProductsProps> = ({ userName, onBack, onNavigate, onLogout, isAdmin = false, userRole = 'user' }) => {
  const [activeNav, setActiveNav] = useState<string>('Products');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Initialize products from localStorage or use default data
  const getInitialProducts = (): Product[] => {
    const savedProducts = localStorage.getItem('products');
    if (savedProducts) {
      return JSON.parse(savedProducts);
    }
    return [
      {
        id: '1',
        name: 'Website Design Package',
        category: 'Sales',
        salesPrice: 50000,
        cost: 30000,
        salesTaxes: 18
      },
      {
        id: '2',
        name: 'Office Supplies',
        category: 'Purchase',
        salesPrice: 0,
        cost: 5000,
        salesTaxes: 18
      },
      {
        id: '3',
        name: 'Software Subscription',
        category: 'Expenses',
        salesPrice: 0,
        cost: 2999,
        salesTaxes: 18
      }
    ];
  };

  const [products, setProducts] = useState<Product[]>(getInitialProducts());

  // Save products to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  const [formData, setFormData] = useState<Product>({
    id: '',
    name: '',
    category: 'Sales',
    salesPrice: 0,
    cost: 0,
    salesTaxes: 18
  });

  const handleCreateProduct = () => {
    const newProduct: Product = {
      ...formData,
      id: Date.now().toString()
    };
    setProducts([...products, newProduct]);
    resetForm();
    setShowCreateModal(false);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setFormData({ ...product });
    setShowEditModal(true);
  };

  const handleUpdateProduct = () => {
    setProducts(products.map(p => p.id === selectedProduct?.id ? formData : p));
    resetForm();
    setShowEditModal(false);
  };

  const handleDeleteProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    setProducts(products.filter(p => p.id !== selectedProduct?.id));
    setShowDeleteModal(false);
    setSelectedProduct(null);
  };

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      category: 'Sales',
      salesPrice: 0,
      cost: 0,
      salesTaxes: 18
    });
    setSelectedProduct(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  return (
    <div className="products-page">
      {/* Background Video */}
      <video autoPlay loop muted playsInline className="background-video">
        <source src="/image/back.mp4" type="video/mp4" />
      </video>

      {/* Top Navigation Bar */}
      <nav className="top-navbar">
        <div className="navbar-left">
          <h1 className="logo">OneFlow</h1>
          
          <div className="nav-links">
            <button
              type="button"
              className={`nav-link ${activeNav === 'Dashboard' ? 'active' : ''}`}
              onClick={() => { setActiveNav('Dashboard'); onNavigate?.('dashboard'); }}
            >
              <ChartBarIcon className="nav-icon" />
              <span>Dashboard</span>
            </button>
            <button
              type="button"
              className={`nav-link ${activeNav === 'Projects' ? 'active' : ''}`}
              onClick={() => { setActiveNav('Projects'); onNavigate?.('projects'); }}
            >
              <FolderIcon className="nav-icon" />
              <span>Projects</span>
            </button>
            <button
              type="button"
              className={`nav-link ${activeNav === 'Tasks' ? 'active' : ''}`}
              onClick={() => { setActiveNav('Tasks'); onNavigate?.('tasks'); }}
            >
              <ClipboardDocumentListIcon className="nav-icon" />
              <span>Tasks</span>
            </button>
            <button
              type="button"
              className={`nav-link ${activeNav === 'Products' ? 'active' : ''}`}
              onClick={() => { setActiveNav('Products'); onNavigate?.('products'); }}
            >
              <CubeIcon className="nav-icon" />
              <span>Products</span>
            </button>
            <button
              type="button"
              className={`nav-link ${activeNav === 'Financial' ? 'active' : ''}`}
              onClick={() => { 
                setActiveNav('Financial'); 
                onNavigate?.('financial');
              }}
            >
              <CurrencyDollarIcon className="nav-icon" />
              <span>Financial</span>
            </button>
            <button
              type="button"
              className={`nav-link ${activeNav === 'Reports' ? 'active' : ''}`}
              onClick={() => { setActiveNav('Reports'); onNavigate?.('reports'); }}
            >
              <DocumentChartBarIcon className="nav-icon" />
              <span>Reports</span>
            </button>
          </div>
        </div>

        <div className="navbar-right">
          <button className="icon-btn" aria-label="Notifications">
            <BellIcon className="icon" />
          </button>
          <div className="profile-section">
            <button 
              className="profile-trigger"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <div className="avatar">
                {userName?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="profile-info">
                <span className="user-name">{userName || 'User'}</span>
                <span className="user-role">{userRole === 'admin' ? 'Administrator' : userRole === 'project_manager' ? 'Project Manager' : 'Team Member'}</span>
              </div>
            </button>
            {showProfileMenu && (
              <div className="profile-dropdown">
                <button className="dropdown-item" onClick={onLogout}>
                  <ArrowRightOnRectangleIcon style={{ width: 18, height: 18 }} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Products Content */}
      <div className="products-container">
        <div className="products-header">
          <h1>Products Management</h1>
          <button className="btn-create-product" onClick={openCreateModal}>
            <PlusIcon style={{ width: 20, height: 20 }} />
            Create Product
          </button>
        </div>

        <div className="products-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-card-header">
                <h3>{product.name}</h3>
                <div className="product-actions">
                  <button 
                    className="action-btn-small"
                    onClick={() => handleEditProduct(product)}
                    title="Edit"
                  >
                    <PencilSquareIcon style={{ width: 18, height: 18 }} />
                  </button>
                  <button 
                    className="action-btn-small delete"
                    onClick={() => handleDeleteProduct(product)}
                    title="Delete"
                  >
                    <TrashIcon style={{ width: 18, height: 18 }} />
                  </button>
                </div>
              </div>
              
              <div className="product-card-body">
                <div className="product-category-badges">
                  <label className="category-checkbox">
                    <input 
                      type="checkbox" 
                      checked={product.category === 'Sales'}
                      readOnly
                    />
                    <span>Sales</span>
                  </label>
                  <label className="category-checkbox">
                    <input 
                      type="checkbox" 
                      checked={product.category === 'Purchase'}
                      readOnly
                    />
                    <span>Purchase</span>
                  </label>
                  <label className="category-checkbox">
                    <input 
                      type="checkbox" 
                      checked={product.category === 'Expenses'}
                      readOnly
                    />
                    <span>Expenses</span>
                  </label>
                </div>

                <div className="product-details">
                  <div className="detail-row">
                    <span className="detail-label">Sales Price:</span>
                    <span className="detail-value">₹{product.salesPrice.toLocaleString()}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Cost:</span>
                    <span className="detail-value">₹{product.cost.toLocaleString()}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Sales Taxes:</span>
                    <span className="detail-value">{product.salesTaxes}%</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Product Modal */}
      <Modal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
        title="Product Create/Edit view"
      >
        <div className="product-modal-content">
          <div className="product-form">
            <div className="form-group">
              <label className="form-label">Product name</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter product name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <div className="category-checkboxes">
                <label className="category-checkbox-option">
                  <input
                    type="checkbox"
                    checked={formData.category === 'Sales'}
                    onChange={() => setFormData({ ...formData, category: 'Sales' })}
                  />
                  <span>Sales</span>
                </label>
                <label className="category-checkbox-option">
                  <input
                    type="checkbox"
                    checked={formData.category === 'Purchase'}
                    onChange={() => setFormData({ ...formData, category: 'Purchase' })}
                  />
                  <span>Purchase</span>
                </label>
                <label className="category-checkbox-option">
                  <input
                    type="checkbox"
                    checked={formData.category === 'Expenses'}
                    onChange={() => setFormData({ ...formData, category: 'Expenses' })}
                  />
                  <span>Expenses</span>
                </label>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Sales price</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="0"
                  value={formData.salesPrice}
                  onChange={(e) => setFormData({ ...formData, salesPrice: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Sales Taxes</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="18"
                  value={formData.salesTaxes}
                  onChange={(e) => setFormData({ ...formData, salesTaxes: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Cost</label>
              <input
                type="number"
                className="form-input"
                placeholder="0"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="modal-actions">
              <button 
                type="button" 
                className="btn-modal-cancel" 
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn-modal-confirm" 
                onClick={handleCreateProduct}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Edit Product Modal */}
      <Modal 
        isOpen={showEditModal} 
        onClose={() => setShowEditModal(false)} 
        title="Product Edit view"
      >
        <div className="product-modal-content">
          <div className="product-form">
            <div className="form-group">
              <label className="form-label">Product name</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter product name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <div className="category-checkboxes">
                <label className="category-checkbox-option">
                  <input
                    type="checkbox"
                    checked={formData.category === 'Sales'}
                    onChange={() => setFormData({ ...formData, category: 'Sales' })}
                  />
                  <span>Sales</span>
                </label>
                <label className="category-checkbox-option">
                  <input
                    type="checkbox"
                    checked={formData.category === 'Purchase'}
                    onChange={() => setFormData({ ...formData, category: 'Purchase' })}
                  />
                  <span>Purchase</span>
                </label>
                <label className="category-checkbox-option">
                  <input
                    type="checkbox"
                    checked={formData.category === 'Expenses'}
                    onChange={() => setFormData({ ...formData, category: 'Expenses' })}
                  />
                  <span>Expenses</span>
                </label>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Sales price</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="0"
                  value={formData.salesPrice}
                  onChange={(e) => setFormData({ ...formData, salesPrice: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Sales Taxes</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="18"
                  value={formData.salesTaxes}
                  onChange={(e) => setFormData({ ...formData, salesTaxes: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Cost</label>
              <input
                type="number"
                className="form-input"
                placeholder="0"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="modal-actions">
              <button 
                type="button" 
                className="btn-modal-cancel" 
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn-modal-confirm" 
                onClick={handleUpdateProduct}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={showDeleteModal} 
        onClose={() => setShowDeleteModal(false)} 
        title="Delete Product"
      >
        <div className="delete-confirm-content">
          <p>Are you sure you want to delete "{selectedProduct?.name}"?</p>
          <p className="warning-text">This action cannot be undone.</p>
          <div className="delete-confirm-actions">
            <button 
              type="button" 
              className="btn-cancel-delete" 
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </button>
            <button 
              type="button" 
              className="btn-delete" 
              onClick={confirmDelete}
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Products;
