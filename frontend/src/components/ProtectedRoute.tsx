import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'company_admin' | 'network_admin' | 'super_admin' | 'creator';
  fallbackPath?: string;
}

export default function ProtectedRoute({ 
  children, 
  requiredRole, 
  fallbackPath = '/' 
}: ProtectedRouteProps) {
  const { currentUser, userProfile, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to home page with auth_required parameter
  if (!currentUser || !userProfile) {
    return <Navigate to="/?auth_required=true" replace />;
  }

  // If role is required and user doesn't have it, redirect to home page with auth_required parameter
  if (requiredRole && userProfile.role !== requiredRole) {
    return <Navigate to="/?auth_required=true" replace />;
  }

  // User is authenticated and has required role (if specified)
  return <>{children}</>;
}
