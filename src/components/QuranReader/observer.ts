/**
 * The top -74px was calculated based on:
 *
 * 1. the top padding of the QuranReader container (2rem).
 * 2. the top and bottom margin of the ReadingPreferenceSwitcher container (1.625rem).
 * 3. the top margin of the TranslationView container (1rem).
 *
 * and the total is 4.625rem around 74 pixels.
 *
 * Note: the navbar is not rendered on reader routes (the ContextMenu is the top
 * header), so the previous navbar term (3.6rem) is no longer included.
 */
const DEFAULT_ROOT_MARGIN = '-74px 0px -68% 0px';
const OBSERVER_THRESHOLD = 0.1;
export const QURAN_READER_OBSERVER_ID = 'quranReaderObserver';
export const REFLECTIONS_OBSERVER_ID = 'reflectionsObserver';
/**
 * The top offset for page navigation scrolling in reading mode.
 * This provides enough clearance for the navbar without excessive spacing.
 */
export const READING_MODE_TOP_OFFSET = 60;
/**
 * The top offset for the intersection observer in reading mode.
 * Based on container padding (2rem) + ReadingPreferenceSwitcher margin (1.625rem)
 * = 3.625rem ≈ 58px. The navbar is not rendered on reader routes, so its previous
 * 3.6rem term is no longer included.
 */
const READING_MODE_OBSERVER_OFFSET = 58;
const READING_MODE_ROOT_MARGIN = `-${READING_MODE_OBSERVER_OFFSET}px 0px -70% 0px`;

/**
 * Get the observer options based on the reading preference.
 *
 * @param {boolean} isReadingPreference
 * @returns {{rootMargin: string, threshold: number | number[]}}
 */
export const getOptions = (
  isReadingPreference: boolean,
): { rootMargin: string; threshold: number | number[] } => ({
  rootMargin: isReadingPreference ? READING_MODE_ROOT_MARGIN : DEFAULT_ROOT_MARGIN,
  threshold: OBSERVER_THRESHOLD,
});

/**
 * Get the payload that will be dispatched to Redux to set the last read verse.
 *
 * @param {Element} element
 * @returns {{verseKey: string,chapterId: string,page: string,hizb: string}}
 */
export const getObservedVersePayload = (
  element: Element,
): { verseKey: string; chapterId: string; page: string; hizb: string } => ({
  verseKey: element.getAttribute('data-verse-key'),
  chapterId: element.getAttribute('data-chapter-id'),
  page: element.getAttribute('data-page'),
  hizb: element.getAttribute('data-hizb'),
});
