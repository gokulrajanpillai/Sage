import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { extractNotesFromTurn } from '../../src/main/vault/noteExtraction'

let vaultDir: string

beforeEach(() => {
  vaultDir = mkdtempSync(join(tmpdir(), 'sage-vault-extract-'))
})

afterEach(() => {
  rmSync(vaultDir, { recursive: true, force: true })
})

describe('extractNotesFromTurn', () => {
  it('writes one file per note section with inferred tags', () => {
    const turn = [
      '## Project Kickoff',
      'We discussed #planning and #timeline for the launch.',
      '',
      '## Follow Up',
      'Nothing tagged here.'
    ].join('\n')

    const results = extractNotesFromTurn(turn, vaultDir, () => '2026-08-24T00:00:00.000Z')

    expect(results).toHaveLength(2)
    expect(results[0].created).toBe(true)
    expect(results[0].tags).toEqual(['planning', 'timeline'])
    expect(results[1].tags).toEqual(['follow-up'])

    const written = readFileSync(results[0].filePath, 'utf8')
    expect(written).toContain('title: Project Kickoff')
    expect(written).toContain('#planning')
  })

  it('never overwrites an existing note file', () => {
    const turn = '## Existing Note\nOriginal external content.'
    const filePath = join(vaultDir, 'existing-note.md')
    writeFileSync(filePath, '---\ntitle: Existing Note\n---\n\nHand-authored content.\n', 'utf8')

    const results = extractNotesFromTurn(turn, vaultDir, () => '2026-08-24T00:00:00.000Z')

    expect(results[0].created).toBe(false)
    expect(readFileSync(filePath, 'utf8')).toContain('Hand-authored content.')
  })
})
