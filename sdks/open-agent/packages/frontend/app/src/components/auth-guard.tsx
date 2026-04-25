import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { useAuthStore } from '../store/auth';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { user, isLoading, refreshSession } = useAuthStore();
  const location = useLocation();

  // Check authentication status on mount
  useEffect(() => {
    refreshSession().catch(() => {});
  }, [refreshSession]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center space-x-3">
          <svg
            className="animate-spin h-8 w-8 text-indigo-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className="text-lg text-gray-700">Loading...</span>
        </div>
      </div>
    );
  }
  if (isLoading) {
    return null;
  }

  // Redirect to sign-in if not authenticated
  if (!user) {
    const redirectUrl = location.pathname + location.search;
    return (
      <Navigate
        to={`/sign-in?redirect=${encodeURIComponent(redirectUrl)}`}
        replace
      />
    );
  }

  // Render children if authenticated
  return children;
};
