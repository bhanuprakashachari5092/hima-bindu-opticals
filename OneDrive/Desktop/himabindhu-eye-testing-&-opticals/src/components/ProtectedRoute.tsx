import React from 'react';
import { useAuth, UserRole } from '../context/AuthContext';
import { ShieldCheck, Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { userProfile, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-6 bg-white rounded-xl shadow-xs border border-gray-100 flex flex-col items-center">
          <Loader2 className="w-10 h-10 animate-spin text-amber-600 mb-4" />
          <p className="text-gray-600 font-medium">Verifying clinic credentials...</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    // If not logged in, return a friendly placeholder of Login.
    // In our main router, we will render the Login screen if userProfile is null.
    // This allows single-view navigation or easy React state-based tab routing.
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-8">
        <ShieldCheck className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Restrained</h2>
        <p className="text-gray-600 mb-6 max-w-md">
          You must be signed in to access the clinic terminal.
        </p>
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(userProfile.role)) {
    // RBAC disabled per user request: "edi display avvakudadu mawa"
    // Allow all users to access admin sections.
  }

  return <>{children}</>;
}
