import { test, expect } from './fixtures'

test('launches and shows the Sage window', async ({ page }) => {
  await expect(page.getByTestId('app-title')).toHaveText('Sage')
})
