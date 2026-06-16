import React from 'react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  PDFViewer, 
  PDFDownloadLink 
} from '@react-pdf/renderer';
import { Download, FileText, Printer, CheckSquare, RefreshCw } from 'lucide-react';

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
}

interface PrescriptionPDFProps {
  prescription: Prescription;
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
            <View style={[styles.tableCell, styles.colSph]}><Text>{rightEyeData.near.sph || '—'}</Text></View>
            <View style={[styles.tableCell, styles.colCyl]}><Text>{rightEyeData.near.cyl || '—'}</Text></View>
            <View style={[styles.tableCell, styles.colAxis]}><Text>{rightEyeData.near.axis || '—'}</Text></View>
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
            <View style={[styles.tableCell, styles.colSph]}><Text>{leftEyeData.near.sph || '—'}</Text></View>
            <View style={[styles.tableCell, styles.colCyl]}><Text>{leftEyeData.near.cyl || '—'}</Text></View>
            <View style={[styles.tableCell, styles.colAxis]}><Text>{leftEyeData.near.axis || '—'}</Text></View>
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


  // Map of 10 clinical advice labels to their visual elements
  const allAdviceItems = [
    { id: 'blue_light', label: 'Blue Light', icon: `<path d="M12 2L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-3z" />` },
    { id: 'blue_cut', label: 'Blue Cut', icon: `<path d="M21 5H3C1.9 5 1 5.9 1 7v1h22V7c0-1.1-.9-2-2-2zM21 16H3c-1.1 0-2-.9-2-2V9h22v5c0 1.1-.9 2-2 2z" />` },
    { id: 'cr_pg_hc', label: 'CR PG HC', icon: `<circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />` },
    { id: 'cr_kt_hc', label: 'CR KT HC', icon: `<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 12 10 12-4.48 12-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />` },
    { id: 'cr_hmc', label: 'CR HMC', icon: `<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 12 10 12-4.48 12-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />` },
    { id: 'cr_hc', label: 'CR HC', icon: `<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 12 10 12-4.48 12-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />` },
    { id: 'cr_kt_hmc', label: 'CR KT HMC', icon: `<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 12 10 12-4.48 12-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />` },
    { id: 'cr_kt_pg_hc', label: 'CR KT PG HC', icon: `<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 12 10 12-4.48 12-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />` },
    { id: 'contact_lens', label: 'Contact Lens', icon: `<circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />` },
    { id: 'progressive_lens', label: 'Progressive Lens', icon: `<path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" /><path d="M12 6a6 6 0 0 0-6 6h12a6 6 0 0 0-6-6z" />` }
  ];

  // Help normalize the user-selected advice in a quick checks lookup array
  const activeAdvices = rx.advice || [];
  const checkAdviceMatches = (itemLabel: string) => {
    return activeAdvices.some(val => 
      val.toLowerCase().replace(/[^a-z]/g, '') === itemLabel.toLowerCase().replace(/[^a-z]/g, '') ||
      val.toLowerCase().includes(itemLabel.toLowerCase().replace(/ lens| protection/g, ''))
    );
  };

  const printContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Prescription ${rx.prescriptionId} - Himabindhu Eye Clinic</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;800;900&family=Inter:wght@400;500;600;700;800&display=swap');
          
          * { box-sizing: border-box; }
          body {
            font-family: 'Inter', sans-serif;
            color: #0f172a;
            background-color: #ffffff;
            margin: 0;
            padding: 15px;
            font-size: 10.5px;
            line-height: 1.35;
          }
          
          /* Container styling mapping the physical diagnostic standard print aspect ratio */
          .prescription-pad {
            max-width: 800px;
            margin: 0 auto;
            border: 1px solid #cbd5e1;
            border-radius: 12px;
            padding: 20px;
            position: relative;
            background-color: #ffffff;
          }

          /* Header Section */
          .header-grid {
            display: grid;
            grid-template-columns: 80px 1fr 140px;
            align-items: center;
            border-bottom: 2px solid #0f5973;
            padding-bottom: 10px;
            margin-bottom: 10px;
          }
          
          .logo-cross-shield {
            width: 60px;
            height: 60px;
            background-color: #0c5975;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .logo-text-block {
            text-align: center;
            padding-left: 10px;
          }

          .logo-main-title {
            font-family: 'Cinzel', serif;
            font-weight: 900;
            font-size: 20px;
            margin: 0;
            line-height: 1.2;
            color: #1e3b8b;
            letter-spacing: 0.5px;
            white-space: nowrap;
          }

