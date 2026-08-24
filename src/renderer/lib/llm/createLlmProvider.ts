import { MockLlmProvider } from './MockLlmProvider'
import { OllamaProvider } from './OllamaProvider'
import type { LlmProvider } from './types'

export function createLlmProvider(): LlmProvider {
  const providers = window.sage?.providers ?? ''
  if (providers.includes('mock')) return new MockLlmProvider()
  return new OllamaProvider()
}
