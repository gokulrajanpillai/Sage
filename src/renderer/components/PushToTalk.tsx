import { useConsoleStore } from '../store/consoleStore'
import { useSttStore } from '../store/sttStore'
import { borders, colors } from '../theme/tokens'
import { Waveform } from './Waveform'

export function PushToTalk() {
  const isRecording = useSttStore((s) => s.isRecording)
  const levels = useSttStore((s) => s.levels)
  const error = useSttStore((s) => s.error)
  const startRecording = useSttStore((s) => s.startRecording)
  const stopRecording = useSttStore((s) => s.stopRecording)
  const sendMessage = useConsoleStore((s) => s.sendMessage)

  const handleStop = async () => {
    const transcript = await stopRecording()
    if (transcript) sendMessage(transcript)
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        data-testid="push-to-talk"
        aria-pressed={isRecording}
        onMouseDown={startRecording}
        onMouseUp={() => void handleStop()}
        onTouchStart={startRecording}
        onTouchEnd={() => void handleStop()}
        className="rounded px-3 py-2 text-sm"
        style={{
          backgroundColor: isRecording ? colors.accentAmber : colors.bgRaised,
          color: isRecording ? colors.bg : colors.textPrimary,
          border: `${borders.hairlineWidth}px solid ${colors.border}`
        }}
      >
        {isRecording ? 'Recording…' : 'Hold to talk'}
      </button>
      {isRecording && <Waveform levels={levels} />}
      {error && (
        <span data-testid="stt-error" style={{ color: colors.accentAmber }}>
          {error}
        </span>
      )}
    </div>
  )
}
