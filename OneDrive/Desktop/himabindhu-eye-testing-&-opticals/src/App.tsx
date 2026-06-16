import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import FrameCollection from './pages/FrameCollection';
import PrescriptionEntry from './pages/PrescriptionEntry';
import PatientHistory from './pages/PatientHistory';
import AdminSettings from './pages/AdminSettings';
import { Prescription } from './components/PrescriptionPDF';
import { Loader2, Eye, ArrowLeft, Download, X } from 'lucide-react';

function TerminalConsole() {
  const { userProfile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showLoginGate, setShowLoginGate] = useState(false);
  const [selectedFrameType, setSelectedFrameType] = useState<string | null>(null);
  
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
    if (selectedFrameType) {
      return (
        <FrameCollection 
          frameTypeId={selectedFrameType} 
          onBack={() => {
            setSelectedFrameType(null);
            setTimeout(() => {
              const el = document.getElementById('designer-frames');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }, 100);
          }} 
        />
      );
    }
    return <Home onNavigateToLogin={() => setShowLoginGate(true)} onSelectFrameType={(id: string) => setSelectedFrameType(id)} />;
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
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    // Register Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => console.log('SW Registered', reg))
        .catch((err) => console.error('SW Registration failed', err));
    }

    // Handle install prompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
      setShowInstallBanner(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to install prompt: ${outcome}`);
    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

  return (
    <AuthProvider>
      <TerminalConsole />
      {showInstallBanner && (
        <div className="fixed bottom-6 right-6 z-[9999] max-w-sm bg-white/95 backdrop-blur-md border border-slate-100 rounded-2xl shadow-xl p-4 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Install Desktop App</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Access Himabindhu Opticals console quickly from your desktop.</p>
              </div>
            </div>
            <button 
              onClick={() => setShowInstallBanner(false)}
              className="text-slate-400 hover:text-slate-600 transition p-1 hover:bg-slate-50 rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-2 justify-end">
            <button 
              onClick={() => setShowInstallBanner(false)}
              className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 transition cursor-pointer"
            >
              Later
            </button>
            <button 
              onClick={handleInstallClick}
              className="px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5 shadow-sm shadow-blue-900/10"
            >
              Install Now
            </button>
          </div>
        </div>
      )}
    </AuthProvider>
  );
}

