import React, { useState } from 'react';
import { useAuth, UserRole } from '../context/AuthContext';
import { Prescription, printPrescriptionHTML, PrescriptionPDFViewerPanel } from '../components/PrescriptionPDF';
import { 
  Eye, 
  Sparkles, 
  Search, 
  Clock, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  Glasses, 
  Activity, 
  ChevronLeft,
  ChevronRight, 
  FileText, 
  Printer,
  ShieldAlert,
  Loader2,
  Lock,
  ArrowRight,
  X
} from 'lucide-react';
import { motion } from 'motion/react';

const frameCategories = [
  {
    id: 'rectangle',
    name: 'Rectangle',
    tagline: 'Structured, Bold & Professional',
    description: 'Often wider with sharp angles, flattering on most face shapes.',
    models: [
      { name: 'Onyx Steel Rectangle', code: 'HB-RE-STEEL', price: '₹1,599', image: '/frames/rectangle.png', desc: 'Lightweight stainless steel frame in matte black.' },
      { name: 'Matte Wayfarer Rectangle', code: 'HB-WF-MATTE', price: '₹1,299', image: '/frames/wayfarer.png', desc: 'Full-rim sturdy frame with smooth rubberized acetate.' }
    ]
  },
  {
    id: 'round',
    name: 'Round',
    tagline: 'Soft Curves & Vintage Intellect',
    description: 'Soft curves that can soften angular features.',
    models: [
      { name: 'Crystal Clear Round', code: 'HB-RD-CLEAR', price: '₹1,499', image: '/frames/round.png', desc: 'Transparent high-quality acetate with visible wire cores.' },
      { name: 'Rose Gold Wire Round', code: 'HB-RD-ROSE', price: '₹1,799', image: '/frames/round.png', desc: 'Chic ultra-thin metallic frames with soft adjustable nose pads.' }
    ]
  },
  {
    id: 'cateye',
    name: 'Cat-Eye',
    tagline: 'Retro Upswept Elegance',
    description: 'Characterized by upswept outer edges, popular for a vintage look.',
    models: [
      { name: 'Vintage Tortoise Cat-Eye', code: 'HB-CE-TORTOISE', price: '₹1,899', image: '/frames/cateye.png', desc: 'Elegant upswept wings in classic amber-spotted tortoise shell.' },
      { name: 'Midnight Velvet Cat-Eye', code: 'HB-CE-BLACK', price: '₹1,699', image: '/frames/cateye.png', desc: 'Sleek black high-gloss acetate cat-eye with gold hinge details.' }
    ]
  },
  {
    id: 'browline',
    name: 'Browline',
    tagline: 'Bold Top Frame Structure',
    description: 'Features a bold upper frame, resembling eyebrows.',
    models: [
      { name: 'Executive Browline', code: 'HB-BL-EXEC', price: '₹2,199', image: '/frames/browline.png', desc: 'Heavy acetate upper arch with golden metal lower rim support.' },
      { name: 'Slate Grey Semi-Rimless', code: 'HB-BL-SLATE', price: '₹1,999', image: '/frames/browline.png', desc: 'Modernized titanium browline with matte gunmetal accents.' }
    ]
  },
  {
    id: 'oval',
    name: 'Oval',
    tagline: 'Soft, Balanced & Elegant',
    description: 'Soft, rounded shape that complements angular features.',
    models: [
      { name: 'Havana Amber Oval', code: 'HB-OV-AMBER', price: '₹1,599', image: '/frames/oval.png', desc: 'Polished acetate frame with soft fluid curves.' },
      { name: 'Silver Whisper Oval', code: 'HB-OV-SILVER', price: '₹1,699', image: '/frames/oval.png', desc: 'Featherlight silver titanium frame with clear temple tips.' }
    ]
  },
  {
    id: 'square',
    name: 'Square',
    tagline: 'Sharp Angles & Distinct Definition',
    description: 'Sharp angles that can balance rounder face shapes.',
    models: [
      { name: 'Onyx Bold Square', code: 'HB-SQ-ONYX', price: '₹1,799', image: '/frames/square.png', desc: 'Thick-profile square frames with a strong bridge architectural line.' },
      { name: 'Crystal Ocean Square', code: 'HB-SQ-OCEAN', price: '₹1,699', image: '/frames/square.png', desc: 'Transparent deep-sea blue square acetate frame with silver core wire.' }
    ]
  },
  {
    id: 'clubmaster',
    name: 'Clubmaster',
    tagline: 'Vintage Revival & Iconic Styling',
    description: 'A combination of browline and round styles, offering a retro vibe.',
    models: [
      { name: 'Classic Ebony Clubmaster', code: 'HB-CM-CLASSIC', price: '₹2,099', image: '/frames/clubmaster.png', desc: 'Timeless retro styling with black upper frame and gold wire rims.' },
      { name: 'Tortoise Gold Clubmaster', code: 'HB-CM-GOLD', price: '₹2,299', image: '/frames/clubmaster.png', desc: 'Premium edition featuring rich amber tortoise shell and polished gold.' }
    ]
  },
  {
    id: 'geometric',
    name: 'Geometric',
    tagline: 'Modern Artistry & Hexagonal Lines',
    description: 'Unique shapes that add a modern touch.',
    models: [
      { name: 'Hexa-Bronze Geometric', code: 'HB-GM-HEX', price: '₹1,999', image: '/frames/geometric.png', desc: 'Polygonal thin metal wireframe in a warm bronze finish.' },
      { name: 'Octa-Crystal Geometric', code: 'HB-GM-OCTA', price: '₹1,899', image: '/frames/geometric.png', desc: 'Bold octagonal crystal-clear frame with rose-gold details.' }
    ]
  },
  {
    id: 'aviator',
    name: 'Aviator',
    tagline: 'Classic Teardrop Styling',
    description: 'Teardrop shape, originally designed for pilots, now a fashion staple.',
    models: [
      { name: 'Maverick Gold Aviator', code: 'HB-AV-MAVERICK', price: '₹1,899', image: '/frames/aviator.png', desc: 'Thin double-bridge wireframe with iconic green-tint demo lenses.' },
      { name: 'Stealth Black Aviator', code: 'HB-AV-STEALTH', price: '₹1,999', image: '/frames/aviator.png', desc: 'Matte black steel frame with matching black temple wraps.' }
    ]
  }
];

