import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Prescription, PrescriptionPDFViewerPanel, EyePower } from '../components/PrescriptionPDF';
import { generateNextPrescriptionId } from '../utils/idGenerators';
import { 
  History, 
  Search, 
  FileText, 
  Eye, 
  Edit3, 
  Calendar, 
  RefreshCw, 
  CheckSquare, 
  Save, 
  Loader2,
  Trash2,
  X,
  AlertCircle,
  CheckCircle,
  CheckCircle2
} from 'lucide-react';
import { 
  generateSphCylOptions, 
  axisOptions, 
  distVisionOptions, 
  nearVisionOptions, 
  addOptions 
} from '../utils/refractionOptions';
import { CustomPowerSelect } from '../components/CustomPowerSelect';

const { positives, negatives } = generateSphCylOptions();

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwin877dfuTnQuvzaSifRtDBtkqbsUG7ULF2RxwJH9-t65AUOC9QAs_quXTgPdmncJW/exec";

interface PatientHistoryProps {
  selectedRxFromOutside: Prescription | null;
  clearOutsideSelection: () => void;
}

export default function PatientHistory({ selectedRxFromOutside, clearOutsideSelection }: PatientHistoryProps) {
  const { isDemoMode, userProfile } = useAuth();
  
  const [allPrescriptions, setAllPrescriptions] = useState<Prescription[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedRx, setSelectedRx] = useState<Prescription | null>(null);
  const [inspectReadyRx, setInspectReadyRx] = useState<Prescription | null>(null);

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editNotes, setEditNotes] = useState('');
  const [editPd, setEditPd] = useState('');
  const [editAdvice, setEditAdvice] = useState<string[]>([]);
  
  // Spectacle Order States for edit
  const [frameName, setFrameName] = useState('');
  const [lensType, setLensType] = useState('');
  const [actualCost, setActualCost] = useState('');
  const [receivedCost, setReceivedCost] = useState('');
  const [balanceCost, setBalanceCost] = useState('');
  const [orderStatus, setOrderStatus] = useState<'Pending' | 'Ready'>('Pending');
  
  // Right Eye (RE / OD) Data States for edit
  const [reSphDist, setReSphDist] = useState('');
  const [reCylDist, setReCylDist] = useState('');
  const [reAxisDist, setReAxisDist] = useState('');
  const [reVisionDist, setReVisionDist] = useState('');

  const [reSphNear, setReSphNear] = useState('');
  const [reCylNear, setReCylNear] = useState('');
  const [reAxisNear, setReAxisNear] = useState('');
  const [reVisionNear, setReVisionNear] = useState('');
  
  const [reAdd, setReAdd] = useState('');

  // Left Eye (LE / OS) Data States for edit
  const [leSphDist, setLeSphDist] = useState('');
  const [leCylDist, setLeCylDist] = useState('');
  const [leAxisDist, setLeAxisDist] = useState('');
  const [leVisionDist, setLeVisionDist] = useState('');

  const [leSphNear, setLeSphNear] = useState('');
  const [leCylNear, setLeCylNear] = useState('');
  const [leAxisNear, setLeAxisNear] = useState('');
  const [leVisionNear, setLeVisionNear] = useState('');

  const [leAdd, setLeAdd] = useState('');

  const [isUpdating, setIsUpdating] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; title: string; message: string } | null>(null);

  const adviceOptions = [
    "MR8",
    "dual corth",
    "Marry blue",
    "Blue light PG - progressive",
    "Blue light KT - progressive",
    "Blue Light Protection",
    "Blue Cut Lens",
    "CR PG HC",
    "CR KT HC",
    "CR HMC",
    "CR HC",
    "CR KT HMC",
    "CR KT PG HC",
    "Contact Lens",
    "Progressive Lens"
  ];

  const fetchPrescriptionsList = async () => {
    setLoading(true);
    let rxList: Prescription[] = [];
    let patientsList: any[] = [];
    let loadedRxFromSheets = false;
    let loadedPatientsFromSheets = false;

    // 1. Instant Load from LocalStorage for Speed (Stale-While-Revalidate)
    const storedPatients = localStorage.getItem('hb_demo_patients');
    const storedRx = localStorage.getItem('hb_demo_prescriptions');
    if (storedPatients) {
      try {
        patientsList = JSON.parse(storedPatients);
      } catch (e) {}
    }
    if (storedRx) {
      try {
        rxList = JSON.parse(storedRx);
      } catch (e) {}
    }
    // Update UI immediately with cached data so it feels lightning fast
    const mergedListFast = [...rxList];
    patientsList.forEach((patient) => {
      const hasRx = rxList.some(rx => rx.patientId === patient.patientId);
      if (!hasRx) {
        mergedListFast.push({
          prescriptionId: `PENDING-${patient.patientId}`,
          patientId: patient.patientId,
          patientName: patient.name,
          mobile: patient.mobile,
          age: patient.age,
          gender: patient.gender,
          date: patient.date,
          rightEyeData: { distance: { sph: "", cyl: "", axis: "", vision: "6/6" }, near: { sph: "", cyl: "", axis: "", vision: "J1" }, add: "" },
          leftEyeData: { distance: { sph: "", cyl: "", axis: "", vision: "6/6" }, near: { sph: "", cyl: "", axis: "", vision: "J1" }, add: "" },
          pd: "", advice: [], notes: "", frameName: "", lensType: "", orderPrice: "", orderStatus: "Pending", isPlaceholder: true
        } as any);
      }
    });
    
    if (mergedListFast.length > 0) {
      setAllPrescriptions(mergedListFast.sort((a, b) => b.prescriptionId.localeCompare(a.prescriptionId) || new Date(b.date).getTime() - new Date(a.date).getTime()));
      setLoading(false); // Hide spinner instantly!
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

    // Background Sync to pull fresh data silently
    fetch(`${APPS_SCRIPT_URL}?action=syncAll`)
      .then(res => res.json())
      .then(json => {
        let rawData = Array.isArray(json) ? json : (json.success && Array.isArray(json.data) ? json.data : []);
        if (rawData.length > 0) {
          const freshPatients = rawData.map(mapPatient);
          const freshRx = rawData.map(mapPrescription);
          
          localStorage.setItem('hb_demo_patients', JSON.stringify(freshPatients));
          localStorage.setItem('hb_demo_prescriptions', JSON.stringify(freshRx));
          
          // Re-merge
          const newMergedList: Prescription[] = [...freshRx];
          freshPatients.forEach((patient) => {
            const hasRx = freshRx.some(rx => rx.patientId === patient.patientId);
            if (!hasRx) {
              const placeholderRx: Prescription = {
                prescriptionId: `PENDING-${patient.patientId}`,
                patientId: patient.patientId,
                patientName: patient.name,
                mobile: patient.mobile,
                age: patient.age,
                gender: patient.gender,
                date: patient.date,
                rightEyeData: { distance: { sph: "", cyl: "", axis: "", vision: "6/6" }, near: { sph: "", cyl: "", axis: "", vision: "J1" }, add: "" },
                leftEyeData: { distance: { sph: "", cyl: "", axis: "", vision: "6/6" }, near: { sph: "", cyl: "", axis: "", vision: "J1" }, add: "" },
                pd: "", advice: [], notes: "", frameName: "", lensType: "", orderPrice: "", orderStatus: "Pending", isPlaceholder: true
              } as any;
              newMergedList.push(placeholderRx);
            }
          });
          
          newMergedList.sort((a, b) => {
            const dateA = new Date(a.date).getTime() || 0;
            const dateB = new Date(b.date).getTime() || 0;
            if (dateB !== dateA) return dateB - dateA;
            const isPlaceholderA = (a as any).isPlaceholder ? 1 : 0;
            const isPlaceholderB = (b as any).isPlaceholder ? 1 : 0;
            if (isPlaceholderB !== isPlaceholderA) return isPlaceholderB - isPlaceholderA;
            return b.prescriptionId.localeCompare(a.prescriptionId);
          });
          
          setAllPrescriptions(newMergedList);
        }
      })
      .catch(err => console.warn("Background sync failed:", err));

    if (mergedListFast.length === 0) {
      setLoading(false);
    }

  };

  useEffect(() => {
    fetchPrescriptionsList();
  }, [isDemoMode]);

  // Handle outside deep redirects (e.g. from Dashboard table link)
  useEffect(() => {
    if (selectedRxFromOutside) {
      setSelectedRx(selectedRxFromOutside);
      clearOutsideSelection();
    }
  }, [selectedRxFromOutside]);

  const handleInspect = (rx: Prescription) => {
    setSelectedRx(rx);
    setIsEditing(false);
  };

  const handleEditInitialize = (rx: Prescription) => {
    setIsEditing(true);
    setEditNotes(rx.notes || '');
    setEditPd(rx.pd || '');
    setEditAdvice(rx.advice || []);
    setFrameName(rx.frameName || '');
    setLensType(rx.lensType || '');
    setActualCost(rx.actualCost || '');
    setReceivedCost(rx.receivedCost || '');
    setBalanceCost(rx.balanceCost || '');
    setOrderStatus(rx.orderStatus || 'Pending');
    
    // SPH/CYL OD
    setReSphDist(rx.rightEyeData?.distance?.sph || '');
    setReCylDist(rx.rightEyeData?.distance?.cyl || '');
    setReAxisDist(rx.rightEyeData?.distance?.axis || '');
    setReVisionDist(rx.rightEyeData?.distance?.vision || '6/6');

    setReSphNear(rx.rightEyeData?.near?.sph || '');
    setReCylNear(rx.rightEyeData?.near?.cyl || '');
    setReAxisNear(rx.rightEyeData?.near?.axis || '');
    setReVisionNear(rx.rightEyeData?.near?.vision || 'J1');
    setReAdd(rx.rightEyeData?.add || '');

    // SPH/CYL OS
    setLeSphDist(rx.leftEyeData?.distance?.sph || '');
    setLeCylDist(rx.leftEyeData?.distance?.cyl || '');
    setLeAxisDist(rx.leftEyeData?.distance?.axis || '');
    setLeVisionDist(rx.leftEyeData?.distance?.vision || '6/6');

    setLeSphNear(rx.leftEyeData?.near?.sph || '');
    setLeCylNear(rx.leftEyeData?.near?.cyl || '');
    setLeAxisNear(rx.leftEyeData?.near?.axis || '');
    setLeVisionNear(rx.leftEyeData?.near?.vision || 'J1');
    setLeAdd(rx.leftEyeData?.add || '');
  };

  const handleToggleAdvice = (item: string) => {
    if (editAdvice.includes(item)) {
      setEditAdvice(editAdvice.filter(x => x !== item));
    } else {
      setEditAdvice([...editAdvice, item]);
    }
  };

  const handleUpdatePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRx) return;

    setIsUpdating(true);

    const updatedRightData: EyePower = {
      distance: { sph: reSphDist, cyl: reCylDist, axis: reAxisDist, vision: reVisionDist },
      near: { sph: "", cyl: "", axis: "", vision: reVisionNear },
      add: reAdd
    };

    const updatedLeftData: EyePower = {
      distance: { sph: leSphDist, cyl: leCylDist, axis: leAxisDist, vision: leVisionDist },
      near: { sph: "", cyl: "", axis: "", vision: leVisionNear },
      add: leAdd
    };

    try {
      const isPlaceholder = selectedRx.isPlaceholder || selectedRx.prescriptionId.startsWith('PENDING-');

      // Always update the existing record to prevent duplicating rows in Google Sheets
      const finalRx: Prescription = {
        ...selectedRx,
        rightEyeData: updatedRightData,
        leftEyeData: updatedLeftData,
        pd: String(editPd || "").trim(),
        advice: editAdvice,
        notes: String(editNotes || "").trim(),
        frameName: String(frameName || "").trim(),
        lensType: String(lensType || "").trim(),
        actualCost: String(actualCost || "").trim(),
        receivedCost: String(receivedCost || "").trim(),
        balanceCost: String(balanceCost || "").trim(),
        orderStatus: orderStatus,
        isPlaceholder: false // No longer a placeholder once eyesight is added
      };

      const storedRx = localStorage.getItem('hb_demo_prescriptions') || '[]';
      const rxList = JSON.parse(storedRx) as Prescription[];
      const updatedList = rxList.map(item => item.prescriptionId === selectedRx.prescriptionId ? finalRx : item);
      localStorage.setItem('hb_demo_prescriptions', JSON.stringify(updatedList));

      // If it was a placeholder initially, also update the patient status locally
      if (selectedRx.isPlaceholder || selectedRx.prescriptionId.startsWith('PENDING-')) {
        const storedPatients = localStorage.getItem('hb_demo_patients') || '[]';
        try {
          const patients = JSON.parse(storedPatients);
          const updatedPatients = patients.map((p: any) => 
            p.patientId === selectedRx.patientId ? { ...p, status: 'Prescribed' } : p
          );
          localStorage.setItem('hb_demo_patients', JSON.stringify(updatedPatients));
        } catch (patErr) {
          console.error("Failed to update local patient status:", patErr);
        }
      }

      // Sync update/save to Google Sheets
      try {
        const flatData = {
          action: "savePrescription",
          patientId: finalRx.patientId,
          prescriptionId: finalRx.prescriptionId,
          patientName: finalRx.patientName,
          mobile: finalRx.mobile,
          age: finalRx.age,
          gender: finalRx.gender,
          date: finalRx.date,
          reDistanceSph: finalRx.rightEyeData.distance.sph,
          reDistanceCyl: finalRx.rightEyeData.distance.cyl,
          reDistanceAxis: finalRx.rightEyeData.distance.axis,
          reDistanceVision: finalRx.rightEyeData.distance.vision,
          reNearSph: finalRx.rightEyeData.near.sph,
          reNearCyl: finalRx.rightEyeData.near.cyl,
          reNearAxis: finalRx.rightEyeData.near.axis,
          reNearVision: finalRx.rightEyeData.near.vision,
          reAdd: finalRx.rightEyeData.add,
          leDistanceSph: finalRx.leftEyeData.distance.sph,
          leDistanceCyl: finalRx.leftEyeData.distance.cyl,
          leDistanceAxis: finalRx.leftEyeData.distance.axis,
          leDistanceVision: finalRx.leftEyeData.distance.vision,
          leNearSph: finalRx.leftEyeData.near.sph,
          leNearCyl: finalRx.leftEyeData.near.cyl,
          leNearAxis: finalRx.leftEyeData.near.axis,
          leNearVision: finalRx.leftEyeData.near.vision,
          leAdd: finalRx.leftEyeData.add,
          pd: finalRx.pd,
          advice: Array.isArray(finalRx.advice) ? finalRx.advice.join(', ') : finalRx.advice,
          notes: finalRx.notes,
          orderData: {
            frameName: finalRx.frameName,
            lensType: finalRx.lensType,
            actualCost: finalRx.actualCost,
            receivedCost: finalRx.receivedCost,
            orderStatus: finalRx.orderStatus
          }
        };

        await fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(flatData)
        });

        // Fire a saveOrder request to ensure Delivery and Payment statuses are updated 
        // since savePrescription on the backend might ignore order columns
        const orderPayload = {
          action: "saveOrder",
          prescriptionId: finalRx.prescriptionId,
          orderData: {
            frameName: finalRx.frameName,
            lensType: finalRx.lensType,
            actualCost: finalRx.actualCost,
            receivedCost: finalRx.receivedCost,
            orderStatus: finalRx.orderStatus
          }
        };
        await fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(orderPayload)
        });
      } catch (sheetErr) {
        console.warn("Failed to sync prescription to Google Sheets:", sheetErr);
      }

      setSelectedRx(finalRx);
      setIsEditing(false);
      setNotification({
        type: 'success',
        title: isPlaceholder ? "Prescription Saved & Sent to Queue" : "Prescription Updated",
        message: isPlaceholder 
          ? `Prescription ID ${finalRx.prescriptionId} registered successfully and moved to spectacle queue.`
          : "Prescription modified successfully inside registry."
      });
      await fetchPrescriptionsList();
    } catch (e) {
      console.error(e);
      setNotification({
        type: 'error',
        title: "Save Failed",
        message: "Failed to save clinical parameters."
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeletePrescription = async (rx: Prescription) => {
    try {
      // 1. Remove from local prescriptions
      const storedRx = localStorage.getItem('hb_demo_prescriptions') || '[]';
      const rxList = JSON.parse(storedRx) as Prescription[];
      const updatedRxList = rxList.filter(item => item.prescriptionId !== rx.prescriptionId);
      localStorage.setItem('hb_demo_prescriptions', JSON.stringify(updatedRxList));

      // 2. Remove from local patients
      const storedPatients = localStorage.getItem('hb_demo_patients') || '[]';
      const patList = JSON.parse(storedPatients) as any[];
      const updatedPatList = patList.filter(item => item.patientId !== rx.patientId);
      localStorage.setItem('hb_demo_patients', JSON.stringify(updatedPatList));

      // 3. Sync deletions to Google Sheets
      if (!(rx as any).isPlaceholder) {
        fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'deletePrescription', prescriptionId: rx.prescriptionId })
        }).catch(e => console.warn(e));
      }

      fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'deletePatient', patientId: rx.patientId })
      }).catch(e => console.warn(e));

      setSelectedRx(null);
      setNotification({
        type: 'success',
        title: "Record Deleted",
        message: "Patient and Prescription deleted permanently."
      });
      await fetchPrescriptionsList();
    } catch (err) {
      console.error(err);
      setNotification({
        type: 'error',
        title: "Delete Failed",
        message: "Failed to delete record."
      });
    }
  };

  // Safe search lookup
  const filteredRx = allPrescriptions.filter(rx => {
    const q = searchQuery.trim().toLowerCase();
    if (userProfile?.role === 'patient') {
      if (!q) return false;
      return String(rx.mobile) === q || String(rx.patientId).toLowerCase() === q;
    }
    if (!q) return true;
    
    return (
      String(rx.prescriptionId || '').toLowerCase().includes(q) ||
      String(rx.patientName || '').toLowerCase().includes(q) ||
      String(rx.patientId || '').toLowerCase().includes(q) ||
      String(rx.mobile || '').includes(q)
    );
  });

  return (
    <div className="space-y-8 font-sans pt-6">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: Lookup & Search Lists */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5 self-start">
          <div className="flex items-center gap-2.5 mb-4 border-b pb-3 border-gray-150">
            <History className="w-5 h-5 text-slate-800" />
            <h4 className="font-extrabold text-gray-900 text-sm">
              {userProfile?.role === 'patient' ? "Secure Patient Spectacles Portal" : "Patient Rx Registry Archives"}
            </h4>
          </div>

          <div className="relative mb-5">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder={userProfile?.role === 'patient' ? "Enter Patient ID or Mobile..." : "Search Name, Phone, Rx Number, ID..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-xs bg-white text-gray-700 focus:border-blue-800 focus:outline-hidden"
              id="search-history-query"
            />
          </div>

          {loading ? (
            <div className="py-12 text-center text-gray-405 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-slate-800 mb-2" />
              <p className="text-xs">Fetching registered logs...</p>
            </div>
          ) : userProfile?.role === 'patient' && !searchQuery.trim() ? (
            <div className="py-8 px-4 text-center text-gray-500 text-xs leading-relaxed bg-amber-50/20 rounded-xl border border-amber-200">
              <p className="font-bold text-slate-900 mb-1">Verify Your Identity</p>
              Please enter your <strong>10-digit registered mobile number</strong> or your **Patient ID** (e.g. <code>HB-2026-0001</code>) to fetch your spectacle power prescription document securely.
            </div>
          ) : filteredRx.length === 0 ? (
            <div className="py-12 text-center text-gray-450 text-xs">
              {userProfile?.role === 'patient' 
                ? "No matching prescription found. Please verify your exact 10-digit mobile or Patient ID."
                : "No matching records found in this sequence."}
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {filteredRx.map((rx) => {
                const isCurrentSelected = selectedRx?.prescriptionId === rx.prescriptionId;
                const isPlaceholder = (rx as any).isPlaceholder;
                return (
                  <div
                    key={rx.prescriptionId}
                    onClick={() => handleInspect(rx)}
                    className={`p-3 rounded-xl border transition cursor-pointer text-left ${
                      isCurrentSelected 
                        ? 'bg-amber-50/25 border-amber-300 shadow-2xs' 
                        : isPlaceholder
                          ? 'bg-amber-50/5 border-amber-100 hover:border-amber-300'
                          : 'bg-gray-50/50 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-[10px] font-black text-slate-900">
                        {isPlaceholder ? (
                          <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded text-[8.5px] uppercase font-extrabold tracking-wider animate-pulse">
                            Waiting Rx
                          </span>
                        ) : (
                          rx.prescriptionId
                        )}
                      </span>
                      <span className="text-[9px] text-gray-400 font-mono">
                        {rx.date}
                      </span>
                    </div>

                    <h5 className="font-bold text-gray-900 text-xs mt-1 truncate">{rx.patientName}</h5>
                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                      ID: {rx.patientId} • Phone: {rx.mobile}
                    </p>
                    
                    <div className="mt-2.5 flex items-center gap-2 justify-end">
                      {userProfile?.role !== 'patient' && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleInspect(rx);
                              handleEditInitialize(rx);
                            }}
                            className="text-[10px] bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-200 text-teal-700 px-3 py-1.5 rounded-lg font-bold hover:bg-gradient-to-br hover:from-teal-500 hover:to-emerald-600 hover:text-white hover:border-transparent hover:-translate-y-0.5 hover:shadow-md hover:shadow-teal-500/30 transition-all duration-300 ease-out flex items-center gap-1.5 cursor-pointer group"
                          >
                            <Edit3 className="w-3 h-3 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm("Are you sure you want to delete this record?")) {
                                handleDeletePrescription(rx);
                              }
                            }}
                            className="text-[10px] bg-gradient-to-br from-rose-50 to-red-50 border border-red-200 text-red-700 px-3 py-1.5 rounded-lg font-bold hover:bg-gradient-to-br hover:from-rose-500 hover:to-red-600 hover:text-white hover:border-transparent hover:-translate-y-0.5 hover:shadow-md hover:shadow-red-500/30 transition-all duration-300 ease-out flex items-center gap-1.5 cursor-pointer group"
                          >
                            <Trash2 className="w-3 h-3 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-12" />
                            Delete
                          </button>
                        </>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInspect(rx);
                        }}
                        className="text-[10px] bg-gradient-to-br from-slate-50 to-white border border-slate-300 text-slate-700 px-3 py-1.5 rounded-lg font-bold hover:bg-gradient-to-br hover:from-slate-800 hover:to-slate-900 hover:text-white hover:border-transparent hover:-translate-y-0.5 hover:shadow-md hover:shadow-slate-900/30 transition-all duration-300 ease-out flex items-center gap-1.5 cursor-pointer group"
                      >
                        <Eye className="w-3 h-3 transition-transform duration-300 group-hover:scale-110" />
                        {isPlaceholder ? "Add Eyesight" : "Inspect Spec"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>        {/* Right column: Standby view & instructions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm h-full flex flex-col min-h-[350px]">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">Ready for Delivery</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Fully paid orders waiting to be handed over</p>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
              {(() => {
                const readyPaid = allPrescriptions.filter(rx => 
                  rx.orderStatus === 'Ready' && 
                  (parseFloat(rx.balanceCost || '0') <= 0 && parseFloat(rx.actualCost || '0') > 0)
                );
                
                if (readyPaid.length === 0) {
                  return (
                    <div className="bg-white rounded-2xl p-8 text-center text-gray-400 space-y-3.5 flex flex-col items-center justify-center h-full">
                      <History className="w-14 h-14 text-gray-300 mx-auto animate-bounce" />
                      <h4 className="font-extrabold text-gray-700 text-sm">Clinical Registry Standby</h4>
                      <p className="text-xs max-w-sm mx-auto leading-normal">
                        Choose a registered spectacle prescription document from the search archive on the left to verify refraction metrics and launch printable letterheads.
                      </p>
                    </div>
                  );
                }
                
                return readyPaid.map(rx => (
                  <div 
                    key={rx.prescriptionId}
                    onClick={() => setInspectReadyRx(rx)}
                    className="p-4 border border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 hover:border-emerald-300 transition cursor-pointer flex justify-between items-center group shadow-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900">{rx.patientName}</span>
                        <span className="text-[9px] font-bold text-slate-500 font-mono">({rx.patientId})</span>
                      </div>
                      <p className="text-[10px] text-slate-500">
                        Mobile: <span className="font-mono">{rx.mobile}</span> • Order: <span className="font-mono">{rx.prescriptionId}</span>
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase tracking-wider rounded-md border border-emerald-200 shadow-sm">
                        <CheckCircle2 className="w-3 h-3" />
                        Payment Completed
                      </span>
                      <span className="text-[9px] text-emerald-600 font-bold group-hover:underline">
                        View Details →
                      </span>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>

      </div>

      {/* Floating Centered Modal Popup */}
      {selectedRx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-fade-in overflow-hidden">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden transition-all transform scale-100">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-950 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xs sm:text-sm uppercase tracking-wider text-white">Record Inspection Desk</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 font-mono">
                    Rx ID: {selectedRx.isPlaceholder ? "PENDING" : selectedRx.prescriptionId} | Patient: {selectedRx.patientName}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Actions allowed by Roles (Admin, Doctor can edit/delete parameters) */}
                {(userProfile?.role === 'admin' || userProfile?.role === 'doctor') && !isEditing && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditInitialize(selectedRx)}
                      className="px-3 py-1.5 text-xs rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer bg-amber-500/10 text-amber-300 border border-amber-500/20 hover:bg-amber-500/20"
                      id="btn-edit-parameters"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      {selectedRx.isPlaceholder ? "Add Eyesight" : "Edit values"}
                    </button>

                    {!selectedRx.isPlaceholder && (
                      <button
                        onClick={() => {
                          if (window.confirm("Are you sure you want to delete this record?")) {
                            handleDeletePrescription(selectedRx);
                          }
                        }}
                        className="px-3 py-1.5 text-xs rounded-lg font-bold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition flex items-center gap-1.5 cursor-pointer"
                        id="btn-delete-prescription"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    )}
                  </div>
                )}
                
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRx(null);
                    setIsEditing(false);
                  }}
                  className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white transition flex items-center justify-center font-bold cursor-pointer border border-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Scrollable Content */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
              {isEditing ? (
                /* INLINE EDIT PANEL MAPPING REFRACTIONS */
                <form onSubmit={handleUpdatePrescription} className="space-y-6">
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-[11px] text-amber-900">
                    ⚠️ Editing mode: Saving updates will permanently rewrite structural values in the cloud and instantly update the dynamic prescription PDF document.
                  </div>

                  {/* Dual Column editors */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* RE Edit */}
                    <div className="p-4 bg-amber-50/10 border border-amber-200 rounded-xl space-y-3">
                      <h5 className="font-bold text-slate-900 text-xs uppercase">Right Eye OD</h5>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-[10px] text-gray-400">Dist SPH</label>
                          <CustomPowerSelect 
                            value={reSphDist} 
                            onChange={setReSphDist} 
                            positives={positives} 
                            negatives={negatives} 
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-400">Dist CYL</label>
                          <CustomPowerSelect 
                            value={reCylDist} 
                            onChange={setReCylDist} 
                            positives={positives} 
                            negatives={negatives} 
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-400">Dist Axis</label>
                          <select value={reAxisDist} onChange={e => setReAxisDist(e.target.value)} className="w-full p-1.5 border rounded-lg bg-white text-xs">
                            <option value="">Nil</option>
                            {axisOptions.map(v => <option key={`reAx-${v}`} value={v}>{v}°</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-400">Distance Visual Acuity</label>
                          <select value={reVisionDist} onChange={e => setReVisionDist(e.target.value)} className="w-full p-1.5 border rounded-lg bg-white text-xs">
                            <option value="">Nil</option>
                            {distVisionOptions.map(v => <option key={`reVis-${v}`} value={v}>{v}</option>)}
                          </select>
                        </div>
                      </div>

                      <div className="border-t border-dashed my-3" />

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-[10px] text-gray-400">Near Acuity</label>
                          <select value={reVisionNear} onChange={e => setReVisionNear(e.target.value)} className="w-full p-1.5 border rounded-lg bg-white text-xs">
                            <option value="">Nil</option>
                            {nearVisionOptions.map(v => <option key={`reNear-${v}`} value={v}>{v}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-400">ADD SPH</label>
                          <select value={reAdd} onChange={e => setReAdd(e.target.value)} className="w-full p-1.5 border rounded-lg bg-white text-xs">
                            <option value="">Nil</option>
                            {addOptions.map(v => <option key={`reAdd-${v}`} value={v}>{v}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* LE Edit */}
                    <div className="p-4 bg-indigo-50/10 border border-indigo-100 rounded-xl space-y-3">
                      <h5 className="font-bold text-indigo-900 text-xs uppercase">Left Eye OS</h5>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-[10px] text-gray-400">Dist SPH</label>
                          <CustomPowerSelect 
                            value={leSphDist} 
                            onChange={setLeSphDist} 
                            positives={positives} 
                            negatives={negatives} 
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-400">Dist CYL</label>
                          <CustomPowerSelect 
                            value={leCylDist} 
                            onChange={setLeCylDist} 
                            positives={positives} 
                            negatives={negatives} 
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-400">Dist Axis</label>
                          <select value={leAxisDist} onChange={e => setLeAxisDist(e.target.value)} className="w-full p-1.5 border rounded-lg bg-white text-xs">
                            <option value="">Nil</option>
                            {axisOptions.map(v => <option key={`leAx-${v}`} value={v}>{v}°</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-400">Distance Visual Acuity</label>
                          <select value={leVisionDist} onChange={e => setLeVisionDist(e.target.value)} className="w-full p-1.5 border rounded-lg bg-white text-xs">
                            <option value="">Nil</option>
                            {distVisionOptions.map(v => <option key={`leVis-${v}`} value={v}>{v}</option>)}
                          </select>
                        </div>
                      </div>

                      <div className="border-t border-dashed my-3" />

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-[10px] text-gray-400">Near Acuity</label>
                          <select value={leVisionNear} onChange={e => setLeVisionNear(e.target.value)} className="w-full p-1.5 border rounded-lg bg-white text-xs">
                            <option value="">Nil</option>
                            {nearVisionOptions.map(v => <option key={`leNear-${v}`} value={v}>{v}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-400">ADD SPH</label>
                          <select value={leAdd} onChange={e => setLeAdd(e.target.value)} className="w-full p-1.5 border rounded-lg bg-white text-xs">
                            <option value="">Nil</option>
                            {addOptions.map(v => <option key={`leAdd-${v}`} value={v}>{v}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] text-gray-400 uppercase font-bold">Pupillary Distance (PD mm)</label>
                        <input type="text" value={editPd} onChange={e => setEditPd(e.target.value)} className="w-full p-1.5 border rounded-lg text-xs bg-white" />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-400 uppercase font-bold">Clinical Notes / Remarks</label>
                        <textarea value={editNotes} onChange={e => setEditNotes(e.target.value)} className="w-full p-1.5 border rounded-lg text-xs bg-white" rows={2} />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] text-gray-400 uppercase font-bold mb-2">Spectacle Lens Advice</label>
                      <div className="grid grid-cols-2 gap-1.5 max-h-28 overflow-y-auto border p-2 rounded-lg bg-gray-50">
                        {adviceOptions.map(advice => {
                          const isChecked = editAdvice.includes(advice);
                          return (
                            <button 
                              key={advice}
                              type="button"
                              onClick={() => handleToggleAdvice(advice)}
                              className={`flex items-center justify-between p-1.5 rounded-lg border text-[9.5px] font-bold text-left transition-all ${
                                isChecked 
                                  ? 'bg-amber-600 border-amber-600 text-white shadow-xs' 
                                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              <span className="truncate">{advice}</span>
                              <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[7px] font-bold shrink-0 ml-1 transition-all ${
                                isChecked 
                                  ? 'bg-white text-amber-600 border-white' 
                                  : 'border-gray-300 bg-white'
                              }`}>
                                {isChecked ? "✓" : ""}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-5 border-t mt-6">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="px-5 py-2 text-xs bg-emerald-800 hover:bg-emerald-950 text-white rounded-lg font-bold flex items-center gap-1.5 cursor-pointer"
                      id="btn-save-inline-edit"
                    >
                      <Save className="w-4 h-4" />
                      {isUpdating ? "Updating profile..." : "Save Eyesight Details & Send to Queue"}
                    </button>
                  </div>
                </form>
              ) : selectedRx.isPlaceholder ? (
                <div className="bg-amber-50/50 border border-amber-200 rounded-3xl p-8 text-center space-y-4 shadow-2xs max-w-lg mx-auto my-6 animate-pulse">
                  <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-500">
                    <AlertCircle className="w-7 h-7" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-extrabold text-slate-905 text-sm uppercase tracking-wide">Eyesight Details & Spectacles Order Pending</h4>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto font-medium">
                      This patient was registered at the welcome desk but has not yet received an eyesight refraction prescription.
                    </p>
                  </div>
                  {(userProfile?.role === 'admin' || userProfile?.role === 'doctor') && (
                    <button
                      type="button"
                      onClick={() => handleEditInitialize(selectedRx)}
                      className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 mx-auto shadow-md hover:scale-[1.02] cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                      Enter Eyesight & Lens Details
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {/* Spectacles Order Status Card */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest font-mono">
                        Spectacles Order Status
                      </span>
                      <h4 className="text-sm font-bold text-slate-800">
                        Frame: <span className="text-slate-950 font-extrabold">{selectedRx.frameName || 'No Frame Selected'}</span>
                      </h4>
                      <p className="text-[11px] text-slate-550 font-semibold">
                        Lens: <span className="text-slate-700 font-bold">{selectedRx.lensType || 'No Lens Selected'}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedRx.orderStatus === 'Ready' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-250 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm shadow-emerald-50">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                          Ready for Collection
                        </span>
                      ) : selectedRx.orderStatus === 'Crafting' || selectedRx.orderStatus === 'Pending' || (selectedRx.frameName || selectedRx.lensType) ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-250 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm shadow-amber-50">
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                          Crafting / Processing in Progress
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-500 border border-slate-200 rounded-xl text-xs font-black uppercase tracking-wider">
                          No Active Spectacles Order
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h5 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">Official Diagnostic Prescription</h5>
                    <div className="bg-slate-50 border border-slate-200 rounded-3xl p-1 md:p-3 shadow-inner overflow-hidden">
                      <PrescriptionPDFViewerPanel prescription={selectedRx} />
                    </div>
                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      )}


      {/* Notification Toast Modal */}
      {notification && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-150 max-w-sm w-full overflow-hidden p-6 text-center space-y-5">
            <div className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center ${
              notification.type === 'success' 
                ? 'bg-emerald-50 border border-emerald-150 text-emerald-600' 
                : 'bg-rose-50 border border-rose-150 text-rose-600'
            }`}>
              {notification.type === 'success' ? (
                <CheckCircle className="w-7 h-7" />
              ) : (
                <AlertCircle className="w-7 h-7" />
              )}
            </div>
            
            <div className="space-y-1.5">
              <h3 className="text-base font-black text-slate-900">{notification.title}</h3>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed px-1">
                {notification.message}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setNotification(null)}
              className="w-full px-5 py-2.5 bg-slate-900 hover:bg-slate-955 text-white rounded-xl text-xs font-extrabold transition cursor-pointer shadow-md"
            >
              Okay
            </button>
          </div>
        </div>
      )}

      {/* Ready Order Text Details Modal */}
      {inspectReadyRx && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
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
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-md cursor-pointer"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
