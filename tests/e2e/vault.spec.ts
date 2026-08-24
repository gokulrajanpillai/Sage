import { _electron as electron, expect, test as base } from '@playwright/test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const MAIN_ENTRY = path.resolve(__dirname, '../../out/main/index.js')

function writeNote(
  vaultDir: string,
  filename: string,
  frontmatter: { title: string; created: string; updated: string; tags: string[] },
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

function launchWithVault(vaultDir: string) {
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

base('file tree, preview, tag filter and backlinks', async () => {
  const vaultDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sage-vault-e2e-'))
  writeNote(
    vaultDir,
    'alpha.md',
    { title: 'Alpha', created: '2026-08-24', updated: '2026-08-24', tags: ['project'] },
    '# Alpha\n\nSee [[Beta]] for details.'
  )
  writeNote(
    vaultDir,
    'beta.md',
    { title: 'Beta', created: '2026-08-24', updated: '2026-08-24', tags: ['reference'] },
    '# Beta\n\nSupporting note.'
  )

  const app = await launchWithVault(vaultDir)
  try {
    const page = await app.firstWindow()
    await page.getByRole('button', { name: 'Vault' }).click()

    await expect(page.getByTestId('vault-note-alpha')).toBeVisible()
    await expect(page.getByTestId('vault-note-beta')).toBeVisible()

    await page.getByTestId('vault-tag-reference').click()
    await expect(page.getByTestId('vault-note-beta')).toBeVisible()
    await expect(page.getByTestId('vault-note-alpha')).toHaveCount(0)

    await page.getByTestId('vault-tag-filter').getByText('all', { exact: true }).click()
    await page.getByTestId('vault-note-alpha').click()
    await expect(page.getByTestId('vault-preview')).toContainText('Alpha')

    await page.getByTestId('vault-note-beta').click()
    await expect(page.getByTestId('vault-backlinks')).toContainText('Alpha')
  } finally {
    await app.close()
    fs.rmSync(vaultDir, { recursive: true, force: true })
  }
})

base('file watcher reflects external changes', async () => {
  const vaultDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sage-vault-e2e-'))
  const app = await launchWithVault(vaultDir)

  try {
    const page = await app.firstWindow()
    await page.getByRole('button', { name: 'Vault' }).click()
    await expect(page.getByTestId('vault-note-gamma')).toHaveCount(0)

    writeNote(
      vaultDir,
      'gamma.md',
      { title: 'Gamma', created: '2026-08-24', updated: '2026-08-24', tags: [] },
      'Added externally while the app was running.'
    )

    await expect(page.getByTestId('vault-note-gamma')).toBeVisible({ timeout: 5000 })
  } finally {
    await app.close()
    fs.rmSync(vaultDir, { recursive: true, force: true })
  }
})
