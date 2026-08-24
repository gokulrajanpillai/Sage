import { existsSync, mkdirSync, readdirSync, readFileSync } from 'node:fs'
import { basename, join } from 'node:path'
import { parseNote } from './frontmatter'
import { parseWikilinks, resolveWikilinks, type WikilinkResolution } from './wikilinks'

export interface VaultNote {
  id: string
  title: string
  tags: string[]
  filePath: string
  body: string
  wikilinks: WikilinkResolution
}

export function loadVault(vaultDir: string): VaultNote[] {
  if (!existsSync(vaultDir)) mkdirSync(vaultDir, { recursive: true })

  const files = readdirSync(vaultDir).filter((file) => file.endsWith('.md'))

  const raw = files.map((file) => {
    const filePath = join(vaultDir, file)
    const { frontmatter, body } = parseNote(readFileSync(filePath, 'utf8'))
    return { id: basename(file, '.md'), filePath, frontmatter, body }
  })

  const knownTitles = raw.map((note) => note.frontmatter.title)

  return raw.map((note) => ({
    id: note.id,
    title: note.frontmatter.title,
    tags: note.frontmatter.tags,
    filePath: note.filePath,
    body: note.body,
    wikilinks: resolveWikilinks(parseWikilinks(note.body), knownTitles)
  }))
}

export function computeBacklinks(notes: VaultNote[]): Record<string, string[]> {
  const backlinks: Record<string, string[]> = {}

  for (const note of notes) {
    for (const target of note.wikilinks.resolved) {
      backlinks[target] = [...(backlinks[target] ?? []), note.title]
    }
  }

  return backlinks
}
