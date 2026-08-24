import { _electron as electron } from '@playwright/test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

export const MAIN_ENTRY = path.resolve(__dirname, '../../../out/main/index.js')

export interface NoteFrontmatterInput {
  title: string
  created: string
  updated: string
  tags: string[]
}

export function writeNote(
  vaultDir: string,
  filename: string,
  frontmatter: NoteFrontmatterInput,
  body: string
): void {
  const tagLines =
    frontmatter.tags.length === 0
      ? 'tags: []'
      : `tags:\n${frontmatter.tags.map((tag) => `  - ${tag}`).join('\n')}`

  const content = [
    '---',
    `title: ${frontmatter.title}`,
    `created: ${frontmatter.created}`,
    `updated: ${frontmatter.updated}`,
    tagLines,
    '---',
    '',
    body,
    ''
  ].join('\n')

  fs.writeFileSync(path.join(vaultDir, filename), content, 'utf8')
}

export function launchWithVault(vaultDir: string) {
  return electron.launch({
    args: [MAIN_ENTRY],
    env: {
      ...process.env,
      SAGE_PROVIDERS: 'mock',
      SAGE_USER_DATA_DIR: fs.mkdtempSync(path.join(os.tmpdir(), 'sage-e2e-userdata-')),
      SAGE_VAULT_DIR: vaultDir
    }
  })
}
