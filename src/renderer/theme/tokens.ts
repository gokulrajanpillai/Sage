export const colors = {
  bg: '#04070d',
  bgRaised: '#070c17',
  border: '#101a2b',
  textPrimary: '#dceeff',
  textMuted: '#54677f',
  accentCyan: '#28e0ff',
  accentAmber: '#ffb454'
} as const

export const fonts = {
  numeric: '"JetBrains Mono", "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
  ui: '"Inter", system-ui, -apple-system, sans-serif'
} as const

export const radii = {
  sm: 4,
  md: 8,
  lg: 16
} as const

export const borders = {
  hairlineWidth: 1
} as const

export const sizes = {
  arcOverlaySize: 420
} as const

export const motion = {
  scanlineDurationMs: 6000,
  arcPulseDurationMs: 4000
} as const

export const patterns = {
  scanlines:
    'repeating-linear-gradient(to bottom, rgba(220,238,255,0.035) 0px, rgba(220,238,255,0.035) 1px, transparent 1px, transparent 3px)'
} as const
