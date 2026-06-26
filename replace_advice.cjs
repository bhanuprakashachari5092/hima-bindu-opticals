const fs = require('fs');
const file = 'src/components/PrescriptionPDF.tsx';
let content = fs.readFileSync(file, 'utf8');

const startMarker = `            {/* Advice Columns matching pad perfectly */}`;
const endMarker = `            {/* Diagnostic Remarks / Notes section */}`;

if (!content.includes(startMarker)) {
  console.log("Start marker not found!");
  process.exit(1);
}

const before = content.split(startMarker)[0];
const after = content.split(endMarker)[1];

const replacement = `            {/* Advice Columns (Only Selected to save paper) */}
            <div className="flex flex-col md:flex-row gap-3 justify-between mb-3">
              {/* Selected Advice items */}
              <div className="flex-1 flex flex-wrap gap-2 content-start">
                {[
                  { label: 'Blue Light', icon: <svg className="w-4 h-4 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-3z"/></svg> },
                  { label: 'MR8', icon: <svg className="w-4 h-4 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/></svg> },
                  { label: 'CR KT HC', icon: <svg className="w-4 h-4 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="12" cy="12" rx="9" ry="5"/></svg> },
                  { label: 'CR KT HMC', icon: <svg className="w-4 h-4 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="12" cy="12" rx="9" ry="5"/></svg> },
                  { label: 'Contact Lens', icon: <svg className="w-4 h-4 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/></svg> },
                  { label: 'Blue Cut', icon: <svg className="w-4 h-4 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="6" cy="12" r="3"/><circle cx="18" cy="12" r="3"/><path d="M9 12h6M6 9h12"/></svg> },
                  { label: 'dual corth', icon: <svg className="w-4 h-4 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="12" cy="12" rx="9" ry="5"/></svg> },
                  { label: 'CR HMC', icon: <svg className="w-4 h-4 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="12" cy="12" rx="9" ry="5"/></svg> },
                  { label: 'CR KT PG HC', icon: <svg className="w-4 h-4 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="12" cy="12" rx="9" ry="5"/></svg> },
                  { label: 'Progressive Lens', icon: <svg className="w-4 h-4 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><line x1="3.6" y1="12" x2="20.4" y2="12"/></svg> },
                  { label: 'Marry blue', icon: <svg className="w-3.5 h-3.5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="12" cy="12" rx="9" ry="5"/></svg> },
                  { label: 'Blue light PG - progressive', icon: <svg className="w-3.5 h-3.5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><line x1="3.6" y1="12" x2="20.4" y2="12"/></svg> },
                  { label: 'Blue light KT - progressive', icon: <svg className="w-3.5 h-3.5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><line x1="3.6" y1="12" x2="20.4" y2="12"/></svg> },
                  { label: 'CR PG HC', icon: <svg className="w-3.5 h-3.5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg> },
                  { label: 'CR HC', icon: <svg className="w-3.5 h-3.5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="12" cy="12" rx="9" ry="5"/></svg> }
                ].filter(item => checkAdviceSelected(item.label)).map((item, idx) => (
                  <div 
                    key={idx} 
                    className="border border-teal-700 bg-teal-50/70 text-teal-950 font-bold rounded-xl p-2 flex items-center gap-2.5 shadow-sm"
                  >
                    <div className="w-4 h-4 rounded-md bg-teal-700 text-white flex items-center justify-center font-mono text-[10px] leading-none">
                      ✓
                    </div>
                    <div className="w-5 h-5 rounded-md bg-white border border-slate-150 flex items-center justify-center shrink-0 shadow-3xs">
                      {item.icon}
                    </div>
                    <span className="text-[10.5px] tracking-wide pr-1">{item.label}</span>
                  </div>
                ))}
                
                {/* Fallback if none selected */}
                {!prescription.advice || prescription.advice.length === 0 ? (
                  <span className="text-xs text-slate-400 italic px-2 py-1">No specific ophthalmic lenses advised.</span>
                ) : null}
              </div>

              {/* Dynamic Signature Area inside Column 3 */}
              <div className="w-32 border border-dashed border-slate-250 bg-slate-50/50 rounded-xl p-2 flex flex-col justify-end items-center min-h-12.5 shadow-3xs shrink-0 mt-auto">
                <div className="w-20 border-b border-dashed border-slate-400 h-5 mb-1 flex items-end justify-center select-none font-serif italic text-[10px] text-slate-350">
                  Sign Verified
                </div>
                <span className="text-[9.5px] font-extrabold text-teal-850">Signature</span>
              </div>
            </div>

            {/* Diagnostic Remarks / Notes section */}
`;

fs.writeFileSync(file, before + replacement + after);
console.log('Successfully replaced advice columns.');
