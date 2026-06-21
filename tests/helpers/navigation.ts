import { type Page } from '@playwright/test';

import { TestId } from '@/tests/test-ids';

const openQuranNavigation = async (page: Page): Promise<void> => {
  await page.getByTestId(TestId.NAVIGATE_QURAN_BUTTON).click();
};

export default openQuranNavigation;
