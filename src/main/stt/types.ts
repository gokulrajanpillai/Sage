export interface TranscriptResult {
  text: string
  latencyMs: number
}

export interface SttProvider {
  transcribe(wavPath: string): Promise<TranscriptResult>
}
