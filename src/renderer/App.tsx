import { ConcentricArcs } from './components/ConcentricArcs'
import { Scanlines } from './components/Scanlines'
import { useAppStore, type ViewName } from './store/appStore'
import { borders, colors, fonts } from './theme/tokens'
import { Console } from './views/Console'
import { Cosmos } from './views/Cosmos'
import { Vault } from './views/Vault'

const VIEWS: { id: ViewName; label: string }[] = [
  { id: 'console', label: 'Console' },
  { id: 'vault', label: 'Vault' },
  { id: 'cosmos', label: 'Cosmos' }
]

export function App() {
  const activeView = useAppStore((s) => s.activeView)
  const setActiveView = useAppStore((s) => s.setActiveView)

  return (
    <div
      className="relative flex h-screen w-screen overflow-hidden"
      style={{ backgroundColor: colors.bg, color: colors.textPrimary }}
    >
      <Scanlines />
      <ConcentricArcs />

      <nav
        className="relative z-10 flex w-20 flex-col items-center gap-6 py-6"
        style={{ backgroundColor: colors.bgRaised, borderRight: `${borders.hairlineWidth}px solid ${colors.border}` }}
      >
        <span
          data-testid="app-title"
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: colors.accentCyan }}
        >
          Sage
        </span>

        {VIEWS.map((view) => (
          <button
            key={view.id}
            type="button"
            aria-pressed={activeView === view.id}
            onClick={() => setActiveView(view.id)}
            className="text-xs font-medium uppercase tracking-wide transition-colors"
            style={{ color: activeView === view.id ? colors.accentCyan : colors.textMuted }}
          >
            {view.label}
          </button>
        ))}

        <span
          className="mt-auto text-xs"
          style={{ color: colors.textMuted, fontFamily: fonts.numeric }}
        >
          v0.1.0
        </span>
      </nav>

      <main className="relative z-10 flex-1 overflow-auto">
        <span data-testid="active-view" className="sr-only">
          {activeView}
        </span>
        {activeView === 'console' && <Console />}
        {activeView === 'vault' && <Vault />}
        {activeView === 'cosmos' && <Cosmos />}
      </main>
    </div>
  )
}
