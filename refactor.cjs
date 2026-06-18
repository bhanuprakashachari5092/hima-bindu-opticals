const fs = require('fs');
const file = 'src/components/PrescriptionPDF.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(`import React from 'react';`, `import React from 'react';\nimport { renderToString } from 'react-dom/server';`);

const startMarker = `        /* Perfectly Mimicked HTML directly inside the App Preview - Looks identical to physical pad */`;
const endMarker = `      )}
    </div>
  );
}`;

let parts = content.split(startMarker);
let beforePreview = parts[0];
let previewAndAfter = parts[1];

let previewParts = previewAndAfter.split(endMarker);
let previewJSX = previewParts[0];

const adviceLogic = `  // Map representation of advisory options for custom dynamic on-screen UI preview rendering
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
  };`;

const newComponent = `
export function PrescriptionPrintTemplate({ prescription }: { prescription: any }) {
${adviceLogic}

  return (
    <>
      ${startMarker}
${previewJSX}
    </>
  );
}
`;

const newPanelBody = `
      ) : (
        <PrescriptionPrintTemplate prescription={prescription} />
      )}
    </div>
  );
}`;

content = beforePreview + newPanelBody + '\n' + newComponent;

const printFuncStart = `export function printPrescriptionHTML(rx: Prescription) {`;
const printFuncEndStr = `    // Clean up
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  }, 500);
}`;

const printParts = content.split(printFuncStart);
const printBefore = printParts[0];
const printAfterEnd = printParts[1].split(printFuncEndStr)[1];

const newPrintFunc = `
export function printPrescriptionHTML(rx: Prescription) {
  const htmlContent = renderToString(<PrescriptionPrintTemplate prescription={rx} />);
  
  const styleNodes = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
    .map(el => el.outerHTML)
    .join('\\n');

  const printContent = \`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Prescription \${rx.prescriptionId || 'Slip'}</title>
        \${styleNodes}
        <style>
          @media print {
            body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; background-color: white !important; margin: 0; padding: 0; }
            @page { size: auto; margin: 5mm; }
          }
          body { background: white; padding: 20px; font-family: ui-sans-serif, system-ui, sans-serif; }
        </style>
      </head>
      <body onload="setTimeout(function(){ window.print(); }, 1500)">
        \${htmlContent}
      </body>
    </html>
  \`;

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
`;

content = printBefore + newPrintFunc + printAfterEnd;

fs.writeFileSync(file, content);
console.log('Successfully refactored PrescriptionPDF.tsx');
