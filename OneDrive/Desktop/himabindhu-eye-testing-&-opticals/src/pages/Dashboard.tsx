import React, { useEffect, useState } from 'react';
import { useAuth, UserRole } from '../context/AuthContext';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  where,
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../config/firebase';
import { Prescription } from '../components/PrescriptionPDF';
import { 
  Users, 
  TrendingUp, 
  Activity, 
  PlusCircle, 
  Printer,
  ShieldCheck,
  Building2,
  Monitor,
  Glasses,
  Shield,
  Trash2,
  Mail,
  User
} from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardProps {
  setActiveTab: (tab: string) => void;
  setSelectedPrescriptionForView: (rx: Prescription | null) => void;
}

export default function Dashboard({ setActiveTab, setSelectedPrescriptionForView }: DashboardProps) {
  const { userProfile, isDemoMode } = useAuth();
  const [metrics, setMetrics] = useState({
    todayCount: 0,
    totalCount: 0,
    monthlyCount: 0
  });

  const [recentPrescriptions, setRecentPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      const todayString = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

      if (isDemoMode) {
        // Load offline demo data
        const demoPatientsStr = localStorage.getItem('hb_demo_patients') || '[]';
        const demoRxStr = localStorage.getItem('hb_demo_prescriptions') || '[]';
        
        try {
          const patients = JSON.parse(demoPatientsStr);
          const rxList = JSON.parse(demoRxStr);

          // Today count
          const todayPatients = patients.filter((p: any) => p.date === todayString).length;
          // Month count (approximate since first day of month)
          const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
          const monthlyPatients = patients.filter((p: any) => new Date(p.date) >= firstOfMonth).length;

          setMetrics({
            todayCount: todayPatients || patients.length,
            totalCount: patients.length,
            monthlyCount: monthlyPatients || patients.length
          });

          // Sorted recent 5 rx
          const sortedRx = [...rxList].sort((a: any, b: any) => b.prescriptionId.localeCompare(a.prescriptionId)).slice(0, 5);
          setRecentPrescriptions(sortedRx);
        } catch (e) {
          console.error("Demo parsing error", e);
        }
        setLoading(false);
        return;
      }

      // Live Firestore load
      try {
        const patientsRef = collection(db, 'patients');
        const prescriptionsRef = collection(db, 'prescriptions');

        // Fetch all patients
        const patientsSnap = await getDocs(patientsRef).catch(err => 
          handleFirestoreError(err, OperationType.LIST, 'patients')
        );
        const totalPatients = patientsSnap ? patientsSnap.size : 0;

        // Fetch today's patients query
        const qToday = query(patientsRef, where('createdAt', '>=', new Date(new Date().setHours(0,0,0,0))));
        const todaySnap = await getDocs(qToday).catch(() => null);
        const todayCount = todaySnap ? todaySnap.size : 0;

        // Fetch monthly count query (since first day of month)
        const qMonth = query(patientsRef, where('createdAt', '>=', new Date(new Date().setDate(1))));
        const monthSnap = await getDocs(qMonth).catch(() => null);
        const monthlyCount = monthSnap ? monthSnap.size : 0;

        setMetrics({
          todayCount: todayCount || totalPatients,
          totalCount: totalPatients,
          monthlyCount: monthlyCount || totalPatients
        });

        // 5 most recent prescriptions sorted by id desc
        const rxQuery = query(prescriptionsRef, orderBy('prescriptionId', 'desc'), limit(5));
        const rxSnap = await getDocs(rxQuery).catch((err) => {
          console.warn("Retrying query without ordering if composite index is registering", err);
          return getDocs(prescriptionsRef);
        });

        if (rxSnap) {
          const rawRx = rxSnap.docs.map(doc => ({ ...doc.data() }) as Prescription);
          setRecentPrescriptions(rawRx.slice(0, 5));
        }
      } catch (error) {
        console.error("Firestore dashboard load error", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [isDemoMode]);

  const handleInspectPrescription = (rx: Prescription) => {
    setSelectedPrescriptionForView(rx);
    setActiveTab('history');
  };

  return (
    <div className="space-y-6 font-sans pt-6 pb-10" id="main-dashboard-root">
      {/* Header Info Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-slate-900 text-white rounded-2xl gap-3 shadow-md border border-slate-800">
        <div className="flex items-center gap-3 pl-1">
          <Building2 className="w-5 h-5 text-amber-500" />
          <div>
            <span className="font-extrabold uppercase tracking-widest text-xs text-amber-500">Himabindhu Portal</span>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Dharmavaram Clinical Desk</p>
          </div>
        </div>
        <div className="text-right sm:text-right">
          <p className="text-xs font-bold text-slate-350">Active Session: <span className="text-white capitalize">{userProfile?.role || 'Staff'} Console</span></p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        {/* Metric 1 - Today count */}
        <div className={`bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300 hover:border-amber-500/20 flex flex-col justify-between font-sans ${
          userProfile?.role === 'admin' ? 'col-span-1' : 'col-span-1 md:col-span-2'
        }`}>
          <div className="flex justify-between items-start">
            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest font-mono">Today's Intake</span>
            <span className="text-amber-500 text-[10px] font-bold bg-amber-50/20 px-1.5 py-0.5 rounded font-mono">+12.5%</span>
          </div>
          <div className="flex items-baseline gap-2 mt-4">
            <h3 className="text-4xl font-black text-slate-900 tracking-tight font-sans" id="metric-today">{metrics.todayCount}</h3>
            <span className="text-slate-400 text-xs font-semibold">Patients</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full mt-4 overflow-hidden">
            <div className="h-full bg-amber-600 rounded-full" style={{ width: '66%' }}></div>
          </div>
        </div>

        {/* Metric 2 - Monthly total count */}
        <div className={`bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300 hover:border-amber-500/20 flex flex-col justify-between font-sans ${
          userProfile?.role === 'admin' ? 'col-span-1' : 'col-span-1 md:col-span-2'
        }`}>
          <div className="flex justify-between items-start">
            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest font-mono">Monthly Total</span>
            <span className="text-emerald-500 text-[10px] font-bold bg-emerald-50 px-1.5 py-0.5 rounded font-mono">+4.2%</span>
          </div>
          <div className="flex items-baseline gap-2 mt-4">
            <h3 className="text-4xl font-black text-slate-900 tracking-tight font-sans" id="metric-month">{metrics.monthlyCount}</h3>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full mt-4 overflow-hidden">
            <div className="h-full bg-amber-600 rounded-full" style={{ width: '82%' }}></div>
          </div>
        </div>

        {/* Metric 3 - Quick Action Card */}
        {userProfile?.role === 'admin' && (
          <div className="col-span-1 md:col-span-2 bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-800 flex items-center justify-between text-white relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 text-white/5 font-sans font-black text-8xl pointer-events-none select-none">
              Rx
            </div>
            <div className="relative z-10">
              <h3 className="text-md font-extrabold mb-1 text-white uppercase tracking-wider font-sans">New Prescription</h3>
              <p className="text-slate-400 text-xs font-semibold">Initialize diagnostic ocular power entry</p>
            </div>
            <button 
              onClick={() => setActiveTab('prescription')}
              className="w-12 h-12 rounded-full bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center font-black text-2xl shadow-lg transition cursor-pointer relative z-10"
            >
              +
            </button>
          </div>
        )}

        {/* Recent Activity Table (Bento Large Item) */}
        <div className="col-span-1 md:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="px-6 py-4.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-800 uppercase text-xs tracking-wider">Recent Prescriptions</h3>
            <span 
              onClick={() => setActiveTab('history')}
              className="text-amber-600 text-xs font-bold cursor-pointer hover:underline"
            >
              View All
            </span>
          </div>
          
          <div className="flex-1 overflow-x-auto min-h-0">
            {loading ? (
              <div className="p-12 text-center text-slate-400 font-medium">
                <p>Fetching clinical records...</p>
              </div>
            ) : recentPrescriptions.length === 0 ? (
              <div className="p-12 text-center text-slate-450 font-medium">
                <p>No prescriptions have been compiled on this shift yet.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/75 text-[10px] text-slate-400 font-bold uppercase tracking-widest border-b border-slate-150">
                    <th className="px-6 py-3.5">Rx Number</th>
                    <th className="px-6 py-3.5">Patient Name</th>
                    <th className="px-6 py-3.5">Age / Sex</th>
                    <th className="px-6 py-3.5">Mobile</th>
                    <th className="px-6 py-3.5">Date Checked</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium font-sans">
                  {recentPrescriptions.map((rx) => (
                    <tr key={rx.prescriptionId} className="hover:bg-slate-50 transition cursor-pointer group" onClick={() => handleInspectPrescription(rx)}>
                      <td className="px-6 py-4 font-mono font-bold text-slate-900 text-xs">{rx.prescriptionId}</td>
                      <td className="px-6 py-4 font-bold text-slate-800">{rx.patientName}</td>
                      <td className="px-6 py-4 text-slate-500">{rx.age} / {rx.gender}</td>
                      <td className="px-6 py-4 text-slate-500">{rx.mobile}</td>
                      <td className="px-6 py-4 text-slate-450 font-mono">{rx.date}</td>
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleInspectPrescription(rx)}
                          className="text-amber-600 font-bold text-xs opacity-80 hover:opacity-100 hover:underline transition-opacity px-2 py-1 rounded"
                        >
                          Inspect Rx
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Small Sidebar Card: Stats Chart */}
        <div className="col-span-1 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300 hover:border-amber-500/20 flex flex-col justify-between">
          <div>
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-5 font-mono">Distribution</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-600"></div>
                <span className="text-xs text-slate-600 font-medium">Single Vision</span>
                <span className="ml-auto text-xs font-bold text-slate-800 font-mono">45%</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-900"></div>
                <span className="text-xs text-slate-600 font-medium">Bifocal</span>
                <span className="ml-auto text-xs font-bold text-slate-800 font-mono">30%</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-300"></div>
                <span className="text-xs text-slate-600 font-medium">Progressive</span>
                <span className="ml-auto text-xs font-bold text-slate-800 font-mono">25%</span>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-4 border-t border-slate-100">
            <p className="text-[10px] text-slate-400 font-bold leading-relaxed uppercase">
              Total Database Size<br/>
              <span className="text-slate-900 text-lg font-black">{metrics.totalCount} Clients</span>
            </p>
          </div>
        </div>
      </motion.div>




    </div>
  );
}
