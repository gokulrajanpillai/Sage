import { create } from 'zustand'
import type { AudioCapture } from '../lib/audio/types'
import { createAudioCapture } from '../lib/audio/createAudioCapture'

interface SttState {
  isRecording: boolean
  levels: number[]
  error: string | null
  transcriptionLatencyMs: number | null
  startRecording: () => void
  stopRecording: () => Promise<string | null>
}

let capture: AudioCapture | null = null

export const useSttStore = create<SttState>()((set) => ({
  isRecording: false,
  levels: [],
  error: null,
  transcriptionLatencyMs: null,

  startRecording: () => {
    capture = createAudioCapture()
    set({ isRecording: true, levels: [], error: null })

    void Promise.resolve(
      capture.start((level) => {
        set((state) => ({ levels: [...state.levels.slice(-63), level] }))
      })
    ).catch((err: unknown) => {
      set({
        isRecording: false,
        error: err instanceof Error ? err.message : 'Microphone access failed'
      })
    })
  },

  stopRecording: async () => {
    const current = capture
    capture = null
    if (!current) return null

    set({ isRecording: false })

    try {
      const wavBytes = await current.stop()
      const result = await window.sage.transcribe(wavBytes)
      set({ transcriptionLatencyMs: result.latencyMs })
      return result.text
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Transcription failed' })
      return null
    }
  }
}))
