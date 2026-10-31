import { test, expect } from '@playwright/test';

test.describe('VillageOS Dashboard E2E Integration Tests', () => {
  test('should navigate, mock cropper search, and target a cropper', async ({ page }) => {
    // 1. Intercept /api/villageos/find-croppers API endpoint
    await page.route('**/api/villageos/find-croppers', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          croppers: [
            {
              label: '15c',
              coords: '(99|99)',
              distance_from_you: 15.5,
              oasis_score: 120,
              occupied: false,
              player: '',
              population: 0,
              nearby_oases: []
            }
          ]
        })
      });
    });

    // 2. Go to /villageos route
    await page.goto('/villageos');

    // 3. Confirm main page elements are loaded
    await expect(page.locator('text=Capital 01').first()).toBeVisible();

    // 4. Click the Expansion & Combat Intel tab
    await page.click('text="Expansion & Combat Intel"');

    // 5. Verify the CP Calculator and Cropper Finder cards are visible
    await expect(page.locator('text=Culture Points & Expansion Planner').first()).toBeVisible();
    await expect(page.locator('text=Optimal Cropper Finder').first()).toBeVisible();

    // 6. Click "Find Optimal Croppers" to trigger mock search
    await page.click('text="Find Optimal Croppers"');

    // 7. Verify the mocked cropper result is shown in the table
    await expect(page.locator('text="(99|99)"')).toBeVisible();
    await expect(page.locator('text="+120%"')).toBeVisible();

    // 8. Target the cropper for expansion
    await page.click('tr:has-text("(99|99)") button:has-text("Target")');

    // 9. Verify the cropper (99|99) is added to the Potential Expansion Settlements list
    await expect(page.locator('.bg-slate-900:has-text("Potential Expansion Settlements") td:has-text("(99|99)")')).toBeVisible();
  });
});
