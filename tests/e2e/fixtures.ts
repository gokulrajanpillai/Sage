import { test as base, _electron as electron, expect } from '@playwright/test'
import type { ElectronApplication, Page } from '@playwright/test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

type Fixtures = {
  electronApp: ElectronApplication
  page: Page
}

export const test = base.extend<Fixtures>({
  // eslint-disable-next-line no-empty-pattern
  electronApp: async ({}, use) => {
    const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sage-e2e-'))
    const app = await electron.launch({
      args: [path.resolve(__dirname, '../../out/main/index.js')],
      env: { ...process.env, SAGE_PROVIDERS: 'mock', SAGE_USER_DATA_DIR: userDataDir }
    })
    await use(app)
    await app.close()
    fs.rmSync(userDataDir, { recursive: true, force: true })
  },
  page: async ({ electronApp }, use) => {
    const window = await electronApp.firstWindow()
    await use(window)
  }
})

export { expect }
