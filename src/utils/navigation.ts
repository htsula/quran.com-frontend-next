/* eslint-disable max-lines */
import { ParsedUrlQuery, stringify } from 'querystring';

import REVELATION_ORDER from './revelationOrder';
import { searchIdToNavigationKey } from './search';
import { getBasePath } from './url';
import { getVerseAndChapterNumbersFromKey, getVerseNumberRangeFromKey } from './verse';

import QueryParam from '@/types/QueryParam';
import { SearchNavigationType } from 'types/Search/SearchNavigationResult';

/**
 * all static routes
 * dynamic routes should have a function to generate the url ie. getPageNavigationUrl
 */
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  LOGOUT: '/logout',
  AUTH: '/auth',
  FORGET_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  COMPLETE_SIGNUP: '/complete-signup',
  SITEMAP: '/sitemap.xml',
  READING_GOAL_PROGRESS: '/reading-goal/progress',
  // TODO: add all static routes here for incremental adoption
};

/**
 * auth routes
 */
export const AUTH_ROUTES = [
  ROUTES.LOGIN,
  ROUTES.FORGET_PASSWORD,
  ROUTES.RESET_PASSWORD,
  ROUTES.COMPLETE_SIGNUP,
];

/**
 * routes that require authentication
 */
export const PROTECTED_ROUTES = [ROUTES.READING_GOAL_PROGRESS, ROUTES.COMPLETE_SIGNUP];

export const EXTERNAL_ROUTES = {
  QURAN_REFLECT_ANDROID:
    'https://play.google.com/store/apps/details?id=com.quranreflect.quranreflect&hl=en',
  QURAN_REFLECT_IOS: 'https://apps.apple.com/us/app/quranreflect/id1444969758',
};

export const QURAN_URL = 'https://quran.com';
export const RADIO_URL = '/radio';
export const RECITERS_URL = '/reciters';

/**
 * Get the href link to a verse.
 *
 * @param {string} verseKey
 * @returns {string}
 */
export const getVerseNavigationUrlByVerseKey = (verseKey: string): string => {
  const [chapterId, verseNumber] = getVerseAndChapterNumbersFromKey(verseKey);
  return `/${chapterId}/${verseNumber}`;
};

/**
 * Get the href link to a verse range e.g. 3:5-7.
 *
 * @param {string} key
 * @returns {string}
 */
export const getSurahRangeNavigationUrlByVerseKey = (key: string): string => {
  const { surah, from, to } = getVerseNumberRangeFromKey(key);
  return `/${surah}/${from}-${to}`;
};

/**
 * Get the scroll to link of a verseKey.
 *
 * @param {string} verseKey
 * @returns {string}
 */
export const getChapterWithStartingVerseUrl = (verseKey: string): string => {
  const [chapterId, verseNumber] = getVerseAndChapterNumbersFromKey(verseKey);
  return `/${chapterId}?${QueryParam.STARTING_VERSE}=${verseNumber}`;
};

/**
 * Get the href link to a verse.
 *
 * @param {string} chapterIdOrSlug
 * @param {string} verseNumber
 * @returns {string}
 */
export const getVerseNavigationUrl = (chapterIdOrSlug: string, verseNumber: string): string =>
  `/${chapterIdOrSlug}/${verseNumber}`;

/**
 * Get the href link to a range.
 *
 * @param {string} startVerseKey
 * @param {string} endVerseKey
 * @returns {string}
 */
export const getRangesNavigationUrl = (startVerseKey: string, endVerseKey: string): string =>
  `/${startVerseKey}-${endVerseKey}`;

/**
 * Get the href link to a juz.
 *
 * @param {string | number} juzNumber
 * @returns  {string}
 */
export const getJuzNavigationUrl = (juzNumber: string | number): string => `/juz/${juzNumber}`;

/**
 * Get the href link to a Rub el Hizb.
 *
 * @param {string | number} rubNumber
 * @returns  {string}
 */
export const getRubNavigationUrl = (rubNumber: string | number): string => `/rub/${rubNumber}`;

/**
 * Get the href link to a hizb.
 *
 * @param {string | number} hizbNumber
 * @returns  {string}
 */
export const getHizbNavigationUrl = (hizbNumber: string | number): string => `/hizb/${hizbNumber}`;

/**
 * Get the href link to a page.
 *
 * @param {string | number} pageNumber
 * @returns  {string}
 */
export const getPageNavigationUrl = (pageNumber: string | number): string => `/page/${pageNumber}`;

