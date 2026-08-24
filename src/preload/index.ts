import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('sage', {
  versions: process.versions,
  providers: process.env.SAGE_PROVIDERS ?? '',
  transcribe: (wavBytes: Uint8Array) => ipcRenderer.invoke('stt:transcribe', wavBytes),
  vault: {
    list: () => ipcRenderer.invoke('vault:list'),
    extract: (turnText: string) => ipcRenderer.invoke('vault:extract', turnText),
    onChanged: (callback: () => void) => {
      const listener = () => callback()
      ipcRenderer.on('vault:changed', listener)
      return () => ipcRenderer.removeListener('vault:changed', listener)
    }
  }
})
