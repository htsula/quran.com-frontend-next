import { test, expect } from '@playwright/test';

import Homepage from '@/tests/POM/home-page';
import { TestId } from '@/tests/test-ids';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('Navbar theme switcher opens the theme options', async ({ page, context }) => {
  const homepage = new Homepage(page, context);
  await homepage.goTo('/1');

  // 1. The theme switcher button is available directly in the navbar
  await expect(page.getByTestId(TestId.CHANGE_THEME_BUTTON)).toBeVisible();

  // 2. Open the theme popover and ensure options are present
  await page.getByTestId(TestId.CHANGE_THEME_BUTTON).click();
  await expect(page.getByTestId('theme-option-light')).toBeVisible();
  await expect(page.getByTestId('theme-option-sepia')).toBeVisible();
  await expect(page.getByTestId('theme-option-dark')).toBeVisible();
});
