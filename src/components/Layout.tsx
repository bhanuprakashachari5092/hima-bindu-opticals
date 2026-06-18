import React, { useState } from 'react';
import { useAuth, UserRole } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  UserPlus, 
  FileSpreadsheet, 
  History, 
  Settings, 
  LogOut, 
  Eye, 
  Menu, 
  X, 
  Clock, 
  ShieldCheck,
  Building2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LayoutProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: React.ReactNode;
}

export default function Layout({ activeTab, setActiveTab, children }: LayoutProps) {
  const { userProfile, logout, isDemoMode } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = currentTime.getHours();
  const minutes = currentTime.getMinutes();
  const seconds = currentTime.getSeconds();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const pad = (n: number) => n.toString().padStart(2, '0');

  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'Welcome Desk', 
      icon: LayoutDashboard, 
      roles: ['admin', 'doctor', 'receptionist'] as UserRole[]
    },
    { 
      id: 'prescription', 
      label: 'Rx Prescription Desk', 
      icon: FileSpreadsheet, 
      roles: ['doctor'] as UserRole[] 
    },
    { 
      id: 'history', 
      label: 'Diagnostics Records', 
      icon: History, 
      roles: ['admin', 'doctor', 'receptionist', 'patient'] as UserRole[] 
    },
    { 
      id: 'admin', 
      label: 'Admin Settings', 
      icon: Settings, 
      roles: ['admin'] as UserRole[] 
    }
  ];

  const currentRole = userProfile?.role || 'receptionist';

  const handleNav = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans" id="app-layout">
      {/* Top Premium Glassmorphic Clinical Header */}
      <header className="bg-slate-950/95 text-white shadow-[0_4px_30px_rgba(0,0,0,0.4)] border-b border-slate-800/70 px-2.5 py-3 sm:px-4 sm:py-3.5 sticky top-0 z-40 backdrop-blur-xl">
        <div className={`mx-auto flex items-center justify-between relative ${activeTab === 'prescription' ? 'max-w-none px-2' : 'max-w-7xl'}`}>
          <div className="flex items-center gap-4">
            {activeTab === 'prescription' ? (
              <button 
                onClick={() => setActiveTab('dashboard')}
                className="px-4 py-2 bg-gradient-to-r from-slate-900 to-slate-850 hover:from-slate-850 hover:to-slate-800 text-teal-400 font-extrabold rounded-xl text-xs flex items-center gap-2 border border-slate-700/60 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-teal-500/5 hover:scale-[1.02]"
              >
                <span className="text-sm">←</span> Back to Dashboard
              </button>
            ) : (
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 transition cursor-pointer border border-slate-800 flex items-center gap-2"
                id="btn-mobile-menu"
              >
                <Menu className="w-5 h-5 text-teal-400" />
                <span className="text-xs font-black text-slate-300 uppercase tracking-widest hidden sm:block">Menu</span>
              </button>
            )}
            <div className="flex items-center gap-2 sm:gap-3.5">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl blur opacity-30 animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-slate-900 to-slate-950 p-1 sm:p-1.5 rounded-xl border border-slate-800 flex items-center justify-center shadow-lg group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-teal-600/20 to-emerald-400/20 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none rounded-xl"></div>
                  <img src="/hima-logo.png" alt="Himabindhu Logo" className="w-7 h-7 sm:w-8 sm:h-8 object-contain scale-[1.25] relative z-20 drop-shadow-md" />
                </div>
              </div>
              <div>
                <span className="font-extrabold tracking-[0.12em] text-xs sm:text-sm md:text-base block text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-teal-200 uppercase cursor-default">
                  HIMABINDHU EYE CLINIC
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  <span className="text-[9px] text-slate-400 block font-mono font-bold tracking-wider uppercase">
                    Opticals & Refraction Suite <span className="text-teal-450 font-extrabold">v2026.1</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Realtime Luxury Digital Clock - Centered exactly */}
          <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center justify-center pointer-events-none z-10">
            <div className="bg-gradient-to-b from-slate-900 to-black border border-slate-700/80 px-4 py-1.5 rounded-lg shadow-[inset_0_1px_3px_rgba(255,255,255,0.05),0_4px_15px_rgba(245,158,11,0.15)] relative overflow-hidden ring-1 ring-amber-500/30 group pointer-events-auto cursor-default">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              
              <div className="relative flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-500/90 drop-shadow-[0_0_3px_rgba(245,158,11,0.8)]" />
                <div className="flex items-end">
                  <span className="text-amber-400 font-mono font-black text-xl leading-none drop-shadow-[0_0_10px_rgba(245,158,11,0.6)] tracking-widest">
                    {pad(displayHours)}:{pad(minutes)}
                  </span>
                  <span className="text-amber-600/90 font-mono font-extrabold text-[14px] leading-none ml-0.5 pb-[1.5px] mix-blend-lighten drop-shadow-[0_0_5px_rgba(245,158,11,0.4)]">
                    {pad(seconds)}
                  </span>
                  <span className="text-[9px] font-black text-amber-300 uppercase tracking-widest ml-2.5 leading-none pb-[4px] bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                    {ampm}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            {/* Classic Luxury Profile Badge */}
            {userProfile && (
              <div className="flex items-center gap-3 bg-gradient-to-b from-slate-800 to-slate-900 p-1 pr-4 pl-1.5 rounded-full border border-slate-700/60 shadow-[0_2px_10px_rgba(0,0,0,0.3)]">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 text-amber-950 flex items-center justify-center font-black text-sm shadow-[inset_0_1px_2px_rgba(255,255,255,0.6)] ring-2 ring-slate-800">
                    {userProfile.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-slate-800 bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
                </div>
                <div className="text-left hidden sm:flex flex-col justify-center">
                  <span className="text-[13px] font-extrabold text-slate-100 tracking-wide leading-tight">{userProfile.name}</span>
                  <span className={`inline-flex items-center mt-0.5 border px-2 py-[1px] rounded bg-slate-950/50 text-[9px] font-black uppercase tracking-widest shadow-inner w-fit ${
                    userProfile.role === 'admin' 
                      ? 'text-amber-400 border-amber-500/30' 
                      : 'text-teal-400 border-teal-500/30'
                  }`}>
                    {userProfile.role}
                  </span>
                </div>
              </div>
            )}

            {/* Classic Animated Logout Button */}
            <button 
              onClick={logout} 
              title="Logout Clinic Terminal Session"
              className="flex items-center gap-2 p-2.5 md:px-4 md:py-2 bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700/60 rounded-full text-slate-300 hover:text-white hover:from-rose-600 hover:to-rose-800 hover:border-rose-500 transition-all duration-300 shadow-[0_2px_10px_rgba(0,0,0,0.2)] hover:shadow-[0_0_15px_rgba(225,29,72,0.4)] group cursor-pointer"
            >
              <LogOut className="w-4 h-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              <span className="hidden md:block text-xs font-black uppercase tracking-widest">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Clinical Console */}
      <div className="flex flex-1 w-full relative max-w-none px-2 md:px-4">
        {/* Universal Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 bg-black z-45"
              />
              <motion.aside 
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'tween', duration: 0.25, ease: "easeOut" }}
                className="fixed inset-y-0 left-0 w-72 bg-slate-900 border-r border-slate-800 z-50 shadow-2xl flex flex-col"
              >
                <div className="flex items-center justify-between mb-4 border-b border-slate-800 p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg border border-slate-700 shadow-inner">
                      <Eye className="w-5 h-5 text-teal-400" />
                    </div>
                    <span className="font-extrabold text-white tracking-widest uppercase text-sm">MENU</span>
                  </div>
                  <button 
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer border border-transparent hover:border-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="px-4 mb-6">
                  {/* Active Banner from old sidebar */}
                  <div className="p-3.5 bg-slate-800/50 rounded-xl border border-slate-700/50 flex items-center gap-3 shadow-inner">
                    <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                      <Building2 className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-white uppercase tracking-wider">Diagnostic Desk</p>
                      <p className="text-[10px] text-teal-400 font-bold mt-1 tracking-widest font-mono">MAIN BRANCH - DHARMAVARAM</p>
                    </div>
                  </div>
                </div>

                <nav className="space-y-1.5 flex-1 px-3">
                  {menuItems
                    .filter(item => item.roles.includes(currentRole))
                    .map((item) => {
                      const isAllowed = item.roles.includes(currentRole);
                      const isActive = activeTab === item.id;
                    
                      return (
                        <button
                          key={item.id}
                          onClick={() => isAllowed && handleNav(item.id)}
                          disabled={!isAllowed}
                          className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-xs font-bold tracking-widest uppercase transition-all duration-200 ${
                            isActive 
                              ? 'bg-amber-600 text-white shadow-[0_0_15px_rgba(217,119,6,0.3)]' 
                              : isAllowed 
                                ? 'text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer' 
                                : 'opacity-25 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <item.icon className={`w-4.5 h-4.5 ${isActive ? 'text-white' : isAllowed ? 'text-teal-400' : 'text-slate-400'}`} />
                            <span>{item.label}</span>
                          </div>
                          {!isAllowed && <ShieldCheck className="w-4 h-4 text-slate-500" />}
                        </button>
                      );
                  })}
                </nav>
                
                <div className="mt-auto p-4 border-t border-slate-800">
                  <div className="flex items-center gap-2 px-3.5 py-2 text-[10px] text-slate-400 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="font-bold uppercase tracking-wider text-[9px]">Console Secure</span>
                  </div>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Console Workspace Area */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden min-h-[calc(100vh-68px)] flex flex-col justify-between">
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
          <footer className="mt-6 md:mt-12 pt-4 md:pt-5 border-t border-slate-200/80 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs font-semibold text-slate-400 font-sans">
            <p>© 2026 Himabindhu Eye Clinic. All rights reserved.</p>
            <div className="flex flex-wrap items-center justify-center gap-1.5 md:gap-2 text-[10.5px] text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-150">
              <span>Developed by</span>
              <span className="font-extrabold text-slate-800 uppercase tracking-wider">Shaivika Groups</span>
              <span className="text-slate-300">•</span>
              <a href="tel:8985541157" className="hover:text-teal-600 transition-colors font-mono font-bold">8985541157</a>
              <span className="text-slate-300">•</span>
              <a href="mailto:shaivikagroups@gmail.com" className="hover:text-teal-600 transition-colors">shaivikagroups@gmail.com</a>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
