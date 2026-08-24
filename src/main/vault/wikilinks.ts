const WIKILINK_RE = /\[\[([^\]]+)\]\]/g

export function parseWikilinks(body: string): string[] {
  const targets: string[] = []
  WIKILINK_RE.lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = WIKILINK_RE.exec(body))) {
    targets.push(match[1].trim())
  }
  return targets
}

export interface WikilinkResolution {
  resolved: string[]
  unresolved: string[]
}

export function resolveWikilinks(targets: string[], knownTitles: string[]): WikilinkResolution {
  const known = new Set(knownTitles)
  const resolved: string[] = []
  const unresolved: string[] = []

  for (const target of targets) {
    if (known.has(target)) resolved.push(target)
    else unresolved.push(target)
  }

  return { resolved, unresolved }
}
