import { useEffect } from 'react'
import { useConsoleStore } from '../store/consoleStore'
import { useSttStore } from '../store/sttStore'
import { useVaultStore } from '../store/vaultStore'
import { colors, fonts } from '../theme/tokens'

function formatMetric(value: number | null, suffix: string): string {
  return value === null ? '—' : `${value}${suffix}`
}

export function TelemetryStrip() {
  const tokensPerSecond = useConsoleStore((s) => s.tokensPerSecond)
  const timeToFirstTokenMs = useConsoleStore((s) => s.timeToFirstTokenMs)
  const selectedModel = useConsoleStore((s) => s.selectedModel)
  const transcriptionLatencyMs = useSttStore((s) => s.transcriptionLatencyMs)
  const notes = useVaultStore((s) => s.notes)
  const refreshVault = useVaultStore((s) => s.refresh)

  useEffect(() => {
    void refreshVault()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const items = [
    { label: 'tok/s', value: formatMetric(tokensPerSecond, ''), testId: 'telemetry-tokens-per-second' },
    { label: 'TTFT', value: formatMetric(timeToFirstTokenMs, 'ms'), testId: 'telemetry-ttft' },
    { label: 'STT', value: formatMetric(transcriptionLatencyMs, 'ms'), testId: 'telemetry-stt-latency' },
    { label: 'notes', value: String(notes.length), testId: 'telemetry-note-count' },
    { label: 'model', value: selectedModel || '—', testId: 'telemetry-model' }
  ]

  return (
    <div
      data-testid="telemetry-strip"
      className="flex flex-wrap gap-4 border-t px-2 py-2 text-xs"
      style={{ borderColor: colors.border, color: colors.textMuted, fontFamily: fonts.numeric }}
    >
      {items.map((item) => (
        <span key={item.testId} data-testid={item.testId}>
          {item.label}: <span style={{ color: colors.accentCyan }}>{item.value}</span>
        </span>
      ))}
    </div>
  )
}
