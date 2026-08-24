import { MockSttProvider } from './MockSttProvider'
import { WhisperCppProvider } from './WhisperCppProvider'
import type { SttProvider } from './types'

export function createSttProvider(): SttProvider {
  const providers = process.env.SAGE_PROVIDERS ?? ''
  if (providers.includes('mock')) return new MockSttProvider()
  return new WhisperCppProvider()
}
