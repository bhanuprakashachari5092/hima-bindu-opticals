import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Prescription, EyePower, printPrescriptionHTML, PrescriptionPDFDocument } from '../components/PrescriptionPDF';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { generateNextPrescriptionId, generateNextPatientId } from '../utils/idGenerators';
import { 
  FileSpreadsheet, 
  Search, 
  User, 
  ChevronRight, 
  CheckSquare, 
  Coins, 
  Save, 
  AlertCircle, 
  Sparkles,
  ClipboardCheck,
  RotateCcw,
  Eye,
  Printer,
  Download,
  MessageCircle,
  Settings,
  CheckCircle
} from 'lucide-react';

interface Patient {
  patientId: string;
  name: string;
  mobile: string;
  age: number;
  gender: string;
  date: string;
}

interface SearchableSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder?: string;
  label: string;
  id?: string;
  renderOption?: (opt: string) => string;
}

function SearchableSelect({ value, onChange, options, placeholder = "—", label, id, renderOption }: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);

  const displayVal = (val: string) => {
    if (renderOption) return renderOption(val);
    return val || '—';
  };

  useEffect(() => {
    if (!isOpen) {
      setSearch(displayVal(value) === '—' ? '' : displayVal(value));
    }
  }, [value, isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = options.filter(opt => {
    const displayOpt = displayVal(opt);
    if (!search || search === displayVal(value)) return true;
    return displayOpt.toLowerCase().includes(search.toLowerCase()) || opt.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div ref={containerRef} className="relative w-full">
      <label className="block text-[10px] text-gray-500 mb-1 font-semibold">{label}</label>
      <input
        type="text"
        id={id}
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          const matched = options.find(o => o.toLowerCase() === e.target.value.toLowerCase() || displayVal(o).toLowerCase() === e.target.value.toLowerCase());
          if (matched !== undefined) {
            onChange(matched);
          } else {
            onChange(e.target.value);
          }
          setIsOpen(true);
        }}
        onFocus={(e) => {
          setIsOpen(true);
          e.target.select();
        }}
        onClick={() => setIsOpen(true)}
        placeholder={placeholder}
        className="w-full text-xs font-mono border border-gray-300 bg-white rounded-lg p-1.5 focus:border-amber-600 focus:outline-hidden focus:ring-1 focus:ring-amber-500/20"
      />
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg">
          {filtered.length === 0 ? (
            <div className="p-2 text-xs text-gray-400 font-sans">No matches</div>
          ) : (
            <div className="grid grid-cols-2 gap-0.5 p-1 bg-gray-50">
              {filtered.map((opt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    onChange(opt);
                    setSearch(displayVal(opt) === '—' ? '' : displayVal(opt));
                    setIsOpen(false);
                  }}
                  className={`px-2 py-1 text-left text-xs font-mono rounded-md hover:bg-amber-50 hover:text-amber-900 ${
                    value === opt ? 'bg-amber-600 text-white font-bold' : 'text-gray-700'
                  }`}
                >
                  {displayVal(opt)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface PrescriptionEntryProps {
  prefilledPatient: Patient | null;
  clearPrefilledPatient: () => void;
}

export default function PrescriptionEntry({ prefilledPatient, clearPrefilledPatient }: PrescriptionEntryProps) {
  const { isDemoMode } = useAuth();

  // WhatsApp Settings state
  const [showWASettings, setShowWASettings] = useState(false);
  const [waApiType, setWaApiType] = useState(() => localStorage.getItem('hb_wa_api_type') || 'direct');
  const [waInstanceId, setWaInstanceId] = useState(() => localStorage.getItem('hb_wa_instance_id') || '');
  const [waToken, setWaToken] = useState(() => localStorage.getItem('hb_wa_token') || '');

  const handleSaveWASettings = () => {
    localStorage.setItem('hb_wa_api_type', waApiType);
    localStorage.setItem('hb_wa_instance_id', waInstanceId);
    localStorage.setItem('hb_wa_token', waToken);
    setShowWASettings(false);
    alert("WhatsApp API configurations saved successfully!");
  };

  // Search/Lookup State
  const [patientsList, setPatientsList] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Form Fields
  const [prescriptionId, setPrescriptionId] = useState('');
  const [patientId, setPatientId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [mobile, setMobile] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]); // 2026-06-13

  // Right Eye (RE / OD) Data States
  const [reSphDist, setReSphDist] = useState('');
  const [reCylDist, setReCylDist] = useState('');
  const [reAxisDist, setReAxisDist] = useState('');
  const [reVisionDist, setReVisionDist] = useState('6/6');

  const [reSphNear, setReSphNear] = useState('');
  const [reCylNear, setReCylNear] = useState('');
  const [reAxisNear, setReAxisNear] = useState('');
  const [reVisionNear, setReVisionNear] = useState('J1');
  
  const [reAdd, setReAdd] = useState('');

  // Left Eye (LE / OS) Data States
  const [leSphDist, setLeSphDist] = useState('');
  const [leCylDist, setLeCylDist] = useState('');
  const [leAxisDist, setLeAxisDist] = useState('');
  const [leVisionDist, setLeVisionDist] = useState('6/6');

  const [leSphNear, setLeSphNear] = useState('');
  const [leCylNear, setLeCylNear] = useState('');
  const [leAxisNear, setLeAxisNear] = useState('');
  const [leVisionNear, setLeVisionNear] = useState('J1');

  const [leAdd, setLeAdd] = useState('');

  // Physical Metadata & Remarks
  const [pd, setPd] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedAdvice, setSelectedAdvice] = useState<string[]>([]);

  // Page States
  const [isLoadingRxId, setIsLoadingRxId] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeCreatedRx, setActiveCreatedRx] = useState<Prescription | null>(null);
  const [successModal, setSuccessModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    rxId: string;
    patientId: string;
  } | null>(null);


  // Advice options
  const adviceList = [
    "MR8",
    "dual corth",
    "Marry blue",
    "Blue light PG - progressive",
    "Blue light KT - progressive",
    "Blue Light",
    "Blue Cut",
    "CR PG HC",
    "CR KT HC",
    "CR HMC",
    "CR HC",
    "CR KT HMC",
    "CR KT PG HC",
    "Contact Lens",
    "Progressive Lens"
  ];

  // Prefill common optometry drop-down selectors
  const generateSphOptions = () => {
    const options = ["", "0.00"];
    for (let i = 0.25; i <= 20.00; i += 0.25) {
      const val = i.toFixed(2);
      options.push(`-${val}`, `+${val}`);
    }
    return options;
  };
  const sphOptions = generateSphOptions();

  const generateCylOptions = () => {
    const options = ["", "0.00"];
    for (let i = 0.25; i <= 20.00; i += 0.25) {
      const val = i.toFixed(2);
      options.push(`-${val}`, `+${val}`);
    }
    return options;
  };
  const cylOptions = generateCylOptions();

  const axisOptions = [
    "", "0", "5", "10", "15", "20", "30", "45", "60", "75", "90", "105", "115", "120", "135", "150", "165", "180"
  ];

  const acuityOptions = ["6/6", "6/9", "6/12", "6/18", "6/24", "6/36", "6/60", "NIL"];
  const nearAcuityOptions = ["J1", "J2", "J3", "J4", "J5", "J6", "NIL"];
  const addOptions = ["", "1.00", "1.25", "1.50", "1.75", "2.00", "2.25", "2.50", "2.75", "3.00"];

  // Prefetch patient records for searchable directory lookup
  useEffect(() => {
    async function loadPatients() {
      const stored = localStorage.getItem('hb_demo_patients') || '[]';
      setPatientsList(JSON.parse(stored));
    }
    loadPatients();
  }, []);

  // Handle incoming trigger redirects from registration desk
  useEffect(() => {
    if (prefilledPatient) {
      applySelectedPatient(prefilledPatient);
      clearPrefilledPatient(); // clear so we can reset or select others later
    }
  }, [prefilledPatient]);

  // Load prescription ID sequence
  const fetchRxSequenceId = async () => {
    setIsLoadingRxId(true);
    try {
      const nextId = await generateNextPrescriptionId(true);
      setPrescriptionId(nextId);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingRxId(false);
    }
  };

  useEffect(() => {
    fetchRxSequenceId();
  }, []);

  const prefillPrescriptionPowers = (rx: Prescription) => {
    setReSphDist(rx.rightEyeData.distance.sph || '');
    setReCylDist(rx.rightEyeData.distance.cyl || '');
    setReAxisDist(rx.rightEyeData.distance.axis || '');
    setReVisionDist(rx.rightEyeData.distance.vision || '');

    setReSphNear(rx.rightEyeData.near.sph || '');
    setReCylNear(rx.rightEyeData.near.cyl || '');
    setReAxisNear(rx.rightEyeData.near.axis || '');
    setReVisionNear(rx.rightEyeData.near.vision || '');
    setReAdd(rx.rightEyeData.add || '');

    setLeSphDist(rx.leftEyeData.distance.sph || '');
    setLeCylDist(rx.leftEyeData.distance.cyl || '');
    setLeAxisDist(rx.leftEyeData.distance.axis || '');
    setLeVisionDist(rx.leftEyeData.distance.vision || '');

    setLeSphNear(rx.leftEyeData.near.sph || '');
    setLeCylNear(rx.leftEyeData.near.cyl || '');
    setLeAxisNear(rx.leftEyeData.near.axis || '');
    setLeVisionNear(rx.leftEyeData.near.vision || '');
    setLeAdd(rx.leftEyeData.add || '');

    setPd(rx.pd || '');
    setNotes(rx.notes || '');
    setSelectedAdvice(rx.advice || []);
  };

  const loadLatestPrescription = async (patId: string) => {
    try {
      const stored = localStorage.getItem('hb_demo_prescriptions') || '[]';
      const rxList = JSON.parse(stored) as Prescription[];
      const patientRx = rxList.filter(r => r.patientId === patId);
      if (patientRx.length > 0) {
        patientRx.sort((a, b) => b.prescriptionId.localeCompare(a.prescriptionId));
        prefillPrescriptionPowers(patientRx[0]);
      }
    } catch (err) {
      console.error("Failed loading latest patient prescription:", err);
    }
  };

  const applySelectedPatient = (p: Patient) => {
    setPatientId(p.patientId);
    setPatientName(p.name);
    setMobile(p.mobile);
    setAge(String(p.age));
    setGender(p.gender);
    setSearchQuery(`${p.name} (${p.patientId})`);
    setShowDropdown(false);
    loadLatestPrescription(p.patientId);
  };

  const handleToggleAdvice = (item: string) => {
    if (selectedAdvice.includes(item)) {
      setSelectedAdvice(selectedAdvice.filter(x => x !== item));
    } else {
      setSelectedAdvice([...selectedAdvice, item]);
    }
  };

  // Autocomplete patient search filtering
  const filteredPatients = patientsList.filter(p => {
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.patientId.toLowerCase().includes(q) ||
      p.mobile.includes(q)
    );
  });

  const handleClearForm = () => {
    setPatientId('');
    setPatientName('');
    setMobile('');
    setAge('');
    setSearchQuery('');
    setReSphDist('');
    setReCylDist('');
    setReAxisDist('');
    setReSphNear('');
    setReCylNear('');
    setReAxisNear('');
    setReAdd('');
    setLeSphDist('');
    setLeCylDist('');
    setLeAxisDist('');
    setLeSphNear('');
    setLeCylNear('');
    setLeAxisNear('');
    setLeAdd('');
    setPd('');
    setNotes('');
    setSelectedAdvice([]);
    setActiveCreatedRx(null);
    fetchRxSequenceId();
  };

  const handleSavePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) {
      alert("Please choose a registered patient profile or record details manually before writing eye values.");
      return;
    }

    setIsSaving(true);
    
    let finalPatientId = patientId;
    const parsedAge = parseInt(age, 10) || 0;

    try {
      if (!finalPatientId) {
        finalPatientId = await generateNextPatientId(true);
        setPatientId(finalPatientId);

        const newPatient = {
          patientId: finalPatientId,
          name: patientName.trim(),
          mobile: mobile.trim(),
          age: parsedAge,
          gender,
          date
        };

        const stored = localStorage.getItem('hb_demo_patients') || '[]';
        const current = JSON.parse(stored);
        current.push(newPatient);
        localStorage.setItem('hb_demo_patients', JSON.stringify(current));
      }

      const rightEyeData: EyePower = {
        distance: { sph: reSphDist, cyl: reCylDist, axis: reAxisDist, vision: reVisionDist },
        near: { sph: "", cyl: "", axis: "", vision: reVisionNear },
        add: reAdd
      };

      const leftEyeData: EyePower = {
        distance: { sph: leSphDist, cyl: leCylDist, axis: leAxisDist, vision: leVisionDist },
        near: { sph: "", cyl: "", axis: "", vision: leVisionNear },
        add: leAdd
      };

      const finalRx: Prescription = {
        prescriptionId,
        patientId: finalPatientId,
        patientName: patientName.trim(),
        mobile: mobile.trim(),
        age: parsedAge,
        gender,
        date,
        rightEyeData,
        leftEyeData,
        pd: pd.trim(),
        advice: selectedAdvice,
        notes: notes.trim()
      };

      const stored = localStorage.getItem('hb_demo_prescriptions') || '[]';
      const list = JSON.parse(stored);
      list.push(finalRx);
      localStorage.setItem('hb_demo_prescriptions', JSON.stringify(list));
      setActiveCreatedRx(finalRx);
      setSuccessModal({
        show: true,
        title: "Prescription Finalized",
        message: `Spectacle Rx ${prescriptionId} finalized. Patient ${finalPatientId} registered.`,
        rxId: prescriptionId,
        patientId: finalPatientId
      });

      // Sync to Google Sheets Web App Webhook
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
          advice: finalRx.advice.join(', '),
          notes: finalRx.notes
        };

        const gsheetsUrl = "https://script.google.com/macros/s/AKfycbzht0FXBeoZK2dF7Lev5GYzCCip1IL27oZ3E-Jgrolvj-UUrRNupxKEVsBUfif6xNWt/exec";

        if ((window as any).require) {
          try {
            const https = (window as any).require('https');
            const makeRequest = (targetUrl: string) => {
              const parsedUrl = new URL(targetUrl);
              const options = {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                }
              };

              const req = https.request(parsedUrl, options, (res: any) => {
                if (res.statusCode === 301 || res.statusCode === 302) {
                  makeRequest(res.headers.location);
                  return;
                }
                console.log("Direct Node HTTPS post to GSheets success, status:", res.statusCode);
              });

              req.on('error', (e: any) => {
                console.error("Direct Node HTTPS post to GSheets failed:", e);
              });

              req.write(JSON.stringify(flatData));
              req.end();
            };

            makeRequest(gsheetsUrl);
          } catch (electronErr) {
            console.error("Failed doing Node HTTPS post to GSheets, falling back to fetch:", electronErr);
            fetch(gsheetsUrl, {
              method: "POST",
              mode: "no-cors",
              headers: { "Content-Type": "text/plain;charset=utf-8" },
              body: JSON.stringify(flatData)
            });
          }
        } else {
          fetch(gsheetsUrl, {
            method: "POST",
            mode: "no-cors",
            headers: {
              "Content-Type": "text/plain;charset=utf-8"
            },
            body: JSON.stringify(flatData)
          }).then(() => {
            console.log("Successfully posted prescription record to Google Sheets webhook.");
          }).catch(err => {
            console.error("Google Sheets webhook call failed:", err);
          });
        }
      } catch (sheetErr) {
        console.error("GSheet formatting error:", sheetErr);
      }
    } catch (err) {
      console.error(err);
      alert("Prescription synchronization or patient registration failed. Check database configuration.");
    } finally {
      setIsSaving(false);
    }
  };

  // ── WhatsApp Send Handler ──────────────────────────────────────────────────
  const handleSendWhatsApp = () => {
    let targetPhone = mobile.trim().replace(/\D/g, '');
    if (!targetPhone) {
      alert("Please enter a valid mobile number for the patient first.");
      return;
    }
    if (targetPhone.length === 10) {
      targetPhone = '91' + targetPhone; // Prefix India code if 10-digit
    }

    const fmt = (v: string | undefined) => (v && v !== '—' && v !== '') ? v : '—';

    const msg = [
      `🏥 *Himabindhu Eye Testing & Opticals*`,
      `📍 Dharmavaram, Andhra Pradesh | 📞 9949334443`,
      ``,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `📋 *PRESCRIPTION DETAILS*`,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      ``,
      `👤 *Patient:* ${patientName || '—'}`,
      `🆔 *Patient ID:* ${patientId || '—'}`,
      `📅 *Date:* ${date}`,
      `🎂 *Age:* ${age || '—'} yrs   |   *Gender:* ${gender}`,
      `📱 *Mobile:* ${mobile || '—'}`,
      `🔖 *Rx ID:* ${prescriptionId || '—'}`,
      ``,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `👁️ *RIGHT EYE (OD)*`,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `*Distance:* SPH: ${fmt(reSphDist)} | CYL: ${fmt(reCylDist)} | AXIS: ${fmt(reAxisDist)}° | Vision: ${reVisionDist}`,
      `*Near:* SPH: ${fmt(reSphNear)} | CYL: ${fmt(reCylNear)} | AXIS: ${fmt(reAxisNear)}° | Vision: ${reVisionNear}`,
      reAdd ? `*ADD:* +${reAdd}` : null,
      ``,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `👁️ *LEFT EYE (OS)*`,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `*Distance:* SPH: ${fmt(leSphDist)} | CYL: ${fmt(leCylDist)} | AXIS: ${fmt(leAxisDist)}° | Vision: ${leVisionDist}`,
      `*Near:* SPH: ${fmt(leSphNear)} | CYL: ${fmt(leCylNear)} | AXIS: ${fmt(leAxisNear)}° | Vision: ${leVisionNear}`,
      leAdd ? `*ADD:* +${leAdd}` : null,
      ``,
      pd ? `📏 *PD:* ${pd} mm` : null,
      selectedAdvice.length > 0 ? `💊 *Advice:* ${selectedAdvice.join(', ')}` : null,
      notes ? `📝 *Notes:* ${notes}` : null,
      ``,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `_Thank you for visiting Himabindhu Opticals! 🙏_`,
    ].filter(v => v !== null).join('\n');

    if (waApiType === 'green-api') {
      if (!waInstanceId || !waToken) {
        alert("Please configure Green API Instance ID and Token in WhatsApp Settings first!");
        return;
      }
      
      const chatId = `${targetPhone}@c.us`;
      fetch(`https://api.green-api.com/waInstance${waInstanceId}/sendMessage/${waToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId, message: msg })
      })
      .then(res => {
        if (!res.ok) throw new Error("API status " + res.status);
        return res.json();
      })
      .then(() => {
        alert("Prescription message sent automatically via Green API! ✅");
      })
      .catch(err => {
        console.error("Green API Error:", err);
        alert("WhatsApp API send failed. Opening web link instead...");
        window.open(`https://wa.me/${targetPhone}?text=${encodeURIComponent(msg)}`, '_blank');
      });
      return;
    }

    if (waApiType === 'ultramsg') {
      if (!waInstanceId || !waToken) {
        alert("Please configure UltraMsg Instance ID and Token in WhatsApp Settings first!");
        return;
      }

      fetch(`https://api.ultramsg.com/${waInstanceId}/messages/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: waToken,
          to: targetPhone,
          body: msg
        })
      })
      .then(res => {
        if (!res.ok) throw new Error("API status " + res.status);
        return res.json();
      })
      .then(() => {
        alert("Prescription message sent automatically via UltraMsg! ✅");
      })
      .catch(err => {
        console.error("UltraMsg Error:", err);
        alert("WhatsApp API send failed. Opening web link instead...");
        window.open(`https://wa.me/${targetPhone}?text=${encodeURIComponent(msg)}`, '_blank');
      });
      return;
    }

    if ((window as any).require) {
      try {
        const { ipcRenderer } = (window as any).require('electron');
        ipcRenderer.send('send-whatsapp-automated', { phone: targetPhone, text: msg });
        return;
      } catch (err) {
        console.error("Failed to send via Electron IPC automation, falling back to browser tab:", err);
      }
    }

    const url = `https://wa.me/${targetPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };
  // ────────────────────────────────────────────────────────────────────────────

  const livePreviewRx: Prescription = {
    prescriptionId: prescriptionId || 'RX-TEMP',
    patientId: patientId || 'HB-TEMP',
    patientName: patientName || 'Patient Name',
    mobile: mobile || 'Mobile Number',
    age: parseInt(age) || 0,
    gender: gender,
    date: date || new Date().toISOString().split('T')[0],
    rightEyeData: {
      distance: { sph: reSphDist || '—', cyl: reCylDist || '—', axis: reAxisDist || '—', vision: reVisionDist || '—' },
      near: { sph: '—', cyl: '—', axis: '—', vision: reVisionNear || '—' },
      add: reAdd ? `+${reAdd}` : '—'
    },
    leftEyeData: {
      distance: { sph: leSphDist || '—', cyl: leCylDist || '—', axis: leAxisDist || '—', vision: leVisionDist || '—' },
      near: { sph: '—', cyl: '—', axis: '—', vision: leVisionNear || '—' },
      add: leAdd ? `+${leAdd}` : '—'
    },
    pd: pd || '—',
    advice: selectedAdvice,
    notes: notes || '—'
  };

  return (
    <div className="space-y-8 font-sans pt-6">
      


      {/* Main Refraction Entry form */}
      <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-950">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-5 h-5 text-blue-200" />
                <h3 className="font-extrabold text-white text-md">Ophthalmic Refraction Entry Desk</h3>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowWASettings(true)}
                  className="p-1 text-slate-400 hover:text-white transition rounded-md hover:bg-slate-800 cursor-pointer flex items-center justify-center"
                  title="Configure WhatsApp API Settings"
                >
                  <Settings className="w-4.5 h-4.5" />
                </button>
                <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded font-mono text-amber-300 font-bold">
                  {isLoadingRxId ? "SYNCING Rx ID..." : `Active Rx: ${prescriptionId}`}
                </span>
              </div>
            </div>

            <form onSubmit={handleSavePrescription} className="p-6 space-y-6">
              {/* Patient Details Form Fields */}
              <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-150 space-y-4">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Patient Information Details
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">
                      Patient ID
                    </label>
                    <input
                      type="text"
                      value={patientId || 'Auto-Generated'}
                      readOnly
                      className="w-full border border-gray-255 bg-gray-150 rounded-lg px-2.5 py-1.5 text-xs text-gray-550 font-bold font-mono cursor-default focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">
                      Patient Name
                    </label>
                    <input
                      type="text"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      required
                      placeholder="Enter full name"
                      className="w-full border border-gray-300 bg-white rounded-lg px-2.5 py-1.5 text-xs text-gray-700"
                      id="rx-patient-name"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">
                      Mobile Number
                    </label>
                    <input
                      type="text"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      required
                      placeholder="Phone"
                      className="w-full border border-gray-300 bg-white rounded-lg px-2.5 py-1.5 text-xs text-gray-700"
                      id="rx-patient-mobile"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">
                      Age
                    </label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      required
                      placeholder="Years"
                      className="w-full border border-gray-300 bg-white rounded-lg px-2.5 py-1.5 text-xs text-gray-700"
                      id="rx-patient-age"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">
                      Gender
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full border border-gray-300 bg-white rounded-lg px-2.5 py-1.5 text-xs text-gray-700"
                      id="rx-patient-gender"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Transgender">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Refraction Fields Header */}
              <div className="flex items-center gap-1.5 border-b pb-2 border-gray-150">
                <span className="w-1.5 h-4.5 bg-amber-700 rounded"></span>
                <h4 className="text-xs font-black text-blue-950 uppercase tracking-widest">
                  Optometry Prescription Values Matrix
                </h4>
              </div>

              {/* Dual Column Side-by-Side: RIGHT EYE vs LEFT EYE */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* 1. RIGHT EYE PANEL (OD) */}
                <div className="p-4 bg-amber-50/20 border-1 border-amber-200 rounded-2xl relative">
                  <svg className="w-16 h-16 text-amber-500/10 absolute -right-2 -top-2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <div className="flex justify-between items-center mb-4 gap-4">
                    <h5 className="font-extrabold text-blue-950 text-sm">Right Eye Specifications</h5>
                    <span className="font-bold text-slate-900 bg-amber-100/60 px-2.5 py-0.5 rounded-full border border-amber-200 text-[10px] tracking-wider uppercase shrink-0">
                      R.E. (OD)
                    </span>
                  </div>
                  
                  {/* Distance specs */}
                  <div className="space-y-3.5">
                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Distance Vision parameters</p>
                    <div className="grid grid-cols-2 gap-3.5">
                      <SearchableSelect
                        label="Spherical (SPH)"
                        value={reSphDist}
                        onChange={setReSphDist}
                        options={sphOptions}
                      />
                      <SearchableSelect
                        label="Cylindrical (CYL)"
                        value={reCylDist}
                        onChange={setReCylDist}
                        options={cylOptions}
                      />
                      <SearchableSelect
                        label="Axis"
                        value={reAxisDist}
                        onChange={setReAxisDist}
                        options={axisOptions}
                      />
                      <SearchableSelect
                        label="Visual Acuity"
                        value={reVisionDist}
                        onChange={setReVisionDist}
                        options={acuityOptions}
                      />
                    </div>

                    {/* Near specs */}
                    <div className="border-t border-dashed border-gray-200 pt-3.5 mt-3.5 space-y-3.5">
                      <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Near Vision parameters</p>
                      <div className="grid grid-cols-2 gap-3.5">
                        <div>
                          <label className="block text-[10px] text-gray-550 mb-1 font-semibold">Spherical (SPH)</label>
                          <input
                            type="text"
                            value="—"
                            disabled
                            className="w-full text-xs font-mono border border-gray-300 bg-gray-50 rounded-lg p-1.5 text-gray-400 cursor-not-allowed text-center"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-550 mb-1 font-semibold">Cylindrical (CYL)</label>
                          <input
                            type="text"
                            value="—"
                            disabled
                            className="w-full text-xs font-mono border border-gray-300 bg-gray-50 rounded-lg p-1.5 text-gray-400 cursor-not-allowed text-center"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-550 mb-1 font-semibold">Axis</label>
                          <input
                            type="text"
                            value="—"
                            disabled
                            className="w-full text-xs font-mono border border-gray-300 bg-gray-50 rounded-lg p-1.5 text-gray-400 cursor-not-allowed text-center"
                          />
                        </div>
                        <SearchableSelect
                          label="Acuity (Near)"
                          value={reVisionNear}
                          onChange={setReVisionNear}
                          options={nearAcuityOptions}
                        />
                      </div>
                    </div>

                    {/* Right Eye Add */}
                    <div className="border-t border-dashed border-gray-250 pt-3.5 mt-3.5 bg-amber-50/20 p-2.5 rounded-lg border border-amber-200">
                      <SearchableSelect
                        label="ADD Power"
                        value={reAdd}
                        onChange={setReAdd}
                        options={addOptions}
                        renderOption={(opt) => opt ? `+${opt}` : '—'}
                      />
                    </div>

                  </div>
                </div>

                {/* 2. LEFT EYE PANEL (OS) */}
                <div className="p-4 bg-indigo-50/20 border-1 border-indigo-100 rounded-2xl relative">
                  <svg className="w-16 h-16 text-indigo-500/10 absolute -right-2 -top-2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <div className="flex justify-between items-center mb-4 gap-4">
                    <h5 className="font-extrabold text-blue-950 text-sm">Left Eye Specifications</h5>
                    <span className="font-bold text-indigo-900 bg-indigo-100/60 px-2.5 py-0.5 rounded-full border border-indigo-200 text-[10px] tracking-wider uppercase shrink-0">
                      L.E. (OS)
                    </span>
                  </div>
                  
                  {/* Distance specs */}
                  <div className="space-y-3.5">
                    <p className="text-[10px] uppercase font-bold text-gray-405 tracking-wider">Distance Vision parameters</p>
                    <div className="grid grid-cols-2 gap-3.5">
                      <SearchableSelect
                        label="Spherical (SPH)"
                        value={leSphDist}
                        onChange={setLeSphDist}
                        options={sphOptions}
                      />
                      <SearchableSelect
                        label="Cylindrical (CYL)"
                        value={leCylDist}
                        onChange={setLeCylDist}
                        options={cylOptions}
                      />
                      <SearchableSelect
                        label="Axis"
                        value={leAxisDist}
                        onChange={setLeAxisDist}
                        options={axisOptions}
                      />
                      <SearchableSelect
                        label="Visual Acuity"
                        value={leVisionDist}
                        onChange={setLeVisionDist}
                        options={acuityOptions}
                      />
                    </div>

                    {/* Near specs */}
                    <div className="border-t border-dashed border-gray-200 pt-3.5 mt-3.5 space-y-3.5">
                      <p className="text-[10px] uppercase font-bold text-gray-405 tracking-wider">Near Vision parameters</p>
                      <div className="grid grid-cols-2 gap-3.5">
                        <div>
                          <label className="block text-[10px] text-gray-550 mb-1 font-semibold">Spherical (SPH)</label>
                          <input
                            type="text"
                            value="—"
                            disabled
                            className="w-full text-xs font-mono border border-gray-300 bg-gray-50 rounded-lg p-1.5 text-gray-400 cursor-not-allowed text-center"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-550 mb-1 font-semibold">Cylindrical (CYL)</label>
                          <input
                            type="text"
                            value="—"
                            disabled
                            className="w-full text-xs font-mono border border-gray-300 bg-gray-50 rounded-lg p-1.5 text-gray-400 cursor-not-allowed text-center"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-550 mb-1 font-semibold">Axis</label>
                          <input
                            type="text"
                            value="—"
                            disabled
                            className="w-full text-xs font-mono border border-gray-300 bg-gray-50 rounded-lg p-1.5 text-gray-400 cursor-not-allowed text-center"
                          />
                        </div>
                        <SearchableSelect
                          label="Acuity (Near)"
                          value={leVisionNear}
                          onChange={setLeVisionNear}
                          options={nearAcuityOptions}
                        />
                      </div>
                    </div>

                    {/* Left Eye Add */}
                    <div className="border-t border-dashed border-gray-250 pt-3.5 mt-3.5 bg-indigo-50/50 p-2.5 rounded-lg border border-indigo-105">
                      <SearchableSelect
                        label="ADD Power"
                        value={leAdd}
                        onChange={setLeAdd}
                        options={addOptions}
                        renderOption={(opt) => opt ? `+${opt}` : '—'}
                      />
                    </div>

                  </div>
                </div>

              </div>

              {/* Physical metadata & lens advice checkboxes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-gray-100">
                
                {/* Physical params & Remarks */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Pupillary Distance (PD mm)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 64"
                      value={pd}
                      onChange={(e) => setPd(e.target.value)}
                      className="w-full border border-gray-300 bg-white rounded-xl px-4 py-2.5 text-xs text-gray-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Clinical Notes / Remarks / Diagnosis
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Routine general checkup. No ocular disease detected..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full border border-gray-300 bg-white rounded-xl p-3 text-xs text-gray-700"
                    />
                  </div>
                </div>

                {/* advice check boxes */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                    Spectacle Ophthalmic Advice Checklist
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2 border rounded-xl p-3 bg-gray-50 border-gray-200">
                    {adviceList.map((advice) => {
                      const isChecked = selectedAdvice.includes(advice);
                      return (
                        <button 
                          key={advice}
                          type="button"
                          onClick={() => handleToggleAdvice(advice)}
                          className={`flex items-center justify-between p-2.5 rounded-xl border text-[10.5px] font-bold text-left transition-all ${
                            isChecked 
                              ? 'bg-amber-600 border-amber-600 text-white shadow-xs' 
                              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <span className="truncate">{advice}</span>
                          <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center text-[9px] font-bold shrink-0 ml-1.5 transition-all ${
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

              {/* Submission buttons */}
              <div className="pt-5 border-t border-gray-150 flex flex-wrap justify-between gap-4">
                <div className="flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={handleClearForm}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset Form
                  </button>

                  <button
                    type="button"
                    onClick={() => printPrescriptionHTML(livePreviewRx)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-xs"
                  >
                    <Printer className="w-4 h-4 text-emerald-400" />
                    Print Custom Laser Slip
                  </button>

                  <PDFDownloadLink
                    document={<PrescriptionPDFDocument prescription={livePreviewRx} />}
                    fileName={`Prescription_${prescriptionId || 'HB-Rx'}.pdf`}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-2 decoration-none shadow-xs cursor-pointer"
                  >
                    {({ loading }) => (
                      <>
                        <Download className="w-4 h-4 text-amber-400" />
                        {loading ? 'Compiling PDF...' : 'Download PDF'}
                      </>
                    )}
                  </PDFDownloadLink>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  <button
                    type="submit"
                    disabled={isSaving || isLoadingRxId}
                    className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-sm transition cursor-pointer"
                  >
                    <Save className="w-4.5 h-4.5" />
                    {isSaving ? "Saving..." : "Finalize & Synchronize"}
                  </button>

                  <button
                    type="button"
                    onClick={handleSendWhatsApp}
                    className="px-5 py-2.5 bg-[#25D366] hover:bg-[#20b858] text-white rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-sm transition cursor-pointer"
                    title="Send prescription via WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Send via WhatsApp
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>

        {/* WhatsApp Settings Modal */}
        {showWASettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-150 max-w-md w-full overflow-hidden transition-all transform scale-100">
              {/* Header */}
              <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-blue-400" />
                  <h3 className="font-extrabold text-sm text-white">WhatsApp Automation Config</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowWASettings(false)}
                  className="text-gray-400 hover:text-white transition text-lg font-bold cursor-pointer"
                >
                  &times;
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                    Integration Type
                  </label>
                  <select
                    value={waApiType}
                    onChange={(e) => setWaApiType(e.target.value)}
                    className="w-full border border-gray-300 bg-white rounded-lg px-3 py-2 text-xs font-semibold text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="direct">Direct Link (Opens Web/App Chat - Free)</option>
                    <option value="green-api">Green API (Auto Send - Free/Paid)</option>
                    <option value="ultramsg">UltraMsg (Auto Send - Paid)</option>
                  </select>
                </div>

                {waApiType !== 'direct' && (
                  <>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-[11px] text-amber-800 leading-relaxed">
                      💡 <strong>Setup Tip:</strong> Scan the QR code in your provider's dashboard (Green API or UltraMsg) to pair your phone number. Then paste the credentials below.
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                        Instance ID
                      </label>
                      <input
                        type="text"
                        value={waInstanceId}
                        onChange={(e) => setWaInstanceId(e.target.value)}
                        placeholder="e.g. 1101825700"
                        className="w-full border border-gray-300 bg-white rounded-lg px-3 py-2 text-xs font-mono text-gray-700 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                        API Token / Token Instance
                      </label>
                      <input
                        type="password"
                        value={waToken}
                        onChange={(e) => setWaToken(e.target.value)}
                        placeholder="Paste your API Token instance"
                        className="w-full border border-gray-300 bg-white rounded-lg px-3 py-2 text-xs font-mono text-gray-700 focus:outline-hidden"
                      />
                    </div>
                  </>
                )}

                {waApiType === 'direct' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-[11px] text-blue-800 leading-relaxed">
                    ℹ️ <strong>Direct Link Mode:</strong> No account setup required. Clicking "Send" will launch WhatsApp with the text pre-filled, but requires you to click "Send" inside WhatsApp.
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowWASettings(false)}
                  className="px-4 py-2 border border-gray-300 hover:bg-gray-100 text-gray-600 rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveWASettings}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  Save Config
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal Popup */}
        {successModal && activeCreatedRx && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-150 max-w-md w-full overflow-hidden transition-all transform scale-100 flex flex-col p-6 text-center space-y-6">
              
              {/* Checkmark animation */}
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-50 border border-emerald-150 flex items-center justify-center text-emerald-600 animate-bounce">
                <CheckCircle className="w-9 h-9" />
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                <h3 className="text-lg font-black text-slate-900 font-serif leading-tight">
                  {successModal.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold px-2">
                  {successModal.message}
                </p>
              </div>

              {/* Registry IDs details */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 border border-slate-150 p-4 rounded-2xl text-xs font-bold text-slate-800">
                <div className="space-y-1 text-center">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Patient ID</p>
                  <p className="font-mono text-emerald-800 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100 uppercase inline-block font-black">
                    {successModal.patientId}
                  </p>
                </div>
                <div className="space-y-1 text-center">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Rx Number</p>
                  <p className="font-mono text-blue-800 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100 uppercase inline-block font-black">
                    {successModal.rxId}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 pt-2">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => printPrescriptionHTML(activeCreatedRx)}
                    className="flex-1 px-4 py-2.5 bg-slate-900 hover:bg-slate-850 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
                  >
                    <Printer className="w-4 h-4 text-emerald-400" />
                    Print Laser Slip
                  </button>

                  <PDFDownloadLink
                    document={<PrescriptionPDFDocument prescription={activeCreatedRx} />}
                    fileName={`Prescription_${successModal.rxId}.pdf`}
                    className="flex-1 px-4 py-2.5 bg-slate-850 hover:bg-slate-800 text-slate-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 decoration-none shadow-xs cursor-pointer"
                  >
                    {({ loading }) => (
                      <>
                        <Download className="w-4 h-4 text-amber-400" />
                        {loading ? 'Compiling...' : 'Download PDF'}
                      </>
                    )}
                  </PDFDownloadLink>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSuccessModal(null);
                    handleClearForm();
                  }}
                  className="w-full px-5 py-3 bg-emerald-805 hover:bg-emerald-900 text-white rounded-xl text-xs font-extrabold transition cursor-pointer shadow-md"
                >
                  Close & Start New Entry
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
  );
}
