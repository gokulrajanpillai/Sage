import type { SttProvider, TranscriptResult } from './types'

const MOCK_LATENCY_MS = 50

export class MockSttProvider implements SttProvider {
  async transcribe(_wavPath: string): Promise<TranscriptResult> {
    const start = Date.now()
    await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS))
    return { text: 'This is a mock transcript.', latencyMs: Date.now() - start }
  }
}
