import { expect, test as base } from '@playwright/test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { launchWithVault, writeNote } from './helpers/vaultFixture'

function seedVault(vaultDir: string): void {
  writeNote(
    vaultDir,
    'alpha.md',
    { title: 'Alpha', created: '2026-08-24', updated: '2026-08-24', tags: ['x'] },
    'See [[Beta]].'
  )
  writeNote(
    vaultDir,
    'beta.md',
    { title: 'Beta', created: '2026-08-24', updated: '2026-08-24', tags: ['x'] },
    'Supporting note.'
  )
}

base('shows a hover label for a node', async () => {
  const vaultDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sage-cosmos-e2e-'))
  seedVault(vaultDir)
  const app = await launchWithVault(vaultDir)
  try {
    const page = await app.firstWindow()
    await page.getByRole('button', { name: 'Cosmos' }).click()
    await expect(page.getByTestId('cosmos-node-count')).toContainText('2')

    await page.getByTestId('cosmos-node-alpha').hover()
    await expect(page.getByTestId('cosmos-hover-label')).toBeVisible()
    await expect(page.getByTestId('cosmos-hover-label')).toContainText('Alpha')
  } finally {
    await app.close()
    fs.rmSync(vaultDir, { recursive: true, force: true })
  }
})

base('click opens the note in Vault', async () => {
  const vaultDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sage-cosmos-e2e-'))
  seedVault(vaultDir)
  const app = await launchWithVault(vaultDir)
  try {
    const page = await app.firstWindow()
    await page.getByRole('button', { name: 'Cosmos' }).click()
    await expect(page.getByTestId('cosmos-node-beta')).toBeVisible()

    await page.getByTestId('cosmos-node-beta').click()

    await expect(page.getByTestId('active-view')).toHaveText('vault')
    await expect(page.getByTestId('vault-preview')).toContainText('Supporting note')
  } finally {
    await app.close()
    fs.rmSync(vaultDir, { recursive: true, force: true })
  }
})

base('zooms on wheel', async () => {
  const vaultDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sage-cosmos-e2e-'))
  seedVault(vaultDir)
  const app = await launchWithVault(vaultDir)
  try {
    const page = await app.firstWindow()
    await page.getByRole('button', { name: 'Cosmos' }).click()
    await expect(page.getByTestId('cosmos-zoom-level')).toHaveText('100%')

    await page.getByTestId('cosmos-canvas').dispatchEvent('wheel', { deltaY: -100 })

    await expect(page.getByTestId('cosmos-zoom-level')).not.toHaveText('100%')
  } finally {
    await app.close()
    fs.rmSync(vaultDir, { recursive: true, force: true })
  }
})

base('pans on drag', async () => {
  const vaultDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sage-cosmos-e2e-'))
  seedVault(vaultDir)
  const app = await launchWithVault(vaultDir)
  try {
    const page = await app.firstWindow()
    await page.getByRole('button', { name: 'Cosmos' }).click()
    await expect(page.getByTestId('cosmos-node-alpha')).toBeVisible()

    const before = await page.getByTestId('cosmos-node-alpha').boundingBox()
    const canvasBox = await page.getByTestId('cosmos-canvas').boundingBox()
    if (!canvasBox) throw new Error('canvas not found')

    await page.mouse.move(canvasBox.x + canvasBox.width / 2, canvasBox.y + canvasBox.height / 2)
    await page.mouse.down()
    await page.mouse.move(canvasBox.x + canvasBox.width / 2 + 80, canvasBox.y + canvasBox.height / 2 + 40, {
      steps: 5
    })
    await page.mouse.up()

    const after = await page.getByTestId('cosmos-node-alpha').boundingBox()
    if (!before || !after) throw new Error('node not found')
    expect(Math.abs(after.x - before.x)).toBeGreaterThan(20)
  } finally {
    await app.close()
    fs.rmSync(vaultDir, { recursive: true, force: true })
  }
})
