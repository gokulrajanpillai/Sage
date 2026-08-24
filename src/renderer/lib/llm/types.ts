export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface StreamHandle {
  stop: () => void
}

export interface LlmProvider {
  listModels(): Promise<string[]>
  streamChat(
    history: ChatMessage[],
    model: string,
    onToken: (token: string) => void,
    onDone: () => void,
    onError: (error: Error) => void
  ): StreamHandle
}
