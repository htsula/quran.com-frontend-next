// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Regression test for the QF public-API server-side `by_chapter` bug: server
 * calls go directly to the QF gateway, where verses/by_chapter expects from/to
 * as verse NUMBERS (from=1&to=3). The app builds them as verse KEYS
 * (from=103:1&to=103:3); sent as-is QF returns ZERO verses and the reader page
 * crashes. makeUrl must rewrite keys -> numbers on the final URL.
 *
 * Runs in the `node` environment so `typeof window === 'undefined'` (server).
 */
describe('makeUrl - QF server-side verses/by_chapter', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('USE_QF_PUBLIC_API', 'true');
    vi.stubEnv('API_GATEWAY_URL', 'https://apis.quran.foundation');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('rewrites from/to verse keys to verse numbers for by_chapter', async () => {
    const { makeUrl } = await import('@/utils/api');
    const url = makeUrl('/verses/by_chapter/103', { from: '103:1', to: '103:3', perPage: 'all' });

    expect(url).toContain('https://apis.quran.foundation/content/api/v4/verses/by_chapter/103');
    expect(url).toMatch(/[?&]from=1(&|$)/);
    expect(url).toMatch(/[?&]to=3(&|$)/);
    // the chapter-prefixed keys must be gone (in either raw or url-encoded form)
    expect(url).not.toContain('103:1');
    expect(url).not.toContain('103%3A1');
  });

  it('does not touch non-by_chapter endpoints', async () => {
    const { makeUrl } = await import('@/utils/api');
    const url = makeUrl('/verses/by_page/1', { from: '1:1', to: '1:7' });

    // by_page keeps verse keys (QF honors them there); no rewrite expected
    expect(url).toMatch(/from=1(:|%3A)1/);
  });
});
