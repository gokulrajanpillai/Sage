export interface SageTranscriptResult {
  text: string
  latencyMs: number
}

export interface SageWikilinkResolution {
  resolved: string[]
  unresolved: string[]
}

export interface SageVaultNote {
  id: string
  title: string
  tags: string[]
  filePath: string
  body: string
  wikilinks: SageWikilinkResolution
}

export interface SageVaultListResult {
  notes: SageVaultNote[]
  backlinks: Record<string, string[]>
}

export interface SageExtractedNote {
  title: string
  filePath: string
  tags: string[]
  created: boolean
}

export interface SageBridge {
  versions: NodeJS.ProcessVersions
  providers: string
  transcribe: (wavBytes: Uint8Array) => Promise<SageTranscriptResult>
  vault: {
    list: () => Promise<SageVaultListResult>
    extract: (turnText: string) => Promise<SageExtractedNote[]>
    onChanged: (callback: () => void) => () => void
  }
}

declare global {
  interface Window {
    sage: SageBridge
  }
}

export {}