const clinicImages = [
  { url: '/clinic_slit_lamp_1.jpg', caption: 'Computerised Eye Refraction Testing' },
  { url: '/clinic_interior.jpg', caption: 'Premium Optical Showroom & Consultation Desk' },
  { url: '/clinic_sunglasses.jpg', caption: 'Luxury Branded Sunglasses Collection' },
  { url: '/clinic_slit_lamp_2.jpg', caption: 'Comprehensive Vision Care & Patient Diagnostic' },
  { url: '/clinic_frames_close.jpg', caption: 'Precision Engineered Optical Frame Selection' }
];

interface HomeProps {
  onNavigateToLogin: () => void;
  onSelectFrameType: (id: string) => void;
}

export default function Home({ onNavigateToLogin, onSelectFrameType }: HomeProps) {
  const { isDemoMode, setDemoProfile } = useAuth();
  const [activeCategory, setActiveCategory] = useState(frameCategories[0]);

  // Clinic gallery state
  const [currentGalleryIdx, setCurrentGalleryIdx] = useState(0);
  const [isFlashing, setIsFlashing] = useState(false);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setIsFlashing(true);
      setTimeout(() => {
        setCurrentGalleryIdx((prev) => (prev + 1) % clinicImages.length);
      }, 250);
      setTimeout(() => {
        setIsFlashing(false);
      }, 500);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const handlePrevGallery = () => {
    if (isFlashing) return;
    setIsFlashing(true);
    setTimeout(() => {
      setCurrentGalleryIdx((prev) => (prev - 1 + clinicImages.length) % clinicImages.length);
    }, 250);
    setTimeout(() => {
      setIsFlashing(false);
    }, 500);
  };

  const handleNextGallery = () => {
    if (isFlashing) return;
    setIsFlashing(true);
    setTimeout(() => {
      setCurrentGalleryIdx((prev) => (prev + 1) % clinicImages.length);
    }, 250);
    setTimeout(() => {
      setIsFlashing(false);
    }, 500);
  };
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Prescription[]>([]);
  const [searched, setSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedRx, setSelectedRx] = useState<Prescription | null>(null);

  // Cached Records for Live Search
  const [cachedRecords, setCachedRecords] = useState<Prescription[] | null>(null);

  React.useEffect(() => {
    const fetchAll = async () => {
      try {
        const response = await fetch(`https://script.google.com/macros/s/AKfycbwin877dfuTnQuvzaSifRtDBtkqbsUG7ULF2RxwJH9-t65AUOC9QAs_quXTgPdmncJW/exec`);
        if (response.ok) {
          const resData = await response.json();
          if (Array.isArray(resData)) {
            const mappedData: Prescription[] = resData.map((item: any) => ({
              prescriptionId: item['Prescription ID'] || item.PrescriptionID || item.prescriptionId || '',
              patientId: item['Patient ID'] || item.PatientID || item.patientId || '',
              patientName: item['Patient Name'] || item.PatientName || item.patientName || item.name || '',
              mobile: String(item['Mobile'] || item.mobile || ''),
              age: Number(item['Age'] || item.age || 0),
              gender: item['Gender'] || item.gender || 'Male',
              date: (item['Date'] || item.date || '').split('T')[0],
              pd: String(item['PD'] || item.pd || ''),
              advice: (item['Advice'] || item.advice) ? String(item['Advice'] || item.advice).split(',').map((s: string) => s.trim()) : [],
              notes: item['Notes'] || item.notes || '',
              frameName: item['FrameName'] || item['Frame Name'] || item.frameName || '',
              lensType: item['LensType'] || item['Lens Type'] || item.lensType || '',
              orderStatus: item['DeliveryStatus'] || item['Delivery Status'] || item.orderStatus || '',
              rightEyeData: {
                distance: { sph: String(item['RE SPH'] || item.RESPH || ''), cyl: String(item['RE CYL'] || item.RECYL || ''), axis: String(item['RE AXIS'] || item.REAXIS || ''), vision: item['RE Vision'] || item.REVision || '' },
                near: { sph: '', cyl: '', axis: '', vision: item['RE Near Vision'] || item.RENearVision || '' },
                add: String(item['RE Add'] || item.REAdd || '')
              },
              leftEyeData: {
                distance: { sph: String(item['LE SPH'] || item.LESPH || ''), cyl: String(item['LE CYL'] || item.LECYL || ''), axis: String(item['LE AXIS'] || item.LEAXIS || ''), vision: item['LE Vision'] || item.LEVision || '' },
                near: { sph: '', cyl: '', axis: '', vision: item['LE Near Vision'] || item.LENearVision || '' },
                add: String(item['LE Add'] || item.LEAdd || '')
              }
            }));
            setCachedRecords(mappedData);
          }
        }
      } catch (err) {
        console.warn("Background GSheets fetch failed", err);
      }
    };
    fetchAll();
  }, []);

  React.useEffect(() => {
    const queryStr = searchQuery.trim().toLowerCase();
    if (!queryStr) {
      setSearchResults([]);
      setSearched(false);
      setSearchError(null);
      return;
    }

    const doLiveSearch = () => {
      let recordsToSearch = cachedRecords;
      
      if (!recordsToSearch) {
        const demoRxStr = localStorage.getItem('hb_demo_prescriptions') || '[]';
        recordsToSearch = JSON.parse(demoRxStr) as Prescription[];
      }

      const filtered = recordsToSearch.filter(rx => 
        (rx.patientId && String(rx.patientId).toLowerCase().includes(queryStr)) || 
        (rx.mobile && String(rx.mobile).replace(/\D/g, '').includes(queryStr.replace(/\D/g, ''))) ||
        (rx.patientName && String(rx.patientName).toLowerCase().includes(queryStr))
      );

      setSearchResults(filtered);
      setSearched(true);
      if (filtered.length === 0) {
        setSearchError('No matching diagnostic registers found. Double-check your ID or mobile phone.');
      } else {
        setSearchError(null);
      }
    };

    const timeoutId = setTimeout(doLiveSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, cachedRecords]);

  // Clinic timing and status state
  const [morningHours, setMorningHours] = useState('9:00 a.m. to 2:00 p.m.');
  const [eveningHours, setEveningHours] = useState('4:00 p.m. to 9:00 p.m.');
  const [clinicStatus, setClinicStatus] = useState<'open' | 'half-day' | 'closed'>('open');
  const [customNotice, setCustomNotice] = useState('');

  // Dynamic live clock for automatic status updates
  const [currentTime, setCurrentTime] = useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 20000); // Check every 20 seconds
    return () => clearInterval(timer);
  }, []);

  // Dynamic override: automatically show Closed outside morning/evening sessions
  const activeDisplayStatus = React.useMemo(() => {
    if (clinicStatus === 'closed') return 'closed';
    
    const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    
    const parseTimeToMinutes = (timeStr: string): number | null => {
      const clean = timeStr.toLowerCase().replace(/\s+/g, '');
      const match = clean.match(/^(\d+)(?::(\d+))?([ap]\.?m\.?)?$/);
      if (!match) return null;
      let hours = parseInt(match[1], 10);
      const minutes = match[2] ? parseInt(match[2], 10) : 0;
      const ampm = match[3];
      if (ampm) {
        const isPm = ampm.includes('p');
        if (isPm && hours < 12) hours += 12;
        if (!isPm && hours === 12) hours = 0;
      }
      return hours * 60 + minutes;
    };

    const isTimeInRange = (currentMinutes: number, rangeStr: string): boolean => {
      const parts = rangeStr.split(/to|-/i);
      if (parts.length !== 2) return false;
      const start = parseTimeToMinutes(parts[0].trim());
      const end = parseTimeToMinutes(parts[1].trim());
      if (start === null || end === null) return false;
      if (start <= end) {
        return currentMinutes >= start && currentMinutes <= end;
      } else {
        return currentMinutes >= start || currentMinutes <= end;
      }
    };

    const inMorning = isTimeInRange(currentMinutes, morningHours);
    const inEvening = isTimeInRange(currentMinutes, eveningHours);

    if (!inMorning && !inEvening) {
      return 'closed';
    }
    return clinicStatus;
  }, [clinicStatus, morningHours, eveningHours, currentTime]);

  const loadClinicSchedule = () => {
    const saved = localStorage.getItem('hb_clinic_schedule');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.morningHours) setMorningHours(parsed.morningHours);
        if (parsed.eveningHours) setEveningHours(parsed.eveningHours);
        if (parsed.status) setClinicStatus(parsed.status);
        if (parsed.customNotice !== undefined) setCustomNotice(parsed.customNotice);
      } catch (e) {
        console.error("Failed to load clinic schedule from localstorage:", e);
      }
    }
  };

  React.useEffect(() => {
    loadClinicSchedule();
    window.addEventListener('storage', loadClinicSchedule);
    
    return () => {
      window.removeEventListener('storage', loadClinicSchedule);
    };
  }, []);

  // Handle patient prescription search
  const handlePatientSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const queryStr = searchQuery.trim().toLowerCase();
    if (!queryStr) {
      setSearchError('Please enter your Patient ID or Registered Mobile Number.');
      return;
    }

    setSearching(true);
    setSearchError(null);
    setSearched(true);
    setSelectedRx(null);
    setSearchResults([]);

    try {
      // Fetch directly from Google Sheets Web App endpoint
      const gsheetsUrl = `https://script.google.com/macros/s/AKfycbwin877dfuTnQuvzaSifRtDBtkqbsUG7ULF2RxwJH9-t65AUOC9QAs_quXTgPdmncJW/exec`;
      
      try {
        const response = await fetch(gsheetsUrl);
        if (response.ok) {
          const resData = await response.json();
          if (Array.isArray(resData)) {
            const mappedData: Prescription[] = resData.map((item: any) => ({
              prescriptionId: item.PrescriptionID || '',
              patientId: item.PatientID || '',
              patientName: item.PatientName || '',
              mobile: String(item.Mobile || ''),
              age: Number(item.Age || 0),
              gender: item.Gender || 'Male',
              date: item.Date ? item.Date.split('T')[0] : '',
              pd: String(item.PD || ''),
              advice: item.Advice ? item.Advice.split(',').map((s: string) => s.trim()) : [],
              notes: item.Notes || '',
              frameName: item.FrameName || '',
              lensType: item.LensType || '',
              orderStatus: item.DeliveryStatus || '',
              rightEyeData: {
                distance: { sph: String(item.RESPH || ''), cyl: String(item.RECYL || ''), axis: String(item.REAXIS || ''), vision: item.REVision || '' },
                near: { sph: '', cyl: '', axis: '', vision: item.RENearVision || '' },
                add: String(item.REAdd || '')
              },
              leftEyeData: {
                distance: { sph: String(item.LESPH || ''), cyl: String(item.LECYL || ''), axis: String(item.LEAXIS || ''), vision: item.LEVision || '' },
                near: { sph: '', cyl: '', axis: '', vision: item.LENearVision || '' },
                add: String(item.LEAdd || '')
              }
            }));
            
            const filteredGSheets = mappedData.filter(rx => 
              (rx.patientId && String(rx.patientId).toLowerCase().includes(queryStr)) || 
              (rx.mobile && String(rx.mobile).replace(/\D/g, '').includes(queryStr.replace(/\D/g, ''))) ||
              (rx.patientName && String(rx.patientName).toLowerCase().includes(queryStr))
            );

            // Update cache as well
            setCachedRecords(mappedData);

            setSearchResults(filteredGSheets);
            if (filteredGSheets.length === 0) {
              setSearchError('No matching diagnostic registers found in Google Sheets. Double-check your ID or mobile phone.');
            } else {
              setSelectedRx(null);
            }
            setSearching(false);
            return; // Successfully retrieved from GSheets!
          }
        }
      } catch (gsheetsErr) {
        console.warn("Direct Google Sheets fetch failed or blocked by CORS. Falling back to clinical database...", gsheetsErr);
      }

      // Fallback: Query local storage database
      const demoRxStr = localStorage.getItem('hb_demo_prescriptions') || '[]';
      const list = JSON.parse(demoRxStr) as Prescription[];
      const filtered = list.filter(rx => 
        (rx.patientId && String(rx.patientId).toLowerCase().includes(queryStr)) || 
        (rx.mobile && String(rx.mobile).replace(/\D/g, '').includes(queryStr.replace(/\D/g, ''))) ||
        (rx.patientName && String(rx.patientName).toLowerCase().includes(queryStr))
      );
      setSearchResults(filtered);
      if (filtered.length === 0) {
        setSearchError('No matching diagnostic registers found. Double-check your ID or mobile phone.');
      } else {
        // Set selectedRx to null so patient lists are shown and the user clicks to open
        setSelectedRx(null);
      }
    } catch (err: any) {
      console.error("Lookup diagnostics failed", err);
      setSearchError('Secure registry channel timed out. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div 
      className="min-h-screen bg-slate-50 font-sans text-slate-900 select-text"
    >
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 py-3 md:px-8 md:py-5 flex items-center justify-between transition-all duration-300">
        <div className="flex items-center gap-4.5">
          <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg shadow-slate-900/15 transform hover:scale-105 transition-transform flex items-center justify-center bg-linear-to-br from-slate-900 to-slate-950 border border-slate-800 p-1.5">
            <img src="/hima-logo.png" alt="Himabindhu Eye Testing Logo" className="w-full h-full object-contain scale-[1.3] pointer-events-none select-none drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]" />
          </div>
          <div className="space-y-1">
            <h1 
              className="text-xl md:text-2xl font-black text-slate-900 font-serif leading-none tracking-[0.18em] transition-all hover:scale-[1.02] duration-300 select-none"
              style={{
                textShadow: '0 0 8px rgba(245, 158, 11, 0.2)',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
              }}
            >
              HIMABINDHU
            </h1>
            <p 
              className="text-[9px] md:text-[10px] font-black text-amber-600 tracking-[0.25em] uppercase block leading-none"
              style={{
                textShadow: '0 0 6px rgba(245, 158, 11, 0.15)'
              }}
            >
              Eye Testing & Opticals
            </p>
          </div>
        </div>
        <div className="flex items-center gap-5 md:gap-7">
          <a href="#prescription-finder" className="text-sm font-bold text-slate-700 hover:text-slate-900 px-3 py-2 rounded-xl transition hidden sm:inline-block hover:bg-slate-50">Prescription Finder</a>
          <a href="#services" className="text-sm font-bold text-slate-700 hover:text-slate-900 px-3 py-2 rounded-xl transition hidden sm:inline-block hover:bg-slate-50">Clinic Services</a>
          <button 
            onClick={onNavigateToLogin}
            className="px-5 py-2.5 bg-linear-to-r from-slate-900 to-amber-700 text-white rounded-xl text-xs md:text-sm font-extrabold hover:from-slate-950 hover:to-amber-800 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 shadow-sm"
          >
            <Lock className="w-4 h-4" />
            Staff Portal
          </button>
        </div>
      </header>

      <section className="relative overflow-hidden text-white py-14 px-4 sm:py-28 sm:px-6 border-b border-teal-950">
        {/* Background Video with image fallback poster */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0 filter brightness-[0.45] scale-110 origin-center"
          poster="/eye_testing_bg.png"
        >
          <source src="/eye_testing_video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Ambient colored lights */}
        <div className="absolute top-0 left-0 w-full h-full bg-slate-950/50 z-0 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none translate-x-1/3 translate-y-1/3 z-0" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -translate-x-1/3 -translate-y-1/3 z-0" />
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* Left Column: Copy & Actions */}
          <motion.div 
            initial={{ opacity: 0, x: -35 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:col-span-7 space-y-5 text-center lg:text-left"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest text-amber-450 shadow-inner">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              Advanced Refraction Clinic
            </span>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-serif leading-tight tracking-wide text-transparent bg-clip-text bg-linear-to-r from-white via-slate-100 to-amber-200">
              PRECISION VISION CARE <br />
              <span className="text-amber-500">EXPERT CLINICAL Refraction</span>
            </h2>
            
            <p className="text-slate-300 text-xs md:text-sm leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
              Himabindhu Eye Testing & Opticals offers high-precision diagnostic services under the expert care of M. Nagaraja Achari. Combining advanced computerized eye exam technology with decades of clinical experience, we assure absolutely precise prescriptions and the perfect lens styling for your eyes.
            </p>
            
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <a 
                href="#prescription-finder" 
                className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs md:text-sm font-extrabold shadow-lg shadow-amber-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                Find My Prescription
              </a>
              <a 
                href="#services" 
                className="px-6 py-3 bg-white/10 hover:bg-white/15 border border-white/20 text-white rounded-xl text-xs md:text-sm font-extrabold transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Our Services
              </a>
            </div>
          </motion.div>

          {/* Right Column: Clean Professional Telugu Typography */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
            className="lg:col-span-5 flex flex-col justify-center text-center space-y-4 font-telugu"
          >
            <h3 
              className="text-4xl sm:text-5xl md:text-7xl font-black leading-none tracking-wider select-none bg-linear-to-r from-white via-amber-100 to-amber-400 bg-clip-text text-transparent filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
              style={{ fontFamily: "'Ramabhadra', sans-serif", fontWeight: 900 }}
            >
              హిమబిందు
            </h3>
            
            <div className="h-0.5 bg-linear-to-r from-transparent via-amber-400 to-transparent my-2 max-w-xs mx-auto w-full"></div>
            
            <p 
              className="text-2xl sm:text-3xl md:text-4xl font-black tracking-wider select-none bg-linear-to-r from-amber-200 to-white bg-clip-text text-transparent filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.4)]"
              style={{ fontFamily: "'Ramabhadra', sans-serif", fontWeight: 900 }}
            >
              ఐ టెస్టింగ్ & ఆప్టికల్స్
            </p>
            
            <p 
              className="text-xs sm:text-sm md:text-base text-white leading-relaxed max-w-md mx-auto font-extrabold select-none tracking-wide filter drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]"
              style={{ fontFamily: "'Ramabhadra', sans-serif", letterSpacing: '0.03em' }}
            >
              కంప్యూటరైజ్డ్ నేత్ర పరీక్షా కేంద్రం మరియు కాంటాక్ట్ లెన్స్ క్లినిక్
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features/Stats Section */}
      <section className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 px-6 -mt-10 relative z-20">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md flex items-start gap-4">
          <div className="p-3 bg-amber-50/20 rounded-xl text-teal-800 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-extrabold text-slate-900 text-sm">Certified Diagnostics</h4>
            <p className="text-slate-555 text-xs mt-1 leading-relaxed">Administered by experienced Optometrist M. Nagaraja Achari (DOA, Reg No. 73/001412).</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md flex items-start gap-4">
          <div className="p-3 bg-amber-50/25 rounded-xl text-slate-800 shrink-0">
            <Glasses className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-extrabold text-slate-900 text-sm">Designer Gallery</h4>
            <p className="text-slate-555 text-xs mt-1 leading-relaxed">Wide range of branded lenses, designer frames, progressive lenses, and quality contact lenses.</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md flex items-start gap-4">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-800 shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-extrabold text-slate-900 text-sm">Computerised Precision</h4>
            <p className="text-slate-555 text-xs mt-1 leading-relaxed">Advanced automated refraction testing to ensure absolutely accurate power descriptions.</p>
          </div>
        </div>
      </section>

      {/* Interactive Prescription Finder Section */}
      <section id="prescription-finder" className="max-w-3xl mx-auto py-10 px-4 sm:py-20 sm:px-6">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-950">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-amber-200" />
              <h3 className="font-extrabold text-sm uppercase tracking-wider">Patient Rx Finder Portal</h3>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            <div className="space-y-2">
              <h4 className="text-lg font-black text-slate-900 font-serif">Retrieve Your Clinical Records</h4>
              <p className="text-slate-555 text-xs leading-relaxed">
                Enter your unique Patient ID (e.g., <span className="font-mono font-bold bg-slate-100 px-1 py-0.5 rounded text-slate-900">HB-2026-1001</span>) or registered mobile number to view and download your official diagnostic prescription in real-time.
              </p>
            </div>

            <form onSubmit={handlePatientSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="relative grow">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Patient ID or Mobile Number..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-blue-900 transition"
                />
              </div>
              <button 
                type="submit"
                disabled={searching}
                className="px-6 py-3 bg-slate-900 hover:bg-slate-950 text-white rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-2 disabled:opacity-50 shrink-0"
              >
                {searching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Searching Registry...
                  </>
                ) : (
                  <>
                    Search Records
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {searchError && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 text-rose-800 text-xs font-semibold">
                <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <p>{searchError}</p>
              </div>
            )}

            {searched && searchResults.length > 0 && (
              <div className="space-y-6 pt-4 border-t border-slate-150">
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Matching Registers ({searchResults.length})</p>
                  <div className="grid grid-cols-1 gap-2">
                    {searchResults.map((rx) => (
                      <button
                        key={rx.prescriptionId}
                        onClick={() => setSelectedRx(rx)}
                        className={`w-full p-4 border rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between text-left transition gap-4 ${
                          selectedRx?.prescriptionId === rx.prescriptionId 
                            ? 'border-blue-900 bg-amber-50/25/35 ring-1 ring-amber-500/30' 
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900 text-xs">{rx.patientName}</span>
                            <span className="text-[9px] bg-slate-100 text-slate-600 font-mono px-1.5 py-0.5 rounded font-bold uppercase">{rx.patientId}</span>
                          </div>
                          <p className="text-[10px] text-slate-450 mt-1 font-medium">
                            Exam Date: <strong className="text-slate-600 font-bold">{rx.date}</strong> | Phone: <strong className="text-slate-600 font-semibold">{rx.mobile}</strong>
                          </p>
                          
                          {/* Inline Spectacles Ready Status */}
                          <div className="mt-2 flex flex-wrap gap-2 items-center">
                            {rx.orderStatus === 'Ready' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-250 rounded text-[9px] font-black uppercase tracking-wider">
                                🟢 Specs Ready
                              </span>
                            ) : rx.orderStatus === 'Crafting' || rx.orderStatus === 'Pending' || (rx.frameName || rx.lensType) ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-250 rounded text-[9px] font-black uppercase tracking-wider">
                                🔴 Crafting
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-500 border border-slate-200 rounded text-[9px] font-bold uppercase tracking-wider">
                                ⚪ No active specs order
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-black text-slate-900 uppercase tracking-wider self-start sm:self-auto">
                          Select Record
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

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
                        <h3 className="font-extrabold text-xs sm:text-sm uppercase tracking-wider text-white">Patient Clinical Registry</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 font-mono">Rx ID: {selectedRx.prescriptionId} | ID: {selectedRx.patientId}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedRx(null)}
                      className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white transition flex items-center justify-center font-bold cursor-pointer border border-white/10"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Modal Scrollable Content */}
                  <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
                    {/* Spectacles Order Status Card */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest font-mono">
                          Spectacles Order Status
                        </span>
                        <h4 className="text-sm font-bold text-slate-800">
                          Frame: <span className="text-slate-950 font-extrabold">{selectedRx.frameName || 'No Frame Selected'}</span>
                        </h4>
                        <p className="text-[11px] text-slate-500 font-semibold">
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
                        <PrescriptionPDFViewerPanel prescription={selectedRx} hideWhatsApp={true} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Chief Optometrist & Clinical Director Profile Section */}
      <section className="bg-slate-50 py-10 px-4 sm:py-20 sm:px-6 border-t border-slate-150">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          {/* Left Column: Bio Photo */}
          <div className="md:col-span-5 flex justify-center">
            <div className="w-full max-w-sm aspect-4/3 sm:aspect-square md:h-100 overflow-hidden relative rounded-3xl shadow-xl shadow-slate-200 border-2 border-white bg-slate-100">
              {/* Doctor Bio Photo (div with background image to prevent browser-injected Google Lens/Edit buttons) */}
              <div
                style={{ backgroundImage: 'url("/doctor_1.jpg")' }}
                role="img"
                aria-label="M. Nagaraja Achari (Chief Optometrist)"
                className="w-full h-full bg-cover bg-center animate-fade-in pointer-events-none select-none"
              />
            </div>
          </div>

          {/* Right Column: Bio Details */}
          <div className="md:col-span-7 space-y-6">
            <div className="space-y-2">
              <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-[10px] font-black uppercase tracking-widest inline-block select-none">
                Chief Optometrist & Director
              </span>
              <h3 className="text-3xl md:text-4xl font-black text-slate-900 font-serif leading-tight">
                M. Nagaraja Achari
              </h3>
              <p className="text-base md:text-lg text-amber-600 font-bold tracking-wide">
                DOA, Ophthalmic Optom
              </p>
            </div>
            
            <p className="text-slate-650 text-xs md:text-sm leading-relaxed font-semibold">
              Himabindhu Eye Testing & Opticals offers high-precision diagnostic services under the expert care of M. Nagaraja Achari. Combining advanced computerized eye exam technology with decades of clinical experience, we assure absolutely precise prescriptions and the perfect lens styling for your eyes.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-150 shadow-sm">
                <div className="p-2 bg-amber-50 rounded-xl text-amber-700">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase leading-none">Registration Status</p>
                  <p className="text-xs font-bold text-slate-800 mt-1">Reg No. 73/001412</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-150 shadow-sm">
                <div className="p-2 bg-amber-50 rounded-xl text-amber-700">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase leading-none">Diagnostic Specialty</p>
                  <p className="text-xs font-bold text-slate-800 mt-1">Refraction & Contact Lenses</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="bg-white py-10 px-4 sm:py-16 sm:px-6 border-t border-b border-slate-150">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-black text-slate-900 uppercase font-serif">Our Optical Clinic Services</h3>
            <p className="text-slate-500 text-xs max-w-md mx-auto">Providing quality clinical eye diagnostics and premium spectacles crafting.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="group relative p-6 bg-white border border-slate-200 rounded-2xl hover:-translate-y-2 hover:scale-[1.02] hover:shadow-xl hover:shadow-amber-500/5 hover:border-amber-400 hover:bg-amber-50/5 transition-all duration-300 ease-out overflow-hidden cursor-pointer">
              <div className="absolute top-0 left-0 w-0 h-1 bg-linear-to-r from-amber-500 to-amber-300 group-hover:w-full transition-all duration-350 ease-out" />
              <h5 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-2 group-hover:text-amber-700 transition-colors duration-250">Computerized Eye Testing</h5>
              <p className="text-slate-550 text-xs leading-normal">Advanced computerized eye testing for accurate vision assessment and prescription.</p>
            </div>
            <div className="group relative p-6 bg-white border border-slate-200 rounded-2xl hover:-translate-y-2 hover:scale-[1.02] hover:shadow-xl hover:shadow-amber-500/5 hover:border-amber-400 hover:bg-amber-50/5 transition-all duration-300 ease-out overflow-hidden cursor-pointer">
              <div className="absolute top-0 left-0 w-0 h-1 bg-linear-to-r from-amber-500 to-amber-300 group-hover:w-full transition-all duration-350 ease-out" />
              <h5 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-2 group-hover:text-amber-700 transition-colors duration-250">Comprehensive Eye Examination</h5>
              <p className="text-slate-550 text-xs leading-normal">Professional eye examinations to detect vision problems and maintain healthy eyesight.</p>
            </div>
            <div className="group relative p-6 bg-white border border-slate-200 rounded-2xl hover:-translate-y-2 hover:scale-[1.02] hover:shadow-xl hover:shadow-amber-500/5 hover:border-amber-400 hover:bg-amber-50/5 transition-all duration-300 ease-out overflow-hidden cursor-pointer">
              <div className="absolute top-0 left-0 w-0 h-1 bg-linear-to-r from-amber-500 to-amber-300 group-hover:w-full transition-all duration-350 ease-out" />
              <h5 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-2 group-hover:text-amber-700 transition-colors duration-250">Spectacles & Frames</h5>
              <p className="text-slate-555 text-xs leading-normal">Premium spectacle frames and high-quality prescription lenses for all age groups.</p>
            </div>
            <div className="group relative p-6 bg-white border border-slate-200 rounded-2xl hover:-translate-y-2 hover:scale-[1.02] hover:shadow-xl hover:shadow-amber-500/5 hover:border-amber-400 hover:bg-amber-50/5 transition-all duration-300 ease-out overflow-hidden cursor-pointer">
              <div className="absolute top-0 left-0 w-0 h-1 bg-linear-to-r from-amber-500 to-amber-300 group-hover:w-full transition-all duration-350 ease-out" />
              <h5 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-2 group-hover:text-amber-700 transition-colors duration-250">Contact Lenses</h5>
              <p className="text-slate-550 text-xs leading-normal">Comfortable and reliable contact lens solutions with expert guidance.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Clinic Showcase & Luxury Gallery */}
      <section className="bg-slate-50 py-10 px-4 sm:py-20 sm:px-6 border-b border-slate-150">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 items-center gap-12">
          {/* Left Column: Natural luxury description */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <span className="px-3.5 py-1 bg-amber-50 text-amber-805 border border-amber-200 rounded-full text-[10px] font-black uppercase tracking-widest inline-block select-none shadow-sm shadow-amber-50">
                Himabindhu Experience
              </span>
              <h3 className="text-3xl md:text-4xl font-black text-slate-900 font-serif leading-tight">
                Where Vision Precision Meets Luxury Eyewear
              </h3>
            </div>
            
            <p className="text-slate-600 text-xs md:text-sm leading-relaxed font-semibold">
              Step into Himabindhu Eye Testing & Opticals for an unparalleled optical experience. 
              Serving the Dharmavaram community with pride, our clinic features high-precision computerized eye examination labs combined with a beautifully curated gallery of international designer frames.
            </p>
            
            <p className="text-slate-600 text-xs md:text-sm leading-relaxed font-semibold">
              Under the veteran care of chief optometrist <strong>M. Nagaraja Achari</strong>, we perform meticulous diagnostic refractions to ensure your prescription is absolutely perfect. 
              We don't just test your eyes; we craft a custom visual identity for you with our range of high-definition progressive lenses, computerised blue-light shields, and hand-selected luxury frames.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 shadow-sm">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <p className="text-xs font-bold text-slate-700">Meticulous computerised eye examinations using state-of-the-art diagnostic slit-lamps.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 shadow-sm">
                  <Glasses className="w-4 h-4" />
                </div>
                <p className="text-xs font-bold text-slate-700">A premium boutique of designer frames, durable double-rim layouts, and elegant shapes.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 shadow-sm">
                  <Sparkles className="w-4 h-4" />
                </div>
                <p className="text-xs font-bold text-slate-700">Personalized lens counseling to match your daily screen time, driving, and lifestyle needs.</p>
              </div>
            </div>
          </div>

          {/* Right Column: Carousel with flash animation */}
          <div className="lg:col-span-6">
            <div className="relative aspect-4/3 rounded-3xl overflow-hidden border border-slate-200/80 shadow-2xl bg-slate-950 group">
              {/* Active Image (div with background image to completely prevent browser-injected Google Lens/Edit buttons) */}
              <div
                style={{
                  backgroundImage: `url(${clinicImages[currentGalleryIdx].url})`
                }}
                role="img"
                aria-label={clinicImages[currentGalleryIdx].caption}
                className={`w-full h-full bg-cover bg-center transition-all duration-300 group-hover:scale-[1.03] pointer-events-none select-none ${
                  isFlashing ? 'brightness-[2.2] scale-[0.995] filter contrast-[0.9]' : 'brightness-[1] scale-100 filter contrast-100'
                }`}
              />

              {/* Camera Flash Overlay */}
              <div
                className={`absolute inset-0 bg-white pointer-events-none z-20 transition-opacity duration-300 ${
                  isFlashing ? 'opacity-95' : 'opacity-0'
                }`}
              />

              {/* Left Navigation Arrow */}
              <button
                onClick={handlePrevGallery}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-slate-900/60 backdrop-blur-md text-white border border-white/15 opacity-80 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg flex items-center justify-center cursor-pointer"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Right Navigation Arrow */}
              <button
                onClick={handleNextGallery}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-slate-900/60 backdrop-blur-md text-white border border-white/15 opacity-80 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg flex items-center justify-center cursor-pointer"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Carousel Indicators & Captions */}
              <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-slate-950 via-slate-900/60 to-transparent p-6 z-10 space-y-2">
                <span className="px-2 py-0.5 bg-amber-500 text-slate-950 text-[9px] font-black uppercase tracking-wider rounded-full shadow-md">
                  Clinic Showcase
                </span>
                <h4 className="text-sm md:text-base font-black text-white leading-tight mt-1">
                  {clinicImages[currentGalleryIdx].caption}
                </h4>
                <div className="flex items-center gap-2 pt-2">
                  {clinicImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        if (isFlashing) return;
                        setIsFlashing(true);
                        setTimeout(() => {
                          setCurrentGalleryIdx(idx);
                        }, 250);
                        setTimeout(() => {
                          setIsFlashing(false);
                        }, 500);
                      }}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        currentGalleryIdx === idx
                          ? 'w-6 bg-amber-400'
                          : 'w-1.5 bg-white/40 hover:bg-white/60'
                      }`}
                      aria-label={`Show slide ${idx + 1}`}
                      style={{ cursor: 'pointer' }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Luxury Frame Styles Showcase */}
      <section id="designer-frames" className="bg-slate-950 text-white py-12 px-4 sm:py-24 sm:px-6 relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 left-0 w-125 h-125 bg-amber-600/5 rounded-full filter blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-100 h-100 bg-slate-700/20 rounded-full filter blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto space-y-14 relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center space-y-4"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-amber-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Premium Eyewear Collection
            </span>
            <h3 className="text-4xl md:text-5xl font-black uppercase font-serif tracking-wider bg-linear-to-r from-white via-amber-100 to-amber-300 bg-clip-text text-transparent">
              Designer Frame Styles
            </h3>
            <p className="text-slate-400 text-sm max-w-2xl mx-auto leading-relaxed">
              Discover our curated collection of international designer frames — crafted in premium titanium, gold-plated alloys, and hand-polished acetate.
            </p>
          </motion.div>

          {/* Frames Grid */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.07 } } }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5"
          >
            {[
              { id: 'rectangle', name: 'Rectangle Frames', tags: 'Modern • Professional • Everyday Wear', image: '/frames/rectangle.png' },
              { id: 'round',     name: 'Round Frames',     tags: 'Classic • Vintage • Intellectual',      image: '/frames/round.png' },
              { id: 'square',    name: 'Square Frames',    tags: 'Bold • Confident • Sharp',              image: '/frames/square.png' },
              { id: 'cateye',    name: 'Cat-Eye Frames',   tags: 'Elegant • Fashion • Premium',           image: '/frames/cateye.png' },
              { id: 'aviator',   name: 'Aviator Frames',   tags: 'Iconic • Stylish • Timeless',           image: '/frames/aviator.png' },
              { id: 'geometric', name: 'Geometric Frames', tags: 'Trendy • Creative • Modern',            image: '/frames/geometric.png' },
              { id: 'oversized', name: 'Oversized Frames', tags: 'Luxury • Statement • Fashion',          image: '/frames/oversized.png' },
              { id: 'rimless',   name: 'Rimless Frames',   tags: 'Minimal • Lightweight • Executive',     image: '/frames/rimless.png' },
            ].map((frame, idx) => (
              <motion.div
                key={idx}
                variants={{
                  hidden: { opacity: 0, y: 25 },
                  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 14 } }
                }}
                whileHover={{ y: -10, scale: 1.02, transition: { duration: 0.25 } }}
                onClick={() => onSelectFrameType(frame.id)}
                className="group relative rounded-3xl overflow-hidden border border-slate-800 hover:border-amber-500/60 transition-all duration-400 shadow-2xl cursor-pointer bg-slate-900"
              >
                {/* Single image — full bleed tall card */}
                <div className="relative aspect-3/4 w-full overflow-hidden bg-white rounded-2xl">
                  {/* Bottom fade overlay */}
                  <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-900/10 to-transparent z-10 pointer-events-none" />
                  {/* Gold top bar on hover */}
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-amber-50 to-transparent z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {/* Frame Styles image (div with background image to prevent browser-injected Google Lens/Edit buttons) */}
                  <div
                    style={{ 
                      backgroundImage: `url(${frame.image})`,
                      backgroundSize: 'contain',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      backgroundOrigin: 'content-box'
                    }}
                    role="img"
                    aria-label={frame.name}
                    className="w-full h-full p-3 transform group-hover:scale-110 group-hover:-rotate-1 transition-transform duration-500 pointer-events-none select-none"
                  />
                  {/* View Collection badge */}
                  <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                    <span className="px-2.5 py-1 bg-amber-500 text-slate-950 text-[9px] font-black uppercase tracking-wider rounded-full shadow-lg">
                      View All →
                    </span>
                  </div>
                </div>

                {/* Text Overlay */}
                <div className="absolute bottom-0 left-0 right-0 z-20 p-4 space-y-1">
                  <p className="text-[9px] font-bold text-amber-400 uppercase tracking-[0.18em] leading-none">
                    {frame.tags}
                  </p>
                  <h4 className="text-sm font-black text-white uppercase tracking-widest leading-tight group-hover:text-amber-300 transition-colors duration-200">
                    {frame.name}
                  </h4>
                  {/* Animated underline */}
                  <div className="h-0.5 bg-linear-to-r from-amber-500 to-transparent w-0 group-hover:w-full transition-all duration-400 rounded-full" />
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Bottom tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-center text-[11px] text-slate-500 uppercase tracking-[0.25em] font-semibold"
          >
            Visit our store to try on your perfect pair · Dharmavaram, Andhra Pradesh
          </motion.p>
        </div>
      </section>

      {/* Contact & Hours Section */}
      <section id="timings" className="max-w-5xl mx-auto py-10 px-4 sm:py-16 sm:px-6 grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 items-center">
        <div className="space-y-6">
          <h3 className="text-2xl font-black text-slate-900 uppercase font-serif">Consulting Schedule</h3>
          
          {/* DYNAMIC CLINIC STATUS INDICATOR */}
          <div className={`p-4.5 rounded-2xl border flex flex-col gap-2.5 transition-all duration-300 ${
            activeDisplayStatus === 'open' 
              ? 'bg-emerald-50/60 border-emerald-200 text-emerald-800' 
              : activeDisplayStatus === 'half-day'
              ? 'bg-amber-50/60 border-amber-200 text-amber-800'
              : 'bg-rose-50/60 border-rose-200 text-rose-800'
          }`}>
            <div className="flex items-center gap-2.5">
              <span className={`w-3 h-3 rounded-full shrink-0 ${
                activeDisplayStatus === 'open' 
                  ? 'bg-emerald-500 animate-pulse' 
                  : activeDisplayStatus === 'half-day'
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`} />
              <p className="font-extrabold text-xs uppercase tracking-wider">
                Clinic Status: {
                  activeDisplayStatus === 'open' 
                    ? 'Fully Open (Active)' 
                    : activeDisplayStatus === 'half-day'
                    ? 'Half Working Day'
                    : clinicStatus === 'closed'
                    ? 'Holiday / Closed Today'
                    : 'Closed Now (Outside Timings)'
                }
              </p>
            </div>
            
            {customNotice ? (
              <p className="text-xs font-semibold leading-relaxed border-t pt-2 border-current/10">
                {customNotice}
              </p>
            ) : (
              <p className="text-[11px] font-medium leading-relaxed border-t pt-2 border-current/10 opacity-85">
                {activeDisplayStatus === 'open' 
                  ? 'Visit during scheduled morning or evening slots. Standard consultation is active.' 
                  : activeDisplayStatus === 'half-day'
                  ? 'Please note that the clinic runs for a limited duration today.'
                  : clinicStatus === 'closed'
                  ? 'Clinic operations are suspended. Standard diagnostics resume tomorrow.'
                  : 'Clinic is currently closed outside of scheduled consulting hours.'}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-150">
              <Clock className="w-5 h-5 text-amber-700" />
              <div className="text-xs">
                <p className="font-bold text-slate-800">Morning Session</p>
                <p className="text-slate-550 font-semibold">{morningHours}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-150">
              <Clock className="w-5 h-5 text-amber-700" />
              <div className="text-xs">
                <p className="font-bold text-slate-800">Evening Session</p>
                <p className="text-slate-550 font-semibold">{eveningHours}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 text-white p-6 md:p-8 rounded-3xl space-y-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-slate-800/20 rounded-full filter blur-xl"></div>
          <h4 className="font-black text-sm uppercase tracking-wider border-b border-slate-850 pb-2">Hima Bindu Eye Testing Center & Opticals</h4>
          <div className="space-y-4">
            <div className="flex gap-3 text-xs">
              <MapPin className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <p className="font-bold text-white">Address:</p>
                <p className="text-slate-400 mt-1 leading-normal">Dharmavaram, Andhra Pradesh, India</p>
              </div>
            </div>
            <div className="flex gap-3 text-xs">
              <Phone className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <p className="font-bold text-white">Phone:</p>
                <p className="text-slate-400 font-mono mt-1 text-xs">
                  <a href="tel:+91XXXXXXXXXX" className="hover:text-amber-450 transition-colors">+91 XXXXXXXXXX</a>
                </p>
              </div>
            </div>
            <div className="flex gap-3 text-xs">
              <Clock className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <p className="font-bold text-white">Timings:</p>
                <p className="text-slate-400 mt-1 leading-normal">Monday - Saturday<br />9:00 AM - 8:00 PM</p>
              </div>
            </div>
          </div>
          <div className="pt-2 text-[10px] text-slate-500 font-mono uppercase">
            © Himabindhu Eye Testing & Opticals. Quality Assured.
          </div>
        </div>
      </section>

      {/* Premium Footer */}
      <footer className="bg-slate-950 text-white border-t border-slate-900 py-8 px-6 text-center">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-slate-450">
          <p>© 2026 Himabindhu Eye Testing & Opticals. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-1.5 md:gap-2 text-[11px] text-slate-300 bg-slate-900/50 px-4 py-2 rounded-xl border border-slate-800/80">
            <span>Developed by</span>
            <span className="font-extrabold text-transparent bg-clip-text bg-linear-to-r from-amber-400 to-amber-200 uppercase tracking-wider">Shaivika Groups</span>
            <span className="text-slate-700">•</span>
            <a href="tel:8985541157" className="hover:text-amber-400 transition-colors font-mono font-bold">8985541157</a>
            <span className="text-slate-700">•</span>
            <a href="mailto:shaivikagroups@gmail.com" className="hover:text-amber-400 transition-colors">shaivikagroups@gmail.com</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
