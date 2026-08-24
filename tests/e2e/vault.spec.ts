import { expect, test as base } from '@playwright/test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { launchWithVault, writeNote } from './helpers/vaultFixture'

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
