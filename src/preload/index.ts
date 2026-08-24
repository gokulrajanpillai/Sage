import { contextBridge } from 'electron'

contextBridge.exposeInMainWorld('sage', {
  versions: process.versions
})
