import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ProtectedRoute from './ProtectedRoute';

export default function AdminRoute({ children }) {
  const { isAdmin, isLoading } = useAuth();

  // First check if user is authenticated (ProtectedRoute handles redirect)
  return (
    <ProtectedRoute>
      {isLoading ? (
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-gray-600">Loading...</div>
        </div>
      ) : isAdmin ? (
        children
      ) : (
        <Navigate to="/dashboard" replace />
      )}
    </ProtectedRoute>
  );
}
