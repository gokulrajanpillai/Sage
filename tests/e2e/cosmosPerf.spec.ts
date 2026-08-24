import { expect, test as base } from '@playwright/test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { launchWithVault } from './helpers/vaultFixture'

const NODE_COUNT = 500
const TAG_GROUPS = 20

function writeSyntheticVault(vaultDir: string): void {
  for (let i = 0; i < NODE_COUNT; i += 1) {
    const tag = `tag-${i % TAG_GROUPS}`
    const body = i > 0 ? `Synthetic note body. See [[Note ${i - 1}]].` : 'Synthetic note body.'
    const content = [
      '---',
      `title: Note ${i}`,
      'created: 2026-08-24',
      'updated: 2026-08-24',
      `tags:\n  - ${tag}`,
      '---',
      '',
      body,
      ''
    ].join('\n')
    fs.writeFileSync(path.join(vaultDir, `note-${i}.md`), content, 'utf8')
  }
}

base('500-node first frame under 2000ms', async () => {
  const vaultDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sage-vault-perf-'))
  writeSyntheticVault(vaultDir)

  const app = await launchWithVault(vaultDir)
  try {
    const page = await app.firstWindow()

    const start = Date.now()
    await page.getByRole('button', { name: 'Cosmos' }).click()
    await expect(page.getByTestId('cosmos-node-count')).toContainText(String(NODE_COUNT))
    const elapsed = Date.now() - start

    expect(elapsed).toBeLessThan(2000)
  } finally {
    await app.close()
    fs.rmSync(vaultDir, { recursive: true, force: true })
  }
})
