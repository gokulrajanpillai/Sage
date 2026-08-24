import { _electron as electron, expect, test as base } from '@playwright/test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { test } from './fixtures'

const MAIN_ENTRY = path.resolve(__dirname, '../../out/main/index.js')

async function launchWithTempUserData() {
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sage-e2e-console-'))
  const env = { ...process.env, SAGE_PROVIDERS: 'mock', SAGE_USER_DATA_DIR: userDataDir }
  const app = await electron.launch({ args: [MAIN_ENTRY], env })
  return { app, userDataDir }
}

test('streams tokens and can be stopped', async ({ page }) => {
  await page.getByTestId('console-input').fill('hello sage')
  await page.getByTestId('console-send').click()
  await expect(page.getByTestId('console-stop')).toBeVisible()

  // Wait for at least one token to actually stream in before stopping, so this
  // isn't racing the mock provider's first tick (flaky otherwise).
  await expect(page.getByTestId('console-message-assistant')).not.toHaveText('assistant:', {
    timeout: 2000
  })

  await page.getByTestId('console-stop').click()
  await expect(page.getByTestId('console-send')).toBeVisible()
})

test('offline error is recoverable', async ({ page }) => {
  await page.getByTestId('model-picker').selectOption('sage-mock-offline')
  await page.getByTestId('console-input').fill('are you there?')
  await page.getByTestId('console-send').click()
  await expect(page.getByTestId('console-error')).toBeVisible()
  await expect(page.getByTestId('console-send')).toBeVisible()

  await page.getByTestId('model-picker').selectOption('sage-mock-small')
  await page.getByTestId('console-input').fill('are you there?')
  await page.getByTestId('console-send').click()
  await expect(page.getByTestId('console-send')).toBeVisible({ timeout: 5000 })
  await expect(page.getByTestId('console-error')).toHaveCount(0)
})

base.describe('restart persistence', () => {
  base('model selection persists across restart', async () => {
    const { app: app1, userDataDir } = await launchWithTempUserData()
    try {
      const page1 = await app1.firstWindow()
      await page1.getByTestId('model-picker').selectOption('sage-mock-large')
      await app1.close()

      const app2 = await electron.launch({
        args: [MAIN_ENTRY],
        env: { ...process.env, SAGE_PROVIDERS: 'mock', SAGE_USER_DATA_DIR: userDataDir }
      })
      const page2 = await app2.firstWindow()
      await expect(page2.getByTestId('model-picker')).toHaveValue('sage-mock-large')
      await app2.close()
    } finally {
      fs.rmSync(userDataDir, { recursive: true, force: true })
    }
  })

  base('history persists across restart', async () => {
    const { app: app1, userDataDir } = await launchWithTempUserData()
    try {
      const page1 = await app1.firstWindow()
      await page1.getByTestId('console-input').fill('remember this')
      await page1.getByTestId('console-send').click()
      await expect(page1.getByTestId('console-send')).toBeVisible({ timeout: 5000 })
      await app1.close()

      const app2 = await electron.launch({
        args: [MAIN_ENTRY],
        env: { ...process.env, SAGE_PROVIDERS: 'mock', SAGE_USER_DATA_DIR: userDataDir }
      })
      const page2 = await app2.firstWindow()
      await expect(page2.getByTestId('console-message-user').first()).toContainText('remember this')
      await app2.close()
    } finally {
      fs.rmSync(userDataDir, { recursive: true, force: true })
    }
  })
})
