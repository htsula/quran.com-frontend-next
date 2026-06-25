/**
 * Server-only helper for the Quran Foundation authenticated public API.
 *
 * Caches an OAuth2 client-credentials access token (valid ~3600s, no refresh
 * token) and renews it shortly before expiry. Used both by the in-app proxy
 * route and by server-side (SSR/ISR/build) data fetching, which calls the QF
 * gateway directly instead of self-calling the proxy.
 *
 * This module reads `QF_CLIENT_SECRET` and uses `Buffer`, so it must only be
 * imported in server contexts (it's pulled in behind `typeof window` guards /
 * dynamic imports).
 */
let cachedQfToken: { token: string; expiresAt: number } | null = null;

/**
 * Get a valid QF client-credentials access token, fetching a new one when the
 * cache is empty or close to expiry.
 *
 * @returns {Promise<string>}
 */
// eslint-disable-next-line import/prefer-default-export
export const getQfAccessToken = async (): Promise<string> => {
  const now = Date.now();
  if (cachedQfToken && cachedQfToken.expiresAt > now + 60_000) {
    return cachedQfToken.token;
  }
  const basic = Buffer.from(`${process.env.QF_CLIENT_ID}:${process.env.QF_CLIENT_SECRET}`).toString(
    'base64',
  );
  const res = await fetch(`${process.env.QF_OAUTH_BASE_URL}/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials&scope=content',
  });
  if (!res.ok) {
    throw new Error(`QF token request failed with status ${res.status}`);
  }
  const data = await res.json();
  cachedQfToken = {
    token: data.access_token,
    expiresAt: now + Number(data.expires_in || 3600) * 1000,
  };
  return cachedQfToken.token;
};
