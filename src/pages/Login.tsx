import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { 
  Lock, 
  ShieldAlert, 
  Loader2, 
  KeyRound, 
  MapPin,
  Mail,
  LockKeyhole,
  CheckCircle2
} from 'lucide-react';

export default function Login() {
  const { loginWithEmail, commitLogin, logout, loading } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loginTab, setLoginTab] = useState<'admin' | 'receptionist'>('receptionist');
  const [successLogin, setSuccessLogin] = useState(false);
  const [loggedUserName, setLoggedUserName] = useState('');
  const [loggedUserRole, setLoggedUserRole] = useState('');

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSubmitting(true);

    try {
      const { profile, isDemo } = await loginWithEmail(email, password);
      
      // Enforce Admin vs. Staff tab restrictions
      if (loginTab === 'admin' && profile.role !== 'admin') {
        await signOut(auth);
        sessionStorage.removeItem('hb_login_in_progress');
        throw new Error("Please login on staff login");
      }
      if (loginTab === 'receptionist' && profile.role === 'admin') {
        await signOut(auth);
        sessionStorage.removeItem('hb_login_in_progress');
        throw new Error("Please login on Admin Login");
      }

      setLoggedUserName(profile.name);
      setLoggedUserRole(profile.role);
      setSuccessLogin(true);
      setSubmitting(false);
      
      setTimeout(() => {
        commitLogin(profile, isDemo);
      }, 1600);
    } catch (err: any) {
      sessionStorage.removeItem('hb_login_in_progress');
      setLocalError(err.message || 'Invalid credentials or password. Please verify your registered email and password.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-amber-50/20 selection:text-white relative">
      {/* Success Loading Animation Overlay */}
      {successLogin && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center text-white transition-opacity duration-300">
          <div className="relative flex flex-col items-center justify-center p-8 bg-slate-900/60 rounded-3xl border border-slate-800 shadow-2xl max-w-sm w-full text-center">
            <div className="relative mb-6">
              <div className="absolute -inset-4 bg-emerald-500/20 rounded-full blur-xl animate-pulse"></div>
              <div className="w-20 h-20 rounded-full border-4 border-emerald-500/30 flex items-center justify-center relative">
                <div className="absolute inset-0 border-4 border-t-emerald-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              </div>
            </div>
            
            <h3 className="text-xl font-black uppercase tracking-wider text-emerald-400">Login Authorized</h3>
            <p className="text-xs text-slate-400 font-mono mt-1">Configuring secure clinical terminal...</p>
            
            <div className="h-px bg-slate-800 w-full my-4"></div>
            
            <p className="text-sm font-bold text-slate-100">Welcome back,</p>
            <p className="text-md font-extrabold text-amber-400 mt-0.5">{loggedUserName}</p>
            <span className="inline-block mt-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider">
              {loggedUserRole}
            </span>
          </div>
        </div>
      )}

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto h-20 w-20 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 shadow-xl shadow-slate-900/30 flex items-center justify-center border border-slate-800 p-2">
          <img src="/hima-logo.png" alt="Himabindhu Eye Clinic Logo" className="w-full h-full object-contain scale-[1.3] drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-black text-slate-900 font-serif tracking-tight">
          HIMABINDHU
        </h2>
        <p className="mt-1 text-center text-xs font-bold text-amber-600 tracking-widest uppercase">
          Eye Testing & Opticals
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl border border-slate-200 rounded-3xl space-y-6">
          <div>
            <h3 className="text-base font-black text-slate-800 text-center uppercase tracking-wider">Clinical Auth Console</h3>
            <p className="text-[10px] text-slate-450 mt-1 leading-normal tracking-wide text-center uppercase font-bold">
              Sign in with your authorized credentials
            </p>
          </div>

          <div className="flex bg-slate-100 p-1.5 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setLoginTab('receptionist');
                setLocalError(null);
              }}
              className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition ${
                loginTab === 'receptionist'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Staff Login
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginTab('admin');
                setLocalError(null);
              }}
              className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition ${
                loginTab === 'admin'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Admin Login
            </button>
          </div>

          {localError && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <span className="text-xs text-red-800 leading-relaxed font-semibold">{localError}</span>
            </div>
          )}

          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-slate-800 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative">
                <LockKeyhole className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-slate-800 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || loading}
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-950 text-white rounded-xl text-xs font-black uppercase tracking-widest transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer mt-2"
            >
              {submitting || loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                  Verifying...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-amber-500" />
                  Sign In to Desk
                </>
              )}
            </button>
          </form>


        </div>


      </div>
    </div>
  );
}
