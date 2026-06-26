import React from 'react';
import { renderToString } from 'react-dom/server';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  PDFViewer, 
  PDFDownloadLink 
} from '@react-pdf/renderer';
import { Download, FileText, Printer, CheckSquare, RefreshCw, MessageCircle } from 'lucide-react';

// Design styles mimicking a physical, professional optical clinic diagnostic prescription letterhead
const styles = StyleSheet.create({
  page: {
    padding: 24,
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: '#333333',
    lineHeight: 1.3,
  },
  header: {
    borderBottomWidth: 2,
    borderBottomColor: '#1e40af', // Clinical Blue
    borderBottomStyle: 'solid',
    paddingBottom: 6,
    marginBottom: 10,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clinicName: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#1e40af',
    letterSpacing: 0.5,
  },
  clinicTagline: {
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: '#4b5563',
    marginTop: 1,
  },
  clinicContact: {
    fontSize: 8,
    textAlign: 'right',
    color: '#4b5563',
  },
  metaGrid: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    padding: 6,
    marginBottom: 10,
  },
  metaItem: {
    width: '33.33%',
    marginBottom: 4,
  },
  metaLabel: {
    fontSize: 7.5,
    color: '#6b7280',
    fontFamily: 'Helvetica-Bold',
  },
  metaValue: {
    fontSize: 8.5,
    fontFamily: 'Helvetica',
    color: '#111827',
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#1e40af',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 2,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  tableRow: {
    display: 'flex',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableHeaderRow: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    borderBottomWidth: 1,
    borderBottomColor: '#dbeafe',
  },
  tableCellHeader: {
    fontFamily: 'Helvetica-Bold',
    color: '#1e40af',
    padding: 3.5,
    textAlign: 'center',
    fontSize: 8,
  },
  tableCell: {
    padding: 3.5,
    textAlign: 'center',
    fontSize: 8,
  },
  colEye: { width: '15%' },
  colType: { width: '15%' },
  colSph: { width: '17%' },
  colCyl: { width: '17%' },
  colAxis: { width: '17%' },
  colVision: { width: '19%' },
  
  detailsGrid: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailsCol: {
    width: '48%',
  },
  badgeContainer: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
    marginTop: 2,
  },
  badge: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 1.5,
    fontSize: 7,
    color: '#1e40af',
    marginBottom: 3,
    marginRight: 3,
  },
  notesBlock: {
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#f3f4f6',
    borderRadius: 4,
    padding: 6,
    minHeight: 32,
    fontSize: 8,
  },
  footer: {
    marginTop: 'auto',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 8,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  footerLeft: {
    width: '60%',
  },
  footerRight: {
    width: '35%',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  signatureLine: {
    width: 100,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
    marginBottom: 3,
  },
});

export interface PowerData {
  sph: string;
  cyl: string;
  axis: string;
  vision: string;
}

export interface EyePower {
  distance: PowerData;
  near: PowerData;
  add: string;
}

export interface Prescription {
  prescriptionId: string;
  patientId: string;
  patientName: string;
  mobile: string;
  age: number;
  gender: string;
  date: string;
  rightEyeData: EyePower;
  leftEyeData: EyePower;
  pd: string;
  advice: string[];
  notes: string;
  createdAt?: any;
  frameName?: string;
  lensType?: string;
  orderStatus?: 'Pending' | 'Ready';
  orderPrice?: string;
  isNotified?: boolean;
  isOrderSent?: boolean;
  actualCost?: string;
  receivedCost?: string;
  balanceCost?: string;
}

interface PrescriptionPDFProps {
  prescription: Prescription;
  hideWhatsApp?: boolean;
}

