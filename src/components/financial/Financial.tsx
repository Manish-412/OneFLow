import React from 'react';
import { Routes, Route } from 'react-router-dom';
import FinancialMenu from './FinancialMenu';
import SalesOrder from './SalesOrder';
import PurchaseOrder from './PurchaseOrder';
import Invoice from './Invoice';
import VendorBills from './VendorBills';
import Expenses from './Expenses';

interface FinancialProps {
  projectId: number;
  onBack: () => void;
  userName?: string;
}

const Financial: React.FC<FinancialProps> = ({ projectId, onBack, userName }) => {
  return (
    <div className="financial-container p-6 h-screen overflow-y-auto">
      <Routes>
        <Route index element={<FinancialMenu />} />
        <Route path="sales-order" element={<SalesOrder projectId={projectId} onBack={onBack} />} />
        <Route path="purchase-order" element={<PurchaseOrder projectId={projectId} onBack={onBack} />} />
        <Route path="invoices" element={<Invoice projectId={projectId} onBack={onBack} />} />
        <Route path="vendor-bills" element={<VendorBills projectId={projectId} onBack={onBack} />} />
        <Route path="expenses" element={<Expenses projectId={projectId} onBack={onBack} />} />
      </Routes>
    </div>
  );
};

export default Financial;