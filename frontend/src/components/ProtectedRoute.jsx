import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RefreshCw } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRoles = ['admin'] }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-4">
        <RefreshCw className="w-8 h-8 text-[#4F46E5] animate-spin mb-3" />
        <p className="text-xs font-extrabold text-[#64748B] uppercase tracking-widest">
          Verifying Portal Security Credentials...
        </p>
      </div>
    );
  }

  if (!user || !allowedRoles.includes(user.role)) {
    // Redirect non-admin users or guests to Customer Portal
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return children;
}
