const HEX_RE = /#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g
const PX_RE = /\b\d+(?:\.\d+)?px\b/g

export function scanSource(content) {
  const violations = []
  const lines = content.split(/\r?\n/)

  lines.forEach((line, index) => {
    for (const [re, kind] of [
      [HEX_RE, 'hex'],
      [PX_RE, 'px']
    ]) {
      re.lastIndex = 0
      let match
      while ((match = re.exec(line))) {
        violations.push({ line: index + 1, column: match.index + 1, match: match[0], kind })
      }
    }
  })

  return violations
}

export function isExemptPath(relativePath) {
  const normalized = relativePath.replace(/\\/g, '/')
  if (normalized.endsWith('theme/tokens.ts')) return true
  if (normalized.includes('.test.')) return true
  return false
}
