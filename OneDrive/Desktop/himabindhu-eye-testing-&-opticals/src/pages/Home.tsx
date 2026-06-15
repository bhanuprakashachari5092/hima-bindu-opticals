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
  ChevronRight, 
  FileText, 
  Printer,
  ShieldAlert,
  Loader2,
  Lock,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';

interface HomeProps {
  onNavigateToLogin: () => void;
}

export default function Home({ onNavigateToLogin }: HomeProps) {
  const { isDemoMode, setDemoProfile } = useAuth();
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Prescription[]>([]);
  const [searched, setSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedRx, setSelectedRx] = useState<Prescription | null>(null);

  // Doctor photos slideshow state
  const doctorPhotos = ['/doctor_1.jpg', '/doctor_2.jpg'];
  const [currentPhotoIdx, setCurrentPhotoIdx] = useState(0);

  // Clinic timing and status state
  const [morningHours, setMorningHours] = useState('9:00 a.m. to 2:00 p.m.');
  const [eveningHours, setEveningHours] = useState('4:00 p.m. to 9:00 p.m.');
  const [clinicStatus, setClinicStatus] = useState<'open' | 'half-day' | 'closed'>('open');
  const [customNotice, setCustomNotice] = useState('');

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
    const timer = setInterval(() => {
      setCurrentPhotoIdx((prev) => (prev === 0 ? 1 : 0));
    }, 4000);
    
    loadClinicSchedule();
    window.addEventListener('storage', loadClinicSchedule);
    
    return () => {
      clearInterval(timer);
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
      const gsheetsUrl = `https://script.google.com/macros/s/AKfycbwmFPrQ7XKDNhpr3p1d0D0OImkd8DlNvhnxmSzNtPMKKmSw81xInATraKA2C7gV6kaW/exec?query=${encodeURIComponent(queryStr)}`;
      
      try {
        const response = await fetch(gsheetsUrl);
        if (response.ok) {
          const resData = await response.json();
          if (resData.success && Array.isArray(resData.data)) {
            setSearchResults(resData.data);
            if (resData.data.length === 0) {
              setSearchError('No matching diagnostic registers found in Google Sheets. Double-check your ID or mobile phone.');
            } else {
              const exactMatch = resData.data.find((rx: any) => rx.patientId.toLowerCase() === queryStr) || resData.data[0];
              setSelectedRx(exactMatch);
              setTimeout(() => {
                printPrescriptionHTML(exactMatch);
              }, 150);
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
        rx.patientId.toLowerCase() === queryStr || 
        rx.mobile.replace(/\D/g, '') === queryStr.replace(/\D/g, '') ||
        rx.patientName.toLowerCase().includes(queryStr)
      );
      setSearchResults(filtered);
      if (filtered.length === 0) {
        setSearchError('No matching diagnostic registers found. Double-check your ID or mobile phone.');
      } else {
        const exactMatch = filtered.find(rx => rx.patientId.toLowerCase() === queryStr) || filtered[0];
        setSelectedRx(exactMatch);
        setTimeout(() => {
          printPrescriptionHTML(exactMatch);
        }, 150);
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
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 md:px-8 py-5 flex items-center justify-between transition-all duration-300">
        <div className="flex items-center gap-4.5">
          <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-md shadow-slate-900/15 transform hover:scale-105 transition-transform flex items-center justify-center bg-white border border-slate-200 p-0.5">
            <img src="/realistic_eye_logo.png" alt="Himabindhu Eye Testing Logo" className="w-full h-full object-cover rounded-xl" />
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
            className="px-5 py-2.5 bg-gradient-to-r from-slate-900 to-amber-700 text-white rounded-xl text-xs md:text-sm font-extrabold hover:from-slate-950 hover:to-amber-800 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 shadow-sm"
          >
            <Lock className="w-4 h-4" />
            Staff Portal
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden text-white py-28 px-6 border-b border-teal-950">
        {/* Background Video with image fallback poster */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
          style={{ opacity: 0.45 }}
          poster="/eye_testing_bg.png"
        >
          <source src="/eye_testing_video.mp4" type="video/mp4" />
        </video>

        {/* Animated Gradient Overlay */}
        <div className="absolute inset-0 animate-gradient-bg opacity-75 mix-blend-multiply pointer-events-none z-10"></div>

        <div className="absolute inset-0 opacity-10 pointer-events-none z-0">
          <div className="absolute top-12 left-10 w-96 h-96 rounded-full bg-amber-50/200 filter blur-3xl"></div>
          <div className="absolute bottom-12 right-10 w-96 h-96 rounded-full bg-amber-50/250 filter blur-3xl"></div>
        </div>
        
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 items-center gap-12 relative z-10">
          {/* Left Column: Copy & Actions */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:col-span-7 space-y-6 text-center lg:text-left"
          >
            <motion.span 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/60 border border-amber-500/30 text-[10px] uppercase font-black tracking-widest text-amber-300"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Computerised Eye Testing & Contact Lens Clinic
            </motion.span>
            
            <motion.h2 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-4xl md:text-6xl font-extrabold font-serif tracking-tight leading-tight"
            >
              Clear Vision.<br className="hidden md:inline" /> Better Life.
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-slate-200 text-xs md:text-sm max-w-xl leading-relaxed font-semibold"
            >
              Step into Himabindhu Eye Testing & Opticals for precise computerized eye exams, custom power lens fitting, and a designer optical gallery tailored to your lifestyle.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex flex-wrap justify-center lg:justify-start gap-4 pt-2"
            >
              <a 
                href="#prescription-finder" 
                className="px-6 py-3.5 bg-amber-600 hover:bg-amber-800 hover:scale-[1.03] text-white text-xs font-extrabold rounded-2xl shadow-lg shadow-amber-500/20 transition flex items-center gap-2 transform duration-200"
              >
                <Search className="w-4.5 h-4.5" />
                Find Your Prescription (Rx)
              </a>
              <a 
                href="#timings" 
                className="px-6 py-3.5 bg-white/10 hover:bg-white/15 hover:scale-[1.03] text-white border border-white/20 text-xs font-bold rounded-2xl transition flex items-center gap-2 transform duration-200"
              >
                <Clock className="w-4.5 h-4.5" />
                Check consulting Hours
              </a>
            </motion.div>
          </motion.div>

          {/* Right Column: Clean Professional Telugu Typography without container box */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
            className="lg:col-span-5 flex flex-col justify-center text-center space-y-4 font-telugu"
          >
            <h3 
              className="text-6xl md:text-7xl font-black leading-none tracking-wider select-none bg-gradient-to-r from-white via-amber-100 to-amber-400 bg-clip-text text-transparent filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
              style={{ fontFamily: "'Ramabhadra', sans-serif", fontWeight: 900 }}
            >
              హిమబిందు
            </h3>
            
            <div className="h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent my-2 max-w-xs mx-auto w-full"></div>
            
            <p 
              className="text-3xl md:text-4xl font-black tracking-wider select-none bg-gradient-to-r from-amber-200 to-white bg-clip-text text-transparent filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.4)]"
              style={{ fontFamily: "'Ramabhadra', sans-serif", fontWeight: 900 }}
            >
              ఐ టెస్టింగ్ & ఆప్టికల్స్
            </p>
            
            <p 
              className="text-sm md:text-base text-white leading-relaxed max-w-md mx-auto font-extrabold select-none tracking-wide filter drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]"
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
      <section id="prescription-finder" className="max-w-3xl mx-auto py-20 px-6">
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
              <div className="relative flex-grow">
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
                        key={rx.id}
                        onClick={() => setSelectedRx(rx)}
                        className={`w-full p-4 border rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between text-left transition gap-4 ${
                          selectedRx?.id === rx.id 
                            ? 'border-blue-900 bg-amber-50/25/35 ring-1 ring-amber-500/30' 
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900 text-xs">{rx.patientName}</span>
                            <span className="text-[9px] bg-slate-100 text-slate-600 font-mono px-1.5 py-0.5 rounded font-bold uppercase">{rx.patientId}</span>
                          </div>
                          <p className="text-[10px] text-slate-450 mt-1 font-medium">Exam Date: <strong className="text-slate-600 font-bold">{rx.date}</strong> | Phone: <strong className="text-slate-600 font-semibold">{rx.mobile}</strong></p>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-black text-slate-900 uppercase tracking-wider self-start sm:self-auto">
                          Select Record
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {selectedRx && (
                  <div className="pt-6 border-t border-slate-150">
                    <h5 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-4">Official Diagnostic Prescription</h5>
                    <div className="bg-slate-50 border border-slate-200 rounded-3xl p-2 md:p-4 shadow-inner overflow-hidden">
                      <PrescriptionPDFViewerPanel prescription={selectedRx} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Chief Optometrist & Clinical Director Profile Section */}
      <section className="bg-slate-50 py-20 px-6 border-t border-slate-150">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          {/* Left Column: Photo Slideshow with Fade Effect */}
          <div className="md:col-span-5 flex justify-center">
            <div className="w-full max-w-sm aspect-[4/3] sm:aspect-square md:h-[400px] overflow-hidden relative rounded-3xl shadow-xl shadow-slate-200 border-2 border-white bg-slate-100">
              {doctorPhotos.map((photo, index) => (
                <motion.img
                  key={photo}
                  src={photo}
                  alt="M. Nagaraja Achari (Chief Optometrist)"
                  className="absolute inset-0 w-full h-full object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: index === currentPhotoIdx ? 1 : 0 }}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                  style={{ zIndex: index === currentPhotoIdx ? 2 : 1 }}
                />
              ))}
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
      <section id="services" className="bg-white py-16 px-6 border-t border-b border-slate-150">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-black text-slate-900 uppercase font-serif">Our Optical Clinic Services</h3>
            <p className="text-slate-500 text-xs max-w-md mx-auto">Providing quality clinical eye diagnostics and premium spectacles crafting.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="group relative p-6 bg-white border border-slate-200 rounded-2xl hover:-translate-y-2 hover:scale-[1.02] hover:shadow-xl hover:shadow-amber-500/5 hover:border-amber-400 hover:bg-amber-50/5 transition-all duration-300 ease-out overflow-hidden cursor-pointer">
              <div className="absolute top-0 left-0 w-0 h-1 bg-gradient-to-r from-amber-500 to-amber-300 group-hover:w-full transition-all duration-350 ease-out" />
              <h5 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-2 group-hover:text-amber-700 transition-colors duration-250">Computerised Refraction</h5>
              <p className="text-slate-550 text-xs leading-normal">High-precision diagnostic testing utilizing automated refractometers for perfect eye power calculation.</p>
            </div>
            <div className="group relative p-6 bg-white border border-slate-200 rounded-2xl hover:-translate-y-2 hover:scale-[1.02] hover:shadow-xl hover:shadow-amber-500/5 hover:border-amber-400 hover:bg-amber-50/5 transition-all duration-300 ease-out overflow-hidden cursor-pointer">
              <div className="absolute top-0 left-0 w-0 h-1 bg-gradient-to-r from-amber-500 to-amber-300 group-hover:w-full transition-all duration-350 ease-out" />
              <h5 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-2 group-hover:text-amber-700 transition-colors duration-250">Contact Lens Clinic</h5>
              <p className="text-slate-550 text-xs leading-normal">Specialized fitting and evaluation for daily wear, cosmetic, and prescription contact lenses.</p>
            </div>
            <div className="group relative p-6 bg-white border border-slate-200 rounded-2xl hover:-translate-y-2 hover:scale-[1.02] hover:shadow-xl hover:shadow-amber-500/5 hover:border-amber-400 hover:bg-amber-50/5 transition-all duration-300 ease-out overflow-hidden cursor-pointer">
              <div className="absolute top-0 left-0 w-0 h-1 bg-gradient-to-r from-amber-500 to-amber-300 group-hover:w-full transition-all duration-350 ease-out" />
              <h5 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-2 group-hover:text-amber-700 transition-colors duration-250">Progressive Lenses</h5>
              <p className="text-slate-555 text-xs leading-normal">Advanced multi-focal lens customization for seamless distance-to-near transition without lines.</p>
            </div>
            <div className="group relative p-6 bg-white border border-slate-200 rounded-2xl hover:-translate-y-2 hover:scale-[1.02] hover:shadow-xl hover:shadow-amber-500/5 hover:border-amber-400 hover:bg-amber-50/5 transition-all duration-300 ease-out overflow-hidden cursor-pointer">
              <div className="absolute top-0 left-0 w-0 h-1 bg-gradient-to-r from-amber-500 to-amber-300 group-hover:w-full transition-all duration-350 ease-out" />
              <h5 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-2 group-hover:text-amber-700 transition-colors duration-250">Specialty Lenses</h5>
              <p className="text-slate-550 text-xs leading-normal">Offering Blue Cut, Blue Light, Transitions, anti-glare HMC, and durable hard coats (HC).</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact & Hours Section */}
      <section id="timings" className="max-w-5xl mx-auto py-16 px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h3 className="text-2xl font-black text-slate-900 uppercase font-serif">Consulting Schedule</h3>
          
          {/* DYNAMIC CLINIC STATUS INDICATOR */}
          <div className={`p-4.5 rounded-2xl border flex flex-col gap-2.5 transition-all duration-300 ${
            clinicStatus === 'open' 
              ? 'bg-emerald-50/60 border-emerald-200 text-emerald-800' 
              : clinicStatus === 'half-day'
              ? 'bg-amber-50/60 border-amber-200 text-amber-800'
              : 'bg-rose-50/60 border-rose-200 text-rose-800'
          }`}>
            <div className="flex items-center gap-2.5">
              <span className={`w-3 h-3 rounded-full shrink-0 ${
                clinicStatus === 'open' 
                  ? 'bg-emerald-500 animate-pulse' 
                  : clinicStatus === 'half-day'
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`} />
              <p className="font-extrabold text-xs uppercase tracking-wider">
                Clinic Status: {
                  clinicStatus === 'open' 
                    ? 'Fully Open (Active)' 
                    : clinicStatus === 'half-day'
                    ? 'Half Working Day'
                    : 'Holiday / Closed Today'
                }
              </p>
            </div>
            
            {customNotice ? (
              <p className="text-xs font-semibold leading-relaxed border-t pt-2 border-current/10">
                {customNotice}
              </p>
            ) : (
              <p className="text-[11px] font-medium leading-relaxed border-t pt-2 border-current/10 opacity-85">
                {clinicStatus === 'open' 
                  ? 'Visit during scheduled morning or evening slots. Standard consultation is active.' 
                  : clinicStatus === 'half-day'
                  ? 'Please note that the clinic runs for a limited duration today.'
                  : 'Clinic operations are suspended. Standard diagnostics resume tomorrow.'}
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
          <h4 className="font-black text-sm uppercase tracking-wider border-b border-slate-850 pb-2">Clinic Location</h4>
          <div className="space-y-4">
            <div className="flex gap-3 text-xs">
              <MapPin className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <p className="font-bold text-white">Beside Apollo Pharmacy</p>
                <p className="text-slate-400 mt-1 leading-normal">RS Road, Gandhi Nagar, Dharmavaram - 515671. (A.P.)</p>
              </div>
            </div>
                        <div className="w-full h-40 rounded-2xl overflow-hidden border border-slate-750/70 shadow-md relative group hover:border-amber-500 transition-colors duration-300">
              <iframe 
                src="https://maps.google.com/maps?q=Apollo%20Pharmacy,%20RS%20Road,%20Gandhi%20Nagar,%20Dharmavaram&t=k&z=18&output=embed" 
                width="100%" 
                height="100%" 
                style={{ border: 0, filter: 'brightness(0.95)' }} 
                allowFullScreen={true} 
                loading="lazy"
                title="Himabindhu Opticals Satellite Map"
              ></iframe>
            </div>
            <div className="flex gap-3 text-xs">
              <Phone className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <p className="font-bold text-white">Direct Phone Support</p>
                <p className="text-slate-400 font-mono mt-1">90104 08092, 79892 89011</p>
              </div>
            </div>
          </div>
          <div className="pt-2 text-[10px] text-slate-500 font-mono uppercase">
            © Himabindhu Eye Testing & Opticals. Quality Assured.
          </div>
        </div>
      </section>
    </div>
  );
}
