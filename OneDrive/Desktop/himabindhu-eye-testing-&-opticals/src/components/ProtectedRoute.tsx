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
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-xl border border-red-100 shadow-sm">
        <div className="flex items-center gap-3 text-red-600 mb-4">
          <ShieldCheck className="w-8 h-8" />
          <h2 className="text-xl font-bold">Access Restricted (RBAC)</h2>
        </div>
        <p className="text-gray-650 leading-relaxed mb-4">
          Your account role is registered as <span className="font-semibold px-2 py-0.5 bg-gray-100 text-gray-800 rounded capitalize">{userProfile.role}</span>.
          This section of the clinic system is reserved for <span className="font-medium text-slate-800 capitalize">{allowedRoles.join(' or ')}</span>.
        </p>
        <p className="text-sm text-gray-400 mb-6">
          Contact your Clinic System Admin to modify authorization tags or upgrade access.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => window.location.hash = '#dashboard'}
            className="px-4 py-2 text-sm bg-amber-50/25 text-slate-700 rounded-lg hover:bg-amber-100 font-medium transition cursor-pointer"
          >
            Go to Welcome Desk
          </button>
          <button
            onClick={logout}
            className="px-4 py-2 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 font-medium transition cursor-pointer"
          >
            Logout staff session
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
