import { describe, expect, it } from 'vitest'
import { isExemptPath, scanSource } from '../../scripts/lintTokens.mjs'

describe('lint:tokens scanner', () => {
  it('flags a raw hex color literal', () => {
    const violations = scanSource('const style = { color: "#04070d" }')
    expect(violations.some((v) => v.kind === 'hex')).toBe(true)
  })

  it('flags a raw px literal', () => {
    const violations = scanSource('const width = "12px"')
    expect(violations.some((v) => v.kind === 'px')).toBe(true)
  })

  it('does not flag token references', () => {
    const violations = scanSource('const style = { color: colors.accentCyan, padding: spacing.md }')
    expect(violations).toHaveLength(0)
  })

  it('exempts the tokens module and test files', () => {
    expect(isExemptPath('src/renderer/theme/tokens.ts')).toBe(true)
    expect(isExemptPath('src/renderer/components/Foo.test.tsx')).toBe(true)
    expect(isExemptPath('src/renderer/components/Foo.tsx')).toBe(false)
  })
})