// React-PDF Document Definition
export const PrescriptionPDFDocument = ({ prescription }: PrescriptionPDFProps) => {
  const { 
    prescriptionId, 
    patientId, 
    patientName, 
    mobile, 
    age, 
    gender, 
    date, 
    rightEyeData, 
    leftEyeData, 
    pd, 
    advice, 
    notes 
  } = prescription;

  return (
    <Document title={`Prescription-${prescriptionId}`}>
      <Page size="A4" style={styles.page}>
        {/* Clinically Designed Header/Letterhead */}
        <View style={styles.header}>
          <View style={{ maxWidth: '75%' }}>
            <Text style={styles.clinicName}>HIMABINDHU EYE TESTING & OPTICALS</Text>
            <Text style={styles.clinicTagline}>Clear Vision • Better Life</Text>
            <Text style={[styles.clinicTagline, { fontSize: 7.5, color: '#0c5975', fontFamily: 'Helvetica-Bold' }]}>Computerised Eye Testing & Contact Lens Clinic</Text>
          </View>
          <View style={styles.clinicContact}>
            <Text>Dharmavaram, Andhra Pradesh</Text>
            <Text>Ph: 90104 08092, 79892 89011</Text>
            <Text>Beside Apollo Pharmacy, RS Road</Text>
          </View>
        </View>

        {/* Patient and Rx Metadata Block */}
        <View style={styles.metaGrid}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>PRESCRIPTION NO (Rx)</Text>
            <Text style={[styles.metaValue, { fontFamily: 'Helvetica-Bold', color: '#1e40af' }]}>{prescriptionId}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>PATIENT ID</Text>
            <Text style={styles.metaValue}>{patientId}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>DATE</Text>
            <Text style={styles.metaValue}>{date}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>PATIENT NAME</Text>
            <Text style={[styles.metaValue, { fontFamily: 'Helvetica-Bold' }]}>{patientName}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>AGE / GENDER</Text>
            <Text style={styles.metaValue}>{age} Yrs / {gender}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>MOBILE NO</Text>
            <Text style={styles.metaValue}>{mobile}</Text>
          </View>
        </View>

        {/* Eye Refraction Table Section */}
        <Text style={styles.sectionTitle}>Refraction & Eye Power Specifications</Text>
        <View style={styles.table}>
          {/* Table Headers */}
          <View style={[styles.tableRow, styles.tableHeaderRow]}>
            <View style={[styles.tableCellHeader, styles.colEye]}><Text>EYE</Text></View>
            <View style={[styles.tableCellHeader, styles.colType]}><Text>VISION TYPE</Text></View>
            <View style={[styles.tableCellHeader, styles.colSph]}><Text>SPHERICAL (SPH)</Text></View>
            <View style={[styles.tableCellHeader, styles.colCyl]}><Text>CYLINDRICAL (CYL)</Text></View>
            <View style={[styles.tableCellHeader, styles.colAxis]}><Text>AXIS</Text></View>
            <View style={[styles.tableCellHeader, styles.colVision]}><Text>VISUAL ACUITY</Text></View>
          </View>

          {/* Right Eye - Distance */}
          <View style={styles.tableRow}>
            <View style={[styles.tableCell, styles.colEye, { fontFamily: 'Helvetica-Bold' }]}><Text>R.E. (OD)</Text></View>
            <View style={[styles.tableCell, styles.colType]}><Text>Distance</Text></View>
            <View style={[styles.tableCell, styles.colSph]}><Text>{rightEyeData.distance.sph || '—'}</Text></View>
            <View style={[styles.tableCell, styles.colCyl]}><Text>{rightEyeData.distance.cyl || '—'}</Text></View>
            <View style={[styles.tableCell, styles.colAxis]}><Text>{rightEyeData.distance.axis || '—'}</Text></View>
            <View style={[styles.tableCell, styles.colVision]}><Text>{rightEyeData.distance.vision || '—'}</Text></View>
          </View>

          {/* Right Eye - Near */}
          <View style={styles.tableRow}>
            <View style={[styles.tableCell, styles.colEye]}><Text></Text></View>
            <View style={[styles.tableCell, styles.colType]}><Text>Near</Text></View>
            <View style={[styles.tableCell, styles.colSph]}><Text>{rightEyeData.near.sph || ''}</Text></View>
            <View style={[styles.tableCell, styles.colCyl]}><Text>{rightEyeData.near.cyl || ''}</Text></View>
            <View style={[styles.tableCell, styles.colAxis]}><Text>{rightEyeData.near.axis || ''}</Text></View>
            <View style={[styles.tableCell, styles.colVision]}><Text>{rightEyeData.near.vision || '—'}</Text></View>
          </View>

          {/* Right Eye Add */}
          <View style={[styles.tableRow, { backgroundColor: '#fcfcfc' }]}>
            <View style={[styles.tableCell, styles.colEye]}><Text></Text></View>
            <View style={[styles.tableCell, styles.colType, { fontFamily: 'Helvetica-Bold' }]}><Text>ADD</Text></View>
            <View style={[styles.tableCell, styles.colSph]}><Text>{rightEyeData.add ? `+${rightEyeData.add}` : '—'}</Text></View>
            <View style={[styles.tableCell, styles.colCyl]}><Text>—</Text></View>
            <View style={[styles.tableCell, styles.colAxis]}><Text>—</Text></View>
            <View style={[styles.tableCell, styles.colVision]}><Text>—</Text></View>
          </View>

          {/* Left Eye - Distance */}
          <View style={[styles.tableRow, { borderTopWidth: 1, borderTopColor: '#e5e7eb' }]}>
            <View style={[styles.tableCell, styles.colEye, { fontFamily: 'Helvetica-Bold' }]}><Text>L.E. (OS)</Text></View>
            <View style={[styles.tableCell, styles.colType]}><Text>Distance</Text></View>
            <View style={[styles.tableCell, styles.colSph]}><Text>{leftEyeData.distance.sph || '—'}</Text></View>
            <View style={[styles.tableCell, styles.colCyl]}><Text>{leftEyeData.distance.cyl || '—'}</Text></View>
            <View style={[styles.tableCell, styles.colAxis]}><Text>{leftEyeData.distance.axis || '—'}</Text></View>
            <View style={[styles.tableCell, styles.colVision]}><Text>{leftEyeData.distance.vision || '—'}</Text></View>
          </View>

          {/* Left Eye - Near */}
          <View style={styles.tableRow}>
            <View style={[styles.tableCell, styles.colEye]}><Text></Text></View>
            <View style={[styles.tableCell, styles.colType]}><Text>Near</Text></View>
            <View style={[styles.tableCell, styles.colSph]}><Text>{leftEyeData.near.sph || ''}</Text></View>
            <View style={[styles.tableCell, styles.colCyl]}><Text>{leftEyeData.near.cyl || ''}</Text></View>
            <View style={[styles.tableCell, styles.colAxis]}><Text>{leftEyeData.near.axis || ''}</Text></View>
            <View style={[styles.tableCell, styles.colVision]}><Text>{leftEyeData.near.vision || '—'}</Text></View>
          </View>

          {/* Left Eye Add */}
          <View style={[styles.tableRow, { backgroundColor: '#fcfcfc' }]}>
            <View style={[styles.tableCell, styles.colEye]}><Text></Text></View>
            <View style={[styles.tableCell, styles.colType, { fontFamily: 'Helvetica-Bold' }]}><Text>ADD</Text></View>
            <View style={[styles.tableCell, styles.colSph]}><Text>{leftEyeData.add ? `+${leftEyeData.add}` : '—'}</Text></View>
            <View style={[styles.tableCell, styles.colCyl]}><Text>—</Text></View>
            <View style={[styles.tableCell, styles.colAxis]}><Text>—</Text></View>
            <View style={[styles.tableCell, styles.colVision]}><Text>—</Text></View>
          </View>
        </View>

        {/* Pupillary Distance and Advice Columns */}
        <View style={styles.detailsGrid}>
          {/* Left Column: Pupillary Distance and Notes */}
          <View style={styles.detailsCol}>
            <Text style={styles.sectionTitle}>Physical Specifications</Text>
            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: '#4b5563' }}>Pupillary Distance (PD):</Text>
              <Text style={{ fontSize: 10, fontFamily: 'Helvetica', color: '#1e40af', marginTop: 2 }}>{pd ? `${pd} mm` : 'Not specified'}</Text>
            </View>

            <Text style={styles.sectionTitle}>Clinical Remarks / Notes</Text>
            <View style={styles.notesBlock}>
              <Text>{notes || 'None or no routine ocular disease detected. Advised standard spectacle wear.'}</Text>
            </View>
          </View>

          {/* Right Column: Spectacle Advice */}
          <View style={styles.detailsCol}>
            <Text style={styles.sectionTitle}>Ophthalmic Lens Advice</Text>
            <View style={styles.badgeContainer}>
              {advice && advice.length > 0 ? (
                advice.map((item, idx) => (
                  <View key={idx} style={styles.badge}>
                    <Text>[✓] {item}</Text>
                  </View>
                ))
              ) : (
                <Text style={{ color: '#9ca3af', fontSize: 8.5, fontStyle: 'italic' }}>No special advice marked.</Text>
              )}
            </View>
          </View>
        </View>

        {/* Legal and Optometrist Signature Placeholder Footer */}
        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            <Text style={{ fontFamily: 'Helvetica-Bold', color: '#1e40af', marginBottom: 2 }}>Himabindhu Eye Clinic Guidelines:</Text>
            <Text style={{ fontSize: 7.5, color: '#6b7280' }}>
              1. Spectacles are crafted specifically based on this ocular diagnostic. Allow 2-3 days for physical adaptation to new powers.
            </Text>
            <Text style={{ fontSize: 7.5, color: '#6b7280' }}>
              2. For progressive lens users, specialized head tracking instructions apply. Review within 15 days if adaptation difficulty persists.
            </Text>
          </View>
          <View style={styles.footerRight}>
            <View style={styles.signatureLine} />
            <Text style={{ fontFamily: 'Helvetica-Bold', color: '#111827', fontSize: 8.5 }}>Administered Optometrist</Text>
            <Text style={{ color: '#4b5563', fontSize: 7.5 }}>Regd No. HBE-Opt-1249</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

