export interface AudioCapture {
  start(onLevel: (level: number) => void): void | Promise<void>
  stop(): Promise<Uint8Array>
}
