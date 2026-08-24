import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('sage', {
  versions: process.versions,
  providers: process.env.SAGE_PROVIDERS ?? '',
  transcribe: (wavBytes: Uint8Array) => ipcRenderer.invoke('stt:transcribe', wavBytes)
})
