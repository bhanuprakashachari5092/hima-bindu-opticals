import React, { useState, useRef, useEffect } from 'react';

interface CustomPowerSelectProps {
  value: string;
  onChange: (val: string) => void;
  positives: string[];
  negatives: string[];
  placeholder?: string;
}

export function CustomPowerSelect({ value, onChange, positives, negatives, placeholder = "Nil" }: CustomPowerSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-1.5 border border-slate-300 hover:border-slate-400 rounded-lg bg-white text-xs text-left flex justify-between items-center transition-colors"
      >
        <span className={value ? "text-slate-900 font-bold" : "text-slate-500"}>
          {value || placeholder}
        </span>
        <svg className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-100 top-full left-0 mt-1 w-64 bg-white border border-slate-200 shadow-xl rounded-xl overflow-hidden flex flex-col max-h-75">
          {/* Quick Actions Header */}
          <div className="flex gap-2 p-2 border-b border-slate-100 bg-slate-50 shrink-0">
            <button 
              type="button" 
              onClick={() => { onChange(''); setIsOpen(false); }} 
              className="flex-1 py-1.5 text-xs font-bold bg-white border border-slate-200 hover:bg-slate-100 rounded-lg shadow-sm text-slate-600 transition-colors"
            >
              Nil
            </button>
            <button 
              type="button" 
              onClick={() => { onChange('Plano'); setIsOpen(false); }} 
              className="flex-1 py-1.5 text-xs font-bold bg-white border border-slate-200 hover:bg-slate-100 rounded-lg shadow-sm text-slate-600 transition-colors"
            >
              Plano
            </button>
            <button 
              type="button" 
              onClick={() => { onChange('0.00'); setIsOpen(false); }} 
              className="flex-1 py-1.5 text-xs font-bold bg-white border border-slate-200 hover:bg-slate-100 rounded-lg shadow-sm text-slate-600 transition-colors"
            >
              0.00
            </button>
          </div>
          
          {/* 2-Column Power Grid */}
          <div className="flex flex-1 overflow-y-auto">
            {/* Positives Column */}
            <div className="flex-1 border-r border-slate-100">
              <div className="sticky top-0 bg-blue-50/95 backdrop-blur-xs text-blue-700 text-[10px] font-black text-center py-1.5 border-b border-blue-100 tracking-wider">
                POSITIVE (+)
              </div>
              <div className="flex flex-col py-1">
                {positives.map(p => (
                  <button 
                    key={p} 
                    type="button" 
                    onClick={() => { onChange(p); setIsOpen(false); }} 
                    className={`text-xs py-2 text-center transition-colors ${
                      value === p 
                        ? 'bg-blue-100 font-extrabold text-blue-800' 
                        : 'text-slate-700 hover:bg-blue-50 font-medium'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Negatives Column */}
            <div className="flex-1">
              <div className="sticky top-0 bg-rose-50/95 backdrop-blur-xs text-rose-700 text-[10px] font-black text-center py-1.5 border-b border-rose-100 tracking-wider">
                NEGATIVE (-)
              </div>
              <div className="flex flex-col py-1">
                {negatives.map(n => (
                  <button 
                    key={n} 
                    type="button" 
                    onClick={() => { onChange(n); setIsOpen(false); }} 
                    className={`text-xs py-2 text-center transition-colors ${
                      value === n 
                        ? 'bg-rose-100 font-extrabold text-rose-800' 
                        : 'text-slate-700 hover:bg-rose-50 font-medium'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
