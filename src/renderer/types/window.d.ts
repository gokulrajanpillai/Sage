export interface SageBridge {
  versions: NodeJS.ProcessVersions
  providers: string
}

declare global {
  interface Window {
    sage: SageBridge
  }
}

export {}
