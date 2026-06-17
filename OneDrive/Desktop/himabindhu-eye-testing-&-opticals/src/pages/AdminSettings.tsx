import React, { useState, useEffect } from 'react';
import { useAuth, UserRole } from '../context/AuthContext';
import { doc, setDoc, getDocs, collection, deleteDoc, serverTimestamp, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, firebaseConfig } from '../config/firebase';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { 
  Settings, 
  UserCheck, 
  Mail, 
  User, 
  Trash2, 
  ShieldAlert, 
  Users, 
  Loader2, 
  Shield, 
  PlusCircle,
  Clock,
  ClipboardList,
  Calendar,
  Phone,
  Search,
  CheckCircle2,
  Trash,
  MapPin,
  Smartphone,
  Activity,
  Download
} from 'lucide-react';

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby6GwqVZVNk4vR9wsMN8PMqZW-hsJuscR5JscUfNMf7pTdC7ykcrrONURgIM2p0qcHO/exec";

interface StaffUser {
  uid?: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string;
  createdAt: any;
  docId?: string;
  docIds?: string[];
}

interface Patient {
  patientId: string;
  name: string;
  mobile: string;
  age: number | string;
  gender: string;
  date: string;
  createdAt?: any;
  [key: string]: any;
}

export default function AdminSettings() {
  const { isDemoMode, userProfile } = useAuth();
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('receptionist');
  
  // App States
  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [patientsList, setPatientsList] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [patientSearch, setPatientSearch] = useState('');
  const [loginLogs, setLoginLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  // Clinic schedule & status state
  const [morningHours, setMorningHours] = useState('9:00 a.m. to 2:00 p.m.');
  const [eveningHours, setEveningHours] = useState('4:00 p.m. to 9:00 p.m.');
  const [clinicStatus, setClinicStatus] = useState<'open' | 'half-day' | 'closed'>('open');
  const [customNotice, setCustomNotice] = useState('');
  const [scheduleSuccessMsg, setScheduleSuccessMsg] = useState<string | null>(null);

  // Fetch all user session audit logs in Real-Time
  useEffect(() => {
    let unsubscribe: () => void;

    if (isDemoMode) {
      const stored = localStorage.getItem('hb_demo_login_logs') || '[]';
      setLoginLogs(JSON.parse(stored));
      setLoadingLogs(false);
      
      // To simulate realtime across tabs in demo mode, listen to storage events
      const handleStorage = (e: StorageEvent) => {
        if (e.key === 'hb_demo_login_logs' && e.newValue) {
          setLoginLogs(JSON.parse(e.newValue));
        }
      };
      window.addEventListener('storage', handleStorage);
      return () => window.removeEventListener('storage', handleStorage);
    } else {
      try {
        const q = query(collection(db, 'login_logs'), orderBy('loginTime', 'desc'), limit(50));
        unsubscribe = onSnapshot(q, (querySnap) => {
          const list = querySnap.docs.map(doc => doc.data());
          setLoginLogs(list);
          setLoadingLogs(false);
        }, (err) => {
          console.error("Failed loading session logs real-time:", err);
          setLoadingLogs(false);
        });
      } catch (err) {
        console.error("Error setting up real-time session logs:", err);
        setLoadingLogs(false);
      }
      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, [isDemoMode]);

  // Fetch all provisioned staff accounts
  const loadStaffRegistry = async () => {
    setLoading(true);
    setSuccessMsg(null);

    if (isDemoMode) {
      const stored = localStorage.getItem('hb_demo_users');
      if (stored) {
        setStaffList(JSON.parse(stored));
      } else {
        // Bootstrap standard dummy staff for visuals
        const initialStaff: StaffUser[] = [
          { uid: 'demo-uid-admin', name: 'Himabindhu', email: 'kh2kgaming@gmail.com', role: 'admin', createdAt: new Date().toISOString() },
          { uid: 'demo-uid-doctor', name: 'S. K. Prasad', email: 'prasad@himabindhueye.com', role: 'doctor', createdAt: new Date().toISOString() },
          { uid: 'demo-uid-receptionist', name: 'Venkata Laxmi', email: 'laxmi@himabindhueye.com', role: 'receptionist', createdAt: new Date().toISOString() }
        ];
        localStorage.setItem('hb_demo_users', JSON.stringify(initialStaff));
        setStaffList(initialStaff);
      }
      setLoading(false);
      return;
    }

    try {
      const querySnap = await getDocs(collection(db, 'users')).catch(err => 
        handleFirestoreError(err, OperationType.LIST, 'users')
      );
      if (querySnap) {
        const list = querySnap.docs.map(doc => ({
          ...(doc.data() as StaffUser),
          docId: doc.id
        }));

        // Deduplicate and group by email
        const uniqueMap = new Map<string, StaffUser & { docIds: string[] }>();
        list.forEach(u => {
          const emailKey = u.email.toLowerCase();
          const existing = uniqueMap.get(emailKey);
          if (!existing) {
            uniqueMap.set(emailKey, {
              ...u,
              docIds: [u.docId]
            });
          } else {
            // Keep the non-temp one as the primary representation if it exists
            const isExistingTemp = existing.docId?.startsWith('temp_');
            const isCurrentTemp = u.docId.startsWith('temp_');
            const preferCurrent = isExistingTemp && !isCurrentTemp;
            
            uniqueMap.set(emailKey, {
              ...(preferCurrent ? u : existing),
              docIds: [...existing.docIds, u.docId]
            });
          }
        });

        setStaffList(Array.from(uniqueMap.values()));
      }
    } catch (e) {
      console.error("Failed loading staff registry database", e);
    } finally {
      setLoading(false);
    }
  };

  // Fetch registered patients ("receptionlist") to monitor receptionist activities
  const loadReceptionList = async () => {
    setLoadingPatients(true);
    try {
      const response = await fetch(`${APPS_SCRIPT_URL}?action=getPatients`);
      const rawData = await response.json();
      
      const mapped = rawData.map((item: any) => ({
        patientId: item['Patient ID'] || '',
        name: item['Patient Name'] || '',
        mobile: item['Mobile'] || '',
        age: item['Age'] || '',
        gender: item['Gender'] || '',
        date: item['Date'] || '',
        ...item
      }));
      
      setPatientsList(mapped.sort((a: any, b: any) => String(b.patientId).localeCompare(String(a.patientId))));
    } catch (err) {
      console.error("Failed loading receptionist patient logs:", err);
    } finally {
      setLoadingPatients(false);
    }
  };

  const handleDownloadExcel = () => {
    if (patientsList.length === 0) {
      alert("No patient data available to download.");
      return;
    }
    
    const exportHeaders = [
      "Date", "Patient ID", "Prescription ID", "Patient Name", "Mobile", "Age", "Gender",
      "RE SPH", "RE CYL", "RE AXIS", "RE Vision", "RE Near Vision", "RE Add",
      "LE SPH", "LE CYL", "LE AXIS", "LE Vision", "LE Near Vision", "LE Add",
      "PD", "Advice", "Notes", "Frame Name", "Lens Type", "Actual Cost", 
      "Received Amount", "Balance Amount", "Payment Status", "Delivery Status"
    ];

    let csvContent = exportHeaders.join(",") + "\n";

    patientsList.forEach((patient: any) => {
      const row = exportHeaders.map(header => {
        let cellData = patient[header] !== undefined && patient[header] !== null ? String(patient[header]) : "";
        cellData = cellData.replace(/"/g, '""');
        return `"${cellData}"`;
      });
      csvContent += row.join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Patients_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    loadStaffRegistry();
    loadReceptionList();

    // Load clinic schedule & status
    const savedSchedule = localStorage.getItem('hb_clinic_schedule');
    if (savedSchedule) {
      try {
        const parsed = JSON.parse(savedSchedule);
        if (parsed.morningHours) setMorningHours(parsed.morningHours);
        if (parsed.eveningHours) setEveningHours(parsed.eveningHours);
        if (parsed.status) setClinicStatus(parsed.status);
        if (parsed.customNotice !== undefined) setCustomNotice(parsed.customNotice);
      } catch (e) {
        console.error("Failed to parse clinic schedule", e);
      }
    }
  }, [isDemoMode]);

  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    const schedule = {
      morningHours: morningHours.trim(),
      eveningHours: eveningHours.trim(),
      status: clinicStatus,
      customNotice: customNotice.trim()
    };
    localStorage.setItem('hb_clinic_schedule', JSON.stringify(schedule));
    
    // Dispatch a storage event to let other parts of the app know immediately
    window.dispatchEvent(new Event('storage'));
    
    setScheduleSuccessMsg("Clinic consulting schedule and status updated successfully!");
    setTimeout(() => {
      setScheduleSuccessMsg(null);
    }, 4000);
  };

  const handleProvisionStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      alert("Name and email are mandatory.");
      return;
    }

    setIsSubmitting(true);
    setSuccessMsg(null);

    const checkEmail = email.trim().toLowerCase();
    
    // Check if email is already listed
    if (staffList.find(s => s.email.toLowerCase() === checkEmail)) {
      alert("This staff email is already provisioned in the database.");
      setIsSubmitting(false);
      return;
    }

    const newStaff: StaffUser = {
      name: name.trim(),
      email: checkEmail,
      role: role,
      password: password.trim(),
      createdAt: new Date().toISOString()
    };

    if (isDemoMode) {
      const storedList = [...staffList, newStaff];
      localStorage.setItem('hb_demo_users', JSON.stringify(storedList));
      setSuccessMsg(`Clinical authorization granted for ${newStaff.name} as ${newStaff.role}.`);
      setName('');
      setEmail('');
      setPassword('');
      await loadStaffRegistry();
      setIsSubmitting(false);
      return;
    }

    try {
      // 1. Initialize secondary Firebase App to create user in Auth without signing out current admin
      const secondaryApp = initializeApp(firebaseConfig, `temp_provision_${Date.now()}`);
      const secondaryAuth = getAuth(secondaryApp);
      
      // 2. Create the user in Firebase Auth
      const authCredential = await createUserWithEmailAndPassword(secondaryAuth, checkEmail, password.trim());
      const newUid = authCredential.user.uid;
      
      // 3. Clean up secondary app to prevent resource/credentials leaks
      await deleteApp(secondaryApp);

      // 4. Create profile document directly with the real Auth UID as the document key
      const userDocRef = doc(db, 'users', newUid);
      
      await setDoc(userDocRef, {
        ...newStaff,
        uid: newUid,
        createdAt: serverTimestamp()
      }).catch(err => {
        handleFirestoreError(err, OperationType.CREATE, `users/${newUid}`);
      });

      setSuccessMsg(`Clinical authorization and Firebase Auth account provisioned successfully for ${newStaff.name} (${newStaff.role}).`);
      setName('');
      setEmail('');
      setPassword('');
      await loadStaffRegistry();
    } catch (err: any) {
      console.error(err);
      alert(`Account provisioning failed: ${err.message || String(err)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Revoke/Delete Staff accounts
  const handleRevokeStaff = async (staff: StaffUser) => {
    if (staff.email === userProfile?.email) {
      alert("Safety Block: You cannot revoke authorization from your own active session account.");
      return;
    }

    const confirmRevoke = window.confirm(`Are you certain you wish to revoke all access permissions for ${staff.name} (${staff.email})? They will be locked out immediately.`);
    if (!confirmRevoke) return;

    if (isDemoMode) {
      const updated = staffList.filter(s => s.email !== staff.email);
      localStorage.setItem('hb_demo_users', JSON.stringify(updated));
      await loadStaffRegistry();
      return;
    }

    try {
      const idsToDelete = staff.docIds || (staff.uid ? [staff.uid] : []);
      if (idsToDelete.length === 0) {
        const targetId = `temp_${staff.email.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_')}`;
        idsToDelete.push(targetId);
      }

      for (const docId of idsToDelete) {
        await deleteDoc(doc(db, 'users', docId)).catch(err => {
          handleFirestoreError(err, OperationType.DELETE, `users/${docId}`);
        });
      }
      
      alert(`Access revoked for ${staff.name}.`);
      await loadStaffRegistry();
    } catch (err) {
      console.error(err);
      alert("Revocation failed. Access controlled via security rules.");
    }
  };

  // Admin bypass to delete fake or erroneous patient registries from receptionist list
  const handleDeletePatientIntake = async (patient: Patient) => {
    const confirmDelete = window.confirm(`Administrative Override: Are you sure you wish to delete the patient file for ${patient.name} (${patient.patientId})? This action cannot be undone.`);
    if (!confirmDelete) return;

    try {
      const stored = localStorage.getItem('hb_demo_patients') || '[]';
      const parsed = JSON.parse(stored) as Patient[];
      const updated = parsed.filter(p => p.patientId !== patient.patientId);
      localStorage.setItem('hb_demo_patients', JSON.stringify(updated));

      // Also clean up patient prescriptions from local storage
      const storedRx = localStorage.getItem('hb_demo_prescriptions') || '[]';
      const parsedRx = JSON.parse(storedRx) as any[];
      const updatedRx = parsedRx.filter(rx => rx.patientId !== patient.patientId);
      localStorage.setItem('hb_demo_prescriptions', JSON.stringify(updatedRx));

      await loadReceptionList();
      alert(`Patient entry ${patient.patientId} has been administratively deleted.`);
    } catch (err) {
      console.error("Override deletion failed", err);
      alert("Failed to override patient entry.");
    }
  };

  // Filter patients list based on admin query
  const filteredPatients = patientsList.filter(p => 
    p.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
    p.patientId.toLowerCase().includes(patientSearch.toLowerCase()) ||
    p.mobile.includes(patientSearch)
  );

  // Filter only receptionist logs
  const receptionistLogs = loginLogs.filter(log => log.role?.toLowerCase() === 'receptionist');

  return (
    <div className="space-y-8 font-sans">
      
      {/* Clinicians & RBAC controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Account Provisioning form */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-blue-400" />
              <h3 className="font-extrabold text-white text-sm uppercase tracking-wider">Clinical Auth Manager (RBAC)</h3>
            </div>
            <span className="text-[9px] uppercase font-mono bg-slate-950 px-2 py-0.5 rounded text-slate-400">
              Root Secure Desk
            </span>
          </div>

          {successMsg && (
            <div className="mx-6 mt-6 p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-xl flex items-start gap-2.5">
              <UserCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-800">
                <p className="font-bold">{successMsg}</p>
                <p className="mt-0.5 font-medium text-slate-500">The authorized staff member may now sign on inside the secure gate.</p>
              </div>
            </div>
          )}

          <div className="mx-6 mt-6 p-4 bg-amber-50/20 border border-amber-200 rounded-xl text-xs text-blue-950 flex gap-2.5">
            <ShieldAlert className="w-5 h-5 shrink-0 text-blue-500" />
            <div>
              <p className="font-bold">Anti-Intrusion Rule Active</p>
              <p className="mt-1 text-slate-500 leading-normal font-semibold">
                Self-registration is deactivated. Receptionists, welcome clerks, and optometrists must be pre-authorized under this secure panel first.
              </p>
            </div>
          </div>

          <form onSubmit={handleProvisionStaff} className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Staff Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="e.g., S. K. Prasad"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full border border-slate-205 bg-slate-50/50 focus:bg-white rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 font-bold focus:border-blue-600 focus:outline-hidden transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Staff Gmail / Google Account
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    placeholder="e.g., prasad@google_account.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full border border-slate-205 bg-slate-50/50 focus:bg-white rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 font-bold focus:border-blue-600 focus:outline-hidden transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Staff Login Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <PlusCircle className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    placeholder="Enter login password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full border border-slate-205 bg-slate-50/50 focus:bg-white rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 font-bold focus:border-blue-600 focus:outline-hidden transition"
                  />
                </div>
              </div>

            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 hover:shadow-lg hover:shadow-amber-500/10 transition cursor-pointer flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Authorizing...</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    <span>Provision Credentials</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Staff roster directory */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 self-start">
          <div className="flex items-center gap-2 mb-4 border-b pb-3 border-slate-100">
            <Users className="w-5 h-5 text-amber-600" />
            <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">Authorized Clinicians</h4>
          </div>

          {loading ? (
            <div className="py-8 text-center text-slate-400 flex flex-col items-center justify-center text-xs">
              <Loader2 className="w-6 h-6 animate-spin text-amber-600 mb-2" />
              <p>Fetching clinician registry...</p>
            </div>
          ) : staffList.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">
              Roster empty. Provision new accounts on the left.
            </p>
          ) : (
            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {staffList.map((staff) => {
                const isClaimed = staff.docIds ? staff.docIds.some((id: string) => !id.startsWith('temp_')) : (staff.uid && !staff.uid.startsWith('temp_'));
                return (
                  <div 
                    key={staff.email} 
                    className="p-3 bg-slate-50 border border-slate-150 rounded-xl relative group flex justify-between items-center transition hover:bg-slate-100/50"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        {staff.role === 'admin' ? (
                          <Shield className="w-3.5 h-3.5 text-amber-600" />
                        ) : (
                          <User className="w-3.5 h-3.5 text-slate-600" />
                        )}
                        <h5 className="font-bold text-slate-800 text-xs truncate">{staff.name}</h5>
                      </div>
                      <p className="text-[9px] text-slate-450 mt-1 font-mono break-all font-semibold select-all">{staff.email}</p>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <span className="inline-block text-[8px] uppercase font-black tracking-widest text-amber-600 bg-amber-50/25 border border-amber-200 px-1.5 py-0.5 rounded">
                          {staff.role}
                        </span>
                        {isDemoMode ? null : isClaimed ? (
                          <span className="inline-block text-[8px] uppercase font-black tracking-widest text-emerald-600 bg-emerald-50/25 border border-emerald-200 px-1.5 py-0.5 rounded">
                            Active
                          </span>
                        ) : (
                          <span className="inline-block text-[8px] uppercase font-black tracking-widest text-orange-600 bg-orange-50/25 border border-orange-200 px-1.5 py-0.5 rounded animate-pulse">
                            Pending Setup
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0 pl-2">
                      <button
                        onClick={() => handleRevokeStaff(staff)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-lg transition opacity-60 hover:opacity-100 cursor-pointer"
                        title="De-authorize clinician immediately"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* CLINIC CONSULTING SCHEDULE & STATUS CUSTOMIZER */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden" id="clinic-schedule-customizer">
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-500" />
            <h3 className="font-extrabold text-white text-sm uppercase tracking-wider">Clinic consulting schedule & status</h3>
          </div>
          <span className="text-[9px] uppercase font-mono bg-slate-950 px-2 py-0.5 rounded text-slate-400">
            Live Schedule Desk
          </span>
        </div>

        {scheduleSuccessMsg && (
          <div className="mx-6 mt-6 p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-xl flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="text-xs text-emerald-800 font-bold">
              {scheduleSuccessMsg}
            </div>
          </div>
        )}

        <form onSubmit={handleSaveSchedule} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Morning hours */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Morning Session Hours
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Clock className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="e.g., 9:00 a.m. to 2:00 p.m."
                  value={morningHours}
                  onChange={(e) => setMorningHours(e.target.value)}
                  required
                  className="w-full border border-slate-200 bg-slate-50/50 focus:bg-white rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 font-bold focus:border-blue-600 focus:outline-hidden transition"
                />
              </div>
            </div>

            {/* Evening hours */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Evening Session Hours
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Clock className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="e.g., 4:00 p.m. to 9:00 p.m."
                  value={eveningHours}
                  onChange={(e) => setEveningHours(e.target.value)}
                  required
                  className="w-full border border-slate-200 bg-slate-50/50 focus:bg-white rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 font-bold focus:border-blue-600 focus:outline-hidden transition"
                />
              </div>
            </div>

            {/* Status options */}
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                Today's Clinic Status (Display on Homepage)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                {/* OPEN STATUS */}
                <button
                  type="button"
                  onClick={() => setClinicStatus('open')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                    clinicStatus === 'open' 
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-xs' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${clinicStatus === 'open' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                  <span>Fully Open (Active)</span>
                </button>

                {/* HALF DAY STATUS */}
                <button
                  type="button"
                  onClick={() => setClinicStatus('half-day')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                    clinicStatus === 'half-day' 
                      ? 'bg-amber-50 border-amber-500 text-amber-700 shadow-xs' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${clinicStatus === 'half-day' ? 'bg-amber-500 animate-pulse' : 'bg-slate-400'}`}></span>
                  <span>Half Working Day</span>
                </button>

                {/* CLOSED / HOLIDAY STATUS */}
                <button
                  type="button"
                  onClick={() => setClinicStatus('closed')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                    clinicStatus === 'closed' 
                      ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-xs' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${clinicStatus === 'closed' ? 'bg-rose-500 animate-pulse' : 'bg-slate-400'}`}></span>
                  <span>Holiday / Closed</span>
                </button>

              </div>
            </div>

            {/* Custom Notice message */}
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Custom Status Notice / Announcement (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="e.g., Clinic closed due to festival holiday. Emergency services call 9010408092."
                value={customNotice}
                onChange={(e) => setCustomNotice(e.target.value)}
                className="w-full border border-slate-200 bg-slate-50/50 focus:bg-white rounded-xl px-4 py-2.5 text-xs text-slate-800 font-bold focus:border-blue-600 focus:outline-hidden transition resize-y"
              />
            </div>

          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-900 text-white hover:bg-slate-800 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Update Clinic Status & Hours</span>
            </button>
          </div>
        </form>
      </div>

      {/* RECEPTION LIST SECTION ADDED DIRECTLY TO ADMIN PAGE AS REQUESTED */}
      {/* "receptionlist nee admin page lo add chei mawa" */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden" id="admin-reception-list">
        <div className="p-5 bg-slate-900 border-b border-slate-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-amber-600 rounded-lg text-white">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-white">Welcome Desk Registry (Reception List)</h3>
              <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Administrative monitoring of all patients registered at the welcome desk by receptionists.</p>
            </div>
          </div>
          
          {/* Active Search Filter inside Admin reception list */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="relative w-full sm:max-w-xs">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search patient name, ID, mobile..."
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 focus:bg-white text-slate-300 focus:text-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold focus:outline-hidden transition"
              />
            </div>
            
            <button
              onClick={() => {
                const handleClearDatabase = () => {
                  if (window.confirm("Are you sure you want to delete all local patient data? Note: You must also delete rows from your Google Sheet!")) {
                    localStorage.removeItem('hb_demo_patients');
                    localStorage.removeItem('hb_demo_prescriptions');
                    setPatientsList([]);
                    alert("Local database wiped successfully! Please clear Google Sheets manually.");
                    window.location.reload();
                  }
                };
                handleClearDatabase();
              }}
              className="px-6 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-medium border border-red-200 text-xs font-black uppercase tracking-wider"
            >
              Clear Local Data
            </button>
          </div>
        </div>

        {loadingPatients ? (
          <div className="p-16 text-center text-slate-400 font-bold flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600 mb-3" />
            <p className="text-xs uppercase tracking-wider">Syncing reception records...</p>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="p-16 text-center text-slate-450 font-bold">
            <p className="text-xs uppercase tracking-wider">The Reception logs directory is empty</p>
            <p className="text-[11px] text-slate-400 mt-1 italic font-normal">No registered patients are matching current administrative parameters.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-150 text-[10px] text-slate-450 font-bold uppercase tracking-widest">
                    <th className="py-3.5 px-6">Patient ID</th>
                    <th className="py-3.5 px-6">Patient Name</th>
                    <th className="py-3.5 px-6">Contact / Mobile</th>
                    <th className="py-3.5 px-6">Age / Gender</th>
                    <th className="py-3.5 px-6">Registration Date</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 text-slate-700 font-semibold font-sans">
                  {filteredPatients.map((patient) => (
                    <tr key={patient.patientId} className="hover:bg-slate-50/50 transition">
                      <td className="py-4 px-6">
                        <span className="font-mono font-bold text-xs text-amber-600 bg-amber-50/25/60 border border-amber-200 px-2.5 py-1 rounded">
                          {patient.patientId}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-900 font-bold">{patient.name}</td>
                      <td className="py-4 px-6 font-mono text-slate-500">{patient.mobile}</td>
                      <td className="py-4 px-6 text-slate-550">{patient.age} Yrs / {patient.gender}</td>
                      <td className="py-4 px-6 text-slate-500">{patient.date}</td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleDeletePatientIntake(patient)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition inline-flex items-center gap-1 cursor-pointer"
                          title="Administrative force delete patient"
                        >
                          <Trash className="w-4 h-4" />
                          <span className="text-[10px] font-bold">Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Excel Download at the bottom */}
            <div className="flex justify-end pt-2 border-t border-slate-100 mt-4">
              <button
                onClick={handleDownloadExcel}
                className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-[#25D366] hover:bg-[#20b858] text-white rounded-xl text-xs font-black uppercase tracking-wider transition shadow-md cursor-pointer shrink-0"
                title="Download full patient registry to Excel"
              >
                <Download className="w-5 h-5" />
                <span>Download Excel Data</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* STAFF SESSION AUDIT LOGS SECTION */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden" id="admin-login-audit-logs">
        <div className="p-5 bg-slate-900 border-b border-slate-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-teal-600 rounded-lg text-white">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-white">Staff Session Audit Logs</h3>
              <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Real-time session monitoring tracking exactly when and where staff members sign on to the clinic console.</p>
            </div>
          </div>
          <button 
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-teal-400 font-bold border border-slate-700/60 rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm opacity-80 cursor-default"
            title="Real-time sync enabled"
          >
            <Clock className="w-3.5 h-3.5 text-teal-400" />
            <span>Live Sync On</span>
          </button>
        </div>

        {loadingLogs ? (
          <div className="p-16 text-center text-slate-400 font-bold flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600 mb-3" />
            <p className="text-xs uppercase tracking-wider">Loading login audit trail...</p>
          </div>
        ) : loginLogs.length === 0 ? (
          <div className="p-16 text-center text-slate-450 font-bold">
            <p className="text-xs uppercase tracking-wider">No receptionist login sessions recorded</p>
            <p className="text-[11px] text-slate-400 mt-1 italic font-normal">Session logs will begin populating automatically as receptionists authenticate.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-150 text-[10px] text-slate-450 font-bold uppercase tracking-widest">
                  <th className="py-3.5 px-6">Login Time</th>
                  <th className="py-3.5 px-6">Staff Name</th>
                  <th className="py-3.5 px-6">Role</th>
                  <th className="py-3.5 px-6">IP Address</th>
                  <th className="py-3.5 px-6">Location</th>
                  <th className="py-3.5 px-6">Device Console</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loginLogs.map((log: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition">
                      <td className="py-4 px-6 text-slate-500 font-mono text-[11px]">
                        {new Date(log.loginTime).toLocaleString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                          hour12: true
                        })}
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-slate-900 font-bold">{log.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono font-medium">{log.email}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-block text-[8.5px] uppercase font-black tracking-wider border px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-600 border-teal-500/20">
                          {log.role}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-mono text-slate-550 text-xs">{log.ip}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span className="font-semibold">{log.location}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[10px]">
                          <Smartphone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{log.device}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
