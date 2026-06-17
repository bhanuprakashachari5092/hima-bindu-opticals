import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  signInWithEmailAndPassword, 
  signInAnonymously, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  deleteUser
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';

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
  loginWithEmail: (email: string, pass: string) => Promise<{ profile: UserProfile; isDemo: boolean }>;
  commitLogin: (profile: UserProfile, isDemo: boolean) => void;
  logout: () => Promise<void>;
  isDemoMode: boolean;
  setDemoProfile: (role: UserRole, name: string) => void;
  clearDemo: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(() => localStorage.getItem('hb_demo_mode') === 'true');

  // Handle local session recovery & Firebase Auth state changes
  useEffect(() => {
    setLoading(true);
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // If a login process is explicitly active, let the Login panel handle committing the profile and state.
      if (sessionStorage.getItem('hb_login_in_progress') === 'true') {
        setLoading(false);
        return;
      }

      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const profileDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (profileDoc.exists()) {
            const data = profileDoc.data() as UserProfile;
            setUserProfile(data);
            setIsDemoMode(false);
            localStorage.setItem('hb_demo_mode', 'false');
            localStorage.setItem('hb_demo_profile', JSON.stringify(data));
          } else {
            const cachedProfile = localStorage.getItem('hb_demo_profile');
            if (cachedProfile) {
              setUserProfile(JSON.parse(cachedProfile));
            }
          }
        } catch (err) {
          console.error("Error fetching user profile from Firestore:", err);
          const cachedProfile = localStorage.getItem('hb_demo_profile');
          if (cachedProfile) {
            setUserProfile(JSON.parse(cachedProfile));
          }
        }
      } else {
        const demoMode = localStorage.getItem('hb_demo_mode') === 'true';
        if (demoMode) {
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
          setIsDemoMode(true);
        } else {
          setUser(null);
          setUserProfile(null);
          setIsDemoMode(false);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Session logging to track receptionist logins
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

            if (isDemoMode) {
              const storedLogs = localStorage.getItem('hb_demo_login_logs') || '[]';
              const parsedLogs = JSON.parse(storedLogs);
              parsedLogs.unshift(logEntry);
              localStorage.setItem('hb_demo_login_logs', JSON.stringify(parsedLogs.slice(0, 50)));
            } else {
              const logId = `${userProfile.uid}_${Date.now()}`;
              await setDoc(doc(db, 'login_logs', logId), {
                ...logEntry,
                createdAt: serverTimestamp()
              }).catch(err => {
                console.error("Firestore logging failed:", err);
              });
            }
          } catch (err) {
            console.error("Failed storing session audit log", err);
          }
        };

        logSession();
      }
    }
  }, [userProfile, isDemoMode]);

  const loginWithGoogle = async () => {
    setError("Google Sign-In is deactivated. Please sign in via secure local clinical terminals.");
  };

  const loginWithEmail = async (email: string, pass: string): Promise<{ profile: UserProfile; isDemo: boolean }> => {
    setError(null);
    const emailClean = email.trim().toLowerCase();
    const passClean = pass.trim();

    // Set temporary lock to prevent onAuthStateChanged from unmounting state during claiming flow
    sessionStorage.setItem('hb_login_in_progress', 'true');

    try {
      // 1. Try Firebase Authentication Sign-In
      let firebaseUser = null;
      try {
        const userCredential = await signInWithEmailAndPassword(auth, emailClean, passClean);
        firebaseUser = userCredential.user;
      } catch (authErr: any) {
        console.log("Firebase Auth sign-in failed:", authErr.code);
        // If the error is not user-not-found or invalid-credential, throw immediately
        if (
          authErr.code !== 'auth/user-not-found' &&
          authErr.code !== 'auth/invalid-credential' &&
          authErr.code !== 'auth/invalid-email'
        ) {
          sessionStorage.removeItem('hb_login_in_progress');
          throw authErr;
        }
      }

      // 2. If signed in successfully, fetch and return the profile
      if (firebaseUser) {
        const profileDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (profileDoc.exists()) {
          const profile = profileDoc.data() as UserProfile;
          return { profile, isDemo: false };
        } else {
          // Profile doc doesn't exist under UID, try to find a pre-provisioned doc by email and claim it
          console.log("Profile doc not found under UID, searching users by email...");
          const usersRef = collection(db, 'users');
          const qSnap = await getDocs(usersRef);
          const list = qSnap.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
          const found = list.find((u: any) => u.email.toLowerCase() === emailClean);
          
          if (found) {
            const profile: UserProfile = {
              uid: firebaseUser.uid,
              name: found.name,
              email: emailClean,
              role: found.role,
              createdAt: found.createdAt || new Date().toISOString()
            };
            await setDoc(doc(db, 'users', firebaseUser.uid), profile);
            return { profile, isDemo: false };
          } else {
            // Root admin bootstrap
            if (emailClean === "kh2kgaming@gmail.com") {
              const profile: UserProfile = {
                uid: firebaseUser.uid,
                name: "Himabindhu (Admin)",
                email: emailClean,
                role: "admin",
                createdAt: new Date().toISOString()
              };
              await setDoc(doc(db, 'users', firebaseUser.uid), profile);
              return { profile, isDemo: false };
            }
          }
        }
      }

      // 3. First-time registration claim flow:
      // Create their Auth account temporarily to query pre-provisioning list.
      let newCred = null;
      try {
        newCred = await createUserWithEmailAndPassword(auth, emailClean, passClean);
      } catch (createErr: any) {
        console.log("Firebase Auth creation failed:", createErr.code);
        // User already exists in Auth, but since step 1 failed, their password must be wrong!
      }

      if (newCred) {
        const newUid = newCred.user.uid;
        let preProvisionedUser = null;
        try {
          const usersRef = collection(db, 'users');
          const qSnap = await getDocs(usersRef);
          const list = qSnap.docs.map(doc => doc.data() as any);
          preProvisionedUser = list.find((u: any) => u.email.toLowerCase() === emailClean);
        } catch (dbErr) {
          console.warn("Error checking pre-provisioning list:", dbErr);
        }

        if (preProvisionedUser) {
          const profile: UserProfile = {
            uid: newUid,
            name: preProvisionedUser.name,
            email: emailClean,
            role: preProvisionedUser.role,
            createdAt: new Date().toISOString()
          };
          await setDoc(doc(db, 'users', newUid), profile);
          return { profile, isDemo: false };
        } else {
          // Root admin bootstrap
          if (emailClean === "kh2kgaming@gmail.com") {
            const profile: UserProfile = {
              uid: newUid,
              name: "Himabindhu (Admin)",
              email: emailClean,
              role: "admin",
              createdAt: new Date().toISOString()
            };
            await setDoc(doc(db, 'users', newUid), profile);
            return { profile, isDemo: false };
          }

          // Unauthorized: delete newly created Auth user
          console.log("User is not pre-provisioned. Rolling back Auth account...");
          await deleteUser(newCred.user).catch(err => console.error("Error deleting unauthorized user:", err));
          await signOut(auth);
        }
      }

      // 4. Fallback to localStorage / demo mode
      let matchedLocal = null;
      const stored = localStorage.getItem('hb_demo_users');
      if (stored) {
        try {
          const list = JSON.parse(stored);
          matchedLocal = list.find((u: any) => 
            u.email.toLowerCase() === emailClean && 
            u.password === passClean
          );
        } catch (err) {
          console.error("Failed to parse local user registry:", err);
        }
      }

      if (matchedLocal) {
        const role = matchedLocal.role as UserRole;
        const name = matchedLocal.name;
        const profile: UserProfile = {
          uid: `demo-uid-${role}`,
          name: name,
          email: emailClean,
          role: role,
          createdAt: new Date().toISOString()
        };
        return { profile, isDemo: true };
      }

      sessionStorage.removeItem('hb_login_in_progress');
      throw new Error("Invalid credentials or password. Please verify your registered email and password.");
    } catch (err: any) {
      sessionStorage.removeItem('hb_login_in_progress');
      const msg = err.message || String(err);
      setError(msg);
      throw new Error(msg);
    }
  };

  const commitLogin = (profile: UserProfile, isDemo: boolean) => {
    sessionStorage.removeItem('hb_login_in_progress');
    setUserProfile(profile);
    if (isDemo) {
      localStorage.setItem('hb_demo_mode', 'true');
      localStorage.setItem('hb_demo_profile', JSON.stringify(profile));
      setIsDemoMode(true);
      setUser({
        uid: profile.uid,
        displayName: profile.name,
        email: profile.email,
        emailVerified: true,
      });
    } else {
      localStorage.setItem('hb_demo_mode', 'false');
      localStorage.setItem('hb_demo_profile', JSON.stringify(profile));
      setIsDemoMode(false);
      setUser(auth.currentUser);
    }
    setLoading(false);
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Firebase signOut failed", e);
    }
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
      loginWithEmail,
      commitLogin,
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
