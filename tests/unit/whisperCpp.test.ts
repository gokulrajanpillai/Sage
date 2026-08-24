import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { WhisperCppProvider } from '../../src/main/stt/WhisperCppProvider'

const modelPath = join(process.cwd(), 'models', 'ggml-base.en.bin')
const modelAvailable = existsSync(modelPath)
const fixturePath = join(process.cwd(), 'tests', 'fixtures', 'sample-3s.wav')

describe('WhisperCppProvider', () => {
  it.skipIf(!modelAvailable)(
    'transcribes the 3-second WAV fixture with the real whisper.cpp binary',
    async () => {
      const provider = new WhisperCppProvider()
      const result = await provider.transcribe(fixturePath)
      expect(result.text.length).toBeGreaterThan(0)
      expect(result.latencyMs).toBeGreaterThanOrEqual(0)
    }
  )

  it('reports a clear skip reason when the ggml model file is absent', () => {
    if (modelAvailable) {
      expect(modelAvailable).toBe(true)
      return
    }

    console.log(
      `SKIP: whisper.cpp ggml model not found at ${modelPath} — download a model into models/ ` +
        'and rerun to exercise the real WhisperCppProvider (see README).'
    )
    expect(modelAvailable).toBe(false)
  })
})
