import { spawn } from 'node:child_process'
import { existsSync, readFileSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'
import type { SttProvider, TranscriptResult } from './types'

export interface WhisperCppOptions {
  binaryPath?: string
  modelPath?: string
}

export class WhisperCppProvider implements SttProvider {
  private readonly binaryPath: string
  private readonly modelPath: string

  constructor(options: WhisperCppOptions = {}) {
    this.binaryPath = options.binaryPath ?? process.env.SAGE_WHISPER_BIN ?? 'whisper-cli'
    this.modelPath = options.modelPath ?? join(process.cwd(), 'models', 'ggml-base.en.bin')
  }

  isModelAvailable(): boolean {
    return existsSync(this.modelPath)
  }

  async transcribe(wavPath: string): Promise<TranscriptResult> {
    if (!this.isModelAvailable()) {
      throw new Error(
        `whisper.cpp ggml model not found at ${this.modelPath}. Download a model into models/ (see README) to enable real transcription.`
      )
    }

    const start = Date.now()
    const outputBase = wavPath.replace(/\.wav$/i, '')

    await new Promise<void>((resolve, reject) => {
      const proc = spawn(this.binaryPath, ['-m', this.modelPath, '-f', wavPath, '-otxt', '-of', outputBase, '-nt'])

      let stderr = ''
      proc.stderr.on('data', (chunk: Buffer) => {
        stderr += chunk.toString()
      })
      proc.on('error', reject)
      proc.on('close', (code) => {
        if (code === 0) resolve()
        else reject(new Error(`whisper.cpp exited with code ${code}: ${stderr}`))
      })
    })

    const outputPath = `${outputBase}.txt`
    const text = readFileSync(outputPath, 'utf8').trim()
    unlinkSync(outputPath)

    return { text, latencyMs: Date.now() - start }
  }
}
