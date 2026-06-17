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
  serverTimestamp,
  updateDoc
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
  User,
  Search,
  MessageCircle,
  Save,
  Clock
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

  // Receptionist States
  const [allPrescriptions, setAllPrescriptions] = useState<Prescription[]>([]);
  const [receptionSearch, setReceptionSearch] = useState('');
  const [selectedRx, setSelectedRx] = useState<Prescription | null>(null);
  const [frameName, setFrameName] = useState('');
  const [lensType, setLensType] = useState('');
  const [orderPrice, setOrderPrice] = useState('');
  const [orderStatus, setOrderStatus] = useState<'Pending' | 'Ready'>('Pending');
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false);
  const [isOrderSent, setIsOrderSent] = useState(false);

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
          const rxList = JSON.parse(demoRxStr) as Prescription[];

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

          // Sorted prescriptions
          const sortedRx = [...rxList].sort((a, b) => b.prescriptionId.localeCompare(a.prescriptionId));
          setRecentPrescriptions(sortedRx.slice(0, 5));
          setAllPrescriptions(sortedRx);
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

        // Load recent prescriptions
        const rxSnap = await getDocs(prescriptionsRef).catch((err) => {
          return getDocs(prescriptionsRef);
        });

        if (rxSnap) {
          const rawRx = rxSnap.docs.map(doc => ({ ...doc.data() }) as Prescription);
          const sortedList = rawRx.sort((a, b) => b.prescriptionId.localeCompare(a.prescriptionId));
          setRecentPrescriptions(sortedList.slice(0, 5));
          setAllPrescriptions(sortedList);
        }
      } catch (error) {
        console.error("Firestore dashboard load error", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [isDemoMode, userProfile]);

  const handleInspectPrescription = (rx: Prescription) => {
    setSelectedPrescriptionForView(rx);
    setActiveTab('history');
  };

  const handleSelectRx = (rx: Prescription) => {
    setSelectedRx(rx);
    setFrameName(rx.frameName || '');
    setLensType(rx.lensType || '');
    setOrderPrice(rx.orderPrice || '');
    setOrderStatus(rx.orderStatus || 'Pending');
    setIsOrderSent(rx.isOrderSent || false);

    // Auto-scroll to customizer desk on mobile screens
    if (window.innerWidth < 1024) {
      setTimeout(() => {
        document.getElementById('order-customizer-panel')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const syncOrderToGoogleSheet = async (rx: Prescription, updatedData: any) => {
    const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyyxeBKUjjpG7InOmRAHTAEcExQKt3chvyIN7MkO4pZYwID4uWs7uZCjiPG-0cHPlkg/exec";

    const formatPower = (eyeData: any) => {
      if (!eyeData) return "—";
      const dist = eyeData.distance || {};
      const near = eyeData.near || {};
      const addVal = eyeData.add ? `, Add: ${eyeData.add}` : "";
      return `[Dist] Sph: ${dist.sph || "Nil"}, Cyl: ${dist.cyl || "Nil"}, Axis: ${dist.axis || "Nil"} | [Near] Sph: ${near.sph || "Nil"}, Cyl: ${near.cyl || "Nil"}${addVal}`;
    };

    const payload = {
      type: "order",
      patientId: rx.patientId,
      prescriptionId: rx.prescriptionId,
      patientName: rx.patientName,
      mobile: rx.mobile,
      frameName: updatedData.frameName,
      lensType: updatedData.lensType,
      orderPrice: updatedData.orderPrice,
      orderStatus: updatedData.orderStatus,
      isOrderSent: updatedData.isOrderSent || false,
      isNotified: updatedData.isNotified || false,
      rePower: formatPower(rx.rightEyeData),
      lePower: formatPower(rx.leftEyeData)
    };

    try {
      if ((window as any).require) {
        try {
          const https = (window as any).require('https');
          const options = {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            }
          };

          const makeRequest = (targetUrl: string) => {
            const req = https.request(new URL(targetUrl), options, (res: any) => {
              if (res.statusCode === 301 || res.statusCode === 302) {
                makeRequest(res.headers.location);
                return;
              }
            });
            req.on('error', (e: any) => {
              console.error("Node HTTPS post to GSheets failed:", e);
            });
            req.write(JSON.stringify(payload));
            req.end();
          };
          makeRequest(APPS_SCRIPT_URL);
        } catch (err) {
          fetch(APPS_SCRIPT_URL, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
        }
      } else {
        fetch(APPS_SCRIPT_URL, {
          method: "POST",
          mode: "no-cors",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });
      }
      console.log("Synced order to Google Sheets successfully.");
    } catch (error) {
      console.error("Error syncing to Google Sheet:", error);
    }
  };

  const handleSaveOrder = async () => {
    if (!selectedRx) return;
    setIsUpdatingOrder(true);

    const hasChanges = 
      frameName.trim() !== (selectedRx.frameName || '') ||
      lensType.trim() !== (selectedRx.lensType || '') ||
      orderPrice.trim() !== (selectedRx.orderPrice || '');

    const updatedData = {
      frameName: frameName.trim(),
      lensType: lensType.trim(),
      orderStatus: orderStatus,
      orderPrice: orderPrice.trim(),
      isNotified: selectedRx.orderStatus === orderStatus ? (selectedRx.isNotified || false) : false,
      isOrderSent: hasChanges ? false : (selectedRx.isOrderSent || false)
    };

    if (isDemoMode) {
      const stored = localStorage.getItem('hb_demo_prescriptions') || '[]';
      const list = JSON.parse(stored) as Prescription[];
      const updatedList = list.map(rx => {
        if (rx.prescriptionId === selectedRx.prescriptionId) {
          return { ...rx, ...updatedData };
        }
        return rx;
      });
      localStorage.setItem('hb_demo_prescriptions', JSON.stringify(updatedList));
      
      const newSelected = { ...selectedRx, ...updatedData };
      setSelectedRx(newSelected);
      setAllPrescriptions(updatedList);
      setRecentPrescriptions(prev => prev.map(p => p.prescriptionId === selectedRx.prescriptionId ? newSelected : p));
      setIsOrderSent(newSelected.isOrderSent || false);
      
      syncOrderToGoogleSheet(selectedRx, updatedData);

      alert(`Spectacle Order for ${selectedRx.patientName} saved! Status: ${orderStatus}.`);
      setIsUpdatingOrder(false);
    } else {
      try {
        const rxRef = doc(db, 'prescriptions', selectedRx.prescriptionId);
        await updateDoc(rxRef, updatedData);
        
        const newSelected = { ...selectedRx, ...updatedData };
        setSelectedRx(newSelected);
        setAllPrescriptions(prev => prev.map(p => p.prescriptionId === selectedRx.prescriptionId ? newSelected : p));
        setRecentPrescriptions(prev => prev.map(p => p.prescriptionId === selectedRx.prescriptionId ? newSelected : p));
        setIsOrderSent(newSelected.isOrderSent || false);
        
        syncOrderToGoogleSheet(selectedRx, updatedData);

        alert(`Spectacle Order for ${selectedRx.patientName} updated in clinical database!`);
      } catch (err) {
        console.error("Failed to update prescription order:", err);
        alert("Failed to update order details.");
      } finally {
        setIsUpdatingOrder(false);
      }
    }
  };

  const handleSendOrderWhatsApp = async () => {
    if (!selectedRx) return;
    const cleanPhone = selectedRx.mobile.replace(/\D/g, '');
    const targetPhone = cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone;
    
    const msg = [
      `🏥 *Himabindhu Eye Testing & Opticals*`,
      `📍 Dharmavaram, Andhra Pradesh | 📞 9949334443`,
      ``,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `👓 *SPECTACLE ORDER CONFIRMATION*`,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      ``,
      `👤 *Patient:* ${selectedRx.patientName}`,
      `🆔 *Patient ID:* ${selectedRx.patientId}`,
      `🔖 *Rx ID:* ${selectedRx.prescriptionId}`,
      ``,
      `✨ *ORDER DETAILS:*`,
      `📦 *Frame Selected:* ${frameName || '—'}`,
      `🔮 *Lens Type:* ${lensType || '—'}`,
      orderPrice ? `💵 *Amount:* ₹${orderPrice}` : null,
      `📊 *Status:* 🔴 Crafting in Progress (Pending)`,
      ``,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `_We have started preparing your custom spectacles in our lab. We will notify you once they are ready for collection! Thank you! 🙏_`
    ].filter(v => v !== null).join('\n');
    
    const updatedData = { isOrderSent: true };
    const sheetData = {
      frameName: frameName.trim(),
      lensType: lensType.trim(),
      orderPrice: orderPrice.trim(),
      orderStatus: orderStatus,
      isNotified: selectedRx.isNotified || false,
      isOrderSent: true
    };

    if (isDemoMode) {
      const stored = localStorage.getItem('hb_demo_prescriptions') || '[]';
      const list = JSON.parse(stored) as Prescription[];
      const updatedList = list.map(rx => {
        if (rx.prescriptionId === selectedRx.prescriptionId) {
          return { ...rx, ...updatedData };
        }
        return rx;
      });
      localStorage.setItem('hb_demo_prescriptions', JSON.stringify(updatedList));
      setSelectedRx(prev => prev ? { ...prev, ...updatedData } : null);
      setAllPrescriptions(updatedList);
      setIsOrderSent(true);
      syncOrderToGoogleSheet(selectedRx, sheetData);
    } else {
      try {
        const rxRef = doc(db, 'prescriptions', selectedRx.prescriptionId);
        await updateDoc(rxRef, updatedData);
        setSelectedRx(prev => prev ? { ...prev, ...updatedData } : null);
        setAllPrescriptions(prev => prev.map(p => p.prescriptionId === selectedRx.prescriptionId ? { ...p, ...updatedData } : p));
        setIsOrderSent(true);
        syncOrderToGoogleSheet(selectedRx, sheetData);
      } catch (err) {
        console.error("Failed to update order sent status:", err);
      }
    }
    
    const url = `https://wa.me/${targetPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const handleNotifyCollectionWhatsApp = async () => {
    if (!selectedRx) return;
    const cleanPhone = selectedRx.mobile.replace(/\D/g, '');
    const targetPhone = cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone;
    
    const msg = [
      `🏥 *Himabindhu Eye Testing & Opticals*`,
      `📍 Dharmavaram, Andhra Pradesh | 📞 9949334443`,
      ``,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `🎉 *SPECTACLES READY FOR COLLECTION*`,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      ``,
      `Dear *${selectedRx.patientName}*,`,
      `Your custom spectacles are fully crafted and ready for collection! 🥳`,
      ``,
      `✨ *DETAILS:*`,
      `📦 *Frame:* ${frameName || selectedRx.frameName || '—'}`,
      `🔮 *Lens:* ${lensType || selectedRx.lensType || '—'}`,
      `🟢 *Status:* READY TO COLLECT`,
      ``,
      `📍 *Collection Point:* Himabindhu Opticals, Dharmavaram`,
      `📞 *Helpline:* 9949334443`,
      ``,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `_Please visit our clinic during working hours to collect your new spectacles. Thank you! 🙏_`
    ].join('\n');
    
    const updatedData = { isNotified: true };
    const sheetData = {
      frameName: frameName.trim(),
      lensType: lensType.trim(),
      orderPrice: orderPrice.trim(),
      orderStatus: orderStatus,
      isNotified: true,
      isOrderSent: isOrderSent
    };

    if (isDemoMode) {
      const stored = localStorage.getItem('hb_demo_prescriptions') || '[]';
      const list = JSON.parse(stored) as Prescription[];
      const updatedList = list.map(rx => {
        if (rx.prescriptionId === selectedRx.prescriptionId) {
          return { ...rx, ...updatedData };
        }
        return rx;
      });
      localStorage.setItem('hb_demo_prescriptions', JSON.stringify(updatedList));
      setSelectedRx(prev => prev ? { ...prev, ...updatedData } : null);
      setAllPrescriptions(updatedList);
      syncOrderToGoogleSheet(selectedRx, sheetData);
    } else {
      try {
        const rxRef = doc(db, 'prescriptions', selectedRx.prescriptionId);
        await updateDoc(rxRef, updatedData);
        setSelectedRx(prev => prev ? { ...prev, ...updatedData } : null);
        setAllPrescriptions(prev => prev.map(p => p.prescriptionId === selectedRx.prescriptionId ? { ...p, ...updatedData } : p));
        syncOrderToGoogleSheet(selectedRx, sheetData);
      } catch (err) {
        console.error("Failed to update notified status:", err);
      }
    }
    
    const url = `https://wa.me/${targetPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  if (userProfile?.role === 'receptionist') {
    const filteredRx = allPrescriptions.filter(rx => 
      rx.patientName.toLowerCase().includes(receptionSearch.toLowerCase()) ||
      rx.prescriptionId.toLowerCase().includes(receptionSearch.toLowerCase()) ||
      rx.mobile.includes(receptionSearch)
    );

    return (
      <div className="space-y-6 font-sans pt-6 pb-10 animate-fade-in" id="receptionist-dashboard-root">
        {/* Header Info Banner */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-slate-900 text-white rounded-2xl gap-3 shadow-md border border-slate-800">
          <div className="flex items-center gap-3 pl-1">
            <Building2 className="w-5 h-5 text-teal-400" />
            <div>
              <span className="font-extrabold uppercase tracking-widest text-xs text-teal-400">Welcome Desk</span>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Order Management & Dispatch Console</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-slate-350">Logged in as: <span className="text-white capitalize">{userProfile?.name}</span></p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Panel: Prescription/Patient Queue */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
            <div className="p-5 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Users className="w-5 h-5 text-teal-400" />
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-white">Patient Queue</h3>
              </div>
              
              <div className="relative shrink-0 max-w-xs w-full">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Search Patient Name, ID or Mobile..."
                  value={receptionSearch}
                  onChange={(e) => setReceptionSearch(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 focus:bg-white text-slate-300 focus:text-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs font-bold focus:outline-hidden transition"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[550px] divide-y divide-slate-100 min-h-[300px]">
              {loading ? (
                <div className="p-16 text-center text-slate-400 font-bold flex flex-col items-center justify-center">
                  <div className="w-8 h-8 animate-spin border-4 border-teal-500 border-t-transparent rounded-full mb-3"></div>
                  <p className="text-xs uppercase tracking-wider">Syncing queue records...</p>
                </div>
              ) : filteredRx.length === 0 ? (
                <div className="p-16 text-center text-slate-450 font-semibold">
                  <p className="text-xs uppercase tracking-wider">No matching registers found</p>
                  <p className="text-[11px] text-slate-400 mt-1 italic font-normal">Check search spelling or add patient in clinical portal.</p>
                </div>
              ) : (
                filteredRx.map((rx) => {
                  const isSelected = selectedRx?.prescriptionId === rx.prescriptionId;
                  const hasDetails = rx.frameName || rx.lensType;
                  return (
                    <div
                      key={rx.prescriptionId}
                      onClick={() => handleSelectRx(rx)}
                      className={`p-4 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isSelected ? 'bg-teal-50/45 border-l-4 border-teal-600' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 text-xs">{rx.patientName}</span>
                          <span className="text-[9px] bg-slate-100 text-slate-600 font-mono px-1.5 py-0.5 rounded font-bold uppercase">
                            {rx.prescriptionId}
                          </span>
                        </div>
                        <p className="text-[10.5px] text-slate-500 font-medium">
                          Mobile: <strong className="text-slate-600 font-semibold">{rx.mobile}</strong> | Age: {rx.age} Yrs ({rx.gender})
                        </p>
                        {hasDetails && (
                          <p className="text-[10px] text-slate-450 mt-0.5">
                            Specs: <span className="font-bold text-slate-600">{rx.frameName}</span> ({rx.lensType})
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        {hasDetails ? (
                          rx.orderStatus === 'Ready' ? (
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-[9.5px] font-black uppercase tracking-wider">
                              🟢 Ready
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-md text-[9.5px] font-black uppercase tracking-wider">
                              🔴 Crafting
                            </span>
                          )
                        ) : (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-500 border border-slate-200 rounded-md text-[9.5px] font-black uppercase tracking-wider">
                            ⚪ Setup Order
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Panel: Order Setup & Actions */}
          <div className="lg:col-span-5 space-y-6" id="order-customizer-panel">
            {selectedRx ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-6">
                <div>
                  <span className="text-[9px] font-black text-teal-600 uppercase tracking-widest font-mono block">
                    Spectacle Customizer Desk
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
                    Order Details for {selectedRx.patientName}
                  </h3>
                  <p className="text-[10.5px] text-slate-400 font-mono mt-1 leading-none">
                    Patient ID: {selectedRx.patientId} | Rx ID: {selectedRx.prescriptionId}
                  </p>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                  {/* Select Frame */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Select Spectacle Frame
                    </label>
                    <input
                      type="text"
                      list="frame-suggestions"
                      value={frameName}
                      onChange={(e) => setFrameName(e.target.value)}
                      placeholder="Type custom frame or select..."
                      className="w-full border border-slate-200 bg-white rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition shadow-xs"
                    />
                    <datalist id="frame-suggestions">
                      <option value="Onyx Steel Rectangle" />
                      <option value="Matte Wayfarer Rectangle" />
                      <option value="Crystal Clear Round" />
                      <option value="Rose Gold Wire Round" />
                      <option value="Vintage Tortoise Cat-Eye" />
                      <option value="Midnight Velvet Cat-Eye" />
                      <option value="Executive Browline" />
                      <option value="Havana Amber Oval" />
                      <option value="Silver Whisper Oval" />
                      <option value="Onyx Bold Square" />
                      <option value="Classic Ebony Clubmaster" />
                      <option value="Hexa-Bronze Geometric" />
                      <option value="Maverick Gold Aviator" />
                    </datalist>
                  </div>

                  {/* Select Lens */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Select Lens Type
                    </label>
                    <input
                      type="text"
                      list="lens-suggestions"
                      value={lensType}
                      onChange={(e) => setLensType(e.target.value)}
                      placeholder="Type custom lens or select..."
                      className="w-full border border-slate-200 bg-white rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition shadow-xs"
                    />
                    <datalist id="lens-suggestions">
                      <option value="Single Vision" />
                      <option value="Bifocal" />
                      <option value="Progressive" />
                      <option value="Blue Cut" />
                      <option value="Blue Light Transitions" />
                      <option value="Anti-glare HMC" />
                      <option value="Hard Coat (HC)" />
                    </datalist>
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Order Price (INR)
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-bold text-xs">
                        ₹
                      </span>
                      <input
                        type="text"
                        placeholder="e.g. 1500"
                        value={orderPrice}
                        onChange={(e) => setOrderPrice(e.target.value)}
                        className="w-full border border-slate-200 bg-white rounded-xl pl-8 pr-4 py-2.5 text-xs font-extrabold text-slate-800 focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition shadow-xs"
                      />
                    </div>
                  </div>

                  {/* Order Status Toggle */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                      Order Crafting Status
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setOrderStatus('Pending')}
                        className={`p-3 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer transition ${
                          orderStatus === 'Pending' 
                            ? 'bg-amber-50 border-amber-500 text-amber-800 shadow-xs' 
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className={`w-2.5 h-2.5 rounded-full ${orderStatus === 'Pending' ? 'bg-amber-500 animate-pulse' : 'bg-slate-400'}`}></span>
                        <span>Pending</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setOrderStatus('Ready')}
                        className={`p-3 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer transition ${
                          orderStatus === 'Ready' 
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs' 
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className={`w-2.5 h-2.5 rounded-full ${orderStatus === 'Ready' ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`}></span>
                        <span>Ready</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Submission & Action Buttons */}
                <div className="pt-6 border-t border-slate-100 space-y-3">
                  {/* Save Button with Dynamic Disabling when details match */}
                  {(() => {
                    const isSaveDisabled = 
                      isUpdatingOrder || 
                      !selectedRx || 
                      (
                        frameName.trim() === (selectedRx.frameName || '') &&
                        lensType.trim() === (selectedRx.lensType || '') &&
                        orderPrice.trim() === (selectedRx.orderPrice || '') &&
                        orderStatus === (selectedRx.orderStatus || 'Pending')
                      );

                    return (
                      <button
                        type="button"
                        onClick={handleSaveOrder}
                        disabled={isSaveDisabled}
                        className={`w-full py-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition ${
                          isSaveDisabled 
                            ? 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed' 
                            : 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm cursor-pointer'
                        }`}
                      >
                        <Save className="w-4.5 h-4.5" />
                        <span>
                          {isUpdatingOrder 
                            ? "Updating Order..." 
                            : isSaveDisabled 
                              ? "Saved & Up to Date" 
                              : "Confirm & Save Order Details"}
                        </span>
                      </button>
                    );
                  })()}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={handleSendOrderWhatsApp}
                      disabled={isOrderSent}
                      className={`py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition cursor-pointer ${
                        isOrderSent
                          ? 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed'
                          : 'bg-slate-900 hover:bg-slate-850 text-white border border-slate-800'
                      }`}
                      title={isOrderSent ? "Order details already sent" : "Send Order details to patient"}
                    >
                      <MessageCircle className={`w-4 h-4 ${isOrderSent ? 'text-slate-300' : 'text-emerald-400'}`} />
                      <span>{isOrderSent ? 'Order Details Sent' : 'Send Order details'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleNotifyCollectionWhatsApp}
                      disabled={orderStatus !== 'Ready'}
                      className={`py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition cursor-pointer ${
                        orderStatus === 'Ready'
                          ? 'bg-[#25D366] hover:bg-[#20b858] text-white shadow-sm'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed border-none'
                      }`}
                      title={orderStatus === 'Ready' ? "Notify patient spectacles are ready" : "Set status to Ready to enable notifications"}
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{selectedRx.isNotified ? "Notified (Resend)" : "Notify ready"}</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-450 font-bold flex flex-col items-center justify-center h-full min-h-[300px]">
                <Glasses className="w-12 h-12 text-slate-300 mb-4 animate-bounce" />
                <p className="text-xs uppercase tracking-wider">No Patient Selected</p>
                <p className="text-[11px] text-slate-400 mt-1 font-normal max-w-[200px]">
                  Select a patient record from the queue to manage their spectacles and lens configurations.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

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
              <>
                {/* Desktop View Table */}
                <div className="hidden md:block">
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
                </div>

                {/* Mobile View Card List */}
                <div className="block md:hidden divide-y divide-slate-100">
                  {recentPrescriptions.map((rx) => (
                    <div 
                      key={rx.prescriptionId} 
                      onClick={() => handleInspectPrescription(rx)}
                      className="p-4 hover:bg-slate-50 transition cursor-pointer space-y-2.5 active:bg-slate-100"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-mono font-bold text-slate-900 text-xs bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {rx.prescriptionId}
                        </span>
                        <span className="text-[10.5px] text-slate-400 font-mono font-bold">{rx.date}</span>
                      </div>
                      
                      <div className="space-y-1">
                        <h4 className="font-extrabold text-slate-800 text-xs">{rx.patientName}</h4>
                        <p className="text-[11px] text-slate-550">
                          {rx.age} Yrs / {rx.gender} • <span className="font-mono">{rx.mobile}</span>
                        </p>
                      </div>
                      
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInspectPrescription(rx);
                          }}
                          className="px-3.5 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 rounded-xl text-[10.5px] font-black uppercase tracking-wider transition"
                        >
                          Inspect Rx →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
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
