import type { ChatMessage, LlmProvider, StreamHandle } from './types'

const OLLAMA_BASE_URL = 'http://localhost:11434'

interface OllamaTagsResponse {
  models?: { name: string }[]
}

interface OllamaChatChunk {
  message?: { content?: string }
  done?: boolean
}

export class OllamaProvider implements LlmProvider {
  async listModels(): Promise<string[]> {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`)
    if (!res.ok) throw new Error(`Ollama /api/tags responded ${res.status}`)
    const data = (await res.json()) as OllamaTagsResponse
    return (data.models ?? []).map((m) => m.name)
  }

  streamChat(
    history: ChatMessage[],
    model: string,
    onToken: (token: string) => void,
    onDone: () => void,
    onError: (error: Error) => void
  ): StreamHandle {
    const controller = new AbortController()

    void (async () => {
      try {
        const res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model, messages: history, stream: true }),
          signal: controller.signal
        })

        if (!res.ok || !res.body) {
          throw new Error(`Ollama /api/chat responded ${res.status}`)
        }

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        for (;;) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })

          let newlineIndex = buffer.indexOf('\n')
          while (newlineIndex !== -1) {
            const line = buffer.slice(0, newlineIndex).trim()
            buffer = buffer.slice(newlineIndex + 1)
            if (line) {
              const parsed = JSON.parse(line) as OllamaChatChunk
              if (parsed.message?.content) onToken(parsed.message.content)
              if (parsed.done) {
                onDone()
                return
              }
            }
            newlineIndex = buffer.indexOf('\n')
          }
        }

        onDone()
      } catch (error) {
        if (controller.signal.aborted) {
          onDone()
          return
        }
        onError(error instanceof Error ? error : new Error(String(error)))
      }
    })()

    return {
      stop: () => controller.abort()
    }
  }
}