          .clear-tagline {
            font-family: 'Cinzel', serif;
            font-style: italic;
            font-size: 11px;
            color: #0c5975;
            margin-top: 5px;
            font-weight: 600;
          }

          .clear-tagline span {
            color: #1e3b8b;
            margin: 0 4px;
          }

          .clinic-ribbon {
            background-color: #0c5975;
            color: #ffffff;
            font-weight: 700;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 4px 14px;
            border-radius: 20px;
            display: inline-block;
            margin-top: 6px;
          }

          .contact-details {
            text-align: right;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            justify-content: center;
            font-weight: 700;
            color: #1e3b8b;
          }

          .contact-phone-block {
            font-size: 11px;
            line-height: 1.3;
            display: flex;
            align-items: center;
            gap: 6px;
          }

          /* Doctor Specifications Subgrid */
          .doctor-card {
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 8px 14px;
            display: grid;
            grid-template-columns: 1fr auto;
            align-items: center;
            margin-bottom: 10px;
            background-color: #f8fafc;
          }

          .doctor-name {
            font-size: 13px;
            font-weight: 800;
            color: #1e3b8b;
            margin: 0;
          }

          .doctor-reg {
            font-size: 10px;
            font-weight: 600;
            color: #64748b;
            margin-top: 1px;
          }

          .rx-date-card {
            font-size: 11px;
            font-weight: 700;
            color: #1e3b8b;
            text-align: right;
          }

          .divider-line {
            text-align: center;
            position: relative;
            margin: 12px 0;
          }

          .divider-line::before {
            content: "";
            position: absolute;
            left: 0;
            right: 0;
            top: 50%;
            height: 1px;
            background-color: #cbd5e1;
            z-index: 1;
          }

          .divider-title {
            position: relative;
            z-index: 2;
            background-color: #ffffff;
            padding: 0 16px;
            font-weight: 800;
            font-size: 11px;
            color: #1e3b8b;
            letter-spacing: 2px;
            text-transform: uppercase;
          }

