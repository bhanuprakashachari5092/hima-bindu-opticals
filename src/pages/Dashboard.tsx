import React, { useEffect, useState } from 'react';
import { useAuth, UserRole } from '../context/AuthContext';
import { Prescription, printPrescriptionHTML } from '../components/PrescriptionPDF';
import { generateNextPatientId, generateNextPrescriptionId } from '../utils/idGenerators';
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
  Clock,
  Edit,
  CheckCircle2,
  CheckCircle,
  X
} from 'lucide-react';
import { motion } from 'motion/react';

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwin877dfuTnQuvzaSifRtDBtkqbsUG7ULF2RxwJH9-t65AUOC9QAs_quXTgPdmncJW/exec";

interface DashboardProps {
  setActiveTab: (tab: string) => void;
  setSelectedPrescriptionForView: (rx: Prescription | null) => void;
  setPrefilledPatient?: (patient: any) => void;
}

export default function Dashboard({ setActiveTab, setSelectedPrescriptionForView, setPrefilledPatient }: DashboardProps) {
  const { userProfile, isDemoMode } = useAuth();
  const [metrics, setMetrics] = useState({
    todayCount: 0,
    totalCount: 0,
    monthlyCount: 0
  });

  const [recentPrescriptions, setRecentPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  // Patients list for queues
  const [patientsList, setPatientsList] = useState<any[]>([]);

  // Receptionist Patient Registration States
  const [regName, setRegName] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regAge, setRegAge] = useState('');
  const [regGender, setRegGender] = useState('Male');
  const [nextPatientId, setNextPatientId] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [receptionTab, setReceptionTab] = useState<'orders' | 'register'>('orders');
  const [registeredPatientForWhatsApp, setRegisteredPatientForWhatsApp] = useState<any | null>(null);
  const [editingPatientId, setEditingPatientId] = useState<string | null>(null);

  // Receptionist States
  const [allPrescriptions, setAllPrescriptions] = useState<Prescription[]>([]);
  const [receptionSearch, setReceptionSearch] = useState('');
  const [selectedRx, setSelectedRx] = useState<Prescription | null>(null);
  const [inspectReadyRx, setInspectReadyRx] = useState<Prescription | null>(null);
  const [frameName, setFrameName] = useState('');
  const [lensType, setLensType] = useState('');
  const [orderPrice, setOrderPrice] = useState('');
  const [orderStatus, setOrderStatus] = useState<'Pending' | 'Ready'>('Pending');
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false);
  const [isOrderSent, setIsOrderSent] = useState(false);
  
  // Custom cost states
  const [actualCost, setActualCost] = useState('');
  const [receivedCost, setReceivedCost] = useState('');
  const [balanceCost, setBalanceCost] = useState('');

  // Refraction power states for the wizard
  const [reSphDist, setReSphDist] = useState('');
  const [reCylDist, setReCylDist] = useState('');
  const [reAxisDist, setReAxisDist] = useState('');
  const [reVisionDist, setReVisionDist] = useState('6/6');
  const [reVisionNear, setReVisionNear] = useState('J1');
  const [reAdd, setReAdd] = useState('');

  const [leSphDist, setLeSphDist] = useState('');
  const [leCylDist, setLeCylDist] = useState('');
  const [leAxisDist, setLeAxisDist] = useState('');
  const [leVisionDist, setLeVisionDist] = useState('6/6');
  const [leVisionNear, setLeVisionNear] = useState('J1');
  const [leAdd, setLeAdd] = useState('');

  const [pd, setPd] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedAdvice, setSelectedAdvice] = useState<string[]>([]);
  
  const [workflowStep, setWorkflowStep] = useState<'input' | 'print' | 'whatsapp'>('input');

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      const todayString = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

      let patients = [];
      let rxList: Prescription[] = [];
      let loadedFromSheets = false;

      // 1. Instant Load from LocalStorage for Speed (Stale-While-Revalidate)
      const storedPatients = localStorage.getItem('hb_demo_patients');
      const storedRx = localStorage.getItem('hb_demo_prescriptions');
      let foundLocalData = false;
      if (storedPatients) {
        try {
          const p = JSON.parse(storedPatients);
          if (p.length > 0) {
            setPatientsList(p.sort((a: any, b: any) => b.patientId.localeCompare(a.patientId)));
            foundLocalData = true;
          }
        } catch (e) {}
      }
      if (storedRx) {
        try {
          const r = JSON.parse(storedRx);
          if (r.length > 0) {
            setAllPrescriptions(r.sort((a: any, b: any) => b.prescriptionId.localeCompare(a.prescriptionId)));
            foundLocalData = true;
          }
        } catch (e) {}
      }
      if (foundLocalData) {
        setLoading(false);
      }

      const mapPatient = (item: any) => ({
        patientId: item['Patient ID'] || item.patientId || '',
        name: item['Patient Name'] || item.name || '',
        mobile: item['Mobile'] || item.mobile || '',
        age: item['Age'] || item.age || '',
        gender: item['Gender'] || item.gender || '',
        date: item['Date'] || item.date || ''
      });

      const mapPrescription = (item: any) => ({
        prescriptionId: item['Prescription ID'] || item.prescriptionId || '',
        patientId: item['Patient ID'] || item.patientId || '',
        patientName: item['Patient Name'] || item.patientName || '',
        mobile: item['Mobile'] || item.mobile || '',
        age: item['Age'] || item.age || '',
        gender: item['Gender'] || item.gender || '',
        date: item['Date'] || item.date || '',
        rightEyeData: {
          distance: { sph: item['RE SPH'] || '', cyl: item['RE CYL'] || '', axis: item['RE AXIS'] || '', vision: item['RE Vision'] || '' },
          near: { sph: '', cyl: '', axis: '', vision: item['RE Near Vision'] || '' },
          add: item['RE Add'] || ''
        },
        leftEyeData: {
          distance: { sph: item['LE SPH'] || '', cyl: item['LE CYL'] || '', axis: item['LE AXIS'] || '', vision: item['LE Vision'] || '' },
          near: { sph: '', cyl: '', axis: '', vision: item['LE Near Vision'] || '' },
          add: item['LE Add'] || ''
        },
        pd: item['PD'] || '',
        advice: item['Advice'] ? item['Advice'].toString().split(',').map((s: string) => s.trim()) : [],
        notes: item['Notes'] || '',
        frameName: item['Frame Name'] || '',
        lensType: item['Lens Type'] || '',
        actualCost: item['Actual Cost'] || '',
        receivedCost: item['Received Amount'] || '',
        balanceCost: item['Balance Amount'] || '',
        orderStatus: item['Delivery Status'] || 'Pending',
        isPlaceholder: false
      });

      // Only show loader if we have absolutely no local data
      if (!foundLocalData) {
        setLoading(true);
      }

      // Background Sync to pull fresh data silently (only 1 network call)
      fetch(`${APPS_SCRIPT_URL}?action=syncAll`)
        .then(res => res.json())
        .then(json => {
          let rawData = Array.isArray(json) ? json : (json.success && Array.isArray(json.data) ? json.data : []);
          if (rawData.length > 0) {
            const freshPatients = rawData.map(mapPatient);
            const freshRx = rawData.map(mapPrescription);
            
            localStorage.setItem('hb_demo_patients', JSON.stringify(freshPatients));
            localStorage.setItem('hb_demo_prescriptions', JSON.stringify(freshRx));
            
            // Silently update state
            setPatientsList(freshPatients.sort((a: any, b: any) => b.patientId.localeCompare(a.patientId)));
            
            const sortedRx = [...freshRx].sort((a: any, b: any) => b.prescriptionId.localeCompare(a.prescriptionId));
            setRecentPrescriptions(sortedRx.slice(0, 5));
            setAllPrescriptions(sortedRx);
            
            // Silently update metrics
            const todayCount = freshPatients.filter((p: any) => p.date === todayString).length;
            const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
            const monthlyCount = freshPatients.filter((p: any) => new Date(p.date) >= firstOfMonth).length;
            
            setMetrics({
              todayCount: todayCount || freshPatients.length,
              totalCount: freshPatients.length,
              monthlyCount: monthlyCount || freshPatients.length
            });
            setLoading(false);
          }
        })
        .catch(err => {
          console.warn("Background sync failed:", err);
          setLoading(false);
        });

      setLoading(false);
    }

    loadDashboardData();
  }, [userProfile]);

  useEffect(() => {
    async function loadNextId() {
      if (userProfile?.role === 'receptionist') {
        const nextId = await generateNextPatientId(true);
        setNextPatientId(nextId);
      }
    }
    loadNextId();
  }, [userProfile]);

  const handleRegisterPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regMobile.trim() || !regAge.trim()) {
      alert("Please enter Name, Mobile, and Age.");
      return;
    }
    setIsRegistering(true);
    try {
      const todayString = new Date().toISOString().split('T')[0];

      if (editingPatientId) {
        // --- EDIT EXISTING PATIENT LOGIC ---
        const stored = localStorage.getItem('hb_demo_patients') || '[]';
        const current = JSON.parse(stored);
        const pIndex = current.findIndex((p: any) => p.patientId === editingPatientId);
        if (pIndex !== -1) {
          current[pIndex].name = regName.trim();
          current[pIndex].mobile = regMobile.trim();
          current[pIndex].age = parseInt(regAge, 10);
          current[pIndex].gender = regGender;
          localStorage.setItem('hb_demo_patients', JSON.stringify(current));
        }

        const storedRx = localStorage.getItem('hb_demo_prescriptions') || '[]';
        const currentRx = JSON.parse(storedRx);
        const rxIndex = currentRx.findIndex((rx: any) => rx.patientId === editingPatientId);
        
        let rxIdToSave = '';
        if (rxIndex !== -1) {
          rxIdToSave = currentRx[rxIndex].prescriptionId;
          currentRx[rxIndex].patientName = regName.trim();
          currentRx[rxIndex].mobile = regMobile.trim();
          currentRx[rxIndex].age = parseInt(regAge, 10);
          currentRx[rxIndex].gender = regGender;
          localStorage.setItem('hb_demo_prescriptions', JSON.stringify(currentRx));
        }

        setPatientsList(current.sort((a: any, b: any) => b.patientId.localeCompare(a.patientId)));
        setAllPrescriptions(currentRx.sort((a: any, b: any) => b.prescriptionId.localeCompare(a.prescriptionId)));
        
        // Background sync update to Google Sheets
        try {
          fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({
              action: 'savePrescription',
              patientId: editingPatientId,
              prescriptionId: rxIdToSave,
              patientName: regName.trim(),
              mobile: regMobile.trim(),
              age: parseInt(regAge, 10),
              gender: regGender,
              date: current[pIndex]?.date || todayString,
              // Send existing blank or filled data to prevent overwrite if it was filled,
              // but realistically since it's just reception, it might be blank. 
              // Sending action: 'editPatient' would be better if backend supported it, but we'll re-save basic fields.
              reDistanceSph: "", reDistanceCyl: "", reDistanceAxis: "", reDistanceVision: "",
              reNearSph: "", reNearCyl: "", reNearAxis: "", reNearVision: "", reAdd: "",
              leDistanceSph: "", leDistanceCyl: "", leDistanceAxis: "", leDistanceVision: "",
              leNearSph: "", leNearCyl: "", leNearAxis: "", leNearVision: "", leAdd: "",
              pd: "", advice: "", notes: ""
            })
          }).catch(e => console.warn(e));
        } catch(e) {}

        alert("Patient details updated successfully!");
        setEditingPatientId(null);
      } else {
        // --- CREATE NEW PATIENT LOGIC ---
        const generatedId = await generateNextPatientId(true);
        const generatedRxId = await generateNextPrescriptionId(true);
        const newPatient = {
          patientId: generatedId,
          name: regName.trim(),
          mobile: regMobile.trim(),
          age: parseInt(regAge, 10),
          gender: regGender,
          date: todayString
        };

        const stored = localStorage.getItem('hb_demo_patients') || '[]';
        const current = JSON.parse(stored);
        current.push(newPatient);
        localStorage.setItem('hb_demo_patients', JSON.stringify(current));
        
        const blankRx: Prescription = {
          prescriptionId: generatedRxId,
          patientId: generatedId,
          patientName: regName.trim(),
          mobile: regMobile.trim(),
          age: parseInt(regAge, 10),
          gender: regGender,
          date: todayString,
          rightEyeData: {
            distance: { sph: "", cyl: "", axis: "", vision: "6/6" },
            near: { sph: "", cyl: "", axis: "", vision: "J1" },
            add: ""
          },
          leftEyeData: {
            distance: { sph: "", cyl: "", axis: "", vision: "6/6" },
            near: { sph: "", cyl: "", axis: "", vision: "J1" },
            add: ""
          },
          pd: "",
          advice: [],
          notes: "",
          frameName: "",
          lensType: "",
          actualCost: "",
          receivedCost: "",
          balanceCost: "",
          orderStatus: "Pending",
          isPlaceholder: true
        } as any;
        
        const storedRx = localStorage.getItem('hb_demo_prescriptions') || '[]';
        const currentRx = JSON.parse(storedRx);
        currentRx.push(blankRx);
        localStorage.setItem('hb_demo_prescriptions', JSON.stringify(currentRx));

        setPatientsList(current.sort((a: any, b: any) => b.patientId.localeCompare(a.patientId)));
        setAllPrescriptions(currentRx.sort((a: any, b: any) => b.prescriptionId.localeCompare(a.prescriptionId)));
        setMetrics(prev => ({
          ...prev,
          todayCount: current.filter((p: any) => p.date === todayString).length,
          totalCount: current.length
        }));

        // POST to Google Sheets (Background Sync for Ultra Fast UI)
        try {
          fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({
              action: 'savePrescription',
              patientId: newPatient.patientId,
              prescriptionId: generatedRxId,
              patientName: newPatient.name,
              mobile: newPatient.mobile,
              age: newPatient.age,
              gender: newPatient.gender,
              date: newPatient.date,
              reDistanceSph: "", reDistanceCyl: "", reDistanceAxis: "", reDistanceVision: "6/6",
              reNearSph: "", reNearCyl: "", reNearAxis: "", reNearVision: "J1", reAdd: "",
              leDistanceSph: "", leDistanceCyl: "", leDistanceAxis: "", leDistanceVision: "6/6",
              leNearSph: "", leNearCyl: "", leNearAxis: "", leNearVision: "J1", leAdd: "",
              pd: "", advice: "", notes: ""
            })
          }).catch(sheetErr => {
            console.warn("Failed to POST registered patient to Google Sheets in background:", sheetErr);
          });
        } catch (sheetErr) {
          console.warn("Failed to initiate POST to Google Sheets:", sheetErr);
        }

        setRegisteredPatientForWhatsApp(newPatient);
      }

      setRegName('');
      setRegMobile('');
      setRegAge('');
      setRegGender('Male');

      const nextId = await generateNextPatientId(true);
      setNextPatientId(nextId);
      
      setReceptionTab('orders');
    } catch (err) {
      console.error("Failed to register/update patient:", err);
      alert("Error saving patient details.");
    } finally {
      setIsRegistering(false);
    }
  };

  const handleEditPatient = (patient: any) => {
    setEditingPatientId(patient.patientId);
    setRegName(patient.name);
    setRegMobile(patient.mobile);
    setRegAge(String(patient.age));
    setRegGender(patient.gender);
    setNextPatientId(patient.patientId); // Lock the ID field to the patient being edited
    setReceptionTab('register');
    // Scroll up slightly to ensure form is visible
    document.getElementById('receptionist-dashboard-root')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInspectPrescription = (rx: Prescription) => {
    setSelectedPrescriptionForView(rx);
    setActiveTab('history');
  };

  const handleSelectRx = (rx: Prescription) => {
    setSelectedRx(rx);
    setFrameName(rx.frameName || '');
    // Automatically set the lens type to whatever the doctor advised if not already set manually
    const adviceText = Array.isArray(rx.advice) ? rx.advice.join(', ') : (rx.advice || '');
    setLensType(rx.lensType || adviceText);
    setOrderPrice(rx.orderPrice || '');
    setOrderStatus(rx.orderStatus || 'Pending');
    setIsOrderSent(rx.isOrderSent || false);

    // Initialize costs
    const act = rx.actualCost || rx.orderPrice || '';
    const rec = rx.receivedCost || '';
    const bal = rx.balanceCost || (act && rec ? String((parseFloat(act) || 0) - (parseFloat(rec) || 0)) : '');
    setActualCost(act);
    setReceivedCost(rec);
    setBalanceCost(bal);

    // Initialize refraction powers
    setReSphDist(rx.rightEyeData?.distance?.sph || '');
    setReCylDist(rx.rightEyeData?.distance?.cyl || '');
    setReAxisDist(rx.rightEyeData?.distance?.axis || '');
    setReVisionDist(rx.rightEyeData?.distance?.vision || '6/6');
    setReVisionNear(rx.rightEyeData?.near?.vision || 'J1');
    setReAdd(rx.rightEyeData?.add || '');

    setLeSphDist(rx.leftEyeData?.distance?.sph || '');
    setLeCylDist(rx.leftEyeData?.distance?.cyl || '');
    setLeAxisDist(rx.leftEyeData?.distance?.axis || '');
    setLeVisionDist(rx.leftEyeData?.distance?.vision || '6/6');
    setLeVisionNear(rx.leftEyeData?.near?.vision || 'J1');
    setLeAdd(rx.leftEyeData?.add || '');

    setPd(rx.pd || '');
    setNotes(rx.notes || '');
    setSelectedAdvice(rx.advice || []);
    
    setWorkflowStep('input');

    // Auto-scroll to customizer desk on mobile screens
    if (window.innerWidth < 1024) {
      setTimeout(() => {
        document.getElementById('order-customizer-panel')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const handleDeletePatientFromQueue = (patientId: string) => {
    const confirmDelete = window.confirm("Are you sure you want to remove this patient from the welcome desk queue?");
    if (!confirmDelete) return;

    try {
      const stored = localStorage.getItem('hb_demo_patients') || '[]';
      const parsed = JSON.parse(stored) as any[];
      const updated = parsed.filter(p => p.patientId !== patientId);
      localStorage.setItem('hb_demo_patients', JSON.stringify(updated));
      setPatientsList(updated);

      // Refresh metrics
      const todayString = new Date().toISOString().split('T')[0];
      const todayPatients = updated.filter((p: any) => p.date === todayString).length;
      const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const monthlyPatients = updated.filter((p: any) => new Date(p.date) >= firstOfMonth).length;

      setMetrics({
        todayCount: todayPatients || updated.length,
        totalCount: updated.length,
        monthlyCount: monthlyPatients || updated.length
      });

      // POST deletion to Google Sheets
      try {
        fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'deletePatient',
            patientId: patientId
          })
        });
      } catch (sheetErr) {
        console.warn("Failed to delete patient from Google Sheets queue:", sheetErr);
      }
    } catch (e) {
      console.error("Failed to delete patient from queue:", e);
    }
  };

  const syncOrderToGoogleSheet = async (rx: Prescription, updatedData: any) => {
    const payload = {
      action: "saveOrder",
      prescriptionId: rx.prescriptionId,
      patientId: rx.patientId, // Added so Google Sheets can find the row if prescriptionId is PENDING
      orderData: {
        frameName: updatedData.frameName,
        lensType: updatedData.lensType,
        orderPrice: updatedData.orderPrice,
        orderStatus: updatedData.orderStatus,
        isOrderSent: updatedData.isOrderSent || false,
        isNotified: updatedData.isNotified || false,
        actualCost: updatedData.actualCost || "",
        receivedCost: updatedData.receivedCost || "",
        balanceCost: updatedData.balanceCost || "",
        reSphDist: rx.rightEyeData?.distance?.sph || "",
        reCylDist: rx.rightEyeData?.distance?.cyl || "",
        reAxisDist: rx.rightEyeData?.distance?.axis || "",
        reVisionDist: rx.rightEyeData?.distance?.vision || "",
        reVisionNear: rx.rightEyeData?.near?.vision || "",
        reAdd: rx.rightEyeData?.add || "",
        leSphDist: rx.leftEyeData?.distance?.sph || "",
        leCylDist: rx.leftEyeData?.distance?.cyl || "",
        leAxisDist: rx.leftEyeData?.distance?.axis || "",
        leVisionDist: rx.leftEyeData?.distance?.vision || "",
        leVisionNear: rx.leftEyeData?.near?.vision || "",
        leAdd: rx.leftEyeData?.add || "",
        pd: rx.pd || "",
        notes: rx.notes || ""
      }
    };

    try {
      if ((window as any).require) {
        try {
          const https = (window as any).require('https');
          const options = {
            method: 'POST',
            headers: {
              'Content-Type': 'text/plain;charset=utf-8',
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
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
          try {
            await fetch(APPS_SCRIPT_URL, {
              method: "POST",
              mode: "no-cors",
              headers: { "Content-Type": "text/plain;charset=utf-8" },
              body: JSON.stringify(payload),
              signal: controller.signal
            });
          } finally {
            clearTimeout(timeoutId);
          }
        }
      } else {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
        try {
          await fetch(APPS_SCRIPT_URL, {
            method: "POST",
            mode: "no-cors",
            headers: {
              "Content-Type": "text/plain;charset=utf-8"
            },
            body: JSON.stringify(payload),
            signal: controller.signal
          });
        } finally {
          clearTimeout(timeoutId);
        }
      }
      console.log("Synced order to Google Sheets successfully.");
    } catch (error) {
      console.error("Error syncing to Google Sheet:", error);
    }
  };

  const handleSaveOrder = async () => {
    if (!selectedRx) return;
    setIsUpdatingOrder(true);

    try {
      const updatedRightData = {
        distance: { sph: reSphDist, cyl: reCylDist, axis: reAxisDist, vision: reVisionDist },
        near: { sph: "", cyl: "", axis: "", vision: reVisionNear },
        add: reAdd
      };

      const updatedLeftData = {
        distance: { sph: leSphDist, cyl: leCylDist, axis: leAxisDist, vision: leVisionDist },
        near: { sph: "", cyl: "", axis: "", vision: leVisionNear },
        add: leAdd
      };

      const actVal = String(actualCost || "").trim();
      const recVal = String(receivedCost || "").trim();
      const balVal = String((parseFloat(actVal) || 0) - (parseFloat(recVal) || 0));

      const updatedRx = {
        ...selectedRx,
        frameName: String(frameName || "").trim(),
        lensType: String(lensType || "").trim(),
        orderPrice: actVal || String(orderPrice || "").trim(),
        orderStatus: orderStatus,
        rightEyeData: updatedRightData,
        leftEyeData: updatedLeftData,
        pd: String(pd || "").trim(),
        notes: String(notes || "").trim(),
        advice: selectedAdvice,
        actualCost: actVal,
        receivedCost: recVal,
        balanceCost: balVal
      };

      const stored = localStorage.getItem('hb_demo_prescriptions') || '[]';
      const list = JSON.parse(stored) as Prescription[];
      const updatedList = list.map(rx => {
        if (rx.prescriptionId === selectedRx.prescriptionId) {
          return updatedRx;
        }
        return rx;
      });
      localStorage.setItem('hb_demo_prescriptions', JSON.stringify(updatedList));
      
      setSelectedRx(updatedRx);
      setAllPrescriptions(updatedList);
      setRecentPrescriptions(prev => prev.map(p => p.prescriptionId === selectedRx.prescriptionId ? updatedRx : p));
      setIsOrderSent(false);

      // Fire and forget background sync to Google Sheets for ultra fast UI
      syncOrderToGoogleSheet(updatedRx, {
        frameName: frameName.trim(),
        lensType: lensType.trim(),
        orderPrice: actVal || orderPrice.trim(),
        orderStatus: orderStatus,
        isNotified: false,
        isOrderSent: false,
        actualCost: actVal,
        receivedCost: recVal,
        balanceCost: balVal
      });

      setWorkflowStep('whatsapp');
    } catch (err) {
      console.error("Save order failed", err);
      alert("There was an error saving the order. Please check the inputs or try again.");
    } finally {
      setIsUpdatingOrder(false);
    }
  };

  const handleSendOrderWhatsApp = async () => {
    if (!selectedRx) return;
    const cleanPhone = String(selectedRx.mobile || '').replace(/\D/g, '');
    const targetPhone = cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone;
    
    const fmt = (v: string | undefined) => (v && v !== '—' && v !== '') ? v : '—';
    const msg = [
      `🏥 *Himabindhu Eye Testing & Opticals*`,
      `📍 Dharmavaram, Andhra Pradesh | 📞 9010408092`,
      ``,
      `✨✨✨✨✨✨✨✨`,
      `👓 *ORDER & SPECTACLE PRESCRIPTION*`,
      `✨✨✨✨✨✨✨✨`,
      ``,
      `👤 *Patient:* ${selectedRx.patientName}`,
      `🆔 *Patient ID:* ${selectedRx.patientId}`,
      `🔖 *Rx ID:* ${selectedRx.prescriptionId}`,
      `🎂 *Age/Sex:* ${selectedRx.age} yrs / ${selectedRx.gender}`,
      ``,
      `👁️ *RIGHT EYE (OD):*`,
      `*Distance:* SPH: ${fmt(reSphDist)} | CYL: ${fmt(reCylDist)} | AXIS: ${fmt(reAxisDist)}° | Vision: ${reVisionDist}`,
      `*Near:* Vision: ${reVisionNear} | *ADD:* +${fmt(reAdd)}`,
      ``,
      `👁️ *LEFT EYE (OS):*`,
      `*Distance:* SPH: ${fmt(leSphDist)} | CYL: ${fmt(leCylDist)} | AXIS: ${fmt(leAxisDist)}° | Vision: ${leVisionDist}`,
      `*Near:* Vision: ${leVisionNear} | *ADD:* +${fmt(leAdd)}`,
      pd ? `📏 *PD:* ${pd} mm` : null,
      ``,
      `✨ *SPECTACLES ORDER:*`,
      `📦 *Frame Selected:* ${frameName || '—'}`,
      `🔮 *Lens Type:* ${lensType || '—'}`,
      actualCost ? `💵 *Actual Cost:* ₹${actualCost}` : null,
      receivedCost ? `💰 *Received Amount:* ₹${receivedCost}` : null,
      balanceCost ? `⚖️ *Balance Amount:* ₹${balanceCost}` : null,
      `📊 *Status:* 🔴 Crafting in Progress`,
      ``,
      `✨✨✨✨✨✨✨✨`,
      `_We have started preparing your custom spectacles in our lab. Thank you! 🙏_`
    ].filter(v => v !== null).join('\n');
    
    const updatedData = {
      isOrderSent: true,
      frameName: frameName.trim(),
      lensType: lensType.trim(),
      orderPrice: actualCost.trim() || orderPrice.trim(),
      orderStatus: orderStatus,
      rightEyeData: {
        distance: { sph: reSphDist, cyl: reCylDist, axis: reAxisDist, vision: reVisionDist },
        near: { sph: "", cyl: "", axis: "", vision: reVisionNear },
        add: reAdd
      },
      leftEyeData: {
        distance: { sph: leSphDist, cyl: leCylDist, axis: leAxisDist, vision: leVisionDist },
        near: { sph: "", cyl: "", axis: "", vision: leVisionNear },
        add: leAdd
      },
      pd: pd.trim(),
      notes: notes.trim(),
      advice: selectedAdvice,
      actualCost: actualCost.trim(),
      receivedCost: receivedCost.trim(),
      balanceCost: balanceCost.trim()
    };

    const stored = localStorage.getItem('hb_demo_prescriptions') || '[]';
    const list = JSON.parse(stored) as Prescription[];
    const updatedList = list.map(rx => {
      if (rx.prescriptionId === selectedRx.prescriptionId) {
        return { ...rx, ...updatedData };
      }
      return rx;
    });
    localStorage.setItem('hb_demo_prescriptions', JSON.stringify(updatedList));
    setAllPrescriptions(updatedList);
    setIsOrderSent(true);
    
    syncOrderToGoogleSheet(selectedRx, updatedData);
    
    const url = `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');

    setSelectedRx(null);
    setWorkflowStep('input');
    alert("WhatsApp sent successfully! Order desk closed.");
  };

  const handleNotifyCollectionWhatsApp = async () => {
    if (!selectedRx) return;
    const cleanPhone = String(selectedRx.mobile || '').replace(/\D/g, '');
    const targetPhone = cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone;
    
    const msg = [
      `🏥 *Himabindhu Eye Testing & Opticals*`,
      `📍 Dharmavaram, Andhra Pradesh | 📞 9010408092`,
      ``,
      `🥳🥳🥳🥳🥳🥳🥳🥳`,
      `🎉 *SPECTACLES READY FOR COLLECTION*`,
      `🥳🥳🥳🥳🥳🥳🥳🥳`,
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
      `📞 *Helpline:* 9010408092`,
      ``,
      `🥳🥳🥳🥳🥳🥳🥳🥳`,
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
    
    const url = `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const renderRegistrationForm = () => (
    <form onSubmit={handleRegisterPatient} className="p-6 space-y-5 animate-fade-in">
      <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 text-slate-800 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-teal-600">
          {editingPatientId ? 'Update Patient Details' : 'Register New Patient'}
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Patient ID (Auto-Generated)</label>
            <input
              type="text"
              value={nextPatientId || 'HB...'}
              disabled
              className="w-full border border-slate-200 bg-slate-100 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-2">Patient Full Name</label>
            <input
              type="text"
              placeholder="e.g. Banu Prakash"
              value={regName}
              onChange={(e) => setRegName(e.target.value)}
              required
              className="w-full border border-slate-200 bg-white rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition shadow-xs"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-wider mb-2">Mobile / Phone Number</label>
            <input
              type="tel"
              placeholder="e.g. 9949334443"
              value={regMobile}
              onChange={(e) => setRegMobile(e.target.value)}
              required
              pattern="[0-9]{10}"
              title="Please enter a 10-digit mobile number"
              className="w-full border border-slate-200 bg-white rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition shadow-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-2">Age</label>
              <input
                type="number"
                placeholder="e.g. 28"
                value={regAge}
                onChange={(e) => setRegAge(e.target.value)}
                required
                min="1"
                max="120"
                className="w-full border border-slate-200 bg-white rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition shadow-xs"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-2">Gender</label>
              <select
                value={regGender}
                onChange={(e) => setRegGender(e.target.value)}
                className="w-full border border-slate-200 bg-white rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition shadow-xs"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        {editingPatientId && (
          <button
            type="button"
            onClick={async () => {
              setEditingPatientId(null);
              setRegName('');
              setRegMobile('');
              setRegAge('');
              setRegGender('Male');
              const nextId = await generateNextPatientId(true);
              setNextPatientId(nextId);
              setReceptionTab('orders');
            }}
            className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
          >
            Cancel Edit
          </button>
        )}
        {!editingPatientId && (
          <button
            type="button"
            onClick={() => setReceptionTab('orders')}
            className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isRegistering}
          className="px-5 py-2.5 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition cursor-pointer flex items-center gap-1.5 shadow-sm"
        >
          {isRegistering ? (
            <>
              <div className="w-3.5 h-3.5 animate-spin border-2 border-white border-t-transparent rounded-full"></div>
              <span>{editingPatientId ? 'Updating...' : 'Registering...'}</span>
            </>
          ) : (
            <span>{editingPatientId ? 'Update Patient' : 'Register Patient'}</span>
          )}
        </button>
      </div>
    </form>
  );

  if (userProfile?.role === 'receptionist') {
    const filteredRx = allPrescriptions.filter(rx => {
      if (rx.isPlaceholder) return false;
      const searchLower = (receptionSearch || '').toLowerCase();
      const pName = (rx.patientName || '').toLowerCase();
      const pId = (rx.prescriptionId || '').toLowerCase();
      const pMobile = String(rx.mobile || '');
      
      return pName.includes(searchLower) || 
             pId.includes(searchLower) || 
             pMobile.includes(receptionSearch);
    });

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

        <div className="w-full">
          {/* Main Panel: Prescription/Patient Queue & Patient Registration */}
          <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
            {/* Ultra Luxury Header Tabs */}
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-5 border-b border-slate-800/80 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10">
                
                {/* Segmented Control / Luxury Buttons */}
                <div className="flex items-center p-1.5 bg-slate-800/60 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-inner w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setReceptionTab('orders')}
                    className={`relative px-6 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all duration-500 ease-out overflow-hidden flex items-center justify-center gap-2 flex-1 sm:flex-none ${
                      receptionTab === 'orders' 
                        ? 'text-white shadow-[0_0_20px_rgba(20,184,166,0.25)]' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/30'
                    }`}
                  >
                    {receptionTab === 'orders' && (
                      <span className="absolute inset-0 bg-gradient-to-r from-teal-500 to-emerald-400 opacity-90 rounded-xl"></span>
                    )}
                    <Glasses className={`w-4 h-4 relative z-10 ${receptionTab === 'orders' ? 'text-white animate-pulse' : ''}`} />
                    <span className="relative z-10">Spectacle Queue</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={async () => {
                      setEditingPatientId(null);
                      setRegName('');
                      setRegMobile('');
                      setRegAge('');
                      setRegGender('Male');
                      setReceptionTab('register');
                      const nextId = await generateNextPatientId(isDemoMode);
                      setNextPatientId(nextId);
                    }}
                    className={`relative px-6 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all duration-500 ease-out overflow-hidden flex items-center justify-center gap-2 flex-1 sm:flex-none ${
                      receptionTab === 'register' 
                        ? 'text-white shadow-[0_0_20px_rgba(234,179,8,0.25)]' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/30'
                    }`}
                  >
                    {receptionTab === 'register' && (
                      <span className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-400 opacity-90 rounded-xl"></span>
                    )}
                    <User className={`w-4 h-4 relative z-10 ${receptionTab === 'register' ? 'text-white animate-bounce' : ''}`} />
                    <span className="relative z-10">{editingPatientId ? 'Edit Patient' : 'Register New'}</span>
                  </button>
                </div>

                {receptionTab === 'orders' && (
                  <div className="relative shrink-0 w-full sm:max-w-[240px]">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <Search className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      placeholder="Search Name or Mobile..."
                      value={receptionSearch}
                      onChange={(e) => setReceptionSearch(e.target.value)}
                      className="w-full bg-slate-800/80 backdrop-blur-md border border-slate-700/80 focus:bg-white text-slate-200 focus:text-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold focus:outline-hidden transition shadow-inner"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[550px] divide-y divide-slate-100 min-h-[300px]">
              {receptionTab === 'orders' ? (
                loading ? (
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
                )
              ) : (
                renderRegistrationForm()
              )}
            </div>
          </div>
        </div>

        {/* Spectacle Customizer Desk Modal */}
        {selectedRx && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in overflow-y-auto">
            <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 max-w-2xl w-full my-auto space-y-6 relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setSelectedRx(null)}
                className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition"
              >
                <X className="w-4 h-4" />
              </button>
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

                {workflowStep === 'input' && (
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    {/* Eyesight Details Section */}
                    <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 space-y-4">
                      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2">
                        <span className="w-1 h-3.5 bg-teal-600 rounded"></span>
                        <h4 className="text-[10.5px] font-extrabold text-slate-800 uppercase tracking-wider">
                          Ocular Refraction Details (Eyesight)
                        </h4>
                      </div>

                      <div className="space-y-4">
                        {/* Right Eye (OD) */}
                        <div>
                          <span className="text-[9px] font-black text-teal-600 uppercase tracking-wider block mb-2 font-mono">
                            Right Eye (R.E. / OD)
                          </span>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">SPH</label>
                              <input
                                type="text"
                                value={reSphDist || '—'}
                                readOnly
                                className="w-full bg-slate-100 rounded-lg px-2 py-1 text-xs font-bold text-slate-600 border border-transparent cursor-not-allowed text-center"
                              />
                            </div>
                            <div>
                              <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">CYL</label>
                              <input
                                type="text"
                                value={reCylDist || '—'}
                                readOnly
                                className="w-full bg-slate-100 rounded-lg px-2 py-1 text-xs font-bold text-slate-600 border border-transparent cursor-not-allowed text-center"
                              />
                            </div>
                            <div>
                              <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">AXIS</label>
                              <input
                                type="text"
                                value={reAxisDist || '—'}
                                readOnly
                                className="w-full bg-slate-100 rounded-lg px-2 py-1 text-xs font-bold text-slate-600 border border-transparent cursor-not-allowed text-center"
                              />
                            </div>
                            <div>
                              <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">ADD</label>
                              <input
                                type="text"
                                value={reAdd || '—'}
                                readOnly
                                className="w-full bg-slate-100 rounded-lg px-2 py-1 text-xs font-bold text-slate-600 border border-transparent cursor-not-allowed text-center"
                              />
                            </div>
                            <div>
                              <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">Vision (D)</label>
                              <input
                                type="text"
                                value={reVisionDist || '—'}
                                readOnly
                                className="w-full bg-slate-100 rounded-lg px-2 py-1 text-xs font-bold text-slate-600 border border-transparent cursor-not-allowed text-center"
                              />
                            </div>
                            <div>
                              <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">Vision (N)</label>
                              <input
                                type="text"
                                value={reVisionNear || '—'}
                                readOnly
                                className="w-full bg-slate-100 rounded-lg px-2 py-1 text-xs font-bold text-slate-600 border border-transparent cursor-not-allowed text-center"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Left Eye (OS) */}
                        <div>
                          <span className="text-[9px] font-black text-teal-600 uppercase tracking-wider block mb-2 font-mono">
                            Left Eye (L.E. / OS)
                          </span>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">SPH</label>
                              <input
                                type="text"
                                value={leSphDist || '—'}
                                readOnly
                                className="w-full bg-slate-100 rounded-lg px-2 py-1 text-xs font-bold text-slate-600 border border-transparent cursor-not-allowed text-center"
                              />
                            </div>
                            <div>
                              <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">CYL</label>
                              <input
                                type="text"
                                value={leCylDist || '—'}
                                readOnly
                                className="w-full bg-slate-100 rounded-lg px-2 py-1 text-xs font-bold text-slate-600 border border-transparent cursor-not-allowed text-center"
                              />
                            </div>
                            <div>
                              <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">AXIS</label>
                              <input
                                type="text"
                                value={leAxisDist || '—'}
                                readOnly
                                className="w-full bg-slate-100 rounded-lg px-2 py-1 text-xs font-bold text-slate-600 border border-transparent cursor-not-allowed text-center"
                              />
                            </div>
                            <div>
                              <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">ADD</label>
                              <input
                                type="text"
                                value={leAdd || '—'}
                                readOnly
                                className="w-full bg-slate-100 rounded-lg px-2 py-1 text-xs font-bold text-slate-600 border border-transparent cursor-not-allowed text-center"
                              />
                            </div>
                            <div>
                              <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">Vision (D)</label>
                              <input
                                type="text"
                                value={leVisionDist || '—'}
                                readOnly
                                className="w-full bg-slate-100 rounded-lg px-2 py-1 text-xs font-bold text-slate-600 border border-transparent cursor-not-allowed text-center"
                              />
                            </div>
                            <div>
                              <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">Vision (N)</label>
                              <input
                                type="text"
                                value={leVisionNear || '—'}
                                readOnly
                                className="w-full bg-slate-100 rounded-lg px-2 py-1 text-xs font-bold text-slate-600 border border-transparent cursor-not-allowed text-center"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Pupillary Distance (PD) */}
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Pupillary Distance (PD) mm</label>
                          <input
                            type="text"
                            value={pd || '—'}
                            readOnly
                            className="w-full bg-slate-100 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-600 border border-transparent cursor-not-allowed text-center"
                          />
                        </div>
                      </div>
                    </div>

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

                    {/* Actual Cost */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Actual Cost (INR)
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-bold text-xs">
                          ₹
                        </span>
                        <input
                          type="text"
                          placeholder="e.g. 1500"
                          value={actualCost}
                          onChange={(e) => {
                            const val = e.target.value;
                            setActualCost(val);
                            const act = parseFloat(val) || 0;
                            const rec = parseFloat(receivedCost) || 0;
                            setBalanceCost(String(act - rec));
                          }}
                          className="w-full border border-slate-200 bg-white rounded-xl pl-8 pr-4 py-2.5 text-xs font-extrabold text-slate-800 focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition shadow-xs"
                        />
                      </div>
                    </div>

                    {/* Received Cost */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Received Amount (INR)
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-bold text-xs">
                          ₹
                        </span>
                        <input
                          type="text"
                          placeholder="e.g. 1000"
                          value={receivedCost}
                          onChange={(e) => {
                            const val = e.target.value;
                            setReceivedCost(val);
                            const act = parseFloat(actualCost) || 0;
                            const rec = parseFloat(val) || 0;
                            setBalanceCost(String(act - rec));
                          }}
                          className="w-full border border-slate-200 bg-white rounded-xl pl-8 pr-4 py-2.5 text-xs font-extrabold text-slate-800 focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition shadow-xs"
                        />
                      </div>
                    </div>

                    {/* Balance Cost */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Balance Due (INR)
                      </label>
                      <div className="relative font-bold">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-450 text-xs">
                          ₹
                        </span>
                        <input
                          type="text"
                          value={balanceCost}
                          disabled
                          className={`w-full border rounded-xl pl-8 pr-4 py-2.5 text-xs font-black cursor-not-allowed transition ${
                            parseFloat(balanceCost) > 0 
                              ? 'bg-red-50 border-red-200 text-red-800 shadow-xs' 
                              : 'bg-emerald-50 border-emerald-250 text-emerald-800 shadow-xs'
                          }`}
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

                    {/* Save Button */}
                    <div className="pt-4 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={handleSaveOrder}
                        disabled={isUpdatingOrder}
                        className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-sm cursor-pointer transition"
                      >
                        <Save className="w-4.5 h-4.5" />
                        <span>{isUpdatingOrder ? "Saving to Sheets..." : "Save"}</span>
                      </button>
                    </div>
                  </div>
                )}

                {workflowStep === 'whatsapp' && (
                  <div className="space-y-6 pt-4 border-t border-slate-100 flex flex-col items-center justify-center py-6">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-2 animate-bounce">
                      <ShieldCheck className="w-8 h-8" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-black text-slate-800">Successfully Saved!</h3>
                      <p className="text-[11px] text-slate-500 mt-1 px-4">
                        Order details stored in Google Sheets. You can now send a confirmation.
                      </p>
                    </div>

                    <div className="w-full space-y-3 mt-4">
                      <button
                        type="button"
                        onClick={handleSendOrderWhatsApp}
                        className="w-full py-3 bg-[#25D366] hover:bg-[#20b858] text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-sm cursor-pointer transition"
                      >
                        <MessageCircle className="w-4.5 h-4.5 text-white" />
                        <span>Send Order via WhatsApp</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedRx(null);
                          setWorkflowStep('input');
                        }}
                        className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition cursor-pointer text-center"
                      >
                        Skip & Close Desk
                      </button>
                    </div>
                  </div>
                )}
            </div>
          </div>
        )}
        {registeredPatientForWhatsApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
            <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 max-w-md w-full space-y-6 text-center">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black text-slate-900">Patient Registered Successfully!</h3>
                <p className="text-xs text-slate-400 mt-1">Details synced to Google Sheets</p>
              </div>

              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 text-left space-y-2.5 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Patient Name</span>
                  <span className="font-extrabold text-slate-900">{registeredPatientForWhatsApp.name}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Patient ID</span>
                    <span className="font-bold text-slate-900 font-mono">{registeredPatientForWhatsApp.patientId}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mobile Number</span>
                    <span className="font-bold text-slate-900 font-mono">{registeredPatientForWhatsApp.mobile}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    const cleanPhone = String(registeredPatientForWhatsApp.mobile || '').replace(/\D/g, '');
                    const targetPhone = cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone;
                    const msg = [
                      `🏥 *Himabindhu Eye Testing & Opticals*`,
                      `📍 Dharmavaram, Andhra Pradesh | 📞 9010408092`,
                      ``,
                      `🌟🌟🌟🌟🌟🌟🌟🌟`,
                      `🎉 *APPOINTMENT BOOKED*`,
                      `🌟🌟🌟🌟🌟🌟🌟🌟`,
                      ``,
                      `Dear *${registeredPatientForWhatsApp.name}*,`,
                      `Your appointment is successfully booked!`,
                      ``,
                      `🆔 *Patient ID:* ${registeredPatientForWhatsApp.patientId}`,
                      `📞 *Mobile:* ${registeredPatientForWhatsApp.mobile}`,
                      `📅 *Date:* ${registeredPatientForWhatsApp.date}`,
                      ``,
                      `🌟🌟🌟🌟🌟🌟🌟🌟`,
                      `_Thank you for choosing Himabindhu Opticals!_`
                    ].join('\n');
                    const url = `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodeURIComponent(msg)}`;
                    window.open(url, '_blank');
                    setRegisteredPatientForWhatsApp(null);
                  }}
                  className="w-full py-3 bg-[#25D366] hover:bg-[#20b858] text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-sm cursor-pointer transition"
                >
                  <MessageCircle className="w-4.5 h-4.5 text-white" />
                  <span>Send Welcome WhatsApp Message</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRegisteredPatientForWhatsApp(null)}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Go to Spectacle Queue
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Ready Order Text Details Modal */}
        {inspectReadyRx && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
            <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 max-w-md w-full space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Ready For Delivery</h3>
                    <p className="text-[10px] text-slate-500 font-mono">Order: {inspectReadyRx.prescriptionId}</p>
                  </div>
                </div>
                <button
                  onClick={() => setInspectReadyRx(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-50 rounded-2xl p-4 space-y-3 border border-slate-100">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Patient Name</span>
                    <span className="font-extrabold text-slate-900 text-sm">{inspectReadyRx.patientName}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Contact Mobile</span>
                      <span className="font-bold text-slate-700 font-mono text-xs">{inspectReadyRx.mobile}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Patient ID</span>
                      <span className="font-bold text-slate-700 font-mono text-xs">{inspectReadyRx.patientId}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-indigo-50/40 rounded-2xl p-3 border border-indigo-100 space-y-2">
                  <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider block pl-1">Ocular Refraction</span>
                  <table className="w-full text-center text-[10px]">
                    <thead>
                      <tr className="text-slate-400 border-b border-indigo-100/60">
                        <th className="font-semibold pb-1.5 text-left pl-2">Eye</th>
                        <th className="font-semibold pb-1.5">SPH</th>
                        <th className="font-semibold pb-1.5">CYL</th>
                        <th className="font-semibold pb-1.5">AXIS</th>
                        <th className="font-semibold pb-1.5">ADD</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-700 font-bold">
                      <tr className="border-b border-indigo-50">
                        <td className="py-2 text-slate-500 font-black text-left pl-2">R.E.</td>
                        <td className="py-2">{inspectReadyRx.rightEyeData?.distance?.sph || '—'}</td>
                        <td className="py-2">{inspectReadyRx.rightEyeData?.distance?.cyl || '—'}</td>
                        <td className="py-2">{inspectReadyRx.rightEyeData?.distance?.axis || '—'}</td>
                        <td className="py-2 text-indigo-600">{inspectReadyRx.rightEyeData?.add ? `+${inspectReadyRx.rightEyeData.add}` : '—'}</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-slate-500 font-black text-left pl-2">L.E.</td>
                        <td className="py-2">{inspectReadyRx.leftEyeData?.distance?.sph || '—'}</td>
                        <td className="py-2">{inspectReadyRx.leftEyeData?.distance?.cyl || '—'}</td>
                        <td className="py-2">{inspectReadyRx.leftEyeData?.distance?.axis || '—'}</td>
                        <td className="py-2 text-indigo-600">{inspectReadyRx.leftEyeData?.add ? `+${inspectReadyRx.leftEyeData.add}` : '—'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="bg-amber-50/30 rounded-2xl p-4 space-y-3 border border-amber-100">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[9px] font-bold text-amber-600/70 uppercase tracking-wider block">Frame Type</span>
                      <span className="font-bold text-slate-800 text-xs">{inspectReadyRx.frameName || 'Standard Frame'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-amber-600/70 uppercase tracking-wider block">Lens Type</span>
                      <span className="font-bold text-slate-800 text-xs">{inspectReadyRx.lensType || 'Standard Lens'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100 flex justify-between items-center">
                  <div>
                    <span className="text-[9px] font-bold text-emerald-600/70 uppercase tracking-wider block">Amount Paid</span>
                    <span className="font-extrabold text-emerald-800 text-lg">₹ {inspectReadyRx.receivedCost || inspectReadyRx.actualCost}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-bold text-emerald-600/70 uppercase tracking-wider block">Balance</span>
                    <span className="font-extrabold text-emerald-600 text-xs">Nil / Paid in Full</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setInspectReadyRx(null)}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-md"
              >
                Close Details
              </button>
            </div>
          </div>
        )}
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
          userProfile?.role === 'doctor' ? 'col-span-1' : 'col-span-1 md:col-span-2'
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
          userProfile?.role === 'doctor' ? 'col-span-1' : 'col-span-1 md:col-span-2'
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
        {userProfile?.role === 'doctor' && (
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

      {/* Patients Queue registered by Receptionist */}
      {(userProfile?.role === 'admin' || userProfile?.role === 'doctor') && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mt-8 animate-fade-in" id="receptionist-queue-desk">
          <div className="p-5 bg-slate-900 border-b border-slate-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-amber-600 rounded-lg text-white">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-white">Today's Registered Patients (Welcome Desk Queue)</h3>
                <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                  Patients registered today by the receptionist. Click "Write Prescription" to complete refraction diagnostic details.
                </p>
              </div>
            </div>
            
            <button
              onClick={async () => {
                setEditingPatientId(null);
                setRegName('');
                setRegMobile('');
                setRegAge('');
                setRegGender('Male');
                setReceptionTab(receptionTab === 'register' ? 'orders' : 'register');
                if (receptionTab !== 'register') {
                  const nextId = await generateNextPatientId(true);
                  setNextPatientId(nextId);
                }
              }}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-2 shadow-sm"
            >
              {receptionTab === 'register' ? 'Close Form' : 'Register New Patient'}
            </button>
          </div>

          <div className="overflow-x-auto min-h-[150px]">
            {receptionTab === 'register' || editingPatientId ? (
              <div className="border-b border-slate-100 bg-white">
                {renderRegistrationForm()}
              </div>
            ) : null}
            {(() => {
              const todayString = new Date().toISOString().split('T')[0];
              const todayPatients = patientsList.filter(p => p.date === todayString);

              if (todayPatients.length === 0) {
                return (
                  <div className="p-12 text-center text-slate-450 font-bold">
                    <p className="text-xs uppercase tracking-wider">No patient registrations recorded today</p>
                    <p className="text-[11px] text-slate-400 mt-1 italic font-normal">Patients registered at the welcome desk will appear here in real-time.</p>
                  </div>
                );
              }

              return (
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-150 text-[10px] text-slate-455 font-bold uppercase tracking-widest">
                      <th className="py-3.5 px-6">Patient ID</th>
                      <th className="py-3.5 px-6">Patient Name</th>
                      <th className="py-3.5 px-6">Contact / Mobile</th>
                      <th className="py-3.5 px-6">Age / Gender</th>
                      <th className="py-3.5 px-6">Status</th>
                      <th className="py-3.5 px-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 text-slate-700 font-semibold font-sans">
                    {todayPatients.map((patient) => {
                      const hasRx = allPrescriptions.some(rx => rx.patientId === patient.patientId);
                      return (
                        <tr key={patient.patientId} className="hover:bg-slate-50/50 transition">
                          <td className="py-4 px-6">
                            <span className="font-mono font-bold text-xs text-amber-600 bg-amber-50/60 border border-amber-200 px-2.5 py-1 rounded">
                              {patient.patientId}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-slate-900 font-bold">{patient.name}</td>
                          <td className="py-4 px-6 font-mono text-slate-550">{patient.mobile}</td>
                          <td className="py-4 px-6 text-slate-550">{patient.age} Yrs / {patient.gender}</td>
                          <td className="py-4 px-6">
                            {hasRx ? (
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-[9.5px] font-black uppercase tracking-wider">
                                🟢 Prescribed
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-md text-[9.5px] font-black uppercase tracking-wider animate-pulse">
                                🟡 Waiting
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-right flex items-center justify-end gap-2.5">
                            {hasRx ? (
                              <div className="flex items-center gap-2">
                                <span className="text-slate-400 text-xs font-medium italic mr-1">Completed</span>
                                <button
                                  type="button"
                                  onClick={() => handleEditPatient(patient)}
                                  className="p-1.5 text-teal-600 hover:bg-teal-50 hover:text-teal-700 rounded-lg transition cursor-pointer flex items-center justify-center"
                                  title="Edit patient details"
                                >
                                  <Edit className="w-4.5 h-4.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeletePatientFromQueue(patient.patientId)}
                                  className="p-1.5 text-rose-500 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition cursor-pointer flex items-center justify-center"
                                  title="Remove patient from welcome desk queue"
                                >
                                  <Trash2 className="w-4.5 h-4.5" />
                                </button>
                              </div>
                            ) : (
                              <>
                                {userProfile?.role === 'doctor' && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (setPrefilledPatient) {
                                        setPrefilledPatient(patient);
                                        setActiveTab('prescription');
                                      }
                                    }}
                                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-[10.5px] font-black uppercase tracking-wider transition cursor-pointer shadow-sm hover:scale-[1.02]"
                                  >
                                    Write Prescription
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleEditPatient(patient)}
                                  className="p-1.5 text-teal-600 hover:bg-teal-50 hover:text-teal-700 rounded-lg transition cursor-pointer flex items-center justify-center"
                                  title="Edit patient details"
                                >
                                  <Edit className="w-4.5 h-4.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeletePatientFromQueue(patient.patientId)}
                                  className="p-1.5 text-rose-500 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition cursor-pointer flex items-center justify-center"
                                  title="Remove patient from welcome desk queue"
                                >
                                  <Trash2 className="w-4.5 h-4.5" />
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              );
            })()}
          </div>
        </div>
      )}

    </div>
  );
}
