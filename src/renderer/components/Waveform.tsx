import { colors } from '../theme/tokens'

interface WaveformProps {
  levels: number[]
}

const BAR_COUNT = 32
const MIN_LEVEL = 0.05

export function Waveform({ levels }: WaveformProps) {
  const recent = levels.slice(-BAR_COUNT)
  const bars = Array.from({ length: BAR_COUNT }, (_, i) => recent[i] ?? 0)

  return (
    <div data-testid="waveform" aria-hidden="true" className="flex h-10 items-end gap-0.5">
      {bars.map((level, i) => (
        <div
          key={i}
          className="w-1 rounded-sm"
          style={{
            height: `${Math.max(level, MIN_LEVEL) * 100}%`,
            backgroundColor: colors.accentCyan
          }}
        />
      ))}
    </div>
  )
}
