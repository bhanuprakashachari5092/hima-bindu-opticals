import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { doc, setDoc, serverTimestamp, collection, getDocs, limit, query, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../config/firebase';
import { generateNextPatientId } from '../utils/idGenerators';
import { UserPlus, User, Phone, Calendar, ClipboardList, Loader2, CheckCircle2, UserCheck } from 'lucide-react';

interface Patient {
  patientId: string;
  name: string;
  mobile: string;
  age: number;
  gender: string;
  date: string;
  createdAt?: any;
}

interface PatientManagementProps {
  setActiveTab: (tab: string) => void;
  setPrefilledPatient: (patient: any) => void;
}

export default function PatientManagement({ setActiveTab, setPrefilledPatient }: PatientManagementProps) {
  const { isDemoMode } = useAuth();
  
  // Form State
  const [patientId, setPatientId] = useState('');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]); // Default to today: 2026-06-13
  
  // App States
  const [isGeneratingId, setIsGeneratingId] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [recentPatients, setRecentPatients] = useState<Patient[]>([]);

  // Pre-load the next sequential Patient ID and recent registrations
  const loadRegistrationDeskState = async () => {
    setIsGeneratingId(true);
    setSuccessMsg(null);
    try {
      const nextId = await generateNextPatientId(isDemoMode);
      setPatientId(nextId);

      if (isDemoMode) {
        const stored = localStorage.getItem('hb_demo_patients') || '[]';
        const list = JSON.parse(stored) as Patient[];
        // Sort descending
        const sorted = [...list].sort((a,b) => b.patientId.localeCompare(a.patientId)).slice(0, 5);
        setRecentPatients(sorted);
      } else {
        const patientsRef = collection(db, 'patients');
        const q = query(patientsRef, orderBy('patientId', 'desc'), limit(5));
        const qSnap = await getDocs(q).catch((err) => {
          console.warn("Index query issue loading registrations. Retrieving list.", err);
          return getDocs(patientsRef);
        });
        
        if (qSnap) {
          const list = qSnap.docs.map(doc => doc.data() as Patient);
          // ensure sorted descending
          const sorted = list.sort((a, b) => b.patientId.localeCompare(a.patientId));
          setRecentPatients(sorted.slice(0, 5));
        }
      }
    } catch (err) {
      console.error("Error generating next patient registration index", err);
    } finally {
      setIsGeneratingId(false);
    }
  };

  useEffect(() => {
    loadRegistrationDeskState();
  }, [isDemoMode]);

  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !mobile.trim() || !age) {
      alert("Please ensure Name, Mobile, and Age are completed.");
      return;
    }

    setIsSubmitting(true);
    setSuccessMsg(null);

    const parsedAge = parseInt(age, 10);
    const newPatient: Patient = {
      patientId,
      name: name.trim(),
      mobile: mobile.trim(),
      age: parsedAge,
      gender,
      date,
    };

    if (isDemoMode) {
      // Save locally
      const stored = localStorage.getItem('hb_demo_patients') || '[]';
      try {
        const current = JSON.parse(stored);
        current.push(newPatient);
        localStorage.setItem('hb_demo_patients', JSON.stringify(current));
        
        setSuccessMsg(`Patient ${newPatient.name} registered successfully with ID ${newPatient.patientId}!`);
        // Reset form
        setName('');
        setMobile('');
        setAge('');
        // Reload desk
        await loadRegistrationDeskState();
      } catch (err) {
        console.error("Local storage save error", err);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Save to real Firebase
    try {
      const patientFields = {
        ...newPatient,
        createdAt: serverTimestamp()
      };
      const patientDocRef = doc(db, 'patients', patientId);
      
      await setDoc(patientDocRef, patientFields).catch((err) => {
        handleFirestoreError(err, OperationType.CREATE, `patients/${patientId}`);
      });

      setSuccessMsg(`Patient ${newPatient.name} registered successfully as ${newPatient.patientId}!`);
      setName('');
      setMobile('');
      setAge('');
      await loadRegistrationDeskState();
    } catch (err: any) {
      console.error("Firebase save failed:", err);
      alert("Database intake failed. Verify permissions or schema mapping rules.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Action to directly send newly registered patient to prescription workspace
  const handleRecordPrescriptionDirectly = (patient: Patient) => {
    setPrefilledPatient(patient);
    setActiveTab('prescription');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 font-sans">
      
      {/* Registration intake form card */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-5 bg-gradient-to-r from-blue-900 to-blue-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserPlus className="w-5 h-5 text-blue-200" />
            <h3 className="font-extrabold text-white text-md">New Patient Registration Desk</h3>
          </div>
          <span className="text-[10px] font-mono uppercase bg-slate-950 px-2 py-0.5 rounded text-amber-300">
            Form HB-Registry
          </span>
        </div>

        {successMsg && (
          <div className="mx-6 mt-6 p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-lg flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-emerald-950">{successMsg}</p>
              <p className="text-[10px] text-emerald-700 mt-1">Press "Record Spectacle Power" below on recently added patients list to compile optical values.</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmitRegistration} className="p-6 space-y-5">
          {/* Main Intake Block Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Auto Generated patient ID field */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Patient ID (Auto-Calculated)
              </label>
              <div className="relative">
                {isGeneratingId ? (
                  <div className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-400 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-slate-800" />
                    <span>Synchronizing sequential ID...</span>
                  </div>
                ) : (
                  <input
                    type="text"
                    value={patientId}
                    readOnly
                    className="w-full bg-amber-50/25 border border-amber-200 text-slate-900 rounded-xl px-4 py-3 text-sm font-bold focus:outline-hidden cursor-default"
                  />
                )}
              </div>
            </div>

            {/* intake Date */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Intake Date
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <Calendar className="w-4.5 h-4.5" />
                </span>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-700 focus:border-blue-850 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Patient Name input */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Patient Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <User className="w-4.5 h-4.5" />
                </span>
                <input
                  type="text"
                  placeholder="e.g. Konduru Srimannarayana"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-700 focus:border-blue-850 focus:ring-1 focus:ring-blue-100 focus:outline-hidden"
                  id="reg-patient-name"
                />
              </div>
            </div>

            {/* Mobile number input */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Mobile Number
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <Phone className="w-4.5 h-4.5" />
                </span>
                <input
                  type="tel"
                  placeholder="e.g. 9440212345"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  required
                  className="w-full border border-gray-305 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-700 focus:border-blue-850 focus:outline-hidden"
                  id="reg-patient-mobile"
                />
              </div>
            </div>

            {/* Age input */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Patient Age (Years)
              </label>
              <input
                type="number"
                placeholder="Years"
                min="0"
                max="125"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-700 focus:border-blue-850 focus:outline-hidden"
                id="reg-patient-age"
              />
            </div>

            {/* Gender input */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Gender Classification
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full border border-gray-300 bg-white rounded-xl px-4 py-3 text-sm text-gray-700 focus:border-blue-850 focus:outline-hidden"
                id="reg-patient-gender"
              >
                <option value="Male">Male Gender</option>
                <option value="Female">Female Gender</option>
                <option value="Transgender">Other / Transgender</option>
              </select>
            </div>

          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || isGeneratingId}
              className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-sm hover:bg-slate-950 transition cursor-pointer flex items-center gap-2"
              id="btn-register-patient"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Recording in central archive...</span>
                </>
              ) : (
                <span>Register Patient in Database</span>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Sidebar showing recent registrations */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5 self-start">
        <div className="flex items-center gap-2 mb-4 border-b pb-3 border-gray-100">
          <ClipboardList className="w-5 h-5 text-slate-800" />
          <h4 className="font-extrabold text-gray-900 text-sm">Shift Registries Log</h4>
        </div>

        {recentPatients.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-6 leading-relaxed">
            No patient files loaded on this session yet. Register details on the left.
          </p>
        ) : (
          <div className="space-y-3.5">
            {recentPatients.map((patient) => (
              <div 
                key={patient.patientId} 
                className="p-3.5 bg-gray-50 border border-gray-200 hover:border-amber-200 rounded-xl transition duration-150 relative group"
              >
                <span className="absolute right-3.5 top-3.5 font-mono text-[10px] font-black text-slate-800 bg-amber-50/25 px-2 py-0.5 rounded border border-amber-200">
                  {patient.patientId}
                </span>
                
                <h5 className="font-bold text-gray-900 text-xs pr-14 truncate">{patient.name}</h5>
                <p className="text-[10px] text-gray-500 mt-1 font-mono">
                  {patient.gender} • {patient.age} Yrs • Ph: {patient.mobile}
                </p>
                
                <button
                  onClick={() => handleRecordPrescriptionDirectly(patient)}
                  className="mt-3 w-full py-1.5 px-3 bg-emerald-50 text-emerald-800 rounded-lg text-[10px] font-bold border border-emerald-100 hover:bg-emerald-800 hover:text-white transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Compile Spectacle Power</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
