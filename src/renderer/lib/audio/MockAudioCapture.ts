import type { AudioCapture } from './types'

const LEVEL_INTERVAL_MS = 30

export class MockAudioCapture implements AudioCapture {
  private timer: ReturnType<typeof setInterval> | null = null
  private tick = 0

  start(onLevel: (level: number) => void): void {
    this.tick = 0
    this.timer = setInterval(() => {
      this.tick += 1
      onLevel((Math.sin(this.tick / 3) + 1) / 2)
    }, LEVEL_INTERVAL_MS)
  }

  async stop(): Promise<Uint8Array> {
    if (this.timer) clearInterval(this.timer)
    this.timer = null
    return new Uint8Array(0)
  }
}