// Perfectly Mimicked HTML letterhead directly in app - handles rendering safely even inside standard iframes

export function printPrescriptionHTML(rx: Prescription) {
  const htmlContent = renderToString(<PrescriptionPrintTemplate prescription={rx} />);
  
  const styleNodes = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
    .map(el => el.outerHTML)
    .join('\n');

  const printContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Prescription ${rx.prescriptionId || 'Slip'}</title>
        ${styleNodes}
        <style>
          @media print {
            @page { size: A4 portrait; margin: 0; }
            body { 
              -webkit-print-color-adjust: exact !important; 
              print-color-adjust: exact !important; 
              background-color: white !important; 
              margin: 0 !important; 
              padding: 0 !important; 
            }
            .a4-print-wrapper {
              width: 210mm;
              height: 296mm;
              padding: 15mm;
              box-sizing: border-box;
              margin: 0 auto;
              overflow: hidden;
              page-break-after: avoid;
              page-break-before: avoid;
            }
          }
          body { background: white; padding: 20px; font-family: ui-sans-serif, system-ui, sans-serif; }
          .a4-print-wrapper { width: 100%; max-width: 800px; margin: 0 auto; }
        </style>
      </head>
      <body onload="setTimeout(function(){ window.print(); }, 1500)">
        <div class="a4-print-wrapper">
          ${htmlContent}
        </div>
      </body>
    </html>
  `;

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentWindow?.document || iframe.contentDocument;
  if (!iframeDoc) {
    alert("Failed to initialize printer frame.");
    return;
  }

  iframeDoc.write(printContent);
  iframeDoc.close();

  setTimeout(() => {
    try { document.body.removeChild(iframe); } catch(e){}
  }, 10000);
}


export function PrescriptionPDFViewerPanel({ prescription, hideWhatsApp }: PrescriptionPDFProps) {
  const [showIframe, setShowIframe] = React.useState(false);

  // Map representation of advisory options for custom dynamic on-screen UI preview rendering
  const adviceItemsObj = [
    { label: 'Blue Light', desc: 'Shield Icon' },
    { label: 'Blue Cut', desc: 'Glasses Eye' },
    { label: 'CR PG HC', desc: 'Transitions' },
    { label: 'CR KT HC', desc: 'Convex Lens' },
    { label: 'CR HMC', desc: 'Convex Lens' },
    { label: 'CR HC', desc: 'Convex Lens' },
    { label: 'CR KT HMC', desc: 'Convex Lens' },
    { label: 'CR KT PG HC', desc: 'Convex Lens' },
    { label: 'Contact Lens', desc: 'Circles case' },
    { label: 'Progressive Lens', desc: 'Progressive' }
  ];

  const checkAdviceSelected = (labelName: string) => {
    return prescription.advice?.some(val => 
      val.toLowerCase().replace(/[^a-z]/g, '') === labelName.toLowerCase().replace(/[^a-z]/g, '') ||
      val.toLowerCase().includes(labelName.toLowerCase().replace(/ lens| protection/g, ''))
    ) || false;
  };

  const handleSendWhatsApp = () => {
    const rx = prescription;
    const cleanPhone = String(rx.mobile || '').replace(/\D/g, '');
    const targetPhone = cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone;
    
    if (!targetPhone) {
      alert("Please provide a valid mobile number.");
      return;
    }
    
    const fmt = (v: string | undefined) => (v && v !== '—' && v !== '') ? v : '—';
    const msg = [
      `🏥 *Himabindhu Eye Testing & Opticals*`,
      `📍 Dharmavaram, Andhra Pradesh | 📞 9010408092`,
      ``,
      `✨✨✨✨✨✨✨✨`,
      `👓 *CLINICAL EYE PRESCRIPTION*`,
      `✨✨✨✨✨✨✨✨`,
      ``,
      `👤 *Patient:* ${rx.patientName}`,
      `🆔 *Patient ID:* ${rx.patientId}`,
      `🔖 *Rx ID:* ${rx.prescriptionId}`,
      `🎂 *Age/Sex:* ${rx.age} yrs / ${rx.gender}`,
      ``,
      `👁️ *RIGHT EYE (OD):*`,
      `*Distance:* SPH: ${fmt(rx.rightEyeData?.distance?.sph)} | CYL: ${fmt(rx.rightEyeData?.distance?.cyl)} | AXIS: ${fmt(rx.rightEyeData?.distance?.axis)}° | Vision: ${fmt(rx.rightEyeData?.distance?.vision)}`,
      `*Near:* Vision: ${fmt(rx.rightEyeData?.near?.vision)} | *ADD:* +${fmt(rx.rightEyeData?.add)}`,
      ``,
      `👁️ *LEFT EYE (OS):*`,
      `*Distance:* SPH: ${fmt(rx.leftEyeData?.distance?.sph)} | CYL: ${fmt(rx.leftEyeData?.distance?.cyl)} | AXIS: ${fmt(rx.leftEyeData?.distance?.axis)}° | Vision: ${fmt(rx.leftEyeData?.distance?.vision)}`,
      `*Near:* Vision: ${fmt(rx.leftEyeData?.near?.vision)} | *ADD:* +${fmt(rx.leftEyeData?.add)}`,
      rx.pd ? `📏 *PD:* ${rx.pd} mm` : null,
      ``,
      `✨✨✨✨✨✨✨✨`,
      `_This is your digital eye prescription. Thank you! 🙏_`
    ].filter(v => v !== null).join('\n');
    
    const url = `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden" id="prescription_pdf_panel">
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 px-2 bg-amber-600 rounded-lg text-white text-xs font-bold leading-none">
            Rx Print Desk
          </div>
          <h3 className="font-extrabold text-white text-xs uppercase tracking-wider">Spectacle Letterhead Diagnostics</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => printPrescriptionHTML(prescription)}
            className="px-3.5 py-1.5 text-xs bg-emerald-600 text-white hover:bg-emerald-700 font-extrabold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm shadow-emerald-700/10"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Custom Laser Slip
          </button>

          <button
            onClick={() => setShowIframe(!showIframe)}
            className="px-3.5 py-1.5 text-xs bg-slate-800 text-slate-300 border border-slate-700 rounded-xl hover:bg-slate-750 font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${showIframe ? 'animate-spin' : ''}`} />
            {showIframe ? "Back to Visual Pad" : "A4 Adobe PDF View"}
          </button>
          
          <PDFDownloadLink
            document={<PrescriptionPDFDocument prescription={prescription} />}
            fileName={`Prescription_${prescription.prescriptionId}.pdf`}
            className="px-3.5 py-1.5 text-xs bg-amber-600 text-white rounded-xl hover:bg-amber-700 font-bold transition flex items-center gap-1.5 decoration-none shadow-sm shadow-amber-500/10"
          >
            {({ loading }) => (
              <>
                <Download className="w-3.5 h-3.5" />
                {loading ? 'Compiling...' : 'Get PDF'}
              </>
            )}
          </PDFDownloadLink>

          {!hideWhatsApp && (
            <button
              onClick={handleSendWhatsApp}
              className="px-3.5 py-1.5 text-xs bg-[#25D366] text-white hover:bg-[#20b858] font-extrabold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm shadow-[#25D366]/20"
            >
              <MessageCircle className="w-3.5 h-3.5 text-white" />
              Send WhatsApp
            </button>
          )}
        </div>
      </div>

      {showIframe ? (
        <div className="w-full h-162.5 bg-slate-100 p-2">
          <PDFViewer width="100%" height="100%" className="border-0 rounded-xl shadow-inner">
            <PrescriptionPDFDocument prescription={prescription} />
          </PDFViewer>
        </div>
      ) : (
        <PrescriptionPrintTemplate prescription={prescription} />
      )}
    </div>
  );
}

