import { MicAudioCapture } from './MicAudioCapture'
import { MockAudioCapture } from './MockAudioCapture'
import type { AudioCapture } from './types'

export function createAudioCapture(): AudioCapture {
  const providers = window.sage?.providers ?? ''
  if (providers.includes('mock')) return new MockAudioCapture()
  return new MicAudioCapture()
}
