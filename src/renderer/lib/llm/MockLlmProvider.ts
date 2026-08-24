import type { ChatMessage, LlmProvider, StreamHandle } from './types'

const MOCK_MODELS = ['sage-mock-small', 'sage-mock-large', 'sage-mock-offline']
const MOCK_REPLY =
  'This is a simulated streaming response from the mock provider, produced one word at a time for testing.'
const TOKEN_INTERVAL_MS = 40
const OFFLINE_DELAY_MS = 30

export class MockLlmProvider implements LlmProvider {
  async listModels(): Promise<string[]> {
    return MOCK_MODELS
  }

  streamChat(
    _history: ChatMessage[],
    model: string,
    onToken: (token: string) => void,
    onDone: () => void,
    onError: (error: Error) => void
  ): StreamHandle {
    if (model === 'sage-mock-offline') {
      const timer = setTimeout(() => {
        onError(new Error('Mock provider unreachable (simulated offline)'))
      }, OFFLINE_DELAY_MS)
      return { stop: () => clearTimeout(timer) }
    }

    const words = MOCK_REPLY.split(' ')
    let index = 0
    let stopped = false

    const timer = setInterval(() => {
      if (stopped) return
      if (index >= words.length) {
        clearInterval(timer)
        onDone()
        return
      }
      onToken((index === 0 ? '' : ' ') + words[index])
      index += 1
    }, TOKEN_INTERVAL_MS)

    return {
      stop: () => {
        stopped = true
        clearInterval(timer)
        onDone()
      }
    }
  }
}
