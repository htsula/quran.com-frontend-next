import { expect, type Locator, type Page } from '@playwright/test';

import { getLanguageItemTestId, TestId } from '@/tests/test-ids';

/**
 * Open the language drawer from the navbar's language button and return the
 * drawer container locator. Language selection lives directly in the navbar now
 * (the navigation/side drawer has been removed).
 *
 * @returns {Promise<Locator>} The language drawer container locator.
 */
export const openNavigationDrawerLanguageSelector = async (page: Page): Promise<Locator> => {
  await page.getByTestId(TestId.OPEN_LANGUAGE_DRAWER).first().click();

  const languageContainer = page.getByTestId(TestId.LANGUAGE_DRAWER);
  await expect(languageContainer).toBeVisible();
  return languageContainer;
};

export const selectNavigationDrawerLanguage = async (page: Page, locale: string): Promise<void> => {
  const languageContainer = await openNavigationDrawerLanguageSelector(page);
  await languageContainer.getByTestId(getLanguageItemTestId(locale)).click();
};

export const ensureEnglishLanguage = async (page: Page): Promise<void> => {
  const html = page.locator('html');
  const currentLang = await html.getAttribute('lang');
  if (currentLang === 'en') {
    return;
  }

  await selectNavigationDrawerLanguage(page, 'en');
  await expect(html).toHaveAttribute('lang', 'en');
};

export const ensureArabicLanguage = async (page: Page): Promise<void> => {
  const html = page.locator('html');
  const currentLang = await html.getAttribute('lang');
  if (currentLang === 'ar') {
    return;
  }

  await selectNavigationDrawerLanguage(page, 'ar');
  await expect(html).toHaveAttribute('lang', 'ar');
};
