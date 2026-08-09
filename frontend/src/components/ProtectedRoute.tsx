import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Layout } from './Layout';
import { Spinner } from './ui/Spinner';

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, checkAuth, isLoading, user } = useAuthStore();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const verify = async () => {
      await checkAuth();
      setAuthChecked(true);
    };
    verify();
  }, [checkAuth]);

  if (isLoading || !authChecked) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated() || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Layout />;
};
