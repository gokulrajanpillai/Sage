import { create } from 'zustand'
import type { SageVaultNote } from '../types/window'

interface VaultState {
  notes: SageVaultNote[]
  backlinks: Record<string, string[]>
  selectedNoteId: string | null
  tagFilter: string | null
  refresh: () => Promise<void>
  selectNote: (id: string) => void
  setTagFilter: (tag: string | null) => void
}

export const useVaultStore = create<VaultState>()((set) => ({
  notes: [],
  backlinks: {},
  selectedNoteId: null,
  tagFilter: null,

  refresh: async () => {
    const { notes, backlinks } = await window.sage.vault.list()
    set((state) => ({
      notes,
      backlinks,
      selectedNoteId:
        state.selectedNoteId && notes.some((note) => note.id === state.selectedNoteId)
          ? state.selectedNoteId
          : (notes[0]?.id ?? null)
    }))
  },

  selectNote: (id) => set({ selectedNoteId: id }),
  setTagFilter: (tag) => set({ tagFilter: tag })
}))
