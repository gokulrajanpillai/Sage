export interface SageTranscriptResult {
  text: string
  latencyMs: number
}

export interface SageBridge {
  versions: NodeJS.ProcessVersions
  providers: string
  transcribe: (wavBytes: Uint8Array) => Promise<SageTranscriptResult>
}

declare global {
  interface Window {
    sage: SageBridge
  }
}

export {}
