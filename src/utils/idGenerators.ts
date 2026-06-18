import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../config/firebase';

/**
 * Automatically fetch and generate the next sequential Patient ID (format HB###).
 * If Firestore is inaccessible or in Demo mode, defaults to localStorage tracking.
 */
export async function generateNextPatientId(isDemoMode: boolean): Promise<string> {
  if (isDemoMode) {
    const demoPatients = localStorage.getItem('hb_demo_patients');
    if (demoPatients) {
      try {
        const patients = JSON.parse(demoPatients);
        if (patients.length > 0) {
          // Find max number
          const ids = patients.map((p: any) => {
            const m = p.patientId.match(/HB(\d+)/);
            return m ? parseInt(m[1], 10) : 0;
          });
          const maxId = Math.max(...ids, 0);
          return `HB${String(maxId + 1).padStart(3, '0')}`;
        }
      } catch (e) {
        console.error("Local storage ID parse error:", e);
      }
    }
    return 'HB001';
  }

  try {
    const patientsRef = collection(db, 'patients');
    const q = query(patientsRef, orderBy('patientId', 'desc'), limit(1));
    const querySnap = await getDocs(q);
    
    if (querySnap.empty) {
      return 'HB001';
    }
    
    const latestPatient = querySnap.docs[0].data();
    const latestId = latestPatient.patientId;
    const match = latestId.match(/HB(\d+)/);
    if (match) {
      const nextNum = parseInt(match[1], 10) + 1;
      return `HB${String(nextNum).padStart(3, '0')}`;
    }
    return 'HB001';
  } catch (err) {
    console.warn("Unable to fetch latest patient ID from Firestore, falling back to local sequential generation:", err);
    // Fallback: load from collection without ordering if index is missing, or default to HB001
    return 'HB001';
  }
}

/**
 * Automatically fetch and generate the next sequential Prescription ID (format HBE-2026-####).
 * Works for both Firestore and local demo context.
 */
export async function generateNextPrescriptionId(isDemoMode: boolean): Promise<string> {
  const currentYear = 2026; // Mandated current year 2026 in the business instructions

  if (isDemoMode) {
    const demoPrescriptions = localStorage.getItem('hb_demo_prescriptions');
    if (demoPrescriptions) {
      try {
        const prescriptions = JSON.parse(demoPrescriptions);
        if (prescriptions.length > 0) {
          const ids = prescriptions.map((p: any) => {
            const m = p.prescriptionId.match(/HBE-2026-(\d+)/);
            return m ? parseInt(m[1], 10) : 0;
          });
          const maxId = Math.max(...ids, 0);
          return `HBE-2026-${String(maxId + 1).padStart(4, '0')}`;
        }
      } catch (e) {
        console.error("Local storage Rx ID parse error:", e);
      }
    }
    return `HBE-${currentYear}-0001`;
  }

  try {
    const prescriptionsRef = collection(db, 'prescriptions');
    const q = query(prescriptionsRef, orderBy('prescriptionId', 'desc'), limit(1));
    const querySnap = await getDocs(q);

    if (querySnap.empty) {
      return `HBE-${currentYear}-0001`;
    }

    const latestRx = querySnap.docs[0].data();
    const latestId = latestRx.prescriptionId;
    const match = latestId.match(/HBE-\d+-(\d+)/);
    if (match) {
      const nextNum = parseInt(match[1], 10) + 1;
      return `HBE-${currentYear}-${String(nextNum).padStart(4, '0')}`;
    }
    return `HBE-${currentYear}-0001`;
  } catch (err) {
    console.warn("Unable to fetch latest prescription ID from Firestore, falling back:", err);
    return `HBE-${currentYear}-0001`;
  }
}
