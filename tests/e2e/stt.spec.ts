import { expect, test } from './fixtures'

test('transcript becomes a user turn and is auto-sent', async ({ page }) => {
  const button = page.getByTestId('push-to-talk')

  await button.dispatchEvent('mousedown')
  await expect(page.getByTestId('waveform')).toBeVisible()

  await button.dispatchEvent('mouseup')

  await expect(page.getByTestId('console-message-user').last()).toContainText('mock transcript')
  await expect(page.getByTestId('console-stop')).toBeVisible()
})
