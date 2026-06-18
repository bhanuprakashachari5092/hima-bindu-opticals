const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// Force native system print dialog by disabling Chromium print preview
app.commandLine.appendSwitch('disable-print-preview');


function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // Check if we are in development mode
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

  if (isDev) {
    win.loadURL('http://localhost:3000');
    // Open the DevTools.
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// ── WhatsApp Web Automation IPC handlers ──────────────────────────────────────
ipcMain.on('send-whatsapp-automated', (event, { phone, text }) => {
  const url = `https://web.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(text)}`;
  
  const waWin = new BrowserWindow({
    width: 900,
    height: 750,
    title: "Himabindhu Opticals - WhatsApp Automation",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      partition: "persist:whatsapp" // Persist session cookies so QR scan is only needed once
    }
  });

  waWin.loadURL(url, {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });

  waWin.webContents.on('did-finish-load', () => {
    const currentUrl = waWin.webContents.getURL();
    
    // If user scans QR code and lands on the dashboard, redirect back to send url
    if (currentUrl === 'https://web.whatsapp.com/' || currentUrl === 'https://web.whatsapp.com/#') {
      waWin.loadURL(url, {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      });
      return;
    }

    waWin.webContents.executeJavaScript(`
      (function() {
        const checkBtn = setInterval(() => {
          const sendBtn = document.querySelector('button span[data-icon="send"]') || 
                          document.querySelector('button[aria-label="Send"]') ||
                          document.querySelector('span[data-icon="send"]')?.closest('button');
          
          if (sendBtn) {
            sendBtn.click();
            clearInterval(checkBtn);
            setTimeout(() => {
              const { ipcRenderer } = require('electron');
              ipcRenderer.send('whatsapp-sent-success');
            }, 3000); // 3 seconds delay to ensure message delivery before closing
          }
        }, 500);
      })();
    `).catch(err => console.error("Error executing JS:", err));
  });
});

ipcMain.on('whatsapp-sent-success', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) {
    win.close();
  }
});
// ────────────────────────────────────────────────────────────────────────────
