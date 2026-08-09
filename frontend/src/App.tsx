import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toast } from './components/ui/Toast';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
// We'll lazy load or just import standard for now.
import CustomerListPage from './pages/customers/CustomerListPage';
import CustomerFormPage from './pages/customers/CustomerFormPage';
import CustomerDetailPage from './pages/customers/CustomerDetailPage';
import ProductListPage from './pages/products/ProductListPage';
import ProductFormPage from './pages/products/ProductFormPage';
import ProductDetailPage from './pages/products/ProductDetailPage';
import ChallanListPage from './pages/challans/ChallanListPage';
import ChallanFormPage from './pages/challans/ChallanFormPage';
import ChallanDetailPage from './pages/challans/ChallanDetailPage';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Toast />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/" element={<ProtectedRoute />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          
          <Route path="customers" element={<CustomerListPage />} />
          <Route path="customers/new" element={<CustomerFormPage />} />
          <Route path="customers/:id" element={<CustomerDetailPage />} />
          <Route path="customers/:id/edit" element={<CustomerFormPage />} />
          
          <Route path="products" element={<ProductListPage />} />
          <Route path="products/new" element={<ProductFormPage />} />
          <Route path="products/:id" element={<ProductDetailPage />} />
          <Route path="products/:id/edit" element={<ProductFormPage />} />
          
          <Route path="challans" element={<ChallanListPage />} />
          <Route path="challans/new" element={<ChallanFormPage />} />
          <Route path="challans/:id" element={<ChallanDetailPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