          /* Patient Meta Details Block */
          .patient-meta-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
            margin-bottom: 12px;
            background-color: #f1f5f9;
            padding: 8px 12px;
            border-radius: 6px;
            border: 1px solid #e2e8f0;
          }

          .patient-meta-item {
            font-weight: 500;
          }

          .patient-meta-label {
            font-size: 8.5px;
            text-transform: uppercase;
            font-weight: 700;
            color: #64748b;
            letter-spacing: 0.5px;
            display: block;
            margin-bottom: 2px;
          }

          .patient-meta-value {
            font-size: 10.5px;
            font-weight: 700;
            color: #0f172a;
          }

          /* Refraction Table Grid styling */
          .rx-table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #94a3b8;
            border-radius: 6px;
            overflow: hidden;
            margin-bottom: 12px;
            text-align: center;
          }

          .rx-table th {
            font-size: 9.5px;
            font-weight: 800;
            padding: 5px;
            border: 1px solid #94a3b8;
          }

          .rx-table td {
            font-size: 10px;
            padding: 5px;
            font-weight: 700;
            border: 1px solid #94a3b8;
          }

          .bg-main-eye {
            background-color: #1e3b8b;
            color: #ffffff !important;
            font-weight: 800;
          }

          .bg-re {
            background-color: #0c5975;
            color: #ffffff !important;
            font-weight: 800;
          }

          .bg-le {
            background-color: #00828a;
            color: #ffffff !important;
            font-weight: 800;
          }

          .bg-subheaders {
            background-color: #ecfdfe;
            color: #0c5975;
            font-weight: 800;
          }

          .bg-add-row {
            background-color: #f8fafc;
            font-weight : 800;
          }

          /* Advice Checklist grid matching natural pad */
          .advice-section {
            margin-top: 12px;
          }

          .section-capsules {
            display: flex;
            gap: 12px;
            margin-bottom: 8px;
          }

          .capsule {
            font-weight: 800;
            font-size: 10px;
            color: #ffffff;
            padding: 3px 12px;
            border-radius: 20px;
            text-transform: uppercase;
          }

          .capsule-advice {
            background-color: #1e3b8b;
          }

          .capsule-pd {
            background-color: #0c5975;
          }

          .advice-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 6px;
            margin-bottom: 12px;
          }

          .advice-card {
            border: 1px solid #e1e8ed;
            border-radius: 6px;
            padding: 8px 12px;
            display: flex;
            align-items: center;
            gap: 8px;
            background-color: #ffffff;
            transition: all 0.2s;
          }

          .advice-card-checked {
            border-color: #0c5975;
            background-color: #f0fdfa;
            font-weight: 800;
            color: #0c5975;
          }

          .checkbox-box {
            width: 14px;
            height: 14px;
            border: 1.5px solid #94a3b8;
            border-radius: 3px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 8px;
            color: #ffffff;
            flex-shrink: 0;
          }

          .checkbox-box-checked {
            border-color: #0c5975;
            background-color: #0c5975;
          }

          .advice-icon-svg {
            width: 16px;
            height: 16px;
            fill: none;
            stroke: #64748b;
            stroke-width: 2;
            flex-shrink: 0;
          }

          .advice-card-checked .advice-icon-svg {
            stroke: #0c5975;
            fill: rgba(12, 89, 117, 0.1);
          }

          .advice-text {
            font-size: 10.5px;
          }

          /* Signature layout */
          .signature-box {
            grid-column: span 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-end;
            padding-bottom: 5px;
          }

          .signature-line-dotted {
            width: 80%;
            border-bottom: 1.5px dotted #64748b;
            margin-bottom: 4px;
          }

          .signature-label {
            font-size: 11px;
            font-weight: 700;
            color: #0c5975;
          }

          /* Footer Banner styled as wide graphic in image */
          .footer-wide-banner {
            background-color: #1e3b8b;
            color: #ffffff;
            border-radius: 6px;
            padding: 8px 12px;
            margin-top: 15px;
            display: grid;
            grid-template-columns: auto 1fr;
            align-items: center;
            gap: 15px;
          }

          .footer-logo-title {
            font-family: 'Cinzel', serif;
            font-weight: 800;
            font-size: 12px;
            letter-spacing: 0.5px;
          }

          .footer-logo-sub {
            font-size: 8px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-top: 1px;
          }

          .footer-badges {
            display: flex;
            justify-content: space-around;
            font-size: 8.5px;
            font-weight: 700;
          }

          .footer-badge-item {
            display: flex;
            align-items: center;
            gap: 5px;
          }

          .footer-badge-item svg {
            width: 12px;
            height: 12px;
            stroke: #ffffff;
            stroke-width: 2;
          }

          .footer-address {
            text-align: center;
            font-weight: 700;
            color: #0c5975;
            font-size: 9.5px;
            margin-top: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
          }

          .consulting-hours-container {
            margin-top: 8px;
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 18px;
          }

          .hours-capsule {
            border: 1px solid #1e3b8b;
            color: #1e3b8b;
            border-radius: 12px;
            padding: 2px 10px;
            font-size: 9px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .hours-item {
            font-size: 9px;
            font-weight: 700;
            color: #0c5975;
            display: flex;
            align-items: center;
            gap: 5px;
          }

          .hours-item svg {
            width: 12px;
            height: 12px;
            fill: #0c5975;
          }

          /* Remarks Section */
          .remarks-box {
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            padding: 10px 15px;
            background-color: #f8fafc;
            font-size: 11px;
            color: #334155;
            font-style: italic;
            min-height: 50px;
          }

          @media print {
            body { padding: 0; margin: 0; background-color: #ffffff; -webkit-print-color-adjust: exact; }
            .prescription-pad { border: none; padding: 0; max-width: 100%; }
          }
        </style>
      </head>
      <body onload="window.print()">
        <div class="prescription-pad">
          
          <!-- Header block mimicking picture -->
          <div class="header-grid">
            <div class="logo-cross-shield" style="background-color: #0c5975; border-radius: 15px; width: 70px; height: 70px; display: flex; items-center: center; justify-content: center; padding: 5px;">
              <svg viewBox="0 0 100 100" style="width: 52px; height: 52px;">
                <path d="M15,50 C30,22 70,22 85,50 C70,78 30,78 15,50 Z" fill="none" stroke="#ffffff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />
                <circle cx="50" cy="50" r="16" fill="none" stroke="#ffffff" stroke-width="7" />
                <circle cx="50" cy="50" r="8" fill="#ffffff" />
                <g fill="#ffffff">
                  <rect x="15" y="65" width="16" height="5" rx="1.5" />
                  <rect x="20.5" y="59.5" width="5" height="16" rx="1.5" />
                </g>
              </svg>
            </div>
            
            <div class="logo-text-block">
              <h1 class="logo-main-title">HIMABINDHU EYE TESTING & OPTICALS</h1>
              <div class="clear-tagline">Clear Vision <span>•</span> Better Life</div>
              <div class="clinic-ribbon">Computerised Eye Testing & Contact Lens Clinic</div>
            </div>

            <div class="contact-details">
              <div class="contact-phone-block">
                <svg viewBox="0 0 24 24" style="width:13px; height: 13px; fill: #1e3b8b;"><path d="M6.62 10.79a15.15 15.15 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.27c1.12.37 2.33.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.24.2 2.45.57 3.57a1 1 0 0 1-.27 1.02l-2.18 2.2z"/></svg>
                <div>90104 08092<br/>79892 89011</div>
              </div>
              <div style="margin-top: 8px; opacity: 0.8;">
                <svg viewBox="0 0 100 100" style="width: 58px; height: 58px;">
                  <ellipse cx="50" cy="50" rx="42" ry="22" fill="none" stroke="#1e3b8b" stroke-width="1.8" />
                  <circle cx="50" cy="50" r="14" fill="none" stroke="#0c5975" stroke-width="2" />
                  <circle cx="50" cy="50" r="7" fill="#0c5975" />
                  <circle cx="47" cy="47" r="2" fill="#ffffff" />
                </svg>
              </div>
            </div>
          </div>

          <!-- Doctor credentials section -->
          <div class="doctor-card">
            <div>
              <p class="doctor-name">M. Nagaraja Achari <span style="font-size:10px; font-weight:600; color:#475569;">(DOA, Ophthalmic Optom)</span></p>
              <p class="doctor-reg">Reg No. 73/001412</p>
            </div>
            <div class="rx-date-card">
              Date: <span style="border-bottom: 1.5px solid #cbd5e1; padding: 0 16px; display:inline-block; font-weight:800; color:#0f172a;">${rx.date}</span>
            </div>
          </div>

          <!-- Section heading -->
          <div class="divider-line">
            <span class="divider-title">Eye Prescription</span>
          </div>

          <!-- Patient Identity Details -->
          <div class="patient-meta-grid">
            <div class="patient-meta-item">
              <span class="patient-meta-label">Patient ID</span>
              <span class="patient-meta-value">${rx.patientId}</span>
            </div>
            <div class="patient-meta-item">
              <span class="patient-meta-label">Patient Name</span>
              <span class="patient-meta-value">${rx.patientName}</span>
            </div>
            <div class="patient-meta-item">
              <span class="patient-meta-label">Mobile Ref</span>
              <span class="patient-meta-value">${rx.mobile}</span>
            </div>
            <div class="patient-meta-item">
              <span class="patient-meta-label">Age / Gender</span>
              <span class="patient-meta-value">${rx.age} Yrs / ${rx.gender}</span>
            </div>
          </div>

          <!-- Visual Table conforming perfectly to paper layout -->
          <table class="rx-table">
            <thead>
              <tr>
                <th rowspan="2" class="bg-main-eye">EYE</th>
                <th colspan="4" class="bg-re">RE (OD) RIGHT EYE</th>
                <th colspan="4" class="bg-le">LE (OS) LEFT EYE</th>
              </tr>
              <tr class="bg-subheaders">
                <th>SPH</th>
                <th>CYL</th>
                <th>AXIS</th>
                <th>VISION</th>
                <th>SPH</th>
                <th>CYL</th>
                <th>AXIS</th>
                <th>VISION</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="background-color:#f1f5f9; font-weight:800;">DISTANCE VISION</td>
                <td>${rx.rightEyeData.distance.sph || '—'}</td>
                <td>${rx.rightEyeData.distance.cyl || '—'}</td>
                <td>${rx.rightEyeData.distance.axis || '—'}</td>
                <td style="color:#1e3b8b; font-weight:800;">${rx.rightEyeData.distance.vision || '—'}</td>
                <td>${rx.leftEyeData.distance.sph || '—'}</td>
                <td>${rx.leftEyeData.distance.cyl || '—'}</td>
                <td>${rx.leftEyeData.distance.axis || '—'}</td>
                <td style="color:#1e3b8b; font-weight:800;">${rx.leftEyeData.distance.vision || '—'}</td>
              </tr>
              <tr>
                <td style="background-color:#f1f5f9; font-weight:800;">NEAR VISION</td>
                <td>${rx.rightEyeData.near.sph || '—'}</td>
                <td>${rx.rightEyeData.near.cyl || '—'}</td>
                <td>${rx.rightEyeData.near.axis || '—'}</td>
                <td style="color:#1e3b8b; font-weight:800;">${rx.rightEyeData.near.vision || '—'}</td>
                <td>${rx.leftEyeData.near.sph || '—'}</td>
                <td>${rx.leftEyeData.near.cyl || '—'}</td>
                <td>${rx.leftEyeData.near.axis || '—'}</td>
                <td style="color:#1e3b8b; font-weight:800;">${rx.leftEyeData.near.vision || '—'}</td>
              </tr>
              <tr class="bg-add-row">
                <td style="background-color:#f1f5f9; font-weight:800;">ADD</td>
                <td>${rx.rightEyeData.add ? `+${rx.rightEyeData.add}` : '—'}</td>
                <td>—</td>
                <td>—</td>
                <td>—</td>
                <td>${rx.leftEyeData.add ? `+${rx.leftEyeData.add}` : '—'}</td>
                <td>—</td>
                <td>—</td>
                <td>—</td>
              </tr>
            </tbody>
          </table>

          <!-- Capsules Row -->
          <div class="section-capsules">
            <span class="capsule capsule-advice">Advice:</span>
            <span class="capsule capsule-pd">PD: <span style="font-weight:900; margin-left:5px;">${rx.pd ? `${rx.pd} mm` : '—'}</span></span>
          </div>

          <!-- Columns checklist mirroring pad precisely -->
          <div class="advice-container" style="display: flex; gap: 15px; justify-content: space-between; margin-bottom: 12px;">
            <!-- Column 1 -->
            <div style="flex: 1; display: flex; flex-direction: column; gap: 8px;">
              ${[
                { label: 'Blue Light', icon: `<path d="M12 2L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-3z" />` },
                { label: 'MR8', icon: `<circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" />` },
                { label: 'CR KT HC', icon: `<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 12 10 12-4.48 12-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />` },
                { label: 'CR KT HMC', icon: `<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 12 10 12-4.48 12-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />` },
                { label: 'Contact Lens', icon: `<circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />` }
              ].map(item => {
                const checked = checkAdviceMatches(item.label);
                return `
                  <div class="advice-card ${checked ? 'advice-card-checked' : ''}">
                    <div class="checkbox-box ${checked ? 'checkbox-box-checked' : ''}">
                      ${checked ? '✓' : ''}
                    </div>
                    <svg class="advice-icon-svg" viewBox="0 0 24 24">${item.icon}</svg>
                    <span class="advice-text">${item.label}</span>
                  </div>
                `;
              }).join('')}
            </div>

            <!-- Column 2 -->
            <div style="flex: 1; display: flex; flex-direction: column; gap: 8px;">
              ${[
                { label: 'Blue Cut', icon: `<path d="M21 5H3C1.9 5 1 5.9 1 7v1h22V7c0-1.1-.9-2-2-2zM21 16H3c-1.1 0-2-.9-2-2V9h22v5c0 1.1-.9 2-2 2z" />` },
                { label: 'dual corth', icon: `<ellipse cx="12" cy="12" rx="9" ry="5" />` },
                { label: 'CR HMC', icon: `<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 12 10 12-4.48 12-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />` },
                { label: 'CR KT PG HC', icon: `<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 12 10 12-4.48 12-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />` },
                { label: 'Progressive Lens', icon: `<path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" /><path d="M12 6a6 6 0 0 0-6 6h12a6 6 0 0 0-6-6z" />` }
              ].map(item => {
                const checked = checkAdviceMatches(item.label);
                return `
                  <div class="advice-card ${checked ? 'advice-card-checked' : ''}">
                    <div class="checkbox-box ${checked ? 'checkbox-box-checked' : ''}">
                      ${checked ? '✓' : ''}
                    </div>
                    <svg class="advice-icon-svg" viewBox="0 0 24 24">${item.icon}</svg>
                    <span class="advice-text">${item.label}</span>
                  </div>
                `;
              }).join('')}
            </div>

            <!-- Column 3 -->
            <div style="flex: 1; display: flex; flex-direction: column; gap: 8px; justify-content: space-between;">
              <div style="display: flex; flex-direction: column; gap: 8px;">
                ${[
                  { label: 'Marry blue', icon: `<ellipse cx="12" cy="12" rx="9" ry="5" />` },
                  { label: 'Blue light PG - progressive', icon: `<path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" /><path d="M12 6a6 6 0 0 0-6 6h12a6 6 0 0 0-6-6z" />` },
                  { label: 'Blue light KT - progressive', icon: `<path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" /><path d="M12 6a6 6 0 0 0-6 6h12a6 6 0 0 0-6-6z" />` },
                  { label: 'CR PG HC', icon: `<circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />` },
                  { label: 'CR HC', icon: `<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 12 10 12-4.48 12-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />` }
                ].map(item => {
                  const checked = checkAdviceMatches(item.label);
                  return `
                    <div class="advice-card ${checked ? 'advice-card-checked' : ''}">
                      <div class="checkbox-box ${checked ? 'checkbox-box-checked' : ''}">
                        ${checked ? '✓' : ''}
                      </div>
                      <svg class="advice-icon-svg" viewBox="0 0 24 24">${item.icon}</svg>
                      <span class="advice-text">${item.label}</span>
                    </div>
                  `;
                }).join('')}
              </div>

              <!-- Signature Spot positioned exactly in the bottom-right corner of Column 3 -->
              <div class="signature-box" style="margin-top: auto; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; padding-bottom: 5px;">
                <svg viewBox="0 0 24 24" style="width:20px; height:20px; fill:none; stroke:#0c5975; stroke-width:1.5; margin-bottom:4px;">
                  <path d="M12 19l7-7 3 3-7 7-3-3z" />
                  <path d="M18 13l-1.5-1.5L4 24v-3.5L16.5 8 18 9.5z" />
                  <path d="M20.5 4a2.5 2.5 0 0 0-3.5 0L15 6l3.5 3.5 2-2a2.5 2.5 0 0 0 0-3.5z" />
                </svg>
                <div class="signature-line-dotted" style="width: 80%; border-bottom: 1.5px dotted #64748b; margin-bottom: 4px;"></div>
                <span class="signature-label" style="font-size: 11px; font-weight: 700; color: #0c5975;">Signature</span>
              </div>
            </div>
          </div>

          <!-- Clinical Remarks Box -->
          <div style="font-weight:700; color:#1e3b8b; font-size:10px; text-transform:uppercase; margin-bottom:5px; letter-spacing:0.5px;">Diagnostic Remarks / Notes:</div>
          <div class="remarks-box">
            ${rx.notes || 'No significant pathology detected. Standard spectacles advised for corrective refraction.'}
          </div>

          <!-- Bottom Wide Banner mirroring logo text in physical pad -->
          <div class="footer-wide-banner">
            <div>
              <div class="footer-logo-title">Himabindhu</div>
              <div class="footer-logo-sub">Eye Testing & Opticals</div>
            </div>
            <div class="footer-badges">
              <div class="footer-badge-item">
                <svg viewBox="0 0 24 24" fill="none"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M6 21h12M12 17v4" /></svg>
                Advanced Computerised Eye Testing
              </div>
              <div class="footer-badge-item">
                <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" /><path d="M8 12h8M12 8v8" /></svg>
                Wide Range of Branded Lenses & Frames
              </div>
              <div class="footer-badge-item">
                <svg viewBox="0 0 24 24" fill="none"><path d="M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" /></svg>
                Quality Service Assured
              </div>
            </div>
          </div>

          <!-- Geographical footer credentials -->
          <div class="footer-address">
            <svg viewBox="0 0 24 24" style="width: 13px; height: 13px; fill:#0c5975;"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
            Beside Apollo Pharmacy, Rs Road, Gandhi Nagar, Dharmavaram - 515671. (A.P.)
          </div>

          <!-- Consulting Schedules -->
          <div class="consulting-hours-container">
            <span class="hours-capsule">Consulting Hours</span>
            <div class="hours-item">
              <svg viewBox="0 0 24 24"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 0 0-1.41 0a.996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 0 0-1.41 0a.996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.02.39 1.41 0c.39-.39.39-1.02 0-1.41l-1.06-1.06zm1.06-12.37l-1.06 1.06a.996.996 0 0 0 0 1.41c.39.39 1.03.39 1.41 0l1.06-1.06a.996.996 0 0 0 0-1.41a.996.996 0 0 0-1.41 0zm-12.37 12.37l-1.06 1.06a.996.996 0 0 0 0 1.41c.39.39 1.02.39 1.41 0l1.06-1.06a.996.996 0 0 0 0-1.41a.996.996 0 0 0-1.41 0z"/></svg>
              Morning: 9-00 a.m. TO 2-00 p.m.
            </div>
            <div class="hours-item">
              <svg viewBox="0 0 24 24"><path d="M12.3 22h-.1c-5.5 0-10-4.5-10-10C2.2 6.8 6.4 2.4 11.8 2c.5 0 .9.3 1 .8c.1.5-.1 1-.5 1.3C10.7 5.4 9.8 7.5 9.8 10c0 4.1 3.2 7.5 7.3 7.8c.8.1 1.6-.1 2.3-.5c.4-.2.9-.2 1.2.1c.4.3.6.7.5 1.2c-.8 3.5-3.9 6.4-7.6 6.4l-1.2-1z"/></svg>
              Evening: 4-00 p.m. TO 9-00 p.m.
            </div>
          </div>

        </div>
      </body>
    </html>
  `;

  // Create an invisible iframe
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

  // Print after short timeout to let resources render
  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (e) {
      console.error("Print failed:", e);
    }
    // Clean up
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  }, 500);
}

export function PrescriptionPDFViewerPanel({ prescription }: PrescriptionPDFProps) {
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
        </div>
      </div>

      {showIframe ? (
        <div className="w-full h-[650px] bg-slate-100 p-2">
          <PDFViewer width="100%" height="100%" className="border-0 rounded-xl shadow-inner">
            <PrescriptionPDFDocument prescription={prescription} />
          </PDFViewer>
        </div>
      ) : (
        /* Perfectly Mimicked HTML directly inside the App Preview - Looks identical to physical pad */
        <div className="w-full p-1 md:p-2 bg-slate-50 border-t border-gray-100 transition duration-150">
          <div className="border border-slate-300 rounded-2xl bg-white p-3 md:p-4.5 shadow-sm relative font-sans text-slate-900 border-double border-4 w-full max-w-3xl mx-auto">
            
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

            {/* Advice Columns matching pad perfectly */}
            <div className="flex flex-col md:flex-row gap-3 justify-between mb-3">
              {/* Column 1 */}
              <div className="flex-1 flex flex-col gap-3">
                {[
                  { label: 'Blue Light', icon: <svg className="w-4 h-4 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-3z"/></svg> },
                  { label: 'MR8', icon: <svg className="w-4 h-4 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/></svg> },
                  { label: 'CR KT HC', icon: <svg className="w-4 h-4 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="12" cy="12" rx="9" ry="5"/></svg> },
                  { label: 'CR KT HMC', icon: <svg className="w-4 h-4 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="12" cy="12" rx="9" ry="5"/></svg> },
                  { label: 'Contact Lens', icon: <svg className="w-4 h-4 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/></svg> }
                ].map((item, idx) => {
                  const checked = checkAdviceSelected(item.label);
                  return (
                    <div 
                      key={idx} 
                      className={`border rounded-xl p-3 flex items-center gap-3 transition-all ${
                        checked 
                          ? 'border-teal-700 bg-teal-50/70 text-teal-950 font-bold' 
                          : 'border-slate-150 bg-white opacity-55 hover:bg-slate-50/40'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center font-mono text-xs ${
                        checked ? 'bg-teal-700 border-teal-700 text-white' : 'border-slate-300 bg-slate-50'
                      }`}>
                        {checked ? "✓" : ""}
                      </div>
                      <div className="w-6 h-6 rounded-lg bg-white border border-slate-150 flex items-center justify-center shrink-0 shadow-3xs">
                        {item.icon}
                      </div>
                      <span className="text-[11px] truncate tracking-wide">{item.label}</span>
                    </div>
                  );
                })}
              </div>

              {/* Column 2 */}
              <div className="flex-1 flex flex-col gap-3">
                {[
                  { label: 'Blue Cut', icon: <svg className="w-4 h-4 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="6" cy="12" r="3"/><circle cx="18" cy="12" r="3"/><path d="M9 12h6M6 9h12"/></svg> },
                  { label: 'dual corth', icon: <svg className="w-4 h-4 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="12" cy="12" rx="9" ry="5"/></svg> },
                  { label: 'CR HMC', icon: <svg className="w-4 h-4 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="12" cy="12" rx="9" ry="5"/></svg> },
                  { label: 'CR KT PG HC', icon: <svg className="w-4 h-4 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="12" cy="12" rx="9" ry="5"/></svg> },
                  { label: 'Progressive Lens', icon: <svg className="w-4 h-4 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><line x1="3.6" y1="12" x2="20.4" y2="12"/></svg> }
                ].map((item, idx) => {
                  const checked = checkAdviceSelected(item.label);
                  return (
                    <div 
                      key={idx} 
                      className={`border rounded-xl p-3 flex items-center gap-3 transition-all ${
                        checked 
                          ? 'border-teal-700 bg-teal-50/70 text-teal-950 font-bold' 
                          : 'border-slate-150 bg-white opacity-55 hover:bg-slate-50/40'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center font-mono text-xs ${
                        checked ? 'bg-teal-700 border-teal-700 text-white' : 'border-slate-300 bg-slate-50'
                      }`}>
                        {checked ? "✓" : ""}
                      </div>
                      <div className="w-5 h-5 rounded-md bg-white border border-slate-150 flex items-center justify-center shrink-0 shadow-3xs">
                        {item.icon}
                      </div>
                      <span className="text-[10.5px] truncate tracking-wide">{item.label}</span>
                    </div>
                  );
                })}
              </div>

              {/* Column 3 */}
              <div className="flex-1 flex flex-col gap-2 justify-between">
                <div className="flex flex-col gap-2">
                  {[
                    { label: 'Marry blue', icon: <svg className="w-3.5 h-3.5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="12" cy="12" rx="9" ry="5"/></svg> },
                    { label: 'Blue light PG - progressive', icon: <svg className="w-3.5 h-3.5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><line x1="3.6" y1="12" x2="20.4" y2="12"/></svg> },
                    { label: 'Blue light KT - progressive', icon: <svg className="w-3.5 h-3.5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><line x1="3.6" y1="12" x2="20.4" y2="12"/></svg> },
                    { label: 'CR PG HC', icon: <svg className="w-3.5 h-3.5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg> },
                    { label: 'CR HC', icon: <svg className="w-3.5 h-3.5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="12" cy="12" rx="9" ry="5"/></svg> }
                  ].map((item, idx) => {
                    const checked = checkAdviceSelected(item.label);
                    return (
                      <div 
                        key={idx} 
                        className={`border rounded-xl p-2 flex items-center gap-2.5 transition-all ${
                          checked 
                            ? 'border-teal-700 bg-teal-50/70 text-teal-950 font-bold' 
                            : 'border-slate-150 bg-white opacity-55 hover:bg-slate-50/40'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center font-mono text-xs ${
                          checked ? 'bg-teal-700 border-teal-700 text-white' : 'border-slate-300 bg-slate-50'
                        }`}>
                          {checked ? "✓" : ""}
                        </div>
                        <div className="w-5 h-5 rounded-md bg-white border border-slate-150 flex items-center justify-center shrink-0 shadow-3xs">
                          {item.icon}
                        </div>
                        <span className="text-[10.5px] truncate tracking-wide">{item.label}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Dynamic Signature Area inside Column 3 */}
                <div className="border border-dashed border-slate-250 bg-slate-50/50 rounded-xl p-2 flex flex-col justify-end items-center min-h-[50px] shadow-3xs mt-auto">
                  <div className="w-20 border-b border-dashed border-slate-400 h-5 mb-1 flex items-end justify-center select-none font-serif italic text-[10px] text-slate-350">
                    Sign Verified
                  </div>
                  <span className="text-[9.5px] font-extrabold text-teal-850">Signature</span>
                </div>
              </div>
            </div>

            {/* Diagnostic Remarks / Notes section */}
            <div className="mb-3">
              <span className="text-[9.5px] uppercase font-black tracking-widest text-slate-900 block mb-1">
                Clinical Remarks & Dynamic Notes:
              </span>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 font-sans italic min-h-[45px] leading-relaxed shadow-3xs">
                {prescription.notes || "Regular refractive diagnostics check up. Frame advice registered."}
              </div>
            </div>

            {/* Footer widescreen banner */}
            <div className="bg-[#1e3b8a] text-white rounded-lg p-2.5 mt-4 grid grid-cols-[auto_1fr] items-center gap-3.5 text-[10px] md:text-xs">
              <div>
                <div className="font-serif font-black text-xs tracking-wider leading-none">Himabindhu</div>
                <div className="text-[7.5px] uppercase font-bold tracking-widest mt-0.5 opacity-90">Eye Testing & Opticals</div>
              </div>
              <div className="flex justify-around text-[8px] font-bold opacity-95">
                <div className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 stroke-white stroke-2" viewBox="0 0 24 24" fill="none"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M6 21h12M12 17v4" /></svg>
                  <span>Advanced Computerised Eye Testing</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 stroke-white stroke-2" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" /><path d="M8 12h8M12 8v8" /></svg>
                  <span>Wide Range of Branded Lenses & Frames</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 stroke-white stroke-2" viewBox="0 0 24 24" fill="none"><path d="M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" /></svg>
                  <span>Quality Service Assured</span>
                </div>
              </div>
            </div>

            {/* Bottom address details */}
            <div className="text-center font-bold text-[#0c5975] text-[8.5px] mt-2.5 flex items-center justify-center gap-1.5">
              <svg viewBox="0 0 24 24" className="w-3 h-3 fill-[#0c5975]"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
              Beside Apollo Pharmacy, Rs Road, Gandhi Nagar, Dharmavaram - 515671. (A.P.)
            </div>

            {/* Consulting Schedules */}
            <div className="mt-2.5 flex justify-center items-center gap-4 text-[8.5px] text-[#0c5975] font-bold">
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
      )}
    </div>
  );
}
