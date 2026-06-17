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
      roles: ['admin', 'doctor'] as UserRole[] 
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
        <div className={`mx-auto flex items-center justify-between ${activeTab === 'prescription' ? 'max-w-none px-2' : 'max-w-7xl'}`}>
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
                className="lg:hidden p-2 rounded-xl bg-slate-900 hover:bg-slate-800 transition cursor-pointer border border-slate-800"
                id="btn-mobile-menu"
              >
                <Menu className="w-5 h-5 text-slate-350" />
              </button>
            )}
            <div className="flex items-center gap-2 sm:gap-3.5">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl blur opacity-30 animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-slate-900 to-slate-950 p-1.5 sm:p-2.5 rounded-xl text-teal-400 border border-slate-800 flex items-center justify-center shadow-lg">
                  <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-teal-350" />
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

          <div className="flex items-center gap-4">
            {/* Realtime Shift Tracker */}
            <div className="hidden md:flex items-center gap-2 bg-slate-900/60 text-slate-300 px-3.5 py-2 rounded-xl text-xs border border-slate-800/80 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-550"></span>
              </span>
              <Clock className="w-3.5 h-3.5 text-teal-400" />
              <span className="font-mono font-bold text-[10.5px] tracking-wide">Shift Ref: <span className="text-white">2026-06-13</span></span>
            </div>

            {/* User Clinical Profile Badge */}
            {userProfile && (
              <div className="flex items-center gap-3 bg-slate-900/40 p-1 pr-3 pl-1.5 rounded-2xl border border-slate-850/80 shadow-md">
                <div className="relative">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-500 text-slate-950 flex items-center justify-center font-extrabold text-xs shadow-inner">
                    {userProfile.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-slate-950 bg-emerald-500" />
                </div>
                <div className="text-left hidden sm:block">
                  <span className="text-xs font-bold block text-slate-100 leading-tight">{userProfile.name}</span>
                  <span className={`inline-flex items-center mt-0.5 border px-2 py-0.5 rounded-full text-[8.5px] font-extrabold uppercase tracking-wider ${
                    userProfile.role === 'admin' 
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                      : 'bg-teal-500/10 text-teal-400 border-teal-500/20'
                  }`}>
                    {userProfile.role}
                  </span>
                </div>
              </div>
            )}

            {/* Logout Staff Button */}
            <button 
              onClick={logout} 
              title="Logout Clinic Terminal Session"
              className="p-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-slate-900 transition-all duration-200 cursor-pointer border border-transparent hover:border-slate-800 shadow-sm"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Clinical Console */}
      <div className="flex flex-1 w-full relative max-w-none px-2 md:px-4">
        {/* Sidebar Panel for Desktop */}
        {activeTab !== 'prescription' && (
          <aside className="hidden lg:flex flex-col w-64 bg-slate-900 border-r border-slate-800 p-5 shrink-0 text-white">
            {/* Active Banner */}
            <div className="mb-6 p-3.5 bg-slate-800/50 rounded-xl border border-slate-800 flex items-center gap-2.5">
              <Building2 className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-xs font-extrabold text-white leading-none">Diagnostic Desk</p>
                <p className="text-[10px] text-slate-400 font-medium mt-1">Main Branch - Dharmavaram</p>
              </div>
          </div>

          <nav className="space-y-1.5">
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
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition duration-150 ${
                    isActive 
                      ? 'bg-amber-600 text-white shadow-lg shadow-slate-900/20' 
                      : isAllowed 
                        ? 'text-slate-300 hover:bg-white/10 hover:text-white cursor-pointer' 
                        : 'opacity-25 text-slate-550 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : isAllowed ? 'text-blue-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {!isAllowed && (
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto pt-4 border-t border-slate-850">
            <div className="flex items-center gap-2 px-3.5 py-2 text-[10px] text-slate-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-bold uppercase tracking-wider text-[9px]">Console Secure</span>
            </div>
          </div>
        </aside>
      )}

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 bg-black z-45 lg:hidden"
              />
              <motion.aside 
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'tween', duration: 0.2 }}
                className="fixed inset-y-0 left-0 w-64 bg-white z-50 p-4 shadow-xl flex flex-col lg:hidden"
              >
                <div className="flex items-center justify-between mb-6 border-b pb-3 border-gray-100">
                  <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-slate-900" />
                    <span className="font-bold text-slate-900 text-sm">HIMABINDHU OPTICAL</span>
                  </div>
                  <button 
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 rounded-lg hover:bg-gray-100 cursor-pointer"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                <nav className="space-y-1.5 flex-1">
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
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                          isActive 
                            ? 'bg-amber-700 text-white shadow-sm' 
                            : isAllowed 
                              ? 'text-gray-650 hover:bg-gray-150 cursor-pointer' 
                              : 'opacity-40 cursor-not-allowed text-gray-400'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className={`w-4.5 h-4.5 ${isActive ? 'text-white' : 'text-slate-800'}`} />
                          <span>{item.label}</span>
                        </div>
                        {!isAllowed && <ShieldCheck className="w-3.5 h-3.5 text-gray-400" />}
                      </button>
                    );
                  })}
                </nav>
                
                <div className="p-3 bg-gray-50 rounded-lg text-[10px] text-gray-450 mt-auto">
                  <p className="font-semibold text-gray-750">Clinic Dharmavaram Admin Panel</p>
                  <p>Operate responsibly under standards of refraction optometry.</p>
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
