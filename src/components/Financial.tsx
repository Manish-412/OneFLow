import React, { useState } from 'react';
import '../styles/Financial.css';
import '../styles/Dashboard.css';
import Modal from './Modal';
import * as XLSX from 'xlsx';
import {
  DocumentTextIcon,
  ShoppingCartIcon,
  CurrencyDollarIcon,
  ReceiptPercentIcon,
  ChartBarIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  CalendarIcon,
  UserIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  FolderIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
  CubeIcon,
  DocumentChartBarIcon,
  BellIcon,
  ArrowRightOnRectangleIcon,
  ArrowDownTrayIcon,
  DocumentArrowUpIcon,
  ClockIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface FinancialProps {
  userName?: string;
  onBack?: () => void;
  onNavigate?: (view: string) => void;
  onLogout?: () => void;
  isAdmin?: boolean;
  userRole?: string;
}

type TabType = 'Dashboard' | 'Sales Order' | 'Invoices' | 'Purchase Order' | 'Expenses' | 'Vendor Bills' | 'Requests';

interface LineItem {
  id: string;
  product: string;
  description?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  tax: number;
  amount: number;
}

interface SalesOrder {
  id: string;
  orderNumber: string;
  customer: string;
  project: string;
  products: LineItem[];
  subtotal: number;
  tax: number;
  total: number;
  deliveryDate: string;
  status: 'Draft' | 'Confirmed' | 'Delivered';
  createdDate: string;
}

interface PurchaseOrder {
  id: string;
  orderNumber: string;
  vendor: string;
  project: string;
  items: LineItem[];
  subtotal: number;
  tax: number;
  total: number;
  deliveryDate: string;
  status: 'Draft' | 'Ordered' | 'Received';
  createdDate: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  customer: string;
  items: LineItem[];
  subtotal: number;
  tax: number;
  total: number;
  dueDate: string;
  status: 'Draft' | 'Sent' | 'Paid';
  createdDate: string;
}

interface Expense {
  id: string;
  title: string;
  amount: number;
  date: string;
  category: string;
  project: string;
  vendor: string;
  paymentMethod: string;
  notes: string;
  image?: string;
}

interface VendorBill {
  id: string;
  billNumber: string;
  vendor: string;
  items: LineItem[];
  subtotal: number;
  tax: number;
  total: number;
  dueDate: string;
  status: 'Draft' | 'Pending' | 'Paid';
  createdDate: string;
  project: string;
}

interface DocumentRequest {
  id: string;
  requestNumber: string;
  requestedBy: string;
  documentType: 'Invoice' | 'Purchase Order' | 'Receipt';
  project: string;
  amount: number;
  description: string;
  requestDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  approvedBy?: string;
  approvalDate?: string;
  rejectionReason?: string;
  downloadUrl?: string;
}

const Financial: React.FC<FinancialProps> = ({ userName, onBack, onNavigate, onLogout, isAdmin = false, userRole = 'user' }) => {
  const [activeTab, setActiveTab] = useState<TabType>('Dashboard');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  const [activeNav, setActiveNav] = useState<string>('Financial');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Sample data with proper state management
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([
    {
      id: 'so-1',
      orderNumber: 'SO-2023-007',
      customer: 'RD Services',
      project: 'Website Redesign',
      products: [
        { id: 'line-1', product: 'Website Design Package', description: 'Complete redesign', quantity: 1, unit: 'week', unitPrice: 45000, tax: 18, amount: 53100 },
        { id: 'line-2', product: 'SEO Optimization', description: 'Monthly service', quantity: 5, unit: 'hours', unitPrice: 2000, tax: 18, amount: 11800 }
      ],
      subtotal: 55000,
      tax: 9900,
      total: 64900,
      deliveryDate: '2025-11-20',
      status: 'Confirmed',
      createdDate: '2025-11-01'
    }
  ]);

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([
    {
      id: 'po-1',
      orderNumber: 'PO-2023-001',
      vendor: 'Tech Suppliers Inc',
      project: 'Office Equipment',
      items: [
        { id: 'line-1', product: 'Laptops', description: 'Dell XPS 15', quantity: 5, unit: 'units', unitPrice: 85000, tax: 18, amount: 501500 },
        { id: 'line-2', product: 'Monitors', description: '27 inch 4K', quantity: 10, unit: 'units', unitPrice: 25000, tax: 18, amount: 295000 }
      ],
      subtotal: 675000,
      tax: 121500,
      total: 796500,
      deliveryDate: '2025-11-25',
      status: 'Ordered',
      createdDate: '2025-11-03'
    }
  ]);

  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: 'inv-1',
      invoiceNumber: 'INV-2023-009',
      customer: 'RD Services',
      items: [
        { id: 'line-1', product: 'Website Design Package', description: 'Phase 1 completion', quantity: 1, unit: 'week', unitPrice: 45000, tax: 18, amount: 53100 },
        { id: 'line-2', product: 'Monthly SEO Subscription', description: 'November 2025', quantity: 1, unit: 'month', unitPrice: 15000, tax: 18, amount: 17700 }
      ],
      subtotal: 60000,
      tax: 10800,
      total: 70800,
      dueDate: '2025-11-30',
      status: 'Sent',
      createdDate: '2025-11-05'
    }
  ]);

  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: 'exp-1',
      title: 'Software Subscription',
      amount: 299,
      date: '2025-11-01',
      category: 'Software',
      project: 'RD Services',
      vendor: 'Adobe',
      paymentMethod: 'Credit Card',
      notes: 'Monthly subscription for design tools'
    },
    {
      id: 'exp-2',
      title: 'Office Supplies',
      amount: 1250,
      date: '2025-11-03',
      category: 'Office Supplies',
      project: 'General',
      vendor: 'Staples',
      paymentMethod: 'Bank Transfer',
      notes: 'Stationery and printing materials'
    }
  ]);

  const [vendorBills, setVendorBills] = useState<VendorBill[]>([
    {
      id: 'vb-1',
      billNumber: 'BILL-2023-001',
      vendor: 'Tech Suppliers Inc',
      project: 'Office Equipment',
      items: [
        { id: 'line-1', product: 'Laptops', description: 'Dell XPS 15', quantity: 5, unit: 'units', unitPrice: 85000, tax: 18, amount: 501500 }
      ],
      subtotal: 425000,
      tax: 76500,
      total: 501500,
      dueDate: '2025-11-30',
      status: 'Pending',
      createdDate: '2025-11-05'
    }
  ]);

  // Document Requests State
  const [documentRequests, setDocumentRequests] = useState<DocumentRequest[]>([
    {
      id: 'req-1',
      requestNumber: 'REQ-2025-001',
      requestedBy: userName || 'John Doe',
      documentType: 'Invoice',
      project: 'Website Redesign',
      amount: 50000,
      description: 'Invoice for Phase 1 completion',
      requestDate: '2025-11-08',
      status: 'Pending',
    },
    {
      id: 'req-2',
      requestNumber: 'REQ-2025-002',
      requestedBy: userName || 'Jane Smith',
      documentType: 'Purchase Order',
      project: 'Office Equipment',
      amount: 75000,
      description: 'PO for new laptops and monitors',
      requestDate: '2025-11-07',
      status: 'Approved',
      approvedBy: 'Project Manager',
      approvalDate: '2025-11-08',
      downloadUrl: '/documents/po-sample.pdf'
    }
  ]);

  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [requestFormData, setRequestFormData] = useState({
    documentType: 'Invoice' as 'Invoice' | 'Purchase Order' | 'Receipt',
    project: '',
    amount: 0,
    description: ''
  });

  // Form state for creating/editing
  const [formData, setFormData] = useState<any>({
    orderNumber: '',
    customer: '',
    vendor: '',
    project: '',
    title: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    category: 'Software',
    paymentMethod: 'Credit Card',
    notes: '',
    deliveryDate: '',
    dueDate: '',
    status: 'Draft',
    items: []
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: Date.now().toString(), product: '', description: '', quantity: 1, unit: 'units', unitPrice: 0, tax: 18, amount: 0 }
  ]);

  // Utility functions
  const calculateLineTotal = (quantity: number, unitPrice: number, taxRate: number): number => {
    const subtotal = quantity * unitPrice;
    const taxAmount = (subtotal * taxRate) / 100;
    return Math.round((subtotal + taxAmount) * 100) / 100;
  };

  const calculateOrderTotals = (items: LineItem[]) => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const tax = items.reduce((sum, item) => sum + ((item.quantity * item.unitPrice * item.tax) / 100), 0);
    const total = subtotal + tax;
    return { subtotal: Math.round(subtotal * 100) / 100, tax: Math.round(tax * 100) / 100, total: Math.round(total * 100) / 100 };
  };

  const generateOrderNumber = (prefix: string): string => {
    const date = new Date();
    const year = date.getFullYear();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${year}-${random}`;
  };

  // CRUD Operations
  const handleAddLineItem = () => {
    setLineItems([...lineItems, { 
      id: Date.now().toString(), 
      product: '', 
      description: '', 
      quantity: 1, 
      unit: 'units', 
      unitPrice: 0, 
      tax: 18, 
      amount: 0 
    }]);
  };

  const handleRemoveLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter(item => item.id !== id));
    }
  };

  const handleLineItemChange = (id: string, field: keyof LineItem, value: any) => {
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice' || field === 'tax') {
          updatedItem.amount = calculateLineTotal(
            field === 'quantity' ? value : updatedItem.quantity,
            field === 'unitPrice' ? value : updatedItem.unitPrice,
            field === 'tax' ? value : updatedItem.tax
          );
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const handleCreateSalesOrder = () => {
    const totals = calculateOrderTotals(lineItems);
    const newOrder: SalesOrder = {
      id: `so-${Date.now()}`,
      orderNumber: formData.orderNumber || generateOrderNumber('SO'),
      customer: formData.customer,
      project: formData.project,
      products: lineItems,
      ...totals,
      deliveryDate: formData.deliveryDate,
      status: formData.status || 'Draft',
      createdDate: new Date().toISOString().split('T')[0]
    };
    setSalesOrders([...salesOrders, newOrder]);
    resetForm();
    setShowCreateModal(false);
  };

  const handleCreatePurchaseOrder = () => {
    const totals = calculateOrderTotals(lineItems);
    const newOrder: PurchaseOrder = {
      id: `po-${Date.now()}`,
      orderNumber: formData.orderNumber || generateOrderNumber('PO'),
      vendor: formData.vendor,
      project: formData.project,
      items: lineItems,
      ...totals,
      deliveryDate: formData.deliveryDate,
      status: formData.status || 'Draft',
      createdDate: new Date().toISOString().split('T')[0]
    };
    setPurchaseOrders([...purchaseOrders, newOrder]);
    resetForm();
    setShowCreateModal(false);
  };

  const handleCreateInvoice = () => {
    const totals = calculateOrderTotals(lineItems);
    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: formData.invoiceNumber || generateOrderNumber('INV'),
      customer: formData.customer,
      items: lineItems,
      ...totals,
      dueDate: formData.dueDate,
      status: formData.status || 'Draft',
      createdDate: new Date().toISOString().split('T')[0]
    };
    setInvoices([...invoices, newInvoice]);
    resetForm();
    setShowCreateModal(false);
  };

  const handleCreateExpense = () => {
    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      title: formData.title,
      amount: parseFloat(formData.amount),
      date: formData.date,
      category: formData.category,
      project: formData.project,
      vendor: formData.vendor || '',
      paymentMethod: formData.paymentMethod,
      notes: formData.notes,
      image: formData.image
    };
    setExpenses([...expenses, newExpense]);
    resetForm();
    setShowCreateModal(false);
  };

  const handleCreateVendorBill = () => {
    const totals = calculateOrderTotals(lineItems);
    const newBill: VendorBill = {
      id: `vb-${Date.now()}`,
      billNumber: formData.billNumber || generateOrderNumber('BILL'),
      vendor: formData.vendor,
      project: formData.project,
      items: lineItems,
      ...totals,
      dueDate: formData.dueDate,
      status: formData.status || 'Draft',
      createdDate: new Date().toISOString().split('T')[0]
    };
    setVendorBills([...vendorBills, newBill]);
    resetForm();
    setShowCreateModal(false);
  };

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    setFormData({ ...item });
    if (item.products || item.items) {
      setLineItems(item.products || item.items);
    }
    setShowEditModal(true);
    setShowActionMenu(null);
  };

  const handleUpdateItem = () => {
    if (activeTab === 'Sales Order' && selectedItem) {
      const totals = calculateOrderTotals(lineItems);
      setSalesOrders(salesOrders.map(order => 
        order.id === selectedItem.id 
          ? { ...order, ...formData, products: lineItems, ...totals }
          : order
      ));
    } else if (activeTab === 'Purchase Order' && selectedItem) {
      const totals = calculateOrderTotals(lineItems);
      setPurchaseOrders(purchaseOrders.map(order => 
        order.id === selectedItem.id 
          ? { ...order, ...formData, items: lineItems, ...totals }
          : order
      ));
    } else if (activeTab === 'Invoices' && selectedItem) {
      const totals = calculateOrderTotals(lineItems);
      setInvoices(invoices.map(invoice => 
        invoice.id === selectedItem.id 
          ? { ...invoice, ...formData, items: lineItems, ...totals }
          : invoice
      ));
    } else if (activeTab === 'Expenses' && selectedItem) {
      setExpenses(expenses.map(expense => 
        expense.id === selectedItem.id 
          ? { ...expense, ...formData, amount: parseFloat(formData.amount) }
          : expense
      ));
    } else if (activeTab === 'Vendor Bills' && selectedItem) {
      const totals = calculateOrderTotals(lineItems);
      setVendorBills(vendorBills.map(bill => 
        bill.id === selectedItem.id 
          ? { ...bill, ...formData, items: lineItems, ...totals }
          : bill
      ));
    }
    resetForm();
    setShowEditModal(false);
  };

  const handleDelete = (item: any) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
    setShowActionMenu(null);
  };

  const confirmDelete = () => {
    if (activeTab === 'Sales Order') {
      setSalesOrders(salesOrders.filter(order => order.id !== selectedItem.id));
    } else if (activeTab === 'Purchase Order') {
      setPurchaseOrders(purchaseOrders.filter(order => order.id !== selectedItem.id));
    } else if (activeTab === 'Invoices') {
      setInvoices(invoices.filter(invoice => invoice.id !== selectedItem.id));
    } else if (activeTab === 'Expenses') {
      setExpenses(expenses.filter(expense => expense.id !== selectedItem.id));
    } else if (activeTab === 'Vendor Bills') {
      setVendorBills(vendorBills.filter(bill => bill.id !== selectedItem.id));
    }
    setShowDeleteModal(false);
    setSelectedItem(null);
  };

  const handleChangeStatus = (item: any, newStatus: string) => {
    if (activeTab === 'Sales Order') {
      setSalesOrders(salesOrders.map(order => 
        order.id === item.id ? { ...order, status: newStatus as any } : order
      ));
    } else if (activeTab === 'Purchase Order') {
      setPurchaseOrders(purchaseOrders.map(order => 
        order.id === item.id ? { ...order, status: newStatus as any } : order
      ));
    } else if (activeTab === 'Invoices') {
      setInvoices(invoices.map(invoice => 
        invoice.id === item.id ? { ...invoice, status: newStatus as any } : invoice
      ));
    } else if (activeTab === 'Vendor Bills') {
      setVendorBills(vendorBills.map(bill => 
        bill.id === item.id ? { ...bill, status: newStatus as any } : bill
      ));
    }
    setShowActionMenu(null);
  };

  const resetForm = () => {
    setFormData({
      orderNumber: '',
      customer: '',
      vendor: '',
      project: '',
      title: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      category: 'Software',
      paymentMethod: 'Credit Card',
      notes: '',
      deliveryDate: '',
      dueDate: '',
      status: 'Draft',
      items: []
    });
    setLineItems([{ id: Date.now().toString(), product: '', description: '', quantity: 1, unit: 'units', unitPrice: 0, tax: 18, amount: 0 }]);
    setSelectedItem(null);
  };

  // Document Request Handlers
  const handleCreateRequest = () => {
    const newRequest: DocumentRequest = {
      id: `req-${Date.now()}`,
      requestNumber: generateOrderNumber('REQ'),
      requestedBy: userName || 'User',
      ...requestFormData,
      requestDate: new Date().toISOString().split('T')[0],
      status: 'Pending'
    };
    setDocumentRequests([...documentRequests, newRequest]);
    setRequestFormData({
      documentType: 'Invoice',
      project: '',
      amount: 0,
      description: ''
    });
    setShowRequestModal(false);
  };

  const handleApproveRequest = (requestId: string) => {
    setDocumentRequests(documentRequests.map(req => 
      req.id === requestId 
        ? { 
            ...req, 
            status: 'Approved', 
            approvedBy: userName || 'Manager',
            approvalDate: new Date().toISOString().split('T')[0],
            downloadUrl: `/documents/${req.documentType.toLowerCase().replace(' ', '-')}-${req.requestNumber}.pdf`
          }
        : req
    ));
  };

  const handleRejectRequest = (requestId: string, reason: string) => {
    setDocumentRequests(documentRequests.map(req => 
      req.id === requestId 
        ? { 
            ...req, 
            status: 'Rejected',
            rejectionReason: reason,
            approvedBy: userName || 'Manager',
            approvalDate: new Date().toISOString().split('T')[0]
          }
        : req
    ));
  };

  const handleDownloadDocument = (request: DocumentRequest) => {
    if (request.downloadUrl) {
      // In real implementation, this would download the actual document
      alert(`Downloading ${request.documentType} - ${request.requestNumber}`);
      // window.open(request.downloadUrl, '_blank');
    }
  };

  const handleImportExcel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          // Process the data based on active tab
          if (activeTab === 'Invoices') {
            const newInvoices = jsonData.map((row: any) => ({
              id: `inv-${Date.now()}-${Math.random()}`,
              invoiceNumber: row['Invoice Number'] || row['InvoiceNumber'] || generateOrderNumber('INV'),
              customer: row['Customer'] || row['customer'] || 'Unknown',
              items: [{
                id: '1',
                product: row['Product'] || row['product'] || 'Imported Item',
                description: row['Description'] || row['description'] || '',
                quantity: parseFloat(row['Quantity'] || row['quantity'] || 1),
                unit: row['Unit'] || row['unit'] || 'units',
                unitPrice: parseFloat(row['Unit Price'] || row['unitPrice'] || row['Price'] || 0),
                tax: parseFloat(row['Tax'] || row['tax'] || 18),
                amount: parseFloat(row['Amount'] || row['amount'] || 0)
              }],
              subtotal: parseFloat(row['Subtotal'] || row['subtotal'] || 0),
              tax: parseFloat(row['Tax Amount'] || row['taxAmount'] || 0),
              total: parseFloat(row['Total'] || row['total'] || 0),
              dueDate: row['Due Date'] || row['dueDate'] || new Date().toISOString().split('T')[0],
              status: (row['Status'] || row['status'] || 'Draft') as 'Draft' | 'Sent' | 'Paid',
              createdDate: row['Created Date'] || row['createdDate'] || new Date().toISOString().split('T')[0]
            }));
            setInvoices([...invoices, ...newInvoices]);
            alert(`Successfully imported ${newInvoices.length} invoices from Excel!`);
          } else if (activeTab === 'Expenses') {
            const newExpenses = jsonData.map((row: any) => ({
              id: `exp-${Date.now()}-${Math.random()}`,
              title: row['Title'] || row['title'] || 'Imported Expense',
              amount: parseFloat(row['Amount'] || row['amount'] || 0),
              date: row['Date'] || row['date'] || new Date().toISOString().split('T')[0],
              category: row['Category'] || row['category'] || 'General',
              project: row['Project'] || row['project'] || 'General',
              vendor: row['Vendor'] || row['vendor'] || '',
              paymentMethod: row['Payment Method'] || row['paymentMethod'] || 'Cash',
              notes: row['Notes'] || row['notes'] || ''
            }));
            setExpenses([...expenses, ...newExpenses]);
            alert(`Successfully imported ${newExpenses.length} expenses from Excel!`);
          } else if (activeTab === 'Sales Order') {
            const newOrders = jsonData.map((row: any) => ({
              id: `so-${Date.now()}-${Math.random()}`,
              orderNumber: row['Order Number'] || row['orderNumber'] || generateOrderNumber('SO'),
              customer: row['Customer'] || row['customer'] || 'Unknown',
              project: row['Project'] || row['project'] || 'General',
              products: [{
                id: '1',
                product: row['Product'] || row['product'] || 'Imported Item',
                description: row['Description'] || row['description'] || '',
                quantity: parseFloat(row['Quantity'] || row['quantity'] || 1),
                unit: row['Unit'] || row['unit'] || 'units',
                unitPrice: parseFloat(row['Unit Price'] || row['unitPrice'] || 0),
                tax: parseFloat(row['Tax'] || row['tax'] || 18),
                amount: parseFloat(row['Amount'] || row['amount'] || 0)
              }],
              subtotal: parseFloat(row['Subtotal'] || row['subtotal'] || 0),
              tax: parseFloat(row['Tax Amount'] || row['taxAmount'] || 0),
              total: parseFloat(row['Total'] || row['total'] || 0),
              deliveryDate: row['Delivery Date'] || row['deliveryDate'] || new Date().toISOString().split('T')[0],
              status: (row['Status'] || row['status'] || 'Draft') as 'Draft' | 'Confirmed' | 'Delivered',
              createdDate: row['Created Date'] || row['createdDate'] || new Date().toISOString().split('T')[0]
            }));
            setSalesOrders([...salesOrders, ...newOrders]);
            alert(`Successfully imported ${newOrders.length} sales orders from Excel!`);
          }

          setShowImportModal(false);
        } catch (error) {
          console.error('Error parsing Excel file:', error);
          alert('Error importing Excel file. Please check the file format and try again.');
        }
      };

      reader.readAsBinaryString(file);
    }
  };

  const handleExportToExcel = () => {
    let dataToExport: any[] = [];
    let fileName = 'export.xlsx';

    if (activeTab === 'Invoices') {
      dataToExport = invoices.map(inv => ({
        'Invoice Number': inv.invoiceNumber,
        'Customer': inv.customer,
        'Subtotal': inv.subtotal,
        'Tax Amount': inv.tax,
        'Total': inv.total,
        'Due Date': inv.dueDate,
        'Status': inv.status,
        'Created Date': inv.createdDate
      }));
      fileName = 'invoices.xlsx';
    } else if (activeTab === 'Expenses') {
      dataToExport = expenses.map(exp => ({
        'Title': exp.title,
        'Amount': exp.amount,
        'Date': exp.date,
        'Category': exp.category,
        'Project': exp.project,
        'Vendor': exp.vendor,
        'Payment Method': exp.paymentMethod,
        'Notes': exp.notes
      }));
      fileName = 'expenses.xlsx';
    } else if (activeTab === 'Sales Order') {
      dataToExport = salesOrders.map(order => ({
        'Order Number': order.orderNumber,
        'Customer': order.customer,
        'Project': order.project,
        'Subtotal': order.subtotal,
        'Tax Amount': order.tax,
        'Total': order.total,
        'Delivery Date': order.deliveryDate,
        'Status': order.status,
        'Created Date': order.createdDate
      }));
      fileName = 'sales_orders.xlsx';
    } else if (activeTab === 'Purchase Order') {
      dataToExport = purchaseOrders.map(order => ({
        'Order Number': order.orderNumber,
        'Vendor': order.vendor,
        'Project': order.project,
        'Subtotal': order.subtotal,
        'Tax Amount': order.tax,
        'Total': order.total,
        'Delivery Date': order.deliveryDate,
        'Status': order.status,
        'Created Date': order.createdDate
      }));
      fileName = 'purchase_orders.xlsx';
    } else if (activeTab === 'Vendor Bills') {
      dataToExport = vendorBills.map(bill => ({
        'Bill Number': bill.billNumber,
        'Vendor': bill.vendor,
        'Project': bill.project,
        'Subtotal': bill.subtotal,
        'Tax Amount': bill.tax,
        'Total': bill.total,
        'Due Date': bill.dueDate,
        'Status': bill.status,
        'Created Date': bill.createdDate
      }));
      fileName = 'vendor_bills.xlsx';
    } else if (activeTab === 'Requests') {
      dataToExport = documentRequests.map(req => ({
        'Request Number': req.requestNumber,
        'Document Type': req.documentType,
        'Project': req.project,
        'Amount': req.amount,
        'Requested By': req.requestedBy,
        'Request Date': req.requestDate,
        'Status': req.status,
        'Approved By': req.approvedBy || '',
        'Approval Date': req.approvalDate || ''
      }));
      fileName = 'document_requests.xlsx';
    }

    if (dataToExport.length > 0) {
      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, activeTab);
      XLSX.writeFile(workbook, fileName);
      alert(`Successfully exported ${dataToExport.length} records to ${fileName}`);
    } else {
      alert('No data to export');
    }
  };

  const openCreateModal = () => {
    resetForm();
    if (activeTab === 'Sales Order') {
      setFormData({ ...formData, orderNumber: generateOrderNumber('SO') });
    } else if (activeTab === 'Purchase Order') {
      setFormData({ ...formData, orderNumber: generateOrderNumber('PO') });
    } else if (activeTab === 'Invoices') {
      setFormData({ ...formData, invoiceNumber: generateOrderNumber('INV') });
    } else if (activeTab === 'Vendor Bills') {
      setFormData({ ...formData, billNumber: generateOrderNumber('BILL') });
    }
    setShowCreateModal(true);
  };

  // Filter data based on search query
  const filterData = (data: any[]) => {
    if (!searchQuery) return data;
    return data.filter(item => 
      JSON.stringify(item).toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const renderDashboard = () => (
    <div className="financial-dashboard-content">
      <div className="dashboard-stats">
        <div className="stat-card-fin">
          <div className="stat-icon-wrapper-fin" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
            <DocumentTextIcon className="stat-icon-fin" style={{ color: '#3b82f6' }} />
          </div>
          <div className="stat-info-fin">
            <p className="stat-label-fin">Sales Orders</p>
            <h3 className="stat-value-fin">{salesOrders.length}</h3>
            <span className="stat-change-fin positive">+12% from last month</span>
          </div>
        </div>

        <div className="stat-card-fin">
          <div className="stat-icon-wrapper-fin" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
            <ShoppingCartIcon className="stat-icon-fin" style={{ color: '#10b981' }} />
          </div>
          <div className="stat-info-fin">
            <p className="stat-label-fin">Purchase Orders</p>
            <h3 className="stat-value-fin">{purchaseOrders.length}</h3>
            <span className="stat-change-fin positive">+8% from last month</span>
          </div>
        </div>

        <div className="stat-card-fin">
          <div className="stat-icon-wrapper-fin" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
            <CurrencyDollarIcon className="stat-icon-fin" style={{ color: '#f59e0b' }} />
          </div>
          <div className="stat-info-fin">
            <p className="stat-label-fin">Invoices</p>
            <h3 className="stat-value-fin">{invoices.length}</h3>
            <span className="stat-change-fin positive">+15% from last month</span>
          </div>
        </div>

        <div className="stat-card-fin">
          <div className="stat-icon-wrapper-fin" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
            <ReceiptPercentIcon className="stat-icon-fin" style={{ color: '#ef4444' }} />
          </div>
          <div className="stat-info-fin">
            <p className="stat-label-fin">Expenses</p>
            <h3 className="stat-value-fin">{expenses.length}</h3>
            <span className="stat-change-fin negative">+5% from last month</span>
          </div>
        </div>
      </div>

      <div className="dashboard-charts">
        <div className="chart-card">
          <h3>Revenue Overview</h3>
          <div className="chart-placeholder">
            <ChartBarIcon style={{ width: 64, height: 64, color: '#cbd5e1' }} />
            <p>Chart visualization coming soon</p>
          </div>
        </div>

        <div className="chart-card">
          <h3>Recent Transactions</h3>
          <div className="transactions-list">
            <div className="transaction-item">
              <div className="transaction-icon" style={{ background: 'rgba(34, 197, 94, 0.1)' }}>
                <CurrencyDollarIcon style={{ width: 20, height: 20, color: '#22c55e' }} />
              </div>
              <div className="transaction-details">
                <p className="transaction-title">Payment Received</p>
                <span className="transaction-date">Nov 7, 2025</span>
              </div>
              <span className="transaction-amount positive">+₹85,100</span>
            </div>
            <div className="transaction-item">
              <div className="transaction-icon" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                <ReceiptPercentIcon style={{ width: 20, height: 20, color: '#ef4444' }} />
              </div>
              <div className="transaction-details">
                <p className="transaction-title">Expense - Software</p>
                <span className="transaction-date">Nov 6, 2025</span>
              </div>
              <span className="transaction-amount negative">-₹299</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSalesOrders = () => (
    <div className="orders-content">
      <div className="orders-header">
        <div className="search-bar-fin">
          <MagnifyingGlassIcon className="search-icon" />
          <input
            type="text"
            placeholder="Search sales orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-secondary-fin" onClick={handleExportToExcel}>
            <ArrowDownTrayIcon style={{ width: 18, height: 18 }} />
            Export to Excel
          </button>
          <button className="btn-primary-fin" onClick={openCreateModal}>
            <PlusIcon style={{ width: 18, height: 18 }} />
            New Sales Order
          </button>
        </div>
      </div>

      <div className="orders-table">
        <table>
          <thead>
            <tr>
              <th>Order Number</th>
              <th>Customer</th>
              <th>Project</th>
              <th>Total Amount</th>
              <th>Delivery Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filterData(salesOrders).map((order) => (
              <tr key={order.id}>
                <td><strong>{order.orderNumber}</strong></td>
                <td>
                  <div className="customer-cell">
                    <UserIcon style={{ width: 16, height: 16, color: '#64748b' }} />
                    {order.customer}
                  </div>
                </td>
                <td>{order.project}</td>
                <td><strong>₹{order.total.toLocaleString()}</strong></td>
                <td>
                  <div className="date-cell">
                    <CalendarIcon style={{ width: 16, height: 16, color: '#64748b' }} />
                    {new Date(order.deliveryDate).toLocaleDateString()}
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${order.status.toLowerCase()}`}>
                    {order.status}
                  </span>
                </td>
                <td>
                  <div className="action-menu-wrapper">
                    <button 
                      className="action-btn" 
                      onClick={() => setShowActionMenu(showActionMenu === order.id ? null : order.id)}
                    >
                      <EllipsisVerticalIcon style={{ width: 18, height: 18 }} />
                    </button>
                    {showActionMenu === order.id && (
                      <div className="action-dropdown">
                        <button onClick={() => handleEdit(order)}>
                          <PencilSquareIcon style={{ width: 16, height: 16 }} />
                          Edit
                        </button>
                        <button onClick={() => handleChangeStatus(order, 'Confirmed')}>
                          <CheckCircleIcon style={{ width: 16, height: 16 }} />
                          Mark as Confirmed
                        </button>
                        <button onClick={() => handleChangeStatus(order, 'Delivered')}>
                          <CheckCircleIcon style={{ width: 16, height: 16 }} />
                          Mark as Delivered
                        </button>
                        <button onClick={() => handleDelete(order)} className="delete-action">
                          <TrashIcon style={{ width: 16, height: 16 }} />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filterData(salesOrders).length === 0 && (
          <div className="empty-state">
            <DocumentTextIcon style={{ width: 48, height: 48, color: '#cbd5e1' }} />
            <p>No sales orders found</p>
            <button className="btn-primary-fin" onClick={openCreateModal}>
              Create Your First Sales Order
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderPurchaseOrders = () => (
    <div className="orders-content">
      <div className="orders-header">
        <div className="search-bar-fin">
          <MagnifyingGlassIcon className="search-icon" />
          <input
            type="text"
            placeholder="Search purchase orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-secondary-fin" onClick={handleExportToExcel}>
            <ArrowDownTrayIcon style={{ width: 18, height: 18 }} />
            Export to Excel
          </button>
          <button className="btn-primary-fin" onClick={() => setShowCreateModal(true)}>
            <PlusIcon style={{ width: 18, height: 18 }} />
            New Purchase Order
          </button>
        </div>
      </div>

      <div className="orders-table">
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Vendor</th>
              <th>Total Amount</th>
              <th>Delivery Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {purchaseOrders.map((order) => (
              <tr key={order.id}>
                <td><strong>{order.id}</strong></td>
                <td>
                  <div className="customer-cell">
                    <UserIcon style={{ width: 16, height: 16, color: '#64748b' }} />
                    {order.vendor}
                  </div>
                </td>
                <td><strong>₹{order.total.toLocaleString()}</strong></td>
                <td>
                  <div className="date-cell">
                    <CalendarIcon style={{ width: 16, height: 16, color: '#64748b' }} />
                    {new Date(order.deliveryDate).toLocaleDateString()}
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${order.status.toLowerCase()}`}>
                    {order.status}
                  </span>
                </td>
                <td>
                  <button className="action-btn">
                    <EllipsisVerticalIcon style={{ width: 18, height: 18 }} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderInvoices = () => (
    <div className="orders-content">
      <div className="orders-header">
        <div className="search-bar-fin">
          <MagnifyingGlassIcon className="search-icon" />
          <input
            type="text"
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-secondary-fin" onClick={handleExportToExcel}>
            <ArrowDownTrayIcon style={{ width: 18, height: 18 }} />
            Export to Excel
          </button>
          <button className="btn-primary-fin" onClick={() => setShowCreateModal(true)}>
            <PlusIcon style={{ width: 18, height: 18 }} />
            New Invoice
          </button>
        </div>
      </div>

      <div className="orders-table">
        <table>
          <thead>
            <tr>
              <th>Invoice ID</th>
              <th>Customer</th>
              <th>Total Amount</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td><strong>{invoice.id}</strong></td>
                <td>
                  <div className="customer-cell">
                    <UserIcon style={{ width: 16, height: 16, color: '#64748b' }} />
                    {invoice.customer}
                  </div>
                </td>
                <td><strong>₹{invoice.total.toLocaleString()}</strong></td>
                <td>
                  <div className="date-cell">
                    <CalendarIcon style={{ width: 16, height: 16, color: '#64748b' }} />
                    {new Date(invoice.dueDate).toLocaleDateString()}
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${invoice.status.toLowerCase()}`}>
                    {invoice.status}
                  </span>
                </td>
                <td>
                  <button className="action-btn">
                    <EllipsisVerticalIcon style={{ width: 18, height: 18 }} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderExpenses = () => (
    <div className="orders-content">
      <div className="orders-header">
        <div className="search-bar-fin">
          <MagnifyingGlassIcon className="search-icon" />
          <input
            type="text"
            placeholder="Search expenses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-secondary-fin" onClick={handleExportToExcel}>
            <ArrowDownTrayIcon style={{ width: 18, height: 18 }} />
            Export to Excel
          </button>
          <button className="btn-primary-fin" onClick={() => setShowCreateModal(true)}>
            <PlusIcon style={{ width: 18, height: 18 }} />
            New Expense
          </button>
        </div>
      </div>

      <div className="orders-table">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Project</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Payment Method</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr key={expense.id}>
                <td><strong>{expense.title}</strong></td>
                <td>
                  <span className="category-badge">{expense.category}</span>
                </td>
                <td>{expense.project}</td>
                <td><strong>₹{expense.amount.toLocaleString()}</strong></td>
                <td>
                  <div className="date-cell">
                    <CalendarIcon style={{ width: 16, height: 16, color: '#64748b' }} />
                    {new Date(expense.date).toLocaleDateString()}
                  </div>
                </td>
                <td>{expense.paymentMethod}</td>
                <td>
                  <button className="action-btn">
                    <EllipsisVerticalIcon style={{ width: 18, height: 18 }} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderVendorBills = () => (
    <div className="orders-content">
      <div className="orders-header">
        <div className="search-bar-fin">
          <MagnifyingGlassIcon className="search-icon" />
          <input
            type="text"
            placeholder="Search vendor bills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-secondary-fin" onClick={handleExportToExcel}>
            <ArrowDownTrayIcon style={{ width: 18, height: 18 }} />
            Export to Excel
          </button>
          <button className="btn-primary-fin" onClick={openCreateModal}>
            <PlusIcon style={{ width: 18, height: 18 }} />
            New Vendor Bill
          </button>
        </div>
      </div>

      <div className="orders-table">
        <table>
          <thead>
            <tr>
              <th>Bill Number</th>
              <th>Vendor</th>
              <th>Project</th>
              <th>Total</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filterData(vendorBills).map((bill) => (
              <tr key={bill.id}>
                <td><strong>{bill.billNumber}</strong></td>
                <td>
                  <div className="vendor-cell">
                    <UserIcon style={{ width: 16, height: 16, color: '#64748b' }} />
                    {bill.vendor}
                  </div>
                </td>
                <td>{bill.project}</td>
                <td><strong>₹{bill.total.toLocaleString()}</strong></td>
                <td>
                  <div className="date-cell">
                    <CalendarIcon style={{ width: 16, height: 16, color: '#64748b' }} />
                    {new Date(bill.dueDate).toLocaleDateString()}
                  </div>
                </td>
                <td>
                  <span className={`status-badge status-${bill.status.toLowerCase()}`}>
                    {bill.status}
                  </span>
                </td>
                <td>
                  <div className="action-cell">
                    <button 
                      className="action-btn"
                      onClick={() => setShowActionMenu(showActionMenu === bill.id ? null : bill.id)}
                    >
                      <EllipsisVerticalIcon style={{ width: 18, height: 18 }} />
                    </button>
                    {showActionMenu === bill.id && (
                      <div className="action-dropdown">
                        <button onClick={() => handleEdit(bill)}>
                          <PencilSquareIcon style={{ width: 16, height: 16 }} />
                          Edit
                        </button>
                        <button onClick={() => handleChangeStatus(bill, 'Pending')}>
                          <CheckCircleIcon style={{ width: 16, height: 16 }} />
                          Mark as Pending
                        </button>
                        <button onClick={() => handleChangeStatus(bill, 'Paid')}>
                          <CheckCircleIcon style={{ width: 16, height: 16 }} />
                          Mark as Paid
                        </button>
                        <button onClick={() => handleDelete(bill)} className="delete-action">
                          <TrashIcon style={{ width: 16, height: 16 }} />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filterData(vendorBills).length === 0 && (
          <div className="empty-state">
            <DocumentTextIcon style={{ width: 64, height: 64, color: '#cbd5e1' }} />
            <p>No vendor bills found</p>
            <button className="btn-primary-fin" onClick={openCreateModal}>
              <PlusIcon style={{ width: 18, height: 18 }} />
              Create Your First Vendor Bill
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderRequests = () => {
    const isManager = userRole === 'admin' || userRole === 'project_manager';
    const userRequests = isManager ? documentRequests : documentRequests.filter(req => req.requestedBy === userName);

    return (
      <div className="orders-content">
        <div className="orders-header">
          <div className="search-bar-fin">
            <MagnifyingGlassIcon className="search-icon" />
            <input
              type="text"
              placeholder="Search requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-secondary-fin" onClick={() => setShowImportModal(true)}>
              <DocumentArrowUpIcon style={{ width: 18, height: 18 }} />
              Import from Excel
            </button>
            <button className="btn-primary-fin" onClick={() => setShowRequestModal(true)}>
              <PlusIcon style={{ width: 18, height: 18 }} />
              New Request
            </button>
          </div>
        </div>

        <div className="orders-table">
          <table>
            <thead>
              <tr>
                <th>Request #</th>
                <th>Document Type</th>
                <th>Project</th>
                <th>Amount</th>
                <th>Requested By</th>
                <th>Request Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filterData(userRequests).map((request) => (
                <tr key={request.id}>
                  <td className="order-number">{request.requestNumber}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {request.documentType === 'Invoice' && <DocumentTextIcon style={{ width: 18, height: 18, color: '#3b82f6' }} />}
                      {request.documentType === 'Purchase Order' && <ShoppingCartIcon style={{ width: 18, height: 18, color: '#10b981' }} />}
                      {request.documentType === 'Receipt' && <ReceiptPercentIcon style={{ width: 18, height: 18, color: '#f59e0b' }} />}
                      {request.documentType}
                    </div>
                  </td>
                  <td>{request.project}</td>
                  <td className="amount">₹{request.amount.toLocaleString()}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <UserIcon style={{ width: 16, height: 16 }} />
                      {request.requestedBy}
                    </div>
                  </td>
                  <td>{new Date(request.requestDate).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge status-${request.status.toLowerCase()}`}>
                      {request.status === 'Pending' && <ClockIcon style={{ width: 14, height: 14 }} />}
                      {request.status === 'Approved' && <CheckCircleIcon style={{ width: 14, height: 14 }} />}
                      {request.status === 'Rejected' && <XCircleIcon style={{ width: 14, height: 14 }} />}
                      {request.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons-group">
                      {request.status === 'Approved' && request.downloadUrl && (
                        <button 
                          className="btn-download"
                          onClick={() => handleDownloadDocument(request)}
                          title="Download Document"
                        >
                          <ArrowDownTrayIcon style={{ width: 18, height: 18 }} />
                          Download
                        </button>
                      )}
                      {request.status === 'Pending' && isManager && (
                        <>
                          <button 
                            className="btn-approve"
                            onClick={() => handleApproveRequest(request.id)}
                            title="Approve Request"
                          >
                            <CheckCircleIcon style={{ width: 18, height: 18 }} />
                            Approve
                          </button>
                          <button 
                            className="btn-reject"
                            onClick={() => handleRejectRequest(request.id, 'Not approved by manager')}
                            title="Reject Request"
                          >
                            <XCircleIcon style={{ width: 18, height: 18 }} />
                            Reject
                          </button>
                        </>
                      )}
                      {request.status === 'Rejected' && (
                        <span className="rejection-reason" title={request.rejectionReason}>
                          {request.rejectionReason}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filterData(userRequests).length === 0 && (
            <div className="empty-state">
              <DocumentTextIcon style={{ width: 64, height: 64, color: '#cbd5e1' }} />
              <p>No document requests found</p>
              <button className="btn-primary-fin" onClick={() => setShowRequestModal(true)}>
                <PlusIcon style={{ width: 18, height: 18 }} />
                Create Your First Request
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderCreateModal = () => {
    const isEditMode = showEditModal;
    const modalTitle = isEditMode ? 
      `${activeTab} Edit view` : 
      `${activeTab} Create/edit view`;

    if (activeTab === 'Expenses') {
      return (
        <Modal 
          isOpen={showCreateModal || showEditModal} 
          onClose={() => { setShowCreateModal(false); setShowEditModal(false); resetForm(); }} 
          title={modalTitle}
        >
          <div className="financial-modal-content">
            <div className="modal-action-buttons">
              <button 
                type="button" 
                className="btn-modal-confirm"
                onClick={isEditMode ? handleUpdateItem : handleCreateExpense}
              >
                Confirm
              </button>
              <button 
                type="button" 
                className="btn-modal-cancel" 
                onClick={() => { setShowCreateModal(false); setShowEditModal(false); resetForm(); }}
              >
                Cancel
              </button>
            </div>

            <form className="financial-form">
              <div className="form-group">
                <label className="form-label">Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Expense name"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Amount</label>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="₹ 0.00"
                  value={formData.amount || ''}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>

              <div className="form-row-2col">
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input 
                    type="date" 
                    className="form-input"
                    value={formData.date || ''}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select 
                    className="form-select"
                    value={formData.category || 'Software'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option>Software</option>
                    <option>Office Supplies</option>
                    <option>Travel</option>
                    <option>Meals</option>
                    <option>Equipment</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Project</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Select project"
                  value={formData.project || ''}
                  onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Payment Method</label>
                <select 
                  className="form-select"
                  value={formData.paymentMethod || 'Credit Card'}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                >
                  <option>Credit Card</option>
                  <option>Bank Transfer</option>
                  <option>Cash</option>
                  <option>Cheque</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea 
                  className="form-textarea" 
                  rows={3}
                  placeholder="Enter notes..."
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                ></textarea>
              </div>
            </form>
          </div>
        </Modal>
      );
    }

    // Sales Order Create Modal
    if (activeTab === 'Sales Order') {
      return (
        <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Sales order Create/edit view" maxWidth="900px">
          <div className="financial-modal-content">
            <div className="modal-action-buttons">
              <button type="button" className="btn-modal-source">Create Source</button>
              <button type="button" className="btn-modal-confirm">Confirm</button>
              <button type="button" className="btn-modal-cancel" onClick={() => setShowCreateModal(false)}>Cancel</button>
            </div>

            <form className="financial-form">
              <div className="form-group">
                <label className="form-label">SO01</label>
                <input type="text" className="form-input" value="SO01" readOnly />
              </div>

              <div className="form-row-2col">
                <div className="form-group">
                  <label className="form-label">Customer</label>
                  <input type="text" className="form-input" placeholder="Select customer" />
                </div>
                <div className="form-group">
                  <label className="form-label">Project</label>
                  <input type="text" className="form-input" placeholder="Select project" />
                </div>
              </div>

              <div className="order-lines-section">
                <label className="form-label">Order Lines</label>
                <div className="order-lines-table">
                  <div className="order-lines-header">
                    <span>Product</span>
                    <span>Quantity</span>
                    <span>Unit</span>
                    <span>Unit Price</span>
                    <span>Taxes</span>
                    <span>Amount</span>
                  </div>
                  <div className="order-lines-row">
                    <input type="text" placeholder="P1" />
                    <input type="number" placeholder="10" />
                    <select>
                      <option>Litre</option>
                      <option>Kg</option>
                      <option>Unit</option>
                    </select>
                    <input type="number" placeholder="20" />
                    <select>
                      <option>18 %</option>
                      <option>5 %</option>
                      <option>12 %</option>
                    </select>
                    <input type="number" placeholder="236.00" value="236.00" readOnly />
                  </div>
                  <div className="order-lines-row">
                    <input type="text" placeholder="P1" />
                    <input type="number" placeholder="10" />
                    <select>
                      <option>Litre</option>
                      <option>Kg</option>
                      <option>Unit</option>
                    </select>
                    <input type="number" placeholder="20" />
                    <select>
                      <option>18 %</option>
                      <option>5 %</option>
                      <option>12 %</option>
                    </select>
                    <input type="number" placeholder="236.00" value="236.00" readOnly />
                  </div>
                </div>
                <button type="button" className="btn-add-product">Add a product</button>
              </div>

              <div className="order-totals">
                <div className="totals-row">
                  <span>Untaxed Amount:</span>
                  <span>Total</span>
                </div>
              </div>
            </form>
          </div>
        </Modal>
      );
    }

    // Purchase Order Create Modal
    if (activeTab === 'Purchase Order') {
      return (
        <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Purchase order Create/edit view" maxWidth="900px">
          <div className="financial-modal-content">
            <div className="modal-action-buttons">
              <button type="button" className="btn-modal-source">Create Bills</button>
              <button type="button" className="btn-modal-confirm">Confirm</button>
              <button type="button" className="btn-modal-cancel" onClick={() => setShowCreateModal(false)}>Cancel</button>
            </div>

            <form className="financial-form">
              <div className="form-group">
                <label className="form-label">PO01</label>
                <input type="text" className="form-input" value="PO01" readOnly />
              </div>

              <div className="form-row-2col">
                <div className="form-group">
                  <label className="form-label">Vendor</label>
                  <input type="text" className="form-input" placeholder="Select vendor" />
                </div>
                <div className="form-group">
                  <label className="form-label">Project</label>
                  <input type="text" className="form-input" placeholder="Select project" />
                </div>
              </div>

              <div className="order-lines-section">
                <label className="form-label">Order Lines</label>
                <div className="order-lines-table">
                  <div className="order-lines-header">
                    <span>Product</span>
                    <span>Quantity</span>
                    <span>Unit</span>
                    <span>Unit Price</span>
                    <span>Taxes</span>
                    <span>Amount</span>
                  </div>
                  <div className="order-lines-row">
                    <input type="text" placeholder="P1" />
                    <input type="number" placeholder="10" />
                    <select>
                      <option>Litre</option>
                      <option>Kg</option>
                      <option>Unit</option>
                    </select>
                    <input type="number" placeholder="20" />
                    <select>
                      <option>18 %</option>
                      <option>5 %</option>
                      <option>12 %</option>
                    </select>
                    <input type="number" placeholder="236.00" value="236.00" readOnly />
                  </div>
                  <div className="order-lines-row">
                    <input type="text" placeholder="P1" />
                    <input type="number" placeholder="10" />
                    <select>
                      <option>Litre</option>
                      <option>Kg</option>
                      <option>Unit</option>
                    </select>
                    <input type="number" placeholder="20" />
                    <select>
                      <option>18 %</option>
                      <option>5 %</option>
                      <option>12 %</option>
                    </select>
                    <input type="number" placeholder="236.00" value="236.00" readOnly />
                  </div>
                </div>
                <button type="button" className="btn-add-product">Add a product</button>
              </div>

              <div className="order-totals">
                <div className="totals-row">
                  <span>Untaxed Amount:</span>
                  <span>Total</span>
                </div>
              </div>
            </form>
          </div>
        </Modal>
      );
    }

    // Invoices Create Modal
    if (activeTab === 'Invoices') {
      return (
        <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Invoice Create/edit view" maxWidth="700px">
          <div className="financial-modal-content">
            <div className="modal-action-buttons">
              <button type="button" className="btn-modal-confirm">Confirm</button>
              <button type="button" className="btn-modal-cancel" onClick={() => setShowCreateModal(false)}>Cancel</button>
            </div>

            <form className="financial-form">
              <div className="form-group">
                <label className="form-label">Customer Invoice</label>
                <input type="text" className="form-input" placeholder="Invoice number" />
              </div>

              <div className="order-lines-section">
                <label className="form-label">Invoice Lines</label>
                <div className="invoice-lines-table">
                  <div className="invoice-lines-header">
                    <span>Product</span>
                  </div>
                  <div className="invoice-lines-row">
                    <input type="text" placeholder="Amazing Swan" className="product-search-input" />
                  </div>
                </div>
                <button type="button" className="btn-add-product">Add a product</button>
              </div>
            </form>
          </div>
        </Modal>
      );
    }

    // Vendor Bills Create Modal
    if (activeTab === 'Vendor Bills') {
      return (
        <Modal isOpen={showCreateModal || showEditModal} onClose={() => { setShowCreateModal(false); setShowEditModal(false); }} title={showEditModal ? "Vendor Bills Edit view" : "Vendor Bills Create/edit view"} maxWidth="900px">
          <div className="financial-modal-content">
            <div className="modal-action-buttons">
              <button type="button" className="btn-modal-confirm" onClick={showEditModal ? handleUpdateItem : handleCreateVendorBill}>
                {showEditModal ? 'Update' : 'Confirm'}
              </button>
              <button type="button" className="btn-modal-cancel" onClick={() => { setShowCreateModal(false); setShowEditModal(false); }}>
                Cancel
              </button>
            </div>

            <form className="financial-form">
              <div className="form-group">
                <label className="form-label">Bill Number</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="BILL-2023-001"
                  value={formData.billNumber || ''}
                  onChange={(e) => setFormData({ ...formData, billNumber: e.target.value })}
                />
              </div>

              <div className="form-row-2col">
                <div className="form-group">
                  <label className="form-label">Vendor</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Enter vendor name"
                    value={formData.vendor || ''}
                    onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Project</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Enter project name"
                    value={formData.project || ''}
                    onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row-2col">
                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input 
                    type="date" 
                    className="form-input"
                    value={formData.dueDate || ''}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select 
                    className="form-select"
                    value={formData.status || 'Draft'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="Draft">Draft</option>
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>
              </div>

              <div className="order-lines-section">
                <label className="form-label">Bill Items</label>
                <div className="order-lines-table">
                  <div className="order-lines-header">
                    <span>Product</span>
                    <span>Quantity</span>
                    <span>Unit</span>
                    <span>Unit Price</span>
                    <span>Tax %</span>
                    <span>Amount</span>
                  </div>
                  {lineItems.map((item) => (
                    <div key={item.id} className="order-lines-row">
                      <input 
                        type="text" 
                        placeholder="Product name"
                        value={item.product}
                        onChange={(e) => handleLineItemChange(item.id, 'product', e.target.value)}
                      />
                      <input 
                        type="number" 
                        placeholder="1"
                        value={item.quantity}
                        onChange={(e) => handleLineItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                      />
                      <select
                        value={item.unit}
                        onChange={(e) => handleLineItemChange(item.id, 'unit', e.target.value)}
                      >
                        <option>units</option>
                        <option>kg</option>
                        <option>litre</option>
                        <option>hours</option>
                      </select>
                      <input 
                        type="number" 
                        placeholder="0"
                        value={item.unitPrice}
                        onChange={(e) => handleLineItemChange(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                      />
                      <select
                        value={item.tax}
                        onChange={(e) => handleLineItemChange(item.id, 'tax', parseFloat(e.target.value))}
                      >
                        <option value={18}>18%</option>
                        <option value={12}>12%</option>
                        <option value={5}>5%</option>
                        <option value={0}>0%</option>
                      </select>
                      <input 
                        type="number" 
                        placeholder="0.00" 
                        value={item.amount.toFixed(2)} 
                        readOnly 
                      />
                    </div>
                  ))}
                </div>
                <button type="button" className="btn-add-product" onClick={handleAddLineItem}>
                  <PlusIcon style={{ width: 16, height: 16 }} />
                  Add a product
                </button>
              </div>

              <div className="order-totals">
                <div className="totals-row">
                  <span>Subtotal:</span>
                  <span>₹{calculateOrderTotals(lineItems).subtotal.toLocaleString()}</span>
                </div>
                <div className="totals-row">
                  <span>Tax:</span>
                  <span>₹{calculateOrderTotals(lineItems).tax.toLocaleString()}</span>
                </div>
                <div className="totals-row">
                  <span><strong>Total:</strong></span>
                  <span><strong>₹{calculateOrderTotals(lineItems).total.toLocaleString()}</strong></span>
                </div>
              </div>
            </form>
          </div>
        </Modal>
      );
    }

    return null;
  };

  return (
    <div className="financial-page">
      {/* Background Video */}
      <video autoPlay loop muted playsInline className="background-video">
        <source src="/image/back.mp4" type="video/mp4" />
      </video>

      {/* Top Navigation Bar */}
      <nav className="top-navbar">
        <div className="navbar-left">
          <div className="logo">
            <h1>OneFlow</h1>
          </div>
          
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
              className={`nav-link ${activeNav === 'Financial' ? 'active' : ''}`}
              onClick={() => { setActiveNav('Financial'); onNavigate?.('financial'); }}
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
          <button className="notification-btn">
            <BellIcon className="notification-icon" />
          </button>
          <div className="user-profile">
            <div 
              className="profile-avatar"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              style={{ cursor: 'pointer' }}
            >
              <div className="avatar-circle">VS</div>
            </div>
            <div className="profile-info">
              <span className="user-name">{userName}</span>
              <span className="user-role">{userRole === 'admin' ? 'Administrator' : userRole === 'project_manager' ? 'Project Manager' : 'Team Member'}</span>
            </div>
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)} 
              className="profile-dropdown-btn" 
              title="Profile Menu"
            >
              <EllipsisVerticalIcon className="dropdown-icon" />
            </button>
            
            {showProfileMenu && (
              <div className="profile-dropdown-menu">
                <button onClick={() => { setShowProfileMenu(false); }}>
                  <svg className="menu-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Profile Settings</span>
                </button>
                {onLogout && (
                  <button onClick={() => { onLogout(); setShowProfileMenu(false); }} className="logout-menu-item">
                    <ArrowRightOnRectangleIcon className="menu-icon" />
                    <span>Logout</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="financial-header-main">
        <div>
          <h1>Financial Management</h1>
          <p className="subtitle-fin">Manage orders, invoices, and expenses</p>
        </div>
      </div>

      <div className="financial-tabs">
        {(['Dashboard', 'Sales Order', 'Invoices', 'Purchase Order', 'Expenses', 'Vendor Bills', 'Requests'] as TabType[]).map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="financial-content">
        {activeTab === 'Dashboard' && renderDashboard()}
        {activeTab === 'Sales Order' && renderSalesOrders()}
        {activeTab === 'Purchase Order' && renderPurchaseOrders()}
        {activeTab === 'Invoices' && renderInvoices()}
        {activeTab === 'Expenses' && renderExpenses()}
        {activeTab === 'Vendor Bills' && renderVendorBills()}
        {activeTab === 'Requests' && renderRequests()}
      </div>

      {renderCreateModal()}

      {/* Document Request Modal */}
      <Modal 
        isOpen={showRequestModal} 
        onClose={() => setShowRequestModal(false)} 
        title="Request Document"
      >
        <div className="financial-modal-content">
          <form className="financial-form">
            <div className="form-group">
              <label>Document Type</label>
              <select
                value={requestFormData.documentType}
                onChange={(e) => setRequestFormData({ ...requestFormData, documentType: e.target.value as any })}
              >
                <option value="Invoice">Invoice</option>
                <option value="Purchase Order">Purchase Order</option>
                <option value="Receipt">Receipt</option>
              </select>
            </div>

            <div className="form-group">
              <label>Project</label>
              <input
                type="text"
                placeholder="Enter project name"
                value={requestFormData.project}
                onChange={(e) => setRequestFormData({ ...requestFormData, project: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Amount (₹)</label>
              <input
                type="number"
                placeholder="Enter amount"
                value={requestFormData.amount || ''}
                onChange={(e) => setRequestFormData({ ...requestFormData, amount: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                placeholder="Enter description..."
                rows={4}
                value={requestFormData.description}
                onChange={(e) => setRequestFormData({ ...requestFormData, description: e.target.value })}
              />
            </div>

            <div className="modal-actions">
              <button 
                type="button" 
                className="btn-modal-cancel" 
                onClick={() => setShowRequestModal(false)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn-modal-confirm" 
                onClick={handleCreateRequest}
              >
                Submit Request
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Import Excel Modal */}
      <Modal 
        isOpen={showImportModal} 
        onClose={() => setShowImportModal(false)} 
        title="Import from Excel"
      >
        <div className="financial-modal-content">
          <div className="import-instructions">
            <h3>Import Invoice/Billing Data</h3>
            <p>Upload an Excel file (.xlsx, .xls) containing your invoice or billing data.</p>
            <ul>
              <li>First row should contain column headers</li>
              <li>Supported columns: Invoice Number, Customer, Amount, Date, Status, etc.</li>
              <li>Maximum file size: 5MB</li>
            </ul>
          </div>
          
          <div className="file-upload-area">
            <DocumentArrowUpIcon style={{ width: 48, height: 48, color: '#6b7280' }} />
            <p>Drag and drop your Excel file here, or click to browse</p>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleImportExcel}
              style={{ marginTop: '10px' }}
            />
          </div>

          <div className="modal-actions">
            <button 
              type="button" 
              className="btn-modal-cancel" 
              onClick={() => setShowImportModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Confirm Delete">
        <div className="delete-confirm-content">
          <ExclamationCircleIcon className="warning-icon" />
          <h3>Are you sure?</h3>
          <p>
            This action cannot be undone. This will permanently delete the {activeTab.toLowerCase()}.
          </p>
          <div className="delete-confirm-actions">
            <button className="btn-cancel-delete" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </button>
            <button className="btn-delete" onClick={confirmDelete}>
              Delete
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      {showEditModal && renderCreateModal()}
    </div>
  );
};

export default Financial;
