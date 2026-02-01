import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Import all main pages – make sure these files exist under the pages directory
import Layout from './components/Layout';
import Login from './pages/Login';
import AdminPanel from './pages/AdminPanel';
import Customers from './pages/Customers';
import CustomerProfile from './pages/CustomerProfile';
import ClientCard from './pages/ClientCard'; // detailed order card
import Production from './pages/Production';
import InstallerApp from './pages/InstallerApp'; // installer mobile web app
import ActiveOrders from './pages/ActiveOrders';
import SupplierManagement from './pages/SupplierManagement';
import InstallationsManager from './pages/InstallationsManager';
import CalendarView from './pages/CalendarView';
import ProductManagement from './pages/ProductManagement';
import PendingMaterials from './pages/PendingMaterials';
import PurchasingTracking from './pages/PurchasingTracking';
import OrderApprovals from './pages/OrderApprovals';
import CompletedOrders from './pages/CompletedOrders';
import DeletedOrders from './pages/DeletedOrders';
import Repairs from './pages/Repairs';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';

// Simple auth guard – checks if a user is logged in
const ProtectedRoute = ({ children }) => {
  const user = localStorage.getItem('userInfo');
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Routes>
      {/* Login page – outside of the main layout */}
      <Route path="/login" element={<Login />} />

      {/* Installer app – outside of the regular side menu */}
      <Route path="/installer" element={
        <ProtectedRoute>
          <InstallerApp />
        </ProtectedRoute>
      } />

      {/* Backoffice / factory system – wrapped with the main layout and sidebar */}
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="orders" element={<ActiveOrders />} />

        <Route path="admin" element={<AdminPanel />} />
        <Route path="customers" element={<Customers />} />
        <Route path="customers/:name" element={<CustomerProfile />} />

        {/* Specific order page */}
        <Route path="orders/:id" element={<ClientCard />} />
        {/* Additional sections */}

        <Route path="production" element={<Production />} />
        <Route path="admin/suppliers" element={<SupplierManagement />} />
        <Route path="admin/products" element={<ProductManagement />} />
        <Route path="installations" element={<InstallationsManager />} />
        <Route path="calendar" element={<CalendarView />} />
        <Route path="procurement/pending" element={<PendingMaterials />} />
        <Route path="procurement/tracking" element={<PurchasingTracking />} />
        <Route path="repairs" element={<Repairs />} />
        <Route path="approvals" element={<OrderApprovals />} />
        <Route path="completed" element={<CompletedOrders />} />
        <Route path="deleted" element={<DeletedOrders />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default App;