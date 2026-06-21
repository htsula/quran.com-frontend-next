/**
 * Manually-curated "linked verses" for this fork.
 *
 * The upstream Quran.com `related_verses` API is not exposed on any public
 * gateway (it 404s on QF v4, the open CDN, and api.quran.com), so related
 * verses are sourced from here instead. Each entry is a GROUP of mutually
 * linked verses: for any verse in a group, its related verses are the other
 * members of that group.
 *
 * Consumed in two places:
 *  - the proxy (`src/pages/api/proxy/[...path].ts`) serves
 *    `GET /related_verses/by_key/{verseKey}` from this data, and
 *  - the "Related verses" tab visibility gate reads {@link verseHasRelatedVerses}
 *    (study mode + the translation-view bottom actions).
 */
export const RELATED_VERSE_GROUPS: string[][] = [
  ['1:1', '27:30', '16:98', '96:1'],
  ['1:2', '6:1', '18:1', '34:1', '35:1', '26:23', '26:24', '37:182', '10:10'],
  ['1:3', '7:156', '39:53', '6:12', '17:110', '15:49'],
  [
    '1:4',
    '2:281',
    '3:30',
    '3:106',
    '6:16',
    '6:73',
    '22:56',
    '82:15',
    '82:16',
    '82:17',
    '82:18',
    '82:19',
    '40:16',
    '70:26',
    '56:56',
    '99:6',
    '99:7',
    '99:8',
  ],
  ['1:5', '25:58', '27:62', '10:107', '2:45', '3:173', '51:56'],
  ['1:6', '3:101', '2:2', '2:5', '2:142', '6:153', '48:2', '17:9', '4:68', '36:61', '26:52'],
  ['1:7', '4:69'],
];

/**
 * verseKey -> related verse keys (the other members of every group it belongs
 * to, de-duplicated, with the verse itself excluded).
 */
export const RELATED_VERSES_MAP: Record<string, string[]> = (() => {
  const map: Record<string, string[]> = {};
  RELATED_VERSE_GROUPS.forEach((group) => {
    group.forEach((verseKey) => {
      const existing = map[verseKey] ?? [];
      const others = group.filter((key) => key !== verseKey && !existing.includes(key));
      map[verseKey] = [...existing, ...others];
    });
  });
  return map;
})();

/**
 * Get the curated related verse keys for a verse.
 *
 * @param {string} verseKey e.g. "1:1"
 * @returns {string[]} related verse keys (empty when none are curated)
 */
export const getRelatedVerseKeys = (verseKey: string): string[] =>
  RELATED_VERSES_MAP[verseKey] ?? [];

/**
 * Whether a verse has any curated related verses. Drives the tab's visibility.
 *
 * @param {string} verseKey e.g. "1:1"
 * @returns {boolean}
 */
export const verseHasRelatedVerses = (verseKey: string): boolean =>
  getRelatedVerseKeys(verseKey).length > 0;
