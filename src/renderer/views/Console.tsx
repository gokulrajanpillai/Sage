import { useEffect, useState } from 'react'
import { PushToTalk } from '../components/PushToTalk'
import { TelemetryStrip } from '../components/TelemetryStrip'
import { useConsoleStore } from '../store/consoleStore'
import { borders, colors } from '../theme/tokens'

export function Console() {
  const models = useConsoleStore((s) => s.models)
  const selectedModel = useConsoleStore((s) => s.selectedModel)
  const messages = useConsoleStore((s) => s.messages)
  const isStreaming = useConsoleStore((s) => s.isStreaming)
  const error = useConsoleStore((s) => s.error)
  const loadModels = useConsoleStore((s) => s.loadModels)
  const selectModel = useConsoleStore((s) => s.selectModel)
  const sendMessage = useConsoleStore((s) => s.sendMessage)
  const stopStreaming = useConsoleStore((s) => s.stopStreaming)

  const [draft, setDraft] = useState('')

  useEffect(() => {
    void loadModels()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fieldStyle = {
    backgroundColor: colors.bgRaised,
    color: colors.textPrimary,
    border: `${borders.hairlineWidth}px solid ${colors.border}`
  }

  const handleSend = () => {
    if (!draft.trim() || isStreaming) return
    sendMessage(draft.trim())
    setDraft('')
  }

  return (
    <div className="flex h-full flex-col p-6" data-testid="console-view">
      <div className="flex items-center justify-between pb-4">
        <h2 className="text-sm uppercase tracking-widest" style={{ color: colors.textMuted }}>
          Console
        </h2>
        <select
          data-testid="model-picker"
          value={selectedModel}
          onChange={(e) => selectModel(e.target.value)}
          className="rounded px-2 py-1 text-sm"
          style={fieldStyle}
        >
          {models.length === 0 && <option value="">No models</option>}
          {models.map((model) => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div
          data-testid="console-error"
          className="mb-4 flex items-center justify-between rounded p-3 text-sm"
          style={{ ...fieldStyle, color: colors.accentAmber }}
        >
          <span>{error}</span>
          <button type="button" onClick={() => void loadModels()} className="underline">
            Retry
          </button>
        </div>
      )}

      <div data-testid="console-history" className="flex-1 space-y-3 overflow-auto">
        {messages.map((message, index) => (
          <div key={index} data-testid={`console-message-${message.role}`} className="text-sm">
            <span style={{ color: message.role === 'user' ? colors.accentCyan : colors.accentAmber }}>
              {message.role}:
            </span>{' '}
            <span>{message.content}</span>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <PushToTalk />
      </div>

      <div className="mt-4 flex gap-2">
        <input
          data-testid="console-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend()
          }}
          className="flex-1 rounded px-3 py-2 text-sm"
          style={fieldStyle}
        />
        {isStreaming ? (
          <button
            type="button"
            data-testid="console-stop"
            onClick={stopStreaming}
            className="rounded px-4 py-2 text-sm"
            style={{ backgroundColor: colors.accentAmber, color: colors.bg }}
          >
            Stop
          </button>
        ) : (
          <button
            type="button"
            data-testid="console-send"
            onClick={handleSend}
            className="rounded px-4 py-2 text-sm"
            style={{ backgroundColor: colors.accentCyan, color: colors.bg }}
          >
            Send
          </button>
        )}
      </div>

      <TelemetryStrip />
    </div>
  )
}
