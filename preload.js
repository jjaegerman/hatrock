const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  onUpdateRFID: (callback) => ipcRenderer.on('update-rfid', (_event, value) => callback(value))
})
