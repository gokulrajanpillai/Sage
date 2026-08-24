import { expect, test } from './fixtures'

test('telemetry strip shows tok/s, TTFT, STT latency, note count and model', async ({ page }) => {
  await expect(page.getByTestId('telemetry-model')).toContainText('sage-mock')
  await expect(page.getByTestId('telemetry-note-count')).toContainText('0')
  await expect(page.getByTestId('telemetry-tokens-per-second')).toContainText('—')
  await expect(page.getByTestId('telemetry-ttft')).toContainText('—')
  await expect(page.getByTestId('telemetry-stt-latency')).toContainText('—')

  await page.getByTestId('console-input').fill('hello')
  await page.getByTestId('console-send').click()
  await expect(page.getByTestId('console-send')).toBeVisible({ timeout: 5000 })

  await expect(page.getByTestId('telemetry-tokens-per-second')).not.toContainText('—')
  await expect(page.getByTestId('telemetry-ttft')).not.toContainText('—')

  const pushToTalk = page.getByTestId('push-to-talk')
  await pushToTalk.dispatchEvent('mousedown')
  await pushToTalk.dispatchEvent('mouseup')

  await expect(page.getByTestId('telemetry-stt-latency')).not.toContainText('—', { timeout: 5000 })
})
