import { _electron as electron, expect, test } from '@playwright/test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

test('active view persists across restart', async () => {
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sage-e2e-'))
  const mainEntry = path.resolve(__dirname, '../../out/main/index.js')
  const env = { ...process.env, SAGE_PROVIDERS: 'mock', SAGE_USER_DATA_DIR: userDataDir }

  try {
    const app1 = await electron.launch({ args: [mainEntry], env })
    const page1 = await app1.firstWindow()
    await page1.getByRole('button', { name: 'Vault' }).click()
    await expect(page1.getByTestId('active-view')).toHaveText('vault')
    await app1.close()

    const app2 = await electron.launch({ args: [mainEntry], env })
    const page2 = await app2.firstWindow()
    await expect(page2.getByTestId('active-view')).toHaveText('vault')
    await app2.close()
  } finally {
    fs.rmSync(userDataDir, { recursive: true, force: true })
  }
})
