import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, getDocs, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../config/firebase';
import { Prescription, PrescriptionPDFViewerPanel, EyePower } from '../components/PrescriptionPDF';
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
  X 
} from 'lucide-react';

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

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editNotes, setEditNotes] = useState('');
  const [editPd, setEditPd] = useState('');
  const [editAdvice, setEditAdvice] = useState<string[]>([]);
  
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

  const adviceOptions = [
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
    if (isDemoMode) {
      const stored = localStorage.getItem('hb_demo_prescriptions') || '[]';
      try {
        const list = JSON.parse(stored) as Prescription[];
        setAllPrescriptions(list.sort((a,b) => b.prescriptionId.localeCompare(a.prescriptionId)));
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
      return;
    }

    try {
      const querySnap = await getDocs(collection(db, 'prescriptions')).catch(err => 
        handleFirestoreError(err, OperationType.LIST, 'prescriptions')
      );
      if (querySnap) {
        const list = querySnap.docs.map(doc => doc.data() as Prescription);
        setAllPrescriptions(list.sort((a, b) => b.prescriptionId.localeCompare(a.prescriptionId)));
      }
    } catch (err) {
      console.error(err);
    } finally {
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
    setEditNotes(rx.notes);
    setEditPd(rx.pd);
    setEditAdvice(rx.advice || []);
    
    // SPH/CYL OD
    setReSphDist(rx.rightEyeData.distance.sph);
    setReCylDist(rx.rightEyeData.distance.cyl);
    setReAxisDist(rx.rightEyeData.distance.axis);
    setReVisionDist(rx.rightEyeData.distance.vision);

    setReSphNear(rx.rightEyeData.near.sph);
    setReCylNear(rx.rightEyeData.near.cyl);
    setReAxisNear(rx.rightEyeData.near.axis);
    setReVisionNear(rx.rightEyeData.near.vision);
    setReAdd(rx.rightEyeData.add || '');

    // SPH/CYL OS
    setLeSphDist(rx.leftEyeData.distance.sph);
    setLeCylDist(rx.leftEyeData.distance.cyl);
    setLeAxisDist(rx.leftEyeData.distance.axis);
    setLeVisionDist(rx.leftEyeData.distance.vision);

    setLeSphNear(rx.leftEyeData.near.sph);
    setLeCylNear(rx.leftEyeData.near.cyl);
    setLeAxisNear(rx.leftEyeData.near.axis);
    setLeVisionNear(rx.leftEyeData.near.vision);
    setLeAdd(rx.leftEyeData.add || '');
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
      near: { sph: reSphNear, cyl: reCylNear, axis: reAxisNear, vision: reVisionNear },
      add: reAdd
    };

    const updatedLeftData: EyePower = {
      distance: { sph: leSphDist, cyl: leCylDist, axis: leAxisDist, vision: leVisionDist },
      near: { sph: leSphNear, cyl: leCylNear, axis: leAxisNear, vision: leVisionNear },
      add: leAdd
    };

    const updatedRx: Prescription = {
      ...selectedRx,
      rightEyeData: updatedRightData,
      leftEyeData: updatedLeftData,
      pd: editPd,
      advice: editAdvice,
      notes: editNotes
    };

    if (isDemoMode) {
      const stored = localStorage.getItem('hb_demo_prescriptions') || '[]';
      try {
        const list = JSON.parse(stored) as Prescription[];
        const updatedList = list.map(item => item.prescriptionId === selectedRx.prescriptionId ? updatedRx : item);
        localStorage.setItem('hb_demo_prescriptions', JSON.stringify(updatedList));
        setSelectedRx(updatedRx);
        setIsEditing(false);
        alert("Prescription modified successfully inside local registry.");
        await fetchPrescriptionsList();
      } catch (e) {
        console.error(e);
      } finally {
        setIsUpdating(false);
      }
      return;
    }

    try {
      const rxDocRef = doc(db, 'prescriptions', selectedRx.prescriptionId);
      const fsData = {
        ...updatedRx,
        updatedAt: serverTimestamp()
      };
      
      await setDoc(rxDocRef, fsData).catch(err => {
        handleFirestoreError(err, OperationType.UPDATE, `prescriptions/${selectedRx.prescriptionId}`);
      });

      setSelectedRx(updatedRx);
      setIsEditing(false);
      alert("Prescription synchronized & modified inside Firestore successfully.");
      await fetchPrescriptionsList();
    } catch (err) {
      console.error(err);
      alert("Failed updating records. Review permissions schema.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeletePrescription = async (rx: Prescription) => {
    if (!window.confirm(`Are you sure you want to delete prescription record ${rx.prescriptionId} permanently?`)) {
      return;
    }

    try {
      if (isDemoMode) {
        const stored = localStorage.getItem('hb_demo_prescriptions') || '[]';
        const list = JSON.parse(stored) as Prescription[];
        const updatedList = list.filter(item => item.prescriptionId !== rx.prescriptionId);
        localStorage.setItem('hb_demo_prescriptions', JSON.stringify(updatedList));
        setSelectedRx(null);
        alert("Prescription deleted successfully from local test registry.");
        await fetchPrescriptionsList();
      } else {
        await deleteDoc(doc(db, 'prescriptions', rx.prescriptionId)).catch(err => {
          handleFirestoreError(err, OperationType.DELETE, `prescriptions/${rx.prescriptionId}`);
        });
        setSelectedRx(null);
        alert("Prescription permanently deleted from Firestore database.");
        await fetchPrescriptionsList();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete record. Please check database permissions.");
    }
  };

  // Safe search lookup
  const filteredRx = allPrescriptions.filter(rx => {
    const q = searchQuery.trim().toLowerCase();
    if (userProfile?.role === 'patient') {
      if (!q) return false;
      return rx.mobile === q || rx.patientId.toLowerCase() === q;
    }
    const qRaw = searchQuery.toLowerCase();
    return (
      rx.prescriptionId.toLowerCase().includes(qRaw) ||
      rx.patientName.toLowerCase().includes(qRaw) ||
      rx.patientId.toLowerCase().includes(qRaw) ||
      rx.mobile.includes(qRaw)
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
                return (
                  <div
                    key={rx.prescriptionId}
                    onClick={() => handleInspect(rx)}
                    className={`p-3 rounded-xl border transition cursor-pointer text-left ${
                      isCurrentSelected 
                        ? 'bg-amber-50/25 border-amber-300 shadow-2xs' 
                        : 'bg-gray-50/50 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-[10px] font-black text-slate-900">
                        {rx.prescriptionId}
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
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInspect(rx);
                        }}
                        className="text-[10px] bg-white border border-gray-300 px-2.0 py-1.0 rounded text-gray-700 font-semibold hover:bg-gray-100 flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3 text-slate-800" />
                        Inspect Spec
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right column: Single Record details inspect & Dynamic PDF Renderer */}
        <div className="lg:col-span-2 space-y-6">
          {selectedRx ? (
            <div className="space-y-6">
              
              {/* Information / Toggle panel */}
              <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-150 flex wrap gap-4 items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">
                      Record Inspection Desk: {selectedRx.prescriptionId}
                    </h3>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Patient Reference: <span className="font-black text-slate-900">{selectedRx.patientName} ({selectedRx.patientId})</span>
                    </p>
                  </div>
                  
                  {/* Actions allowed by Roles (Admin or Doctor can edit/delete parameters) */}
                  {(userProfile?.role === 'admin' || userProfile?.role === 'doctor') && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditInitialize(selectedRx)}
                        disabled={isEditing}
                        className={`px-3 py-1.5 text-xs rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
                          isEditing 
                            ? 'bg-gray-100 text-gray-400' 
                            : 'bg-amber-50/25 text-slate-800 border border-amber-200 hover:bg-amber-100'
                        }`}
                        id="btn-edit-parameters"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Edit Prescription Values
                      </button>

                      <button
                        onClick={() => handleDeletePrescription(selectedRx)}
                        className="px-3 py-1.5 text-xs rounded-lg font-bold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition flex items-center gap-1.5 cursor-pointer"
                        id="btn-delete-prescription"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete Record
                      </button>
                    </div>
                  )}
                </div>

                {isEditing ? (
                  /* INLINE EDIT PANEL MAPPING REFRACTIONS */
                  <form onSubmit={handleUpdatePrescription} className="p-5 space-y-6">
                    <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-[11px] text-amber-900">
                      ⚠️ Editing mode: Saving updates will permanently rewrite structural values in the cloud and instantly update the dynamic prescription PDF document.
                    </div>

                    {/* Dual Column editors */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* RE Edit */}
                      <div className="p-4 bg-amber-50/25/10 border border-amber-200 rounded-xl space-y-3">
                        <h5 className="font-bold text-slate-900 text-xs uppercase">Right Eye OD</h5>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <label className="block text-[10px] text-gray-400">Dist SPH</label>
                            <input type="text" value={reSphDist} onChange={e => setReSphDist(e.target.value)} className="w-full p-1 border rounded" />
                          </div>
                          <div>
                            <label className="block text-[10px] text-gray-400">Dist CYL</label>
                            <input type="text" value={reCylDist} onChange={e => setReCylDist(e.target.value)} className="w-full p-1 border rounded" />
                          </div>
                          <div>
                            <label className="block text-[10px] text-gray-400">Dist Axis</label>
                            <input type="text" value={reAxisDist} onChange={e => setReAxisDist(e.target.value)} className="w-full p-1 border rounded" />
                          </div>
                          <div>
                            <label className="block text-[10px] text-gray-400">Distance Visual Acuity</label>
                            <input type="text" value={reVisionDist} onChange={e => setReVisionDist(e.target.value)} className="w-full p-1 border rounded" />
                          </div>
                        </div>

                        <div className="border-t border-dashed my-3" />

                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <label className="block text-[10px] text-gray-400">Near SPH</label>
                            <input type="text" value={reSphNear} onChange={e => setReSphNear(e.target.value)} className="w-full p-1 border rounded" />
                          </div>
                          <div>
                            <label className="block text-[10px] text-gray-400">Near CYL</label>
                            <input type="text" value={reCylNear} onChange={e => setReCylNear(e.target.value)} className="w-full p-1 border rounded" />
                          </div>
                          <div>
                            <label className="block text-[10px] text-gray-400">Near Axis</label>
                            <input type="text" value={reAxisNear} onChange={e => setReAxisNear(e.target.value)} className="w-full p-1 border rounded" />
                          </div>
                          <div>
                            <label className="block text-[10px] text-gray-400">Near Acuity</label>
                            <input type="text" value={reVisionNear} onChange={e => setReVisionNear(e.target.value)} className="w-full p-1 border rounded" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-400 mt-1">ADD SPH</label>
                          <input type="text" value={reAdd} onChange={e => setReAdd(e.target.value)} className="w-full p-1 border rounded" />
                        </div>
                      </div>

                      {/* LE Edit */}
                      <div className="p-4 bg-indigo-50/10 border border-indigo-105 rounded-xl space-y-3">
                        <h5 className="font-bold text-indigo-900 text-xs uppercase">Left Eye OS</h5>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <label className="block text-[10px] text-gray-400">Dist SPH</label>
                            <input type="text" value={leSphDist} onChange={e => setLeSphDist(e.target.value)} className="w-full p-1 border rounded" />
                          </div>
                          <div>
                            <label className="block text-[10px] text-gray-400">Dist CYL</label>
                            <input type="text" value={leCylDist} onChange={e => setLeCylDist(e.target.value)} className="w-full p-1 border rounded" />
                          </div>
                          <div>
                            <label className="block text-[10px] text-gray-400">Dist Axis</label>
                            <input type="text" value={leAxisDist} onChange={e => setLeAxisDist(e.target.value)} className="w-full p-1 border rounded" />
                          </div>
                          <div>
                            <label className="block text-[10px] text-gray-400">Distance Visual Acuity</label>
                            <input type="text" value={leVisionDist} onChange={e => setLeVisionDist(e.target.value)} className="w-full p-1 border rounded" />
                          </div>
                        </div>

                        <div className="border-t border-dashed my-3" />

                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <label className="block text-[10px] text-gray-400">Near SPH</label>
                            <input type="text" value={leSphNear} onChange={e => setLeSphNear(e.target.value)} className="w-full p-1 border rounded" />
                          </div>
                          <div>
                            <label className="block text-[10px] text-gray-400">Near CYL</label>
                            <input type="text" value={leCylNear} onChange={e => setLeCylNear(e.target.value)} className="w-full p-1 border rounded" />
                          </div>
                          <div>
                            <label className="block text-[10px] text-gray-400">Near Axis</label>
                            <input type="text" value={leAxisNear} onChange={e => setLeAxisNear(e.target.value)} className="w-full p-1 border rounded" />
                          </div>
                          <div>
                            <label className="block text-[10px] text-gray-400">Near Acuity</label>
                            <input type="text" value={leVisionNear} onChange={e => setLeVisionNear(e.target.value)} className="w-full p-1 border rounded" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-400 mt-1">ADD SPH</label>
                          <input type="text" value={leAdd} onChange={e => setLeAdd(e.target.value)} className="w-full p-1 border rounded" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] text-gray-400 uppercase font-bold">PD mm</label>
                          <input type="text" value={editPd} onChange={e => setEditPd(e.target.value)} className="w-full p-1.5 border rounded text-xs" />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-400 uppercase font-bold">Clinical Notes / Remarks</label>
                          <textarea value={editNotes} onChange={e => setEditNotes(e.target.value)} className="w-full p-1.5 border rounded text-xs" rows={2} />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] text-gray-400 uppercase font-bold mb-2">Spectacle Lens Advice</label>
                        <div className="grid grid-cols-2 gap-1.5 max-h-28 overflow-y-auto border p-2 rounded bg-gray-50">
                          {adviceOptions.map(advice => {
                            const isChecked = editAdvice.includes(advice);
                            return (
                              <label key={advice} className="flex items-center gap-1.5 text-[10px] cursor-pointer">
                                <input type="checkbox" checked={isChecked} onChange={() => handleToggleAdvice(advice)} className="rounded text-slate-900 h-3 w-3" />
                                <span>{advice}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t">
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
                        {isUpdating ? "Updating profile..." : "Save & Recompile Spectacle Rx"}
                      </button>
                    </div>
                  </form>
                ) : null}
              </div>

              {/* PDF on-the-fly interactive drawer */}
              <PrescriptionPDFViewerPanel prescription={selectedRx} />

            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-400 shadow-2xs space-y-3.5">
              <History className="w-14 h-14 text-gray-300 mx-auto animate-bounce" />
              <h4 className="font-extrabold text-gray-700 text-sm">Clinical Registry Standby</h4>
              <p className="text-xs max-w-sm mx-auto leading-normal">
                Choose a registered spectacle prescription document from the search archive on the left to verify refraction metrics and launch printable letterheads.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