/**
 * Get the href link to tafsir for Ayah.
 *
 * @param {string | number} chapterIdOrSlug
 * @param {number} verseNumber
 * @returns {string}
 */
export const getVerseTafsirNavigationUrl = (
  chapterIdOrSlug: string | number,
  verseNumber: number,
  tafsirId?: string,
): string =>
  `/${chapterIdOrSlug}/${verseNumber}/tafsirs${tafsirId ? `?${stringify({ tafsirId })}` : ''}`;

/**
 * Get the href link to selected tafsir for Ayah.
 *
 * @param {string | number} chapterId
 * @param {number} verseNumber
 * @param {number |string} tafsirId
 * @returns {string}
 */
export const getVerseSelectedTafsirNavigationUrl = (
  chapterId: string | number,
  verseNumber: number,
  tafsirId: number | string,
): string => `/${chapterId}:${verseNumber}/tafsirs/${tafsirId}`;

/**
 * Get the href link to related verse of Ayah.
 *
 * @param {string} verseKey
 * @returns {string}
 */
export const getVerseRelatedVersesNavigationUrl = (verseKey: string): string =>
  `/${verseKey}/related-verses`;

/**
 * Get the href link to Hadith of Ayah.
 *
 * @param {string} verseKey
 * @returns {string}
 */
export const getVerseHadithsNavigationUrl = (verseKey: string): string => `/${verseKey}/hadith`;

/**
 * Get the href link to a surah.
 *
 * @param {string | number} surahIdOrSlug
 * @returns  {string}
 */
export const getSurahNavigationUrl = (surahIdOrSlug: string | number): string =>
  `/${surahIdOrSlug}`;

/**
 * Get the href link to the previous surah.
 *
 * @param {number} chapterNumber
 * @param {boolean} isReadingByRevelationOrder
 * @returns  {string}
 */
export const getPreviousSurahNavigationUrl = (
  chapterNumber: number,
  isReadingByRevelationOrder?: boolean,
): string => {
  if (!isReadingByRevelationOrder) {
    return getSurahNavigationUrl(chapterNumber - 1);
  }
  const currentChapterRevelationOrderIndex = REVELATION_ORDER.indexOf(chapterNumber);
  const previousChapterRevelationOrderIndex = currentChapterRevelationOrderIndex - 1;

  const previousChapterNumberByRevelationOrder =
    REVELATION_ORDER[previousChapterRevelationOrderIndex];

  return getSurahNavigationUrl(previousChapterNumberByRevelationOrder);
};

/**
 * Get the href link to the next surah.
 *
 * @param chapterNumber
 * @param isReadingByRevelationOrder
 * @returns  {string}
 */

export const getNextSurahNavigationUrl = (
  chapterNumber: number,
  isReadingByRevelationOrder?: boolean,
): string => {
  if (!isReadingByRevelationOrder) {
    return getSurahNavigationUrl(chapterNumber + 1);
  }

  const currentChapterRevelationOrderIndex = REVELATION_ORDER.indexOf(chapterNumber);
  const nextChapterRevelationOrderIndex = currentChapterRevelationOrderIndex + 1;

  const nextChapterNumberByRevelationOrder = REVELATION_ORDER[nextChapterRevelationOrderIndex];

  return getSurahNavigationUrl(nextChapterNumberByRevelationOrder);
};

/**
 * Generate the navigation url based on the type.
 *
 * @param {SearchNavigationType} type
 * @param {string | number} key
 * @param {boolean} isKalimatSearch
 * @returns {string}
 */
export const resolveUrlBySearchNavigationType = (
  type: SearchNavigationType,
  key: string | number,
  isKalimatSearch = false,
): string => {
  const stringKey = isKalimatSearch ? searchIdToNavigationKey(type, String(key)) : String(key);
  if (
    type === SearchNavigationType.AYAH ||
    type === SearchNavigationType.TRANSLITERATION ||
    type === SearchNavigationType.TRANSLATION
  ) {
    return getChapterWithStartingVerseUrl(stringKey);
  }
  if (type === SearchNavigationType.JUZ) {
    return getJuzNavigationUrl(stringKey);
  }
  if (type === SearchNavigationType.RUB_EL_HIZB) {
    return getRubNavigationUrl(stringKey);
  }
  if (type === SearchNavigationType.HIZB) {
    return getHizbNavigationUrl(stringKey);
  }
  if (type === SearchNavigationType.PAGE) {
    return getPageNavigationUrl(stringKey);
  }
  if (type === SearchNavigationType.SEARCH_PAGE) {
    return getSearchQueryNavigationUrl(stringKey);
  }
  if (type === SearchNavigationType.RANGE || type === SearchNavigationType.QURAN_RANGE) {
    return getSurahRangeNavigationUrlByVerseKey(stringKey);
  }
  // for the Surah navigation
  return getSurahNavigationUrl(stringKey);
};

