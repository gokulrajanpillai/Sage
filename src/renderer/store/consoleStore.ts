import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createLlmProvider } from '../lib/llm/createLlmProvider'
import type { ChatMessage } from '../lib/llm/types'

interface ConsoleState {
  models: string[]
  selectedModel: string
  messages: ChatMessage[]
  isStreaming: boolean
  error: string | null
  tokensPerSecond: number | null
  timeToFirstTokenMs: number | null
  loadModels: () => Promise<void>
  selectModel: (model: string) => void
  sendMessage: (content: string) => void
  stopStreaming: () => void
}

const provider = createLlmProvider()
let activeStream: { stop: () => void } | null = null

export const useConsoleStore = create<ConsoleState>()(
  persist(
    (set, get) => ({
      models: [],
      selectedModel: '',
      messages: [],
      isStreaming: false,
      error: null,
      tokensPerSecond: null,
      timeToFirstTokenMs: null,

      loadModels: async () => {
        try {
          const models = await provider.listModels()
          set((state) => ({
            models,
            selectedModel: state.selectedModel || models[0] || '',
            error: null
          }))
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Failed to load models' })
        }
      },

      selectModel: (model) => set({ selectedModel: model }),

      sendMessage: (content) => {
        const userMessage: ChatMessage = { role: 'user', content }
        const assistantMessage: ChatMessage = { role: 'assistant', content: '' }

        set((state) => ({
          messages: [...state.messages, userMessage, assistantMessage],
          isStreaming: true,
          error: null
        }))

        const { selectedModel, messages } = get()
        const history = messages.slice(0, -1)

        const startedAt = performance.now()
        let firstTokenAt: number | null = null
        let tokenCount = 0

        activeStream = provider.streamChat(
          history,
          selectedModel,
          (token) => {
            tokenCount += 1
            if (firstTokenAt === null) {
              firstTokenAt = performance.now()
              set({ timeToFirstTokenMs: Math.round(firstTokenAt - startedAt) })
            }
            set((state) => {
              const next = [...state.messages]
              const last = next[next.length - 1]
              next[next.length - 1] = { ...last, content: last.content + token }
              return { messages: next }
            })
          },
          () => {
            const elapsedSeconds = (performance.now() - (firstTokenAt ?? startedAt)) / 1000
            set({
              isStreaming: false,
              tokensPerSecond:
                elapsedSeconds > 0 ? Math.round((tokenCount / elapsedSeconds) * 10) / 10 : tokenCount
            })
            activeStream = null
          },
          (error) => {
            set({ isStreaming: false, error: error.message })
            activeStream = null
          }
        )
      },

      stopStreaming: () => {
        activeStream?.stop()
      }
    }),
    {
      name: 'sage-console-state',
      partialize: (state) => ({ selectedModel: state.selectedModel, messages: state.messages })
    }
  )
)
