import { patterns } from '../theme/tokens'

export function Scanlines() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0"
      style={{ backgroundImage: patterns.scanlines }}
    />
  )
}
