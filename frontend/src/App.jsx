
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Storefront from './Storefront';
import ProductDetail from './ProductDetail';
import CustomerDashboard from './CustomerDashboard';
import AdminDashboard from './AdminDashboard';
import { LoginPage, RegisterPage, ForgotPasswordPage } from './AuthPages';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import PublicRoute from './components/PublicRoute';

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Storefront />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      
      {/* Auth routes - redirect if already authenticated */}
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/forgot" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
      
      {/* Protected routes */}
      <Route path="/dashboard" element={<ProtectedRoute><CustomerDashboard /></ProtectedRoute>} />
      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
    </Routes>
  );
}

export default App;
