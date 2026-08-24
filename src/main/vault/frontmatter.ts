import yaml from 'js-yaml'

export interface NoteFrontmatter {
  title: string
  created: string
  updated: string
  tags: string[]
}

export interface ParsedNote {
  frontmatter: NoteFrontmatter
  body: string
}

const DELIMITER = '---'

export function parseNote(raw: string): ParsedNote {
  const lines = raw.split('\n')
  if (lines[0]?.trim() !== DELIMITER) {
    throw new Error('Note is missing YAML frontmatter')
  }

  const endIndex = lines.findIndex((line, i) => i > 0 && line.trim() === DELIMITER)
  if (endIndex === -1) {
    throw new Error('Note frontmatter is not terminated')
  }

  const frontmatterText = lines.slice(1, endIndex).join('\n')
  const body = lines
    .slice(endIndex + 1)
    .join('\n')
    .replace(/^\n+/, '')
  const parsed = (yaml.load(frontmatterText) ?? {}) as Partial<NoteFrontmatter>

  const frontmatter: NoteFrontmatter = {
    title: parsed.title ?? '',
    created: parsed.created ?? '',
    updated: parsed.updated ?? '',
    tags: parsed.tags ?? []
  }

  return { frontmatter, body }
}

export function serializeNote(note: ParsedNote): string {
  const yamlText = yaml.dump(
    {
      title: note.frontmatter.title,
      created: note.frontmatter.created,
      updated: note.frontmatter.updated,
      tags: note.frontmatter.tags
    },
    { lineWidth: -1 }
  )

  return `${DELIMITER}\n${yamlText}${DELIMITER}\n\n${note.body}`
}
