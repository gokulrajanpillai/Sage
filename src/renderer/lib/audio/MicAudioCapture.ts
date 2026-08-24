import type { AudioCapture } from './types'

const SAMPLE_RATE = 16000
const BUFFER_SIZE = 4096

export class MicAudioCapture implements AudioCapture {
  private stream: MediaStream | null = null
  private audioContext: AudioContext | null = null
  private processor: ScriptProcessorNode | null = null
  private samples: Float32Array[] = []

  async start(onLevel: (level: number) => void): Promise<void> {
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1 } })
    this.audioContext = new AudioContext({ sampleRate: SAMPLE_RATE })
    const source = this.audioContext.createMediaStreamSource(this.stream)
    this.processor = this.audioContext.createScriptProcessor(BUFFER_SIZE, 1, 1)

    this.processor.onaudioprocess = (event) => {
      const input = event.inputBuffer.getChannelData(0)
      this.samples.push(new Float32Array(input))

      let sumSquares = 0
      for (const sample of input) sumSquares += sample * sample
      onLevel(Math.min(1, Math.sqrt(sumSquares / input.length) * 4))
    }

    source.connect(this.processor)
    this.processor.connect(this.audioContext.destination)
  }

  async stop(): Promise<Uint8Array> {
    this.processor?.disconnect()
    await this.audioContext?.close()
    this.stream?.getTracks().forEach((track) => track.stop())

    const merged = mergeFloat32(this.samples)
    this.samples = []
    return encodeWav(merged, SAMPLE_RATE)
  }
}

function mergeFloat32(chunks: Float32Array[]): Float32Array {
  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
  const result = new Float32Array(total)
  let offset = 0
  for (const chunk of chunks) {
    result.set(chunk, offset)
    offset += chunk.length
  }
  return result
}

function encodeWav(samples: Float32Array, sampleRate: number): Uint8Array {
  const bytesPerSample = 2
  const dataSize = samples.length * bytesPerSample
  const buffer = new ArrayBuffer(44 + dataSize)
  const view = new DataView(buffer)

  writeAscii(view, 0, 'RIFF')
  view.setUint32(4, 36 + dataSize, true)
  writeAscii(view, 8, 'WAVE')
  writeAscii(view, 12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * bytesPerSample, true)
  view.setUint16(32, bytesPerSample, true)
  view.setUint16(34, 16, true)
  writeAscii(view, 36, 'data')
  view.setUint32(40, dataSize, true)

  let offset = 44
  for (const sample of samples) {
    const clamped = Math.max(-1, Math.min(1, sample))
    view.setInt16(offset, clamped * 0x7fff, true)
    offset += bytesPerSample
  }

  return new Uint8Array(buffer)
}

function writeAscii(view: DataView, offset: number, text: string): void {
  for (let i = 0; i < text.length; i += 1) view.setUint8(offset + i, text.charCodeAt(i))
}
