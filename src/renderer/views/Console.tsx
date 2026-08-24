import { colors } from '../theme/tokens'

export function Console() {
  return (
    <div className="p-8" data-testid="console-view">
      <h2 className="text-sm uppercase tracking-widest" style={{ color: colors.textMuted }}>
        Console
      </h2>
    </div>
  )
}
