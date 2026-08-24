import { colors } from '../theme/tokens'

export function Vault() {
  return (
    <div className="p-8" data-testid="vault-view">
      <h2 className="text-sm uppercase tracking-widest" style={{ color: colors.textMuted }}>
        Vault
      </h2>
    </div>
  )
}
