import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Spinner from '../common/Spinner';
import MainLayout from './MainLayout';

const ProtectedLayout = ({ children, requiredRole = null, showSidebar = true }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner fullscreen message="Loading..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <MainLayout showSidebar={showSidebar}>
      {children}
    </MainLayout>
  );
};

export default ProtectedLayout;
