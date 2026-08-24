import { contextBridge } from 'electron'

contextBridge.exposeInMainWorld('sage', {
  versions: process.versions,
  providers: process.env.SAGE_PROVIDERS ?? ''
})
