import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { serializeNote, type ParsedNote } from './frontmatter'

export interface ExtractedNote {
  title: string
  filePath: string
  tags: string[]
  created: boolean
}

const SECTION_HEADER_RE = /^##\s+(.+)$/

export function extractNotesFromTurn(
  turnText: string,
  vaultDir: string,
  now: () => string = () => new Date().toISOString()
): ExtractedNote[] {
  const sections = splitSections(turnText)
  const results: ExtractedNote[] = []

  for (const section of sections) {
    const tags = inferTags(section.title, section.body)
    const filePath = join(vaultDir, `${slugify(section.title)}.md`)

    if (existsSync(filePath)) {
      results.push({ title: section.title, filePath, tags, created: false })
      continue
    }

    const timestamp = now()
    const note: ParsedNote = {
      frontmatter: { title: section.title, created: timestamp, updated: timestamp, tags },
      body: section.body
    }

    mkdirSync(vaultDir, { recursive: true })
    writeFileSync(filePath, serializeNote(note), 'utf8')
    results.push({ title: section.title, filePath, tags, created: true })
  }

  return results
}

function splitSections(turnText: string): { title: string; body: string }[] {
  const lines = turnText.split('\n')
  const sections: { title: string; body: string }[] = []
  let current: { title: string; body: string[] } | null = null

  for (const line of lines) {
    const headerMatch = SECTION_HEADER_RE.exec(line)
    if (headerMatch) {
      if (current) sections.push({ title: current.title, body: current.body.join('\n').trim() })
      current = { title: headerMatch[1].trim(), body: [] }
    } else if (current) {
      current.body.push(line)
    }
  }
  if (current) sections.push({ title: current.title, body: current.body.join('\n').trim() })

  return sections
}

function inferTags(title: string, body: string): string[] {
  const hashtags = Array.from(body.matchAll(/#(\w+)/g)).map((m) => m[1].toLowerCase())
  if (hashtags.length > 0) return Array.from(new Set(hashtags))

  const slug = slugify(title)
  return slug === 'note' ? [] : [slug]
}

function slugify(text: string): string {
  const slug = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug || 'note'
}
