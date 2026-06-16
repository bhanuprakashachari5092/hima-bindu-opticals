import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type UserRole = 'admin' | 'doctor' | 'receptionist' | 'patient';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: any;
}

interface AuthContextType {
  user: any | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isDemoMode: boolean;
  setDemoProfile: (role: UserRole, name: string) => void;
  clearDemo: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(() => localStorage.getItem('hb_demo_mode') === 'true');

  // Handle local session recovery
  useEffect(() => {
    const stored = localStorage.getItem('hb_demo_profile');
    if (stored) {
      const parsed = JSON.parse(stored);
      setUserProfile(parsed);
      setUser({
        uid: parsed.uid,
        displayName: parsed.name,
        email: parsed.email,
        emailVerified: true
      });
    }
    setLoading(false);
  }, []);

  // Session logging to track receptionist logins locally
  useEffect(() => {
    if (userProfile) {
      const sessionKey = `hb_session_logged_${userProfile.uid}`;
      if (!sessionStorage.getItem(sessionKey)) {
        sessionStorage.setItem(sessionKey, 'true');
        
        const logSession = async () => {
          try {
            let ip = '127.0.0.1';
            let locationStr = 'Dharmavaram, Andhra Pradesh, IN';
            let device = navigator.userAgent;

            if (device.includes("Mobi")) {
              device = "Mobile (" + (device.includes("Android") ? "Android" : "iOS") + ")";
            } else {
              device = "Desktop (" + (device.includes("Windows") ? "Windows" : device.includes("Mac") ? "macOS" : "Linux") + ")";
            }

            try {
              const res = await fetch("https://ipapi.co/json/");
              if (res.ok) {
                const ipData = await res.json();
                ip = ipData.ip || ip;
                const city = ipData.city || '';
                const region = ipData.region || '';
                const postal = ipData.postal || '';
                const lat = ipData.latitude || '';
                const lon = ipData.longitude || '';
                const org = ipData.org || '';
                locationStr = `${city}, ${region} ${postal} (Lat: ${lat}, Lon: ${lon}) [ISP: ${org}]`;
              }
            } catch (fetchErr) {
              console.warn("Location query offline, using local fallback", fetchErr);
            }

            const logEntry = {
              uid: userProfile.uid,
              name: userProfile.name,
              email: userProfile.email,
              role: userProfile.role,
              loginTime: new Date().toISOString(),
              ip,
              location: locationStr,
              device
            };

            const storedLogs = localStorage.getItem('hb_demo_login_logs') || '[]';
            const parsedLogs = JSON.parse(storedLogs);
            parsedLogs.unshift(logEntry);
            localStorage.setItem('hb_demo_login_logs', JSON.stringify(parsedLogs.slice(0, 50)));
          } catch (err) {
            console.error("Failed storing session audit log", err);
          }
        };

        logSession();
      }
    }
  }, [userProfile]);

  const loginWithGoogle = async () => {
    // Deprecated / Offline bypass
    setError("Google Sign-In is deactivated. Please sign in via secure local clinical terminals.");
  };

  const logout = async () => {
    setLoading(true);
    clearDemo();
    setLoading(false);
  };

  const setDemoProfile = (role: UserRole, name: string) => {
    const demoProfile: UserProfile = {
      uid: `demo-uid-${role}`,
      name: name,
      email: `${name.toLowerCase().replace(/\s+/g, '')}@himabindhueye.com`,
      role: role,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem('hb_demo_mode', 'true');
    localStorage.setItem('hb_demo_profile', JSON.stringify(demoProfile));
    setIsDemoMode(true);
    setUserProfile(demoProfile);
    setUser({
      uid: demoProfile.uid,
      displayName: demoProfile.name,
      email: demoProfile.email,
      emailVerified: true,
    });
  };

  const clearDemo = () => {
    localStorage.removeItem('hb_demo_mode');
    localStorage.removeItem('hb_demo_profile');
    setIsDemoMode(false);
    setUser(null);
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      userProfile, 
      loading, 
      error, 
      loginWithGoogle, 
      logout,
      isDemoMode,
      setDemoProfile,
      clearDemo
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
