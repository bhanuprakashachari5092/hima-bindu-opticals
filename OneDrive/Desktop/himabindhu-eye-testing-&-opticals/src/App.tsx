import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import PrescriptionEntry from './pages/PrescriptionEntry';
import PatientHistory from './pages/PatientHistory';
import AdminSettings from './pages/AdminSettings';
import { Prescription } from './components/PrescriptionPDF';
import { Loader2, Eye, ArrowLeft } from 'lucide-react';

function TerminalConsole() {
  const { userProfile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showLoginGate, setShowLoginGate] = useState(false);
  
  // Inter-module prefill workflow states
  const [prefilledPatient, setPrefilledPatient] = useState<any>(null);
  const [selectedRxFromOutside, setSelectedRxFromOutside] = useState<Prescription | null>(null);

  React.useEffect(() => {
    if (userProfile?.role === 'patient' && activeTab !== 'history') {
      setActiveTab('history');
    }
  }, [userProfile, activeTab]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans">
        <div className="text-center p-6 bg-white rounded-2xl border border-gray-150 shadow-sm flex flex-col items-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-900 mb-3" />
          <h3 className="text-gray-900 font-bold text-sm">Synchronizing Clinic Terminal...</h3>
          <p className="text-[11px] text-gray-400 mt-1">Authenticating encrypted cloud channels</p>
        </div>
      </div>
    );
  }

  // If no active profile is logged in, show landing page or login gate
  if (!userProfile) {
    if (showLoginGate) {
      return (
        <div className="relative">
          <button 
            onClick={() => setShowLoginGate(false)}
            className="fixed top-4 left-4 z-50 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer shadow-sm border border-slate-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
          <Login />
        </div>
      );
    }
    return <Home onNavigateToLogin={() => setShowLoginGate(true)} />;
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'dashboard' && (
        <Dashboard 
          setActiveTab={setActiveTab} 
          setSelectedPrescriptionForView={setSelectedRxFromOutside} 
        />
      )}



      {activeTab === 'prescription' && (
        <ProtectedRoute allowedRoles={['admin', 'doctor']}>
          <PrescriptionEntry 
            prefilledPatient={prefilledPatient} 
            clearPrefilledPatient={() => setPrefilledPatient(null)} 
          />
        </ProtectedRoute>
      )}

      {activeTab === 'history' && (
        <PatientHistory 
          selectedRxFromOutside={selectedRxFromOutside} 
          clearOutsideSelection={() => setSelectedRxFromOutside(null)} 
        />
      )}

      {activeTab === 'admin' && (
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminSettings />
        </ProtectedRoute>
      )}
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <TerminalConsole />
    </AuthProvider>
  );
}
