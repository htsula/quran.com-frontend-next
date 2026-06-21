import { test, expect } from '@playwright/test';

import Homepage from '@/tests/POM/home-page';
import { TestId } from '@/tests/test-ids';

let homePage: Homepage;

test.beforeEach(async ({ page, context }) => {
  homePage = new Homepage(page, context);
  await homePage.goTo('/');
});

test.describe('Theme Switcher', () => {
  test('Auto should be selected by default', async ({ page }) => {
    // 1. Open the theme switcher from the navbar
    await page.getByTestId(TestId.CHANGE_THEME_BUTTON).click();

    const autoButton = page.getByTestId('theme-option-auto');

    // check if it has class `Selected`
    await expect(autoButton).toHaveClass(/Selected/);
  });

  test('Selecting a non-default theme should change the active theme', async ({ page }) => {
    let bodyTheme = await page.locator('body').getAttribute('data-theme');
    // 1. Make sure the auto theme is the currently selected theme
    expect(bodyTheme).toBe('auto');

    // 2. Open the theme switcher from the navbar and click on the light theme
    await page.getByTestId(TestId.CHANGE_THEME_BUTTON).click();
    await page.getByTestId('theme-option-light').click();
    // 4. Make sure the light theme is the currently selected theme
    bodyTheme = await page.locator('body').getAttribute('data-theme');
    expect(bodyTheme).toBe('light');
  });
});
