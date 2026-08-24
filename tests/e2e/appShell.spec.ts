import { expect, test } from './fixtures'

test('left rail switches between Console, Vault and Cosmos', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Console' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Vault' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Cosmos' })).toBeVisible()

  await expect(page.getByTestId('active-view')).toHaveText('console')

  await page.getByRole('button', { name: 'Vault' }).click()
  await expect(page.getByTestId('active-view')).toHaveText('vault')

  await page.getByRole('button', { name: 'Cosmos' }).click()
  await expect(page.getByTestId('active-view')).toHaveText('cosmos')
})