/**
 * Get the href link to the search page with a specific query.
 *
 * @param {string} query the search query.
 * @returns {string}
 */
export const getSearchQueryNavigationUrl = (query?: string): string => {
  if (!query) return '/search';

  const params = new URLSearchParams();
  params.set(QueryParam.PAGE, '1');
  params.set(QueryParam.QUERY, query);

  return `/search?${params.toString()}`;
};

/**
 * Get the href link to the info page of a Surah.
 *
 * @param {string} chapterIdOrSlug
 * @param {string} resourceId
 * @returns {string} chapterUrl
 */
export const getSurahInfoNavigationUrl = (chapterIdOrSlug: string, resourceId?: string): string =>
  `/surah/${chapterIdOrSlug}/info${resourceId ? `/${resourceId}` : ''}`;

/**
 * Get href link to the reciter page
 *
 * @param {string} reciterId
 * @returns {string} reciterPageUrl
 */
export const getReciterNavigationUrl = (reciterId: string): string => `/reciters/${reciterId}`;

/**
 * Get href link to an audio recitation page by reciterId and chapterId
 *
 * @param {string} reciterId
 * @param {string} chapterId
 * @returns {string} recitationPageUrl
 */
export const getReciterChapterNavigationUrl = (reciterId: string, chapterId: string) =>
  `/reciters/${reciterId}/${chapterId}`;

/**
 * Get the canonical url. Will include the language in the url except for English.
 *
 * @param {string} lang
 * @param {string} path
 * @returns {string}
 */
export const getCanonicalUrl = (lang: string, path: string): string =>
  `${getBasePath()}${lang === 'en' ? '' : `/${lang}`}${path}`;

export const getProfileNavigationUrl = () => {
  return '/profile';
};

export const getReadingGoalNavigationUrl = (example?: string) =>
  example && example.trim() !== ''
    ? `/reading-goal?example=${encodeURIComponent(example)}`
    : '/reading-goal';
export const getLoginNavigationUrl = (redirectTo?: string) =>
  `/login${redirectTo ? `?${QueryParam.REDIRECT_TO}=${encodeURIComponent(redirectTo)}` : ''}`;

export const getReadingGoalProgressNavigationUrl = () => '/reading-goal/progress';

export const getFirstTimeReadingGuideNavigationUrl = () => '/first-time-reading-guide';

export const getNotesNavigationUrl = () => '/notes-and-reflections';

export const getForgotPasswordNavigationUrl = () => `/forgot-password`;

export const getResetPasswordNavigationUrl = () => `/reset-password`;

export const getVerifyEmailNavigationUrl = (email?: string) =>
  `/verify-email${email ? `?${QueryParam.EMAIL}=${email}` : ''}`;

export const getQuranMediaMakerNavigationUrl = (params?: ParsedUrlQuery) => {
  const baseUrl = '/media';
  return params ? `${baseUrl}?${stringify(params)}` : baseUrl;
};

/**
 * Build a url with query parameters
 *
 * @param {string} baseUrl
 * @param {Record<string, unknown>} params
 * @returns {string}
 */
export const buildUrlWithParams = (baseUrl: string, params: Record<string, unknown>): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    searchParams.set(key, String(value));
  });

  const queryString = searchParams.toString();
  return `${baseUrl}${queryString ? `?${queryString}` : ''}`;
};

/**
 * Update the browser history with the new url.
 * without actually navigating into that url.
 * So it does not trigger re render or page visit on Next.js
 *
 * @param {string} url
 * @param {string} locale
 */
export const fakeNavigate = (url: string, locale: string) => {
  window.history.pushState({}, '', `${locale === 'en' ? '' : `/${locale}`}${url}`);
};

/**
 * Update the URL bar without triggering a re-render or page visit.
 * Uses replaceState to replace the current history entry instead of creating a new one.
 * Use this when you want to update the URL without affecting browser back/forward navigation.
 *
 * @param {string} url
 * @param {string} locale
 */
export const fakeNavigateReplace = (url: string, locale: string) => {
  window.history.replaceState({}, '', `${locale === 'en' ? '' : `/${locale}`}${url}`);
};

/**
 * Scroll to the top of the page.
 */
export const scrollWindowToTop = (): void => {
  if (typeof window !== 'undefined') {
    window.scrollTo(0, 0);
  }
};
