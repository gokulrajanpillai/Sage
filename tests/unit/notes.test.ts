import { describe, expect, it } from 'vitest'
import { parseNote, serializeNote, type ParsedNote } from '../../src/main/vault/frontmatter'
import { parseWikilinks, resolveWikilinks } from '../../src/main/vault/wikilinks'

describe('note frontmatter', () => {
  it('frontmatter round-trips unchanged', () => {
    const original: ParsedNote = {
      frontmatter: {
        title: 'Test Note',
        created: '2026-08-24T00:00:00.000Z',
        updated: '2026-08-24T00:00:00.000Z',
        tags: ['sage', 'test']
      },
      body: 'Some body content with a [[Wikilink]].'
    }

    const serialized = serializeNote(original)
    const parsed = parseNote(serialized)

    expect(parsed).toEqual(original)
    expect(serializeNote(parsed)).toBe(serialized)
  })
})

describe('wikilinks', () => {
  it('parses wikilink targets from a note body', () => {
    const targets = parseWikilinks('See [[Alpha]] and [[Beta Note]] for more.')
    expect(targets).toEqual(['Alpha', 'Beta Note'])
  })

  it('unresolved wikilinks are reported', () => {
    const targets = parseWikilinks('Links to [[Known]] and [[Missing]].')
    const { resolved, unresolved } = resolveWikilinks(targets, ['Known'])
    expect(resolved).toEqual(['Known'])
    expect(unresolved).toEqual(['Missing'])
  })
})
