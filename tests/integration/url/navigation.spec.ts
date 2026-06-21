import { test, expect } from '@playwright/test';

import Homepage from '@/tests/POM/home-page';
import { getChapterContainerTestId, TestId } from '@/tests/test-ids';

let homePage: Homepage;

test.beforeEach(async ({ page, context }) => {
  test.slow();

  homePage = new Homepage(page, context);
});

test(
  'Navigating using back button works',
  { tag: ['@url', '@slow', '@navigation'] },
  async ({ page }) => {
    await homePage.goTo('/');
    await page.getByTestId(getChapterContainerTestId(1)).click();
    await expect(page).toHaveURL(/\/1$/);
    // Navigate to the search results page directly (the search drawer has been removed)
    await page.goto('/search?page=1&query=eat');
    await expect(page).toHaveURL(/search\?page=1&query=eat/);
    await page.getByTestId(TestId.NEXT_PAGE_BUTTON).click();
    await expect(page).toHaveURL(/search\?page=2&query=eat/);

    const navigationButtons = page.getByTestId(TestId.PAGE_NAVIGATION_BUTTONS);
    await expect(navigationButtons).toBeVisible();
    await navigationButtons.getByText('4').click();
    await expect(page).toHaveURL(/search\?page=4&query=eat/);

    // go back
    await page.goBack();
    await expect(page).toHaveURL(/search\?page=2&query=eat/);
    await page.goBack();
    await expect(page).toHaveURL(/search\?page=1&query=eat/);
    await page.goBack();
    await expect(page).toHaveURL(/\/1$/);
    await page.goBack();
    await expect(page).toHaveURL(/\/$/);
  },
);

test(
  'Navigating using forward button works',
  { tag: ['@url', '@slow', '@navigation'] },
  async ({ page }) => {
    await homePage.goTo('/');
    await page.getByTestId(getChapterContainerTestId(1)).click();
    await expect(page).toHaveURL(/\/1$/);
    // Navigate to the search results page directly (the search drawer has been removed)
    await page.goto('/search?page=1&query=eat');
    await expect(page).toHaveURL(/search\?page=1&query=eat/);
    await page.getByTestId(TestId.NEXT_PAGE_BUTTON).click();
    await expect(page).toHaveURL(/search\?page=2&query=eat/);

    await page.goBack();
    await expect(page).toHaveURL(/search\?page=1&query=eat/);
    await page.goBack();
    await expect(page).toHaveURL(/\/1$/);

    await page.goForward();
    await expect(page).toHaveURL(/search\?page=1&query=eat/);
    await page.goForward();
    await expect(page).toHaveURL(/search\?page=2&query=eat/);
  },
);