export function PrescriptionPrintTemplate({ prescription }: { prescription: any }) {
  // Map representation of advisory options for custom dynamic on-screen UI preview rendering
  const adviceItemsObj = [
    { label: 'Blue Light', desc: 'Shield Icon' },
    { label: 'Blue Cut', desc: 'Glasses Eye' },
    { label: 'CR PG HC', desc: 'Transitions' },
    { label: 'CR KT HC', desc: 'Convex Lens' },
    { label: 'CR HMC', desc: 'Convex Lens' },
    { label: 'CR HC', desc: 'Convex Lens' },
    { label: 'CR KT HMC', desc: 'Convex Lens' },
    { label: 'CR KT PG HC', desc: 'Convex Lens' },
    { label: 'Contact Lens', desc: 'Circles case' },
    { label: 'Progressive Lens', desc: 'Progressive' }
  ];

  const checkAdviceSelected = (labelName: string) => {
    return prescription.advice?.some((val: string) => 
      val.toLowerCase().replace(/[^a-z]/g, '') === labelName.toLowerCase().replace(/[^a-z]/g, '') ||
      val.toLowerCase().includes(labelName.toLowerCase().replace(/ lens| protection/g, ''))
    ) || false;
  };

  return (
    <>

        <div className="w-full p-1 md:p-2 bg-slate-50 border-t border-gray-100 transition duration-150">
          <div className="border-4 border-double border-slate-300 rounded-2xl bg-white p-3 md:p-4.5 shadow-sm relative font-sans text-slate-900 w-full max-w-3xl mx-auto">
            
            {/* Header letterhead pattern */}
            <div className="grid grid-cols-[60px_1fr_120px] items-center border-b-2 border-teal-850 pb-3 mb-3 gap-3">
              
              {/* Left Shield Medical Eye Logo */}
              <div className="flex justify-center">
                <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-md shadow-slate-900/20 p-2">
                  <svg viewBox="0 0 100 100" className="w-9 h-9">
                    <path d="M15,50 C30,22 70,22 85,50 C70,78 30,78 15,50 Z" fill="none" stroke="#ffffff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />
                    <circle cx="50" cy="50" r="16" fill="none" stroke="#ffffff" stroke-width="7" />
                    <circle cx="50" cy="50" r="8" fill="#ffffff" />
                    <g fill="#ffffff">
                      <rect x="15" y="65" width="16" height="5" rx="1.5" />
                      <rect x="20.5" y="59.5" width="5" height="16" rx="1.5" />
                    </g>
                  </svg>
                </div>
              </div>

              {/* Centered serif titles */}
              <div className="text-center flex flex-col items-center">
                <h1 className="text-sm sm:text-base md:text-[15px] font-black text-slate-900 font-serif leading-tight uppercase">
                  Himabindhu Eye Testing & Opticals
                </h1>
                <p className="text-[9px] text-teal-700 font-serif italic font-semibold mt-0.5">
                  Clear Vision <span className="text-slate-800 mx-0.5">•</span> Better Life
                </p>
                <span className="inline-block bg-teal-850 text-white text-[8px] uppercase font-black tracking-wider px-3 py-0.5 rounded-full mt-1.5 shadow-2xs">
                  Computerised Eye Testing & Contact Lens Clinic
                </span>
              </div>

              {/* Right contacts */}
              <div className="text-right flex flex-col items-end justify-center">
                <div className="flex items-center gap-1 font-bold text-slate-900 text-[10px] font-mono leading-tight">
                  <svg viewBox="0 0 24 24" className="w-3 h-3 fill-blue-900 shrink-0"><path d="M6.62 10.79a15.15 15.15 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.27c1.12.37 2.33.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.24.2 2.45.57 3.57a1 1 0 0 1-.27 1.02l-2.18 2.2z"/></svg>
                  <div>
                    <p>90104 08092</p>
                    <p>79892 89011</p>
                  </div>
                </div>
                <div className="mt-3 opacity-90 hidden md:block">
                  <svg viewBox="0 0 100 100" className="w-14 h-14">
                    <ellipse cx="50" cy="50" rx="42" ry="22" fill="none" stroke="#1e3a8a" strokeWidth="1.8" />
                    <circle cx="50" cy="50" r="14" fill="none" stroke="#0d9488" strokeWidth="2" />
                    <circle cx="50" cy="50" r="7" className="fill-teal-700" />
                    <circle cx="47" cy="47" r="2" fill="#ffffff" />
                  </svg>
                </div>
              </div>

            </div>

            {/* Doctor Card Banner */}
            <div className="border border-slate-200 rounded-xl bg-slate-50 p-2.5 px-4 flex flex-col sm:flex-row justify-between items-center gap-2 mb-3 shadow-xs">
              <div className="text-center sm:text-left">
                <h4 className="font-extrabold text-slate-900 text-sm">M. Nagaraja Achari <span className="text-[10px] font-semibold text-slate-500">(DOA, Ophthalmic Optom)</span></h4>
                <p className="text-[10px] font-mono text-slate-450 font-black tracking-wide">Reg No. 73/001412</p>
              </div>
              <div className="text-xs bg-white border border-slate-200 rounded-lg px-3.5 py-1.5 text-slate-900 font-extrabold shadow-2xs">
                Clinical Date: <span className="text-slate-800 ml-1 select-all">{prescription.date}</span>
              </div>
            </div>

            {/* Title separator */}
            <div className="relative text-center my-3">
              <div className="absolute inset-0 flex items-center md:px-12"><div className="w-full border-t border-slate-200"></div></div>
              <span className="relative z-10 bg-white px-5 text-[10px] font-extrabold text-slate-900 uppercase tracking-[0.25em]">
                • Optical Prescription Specs •
              </span>
            </div>

            {/* Patient Meta Fields */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 border border-slate-150 p-2.5 rounded-xl mb-3 text-xs shadow-3xs">
              <div>
                <p className="text-[9px] uppercase font-bold text-slate-400 font-mono">Patient Ref ID</p>
                <p className="text-sm font-extrabold text-slate-900 select-all">{prescription.patientId}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase font-bold text-slate-400 font-mono">Full Name</p>
                <p className="text-sm font-extrabold text-slate-900">{prescription.patientName}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase font-bold text-slate-400 font-mono">Contact Phone</p>
                <p className="text-sm font-bold text-slate-700 font-mono">{prescription.mobile}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase font-bold text-slate-400 font-mono">Age / Gender</p>
                <p className="text-sm text-slate-700 font-bold">{prescription.age} Years / {prescription.gender}</p>
              </div>
            </div>

            {/* Visual Specification Grid */}
            <div className="overflow-x-auto border border-slate-300 rounded-xl mb-3 bg-white shadow-sm font-mono text-xs text-center">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white border-b border-slate-300 text-[10px] font-sans">
                    <th rowSpan={2} className="py-2 px-3 border border-slate-300 bg-slate-950 font-extrabold">EYE</th>
                    <th colSpan={4} className="py-1.5 px-3 border border-slate-300 bg-[#0c5975] text-white font-black tracking-wider text-center">RE (OD) RIGHT EYE</th>
                    <th colSpan={4} className="py-1.5 px-3 border border-slate-300 bg-[#00828a] text-white font-black tracking-wider text-center">LE (OS) LEFT EYE</th>
                  </tr>
                  <tr className="bg-cyan-50/70 border-b border-slate-300 text-[9px] text-teal-900 font-sans font-bold uppercase">
                    <th className="py-1.5 px-2 border border-slate-300">SPH</th>
                    <th className="py-1.5 px-2 border border-slate-300">CYL</th>
                    <th className="py-1.5 px-2 border border-slate-300">AXIS</th>
                    <th className="py-1.5 px-2 border border-slate-300">VISION</th>
                    <th className="py-1.5 px-2 border border-slate-300">SPH</th>
                    <th className="py-1.5 px-2 border border-slate-300">CYL</th>
                    <th className="py-1.5 px-2 border border-slate-300">AXIS</th>
                    <th className="py-1.5 px-2 border border-slate-300">VISION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {/* Distance row */}
                  <tr>
                    <td className="py-2 px-3 font-extrabold text-slate-955 bg-slate-50/70 text-center font-sans border-r border-slate-300">DISTANCE VISION</td>
                    <td className="py-2 px-2 border-r border-slate-200 font-bold">{prescription.rightEyeData.distance.sph || '—'}</td>
                    <td className="py-2 px-2 border-r border-slate-200 font-bold">{prescription.rightEyeData.distance.cyl || '—'}</td>
                    <td className="py-2 px-2 border-r border-slate-200 font-bold">{prescription.rightEyeData.distance.axis || '—'}</td>
                    <td className="py-2 px-2 border-r border-slate-300 font-black text-slate-800 font-sans">{prescription.rightEyeData.distance.vision || '—'}</td>
                    <td className="py-2 px-2 border-r border-slate-200 font-bold">{prescription.leftEyeData.distance.sph || '—'}</td>
                    <td className="py-2 px-2 border-r border-slate-200 font-bold">{prescription.leftEyeData.distance.cyl || '—'}</td>
                    <td className="py-2 px-2 border-r border-slate-200 font-bold">{prescription.leftEyeData.distance.axis || '—'}</td>
                    <td className="py-2 px-2 border-r border-slate-300 font-black text-teal-800 font-sans">{prescription.leftEyeData.distance.vision || '—'}</td>
                  </tr>
                  {/* Near row */}
                  <tr>
                    <td className="py-2 px-3 font-extrabold text-slate-955 bg-slate-50/70 text-center font-sans border-r border-slate-300">NEAR VISION</td>
                    <td className="py-2 px-2 border-r border-slate-200 font-bold">{prescription.rightEyeData.near.sph || '—'}</td>
                    <td className="py-2 px-2 border-r border-slate-200 font-bold">{prescription.rightEyeData.near.cyl || '—'}</td>
                    <td className="py-2 px-2 border-r border-slate-200 font-bold">{prescription.rightEyeData.near.axis || '—'}</td>
                    <td className="py-2 px-2 border-r border-slate-300 font-black text-slate-800 font-sans">{prescription.rightEyeData.near.vision || '—'}</td>
                    <td className="py-2 px-2 border-r border-slate-200 font-bold">{prescription.leftEyeData.near.sph || '—'}</td>
                    <td className="py-2 px-2 border-r border-slate-200 font-bold">{prescription.leftEyeData.near.cyl || '—'}</td>
                    <td className="py-2 px-2 border-r border-slate-200 font-bold">{prescription.leftEyeData.near.axis || '—'}</td>
                    <td className="py-2 px-2 border-r border-slate-300 font-black text-teal-800 font-sans">{prescription.leftEyeData.near.vision || '—'}</td>
                  </tr>
                  {/* ADD SPH split row */}
                  <tr className="bg-slate-50/30 font-sans">
                    <td className="py-2 px-3 font-extrabold bg-slate-50/70 text-center border-r border-slate-300">ADD</td>
                    <td className="py-2 px-2 border-r border-slate-200 font-bold">{prescription.rightEyeData.add ? `+${prescription.rightEyeData.add}` : '—'}</td>
                    <td className="py-2 px-2 border-r border-slate-200 font-bold">—</td>
                    <td className="py-2 px-2 border-r border-slate-200 font-bold">—</td>
                    <td className="py-2 px-2 border-r border-slate-300 font-bold">—</td>
                    <td className="py-2 px-2 border-r border-slate-200 font-bold">{prescription.leftEyeData.add ? `+${prescription.leftEyeData.add}` : '—'}</td>
                    <td className="py-2 px-2 border-r border-slate-200 font-bold">—</td>
                    <td className="py-2 px-2 border-r border-slate-200 font-bold">—</td>
                    <td className="py-2 px-2 border-r border-slate-300 font-bold">—</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Capsules Row */}
            <div className="flex gap-4 mb-3">
              <span className="bg-slate-900 text-white font-extrabold uppercase tracking-wide px-4 py-1 text-[11px] rounded-full shadow-2xs">
                Clinical Advice
              </span>
              <span className="bg-teal-800 text-white font-extrabold uppercase tracking-wide px-4 py-1 text-[11px] rounded-full shadow-2xs">
                PD: <span className="font-mono ml-1 font-bold">{prescription.pd ? `${prescription.pd} mm` : '—'}</span>
              </span>
            </div>

            {/* Advice Columns (Only Selected to save paper) */}
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

            {/* Diagnostic Remarks / Notes section (only if present) */}
            {prescription.notes && prescription.notes.trim() !== '' && (
              <div className="mb-3">
                <span className="text-[9.5px] uppercase font-black tracking-widest text-slate-900 block mb-1">
                  Clinical Remarks & Dynamic Notes:
                </span>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 font-sans italic min-h-7.5 leading-relaxed shadow-3xs">
                  {prescription.notes}
                </div>
              </div>
            )}

            {/* Friendly Reminders & Footer Info (Compact) */}
            <div className="flex justify-between items-stretch gap-2 mb-2 bg-[#f0f7f0] rounded-xl border border-[#d6ebd6] p-2 shadow-3xs">
              
              {/* Reminders */}
              <div className="flex-1 border-r border-[#d6ebd6] pr-2">
                <h4 className="text-[9px] font-black text-[#2e6b2e] tracking-widest uppercase mb-1">
                  A Few Friendly Reminders
                </h4>
                <ul className="text-[8px] text-[#426b42] font-semibold space-y-0.5 list-disc pl-3">
                  <li>Use your prescribed glasses for clear and comfortable vision.</li>
                  <li>Follow up regularly for a healthier tomorrow.</li>
                  <li>We're always here to help you see better, every day.</li>
                </ul>
              </div>

              {/* Thank You & Take Care */}
              <div className="flex-1 px-2 flex flex-col justify-center items-center text-center border-r border-[#d6ebd6]">
                <span className="text-[10px] font-black text-[#2e6b2e]">Thank you for choosing us!</span>
                <span className="text-[8.5px] text-[#426b42] font-bold mb-1">Your vision is our priority.</span>
                <div className="text-[11px] font-serif italic font-extrabold text-[#3e8c3e]">
                  Take care of your eyes!
                </div>
              </div>

              {/* WhatsApp Assistance */}
              <div className="flex-1 pl-2 flex flex-col justify-center items-center text-center">
                <span className="text-[8.5px] font-bold text-[#2e6b2e] mb-1">Need assistance? Just WhatsApp us</span>
                <div className="flex items-center gap-1.5 bg-[#25D366] text-white px-2.5 py-1 rounded-full shadow-sm">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <span className="font-bold text-[10px] tracking-wide">9010408092</span>
                </div>
              </div>
            </div>

            {/* Bottom address details */}
            <div className="text-center font-bold text-[#0c5975] text-[8.5px] mt-2.5 flex items-center justify-center gap-1.5">
              <svg viewBox="0 0 24 24" className="w-3 h-3 fill-[#0c5975]"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
              Beside Apollo Pharmacy, Rs Road, Gandhi Nagar, Dharmavaram - 515671. (A.P.)
            </div>

            {/* Consulting Schedules */}
            <div className="mt-2.5 flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 text-[8.5px] text-[#0c5975] font-bold text-center">
              <span className="border border-[#1e3b8a] text-[#1e3b8a] rounded-full px-2.5 py-0.5 text-[7.5px] uppercase tracking-wider font-extrabold bg-white">Consulting Hours</span>
              <div className="flex items-center gap-1.5">
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-[#0c5975]"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 0 0-1.41 0a.996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 0 0-1.41 0a.996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.02.39 1.41 0c.39-.39.39-1.02 0-1.41l-1.06-1.06zm1.06-12.37l-1.06 1.06a.996.996 0 0 0 0 1.41c.39.39 1.03.39 1.41 0l1.06-1.06a.996.996 0 0 0 0-1.41a.996.996 0 0 0-1.41 0zm-12.37 12.37l-1.06 1.06a.996.996 0 0 0 0 1.41c.39.39 1.02.39 1.41 0l1.06-1.06a.996.996 0 0 0 0-1.41a.996.996 0 0 0-1.41 0z"/></svg>
                <span>Morning: 9-00 a.m. TO 2-00 p.m.</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-[#0c5975]"><path d="M12.3 22h-.1c-5.5 0-10-4.5-10-10C2.2 6.8 6.4 2.4 11.8 2c.5 0 .9.3 1 .8c.1.5-.1 1-.5 1.3C10.7 5.4 9.8 7.5 9.8 10c0 4.1 3.2 7.5 7.3 7.8c.8.1 1.6-.1 2.3-.5c.4-.2.9-.2 1.2.1c.4.3.6.7.5 1.2c-.8 3.5-3.9 6.4-7.6 6.4l-1.2-1z"/></svg>
                <span>Evening: 4-00 p.m. TO 9-00 p.m.</span>
              </div>
            </div>

          </div>
        </div>

    </>
  );
}
