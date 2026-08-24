import { colors, sizes } from '../theme/tokens'

const RING_COUNT = 5
const RING_STEP = 32

export function ConcentricArcs() {
  const rings = Array.from({ length: RING_COUNT }, (_, i) => (i + 1) * RING_STEP)

  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute bottom-0 right-0 z-0 opacity-40"
      style={{ width: sizes.arcOverlaySize, height: sizes.arcOverlaySize }}
      viewBox="-200 -200 400 400"
    >
      {rings.map((r, i) => (
        <circle
          key={r}
          r={r}
          fill="none"
          stroke={i % 2 === 0 ? colors.accentCyan : colors.accentAmber}
          strokeOpacity={0.25}
          strokeWidth={1}
        />
      ))}
    </svg>
  )
}
