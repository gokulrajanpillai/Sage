import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ViewName = 'console' | 'vault' | 'cosmos'

interface AppState {
  activeView: ViewName
  setActiveView: (view: ViewName) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      activeView: 'console',
      setActiveView: (view) => set({ activeView: view })
    }),
    { name: 'sage-app-state' }
  )
)
