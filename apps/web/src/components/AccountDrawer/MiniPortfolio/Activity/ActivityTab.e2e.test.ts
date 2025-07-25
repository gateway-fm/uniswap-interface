import { expect, test } from 'playwright/fixtures'
import { Mocks } from 'playwright/mocks/mocks'
import { USDC_MAINNET } from 'uniswap/src/constants/tokens'
import { ElementName } from 'uniswap/src/features/telemetry/constants'
import { TestID } from 'uniswap/src/test/fixtures/testIDs'

test.describe('ActivityTab activity history', () => {
  test('should deduplicate activity history by nonce', async ({ page, graphql }) => {
    await graphql.intercept('ActivityWeb', Mocks.Account.activity_history)
    await page.goto(`/swap?inputCurrency=ETH&outputCurrency=${USDC_MAINNET.address}`)

    // Perform swap
    await page.getByTestId(TestID.AmountInputIn).click()
    await page.getByTestId(TestID.AmountInputIn).fill('1')
    await expect(page.getByTestId(TestID.AmountInputIn)).toHaveValue('1')
    await expect(page.getByTestId(TestID.AmountInputOut)).not.toHaveValue('')
    await page.getByTestId(TestID.ReviewSwap).click()
    await page.getByTestId(TestID.Swap).click()
    await page.getByTestId(TestID.ActivityPopupCloseIcon).click()

    // Open account drawer and navigate to activity tab
    await page.getByTestId(TestID.Web3StatusConnected).click()
    await page.getByTestId(ElementName.MiniPortfolioActivityTab).click()

    // Wait for activity content to be visible
    await expect(page.getByTestId(TestID.ActivityContent)).toBeVisible()

    // Assert that the local pending transaction is replaced by remote transaction with the same nonce
    // The "Swapping" text should not exist as it indicates a pending local transaction
    await expect(page.getByText('Swapping')).not.toBeVisible()

    // Verify that we have activity content displayed (from the mocked GraphQL response)
    await expect(page.getByTestId(TestID.ActivityContent)).toBeVisible()
  })
})
