/* eslint-disable max-lines */
/* eslint-disable no-param-reassign */
import { EventEmitter } from 'events';

import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware';
import { NextApiRequest, NextApiResponse } from 'next';

import { getRelatedVerseKeys } from '@/data/relatedVerses';
import generateSignature from '@/utils/auth/signature';
import {
  X_AUTH_SIGNATURE,
  X_INTERNAL_CLIENT,
  X_TIMESTAMP,
  X_PROXY_SIGNATURE,
  X_PROXY_TIMESTAMP,
} from '@/utils/headers';

const ERROR_MESSAGES = {
  PROXY_ERROR: 'Proxy error',
  PROXY_HANDLER_ERROR: 'Proxy handler error',
  FORBIDDEN: 'Forbidden',
};

const ALLOWED_DOMAINS = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((domain) => domain.trim());

// This line increases the default maximum number of event listeners for the EventEmitter to a better number like 20.
// It is necessary to prevent memory leak warnings when multiple listeners are added,
// which can occur in a proxy setup like this where multiple requests are handled concurrently.
EventEmitter.defaultMaxListeners = Number(process.env.PROXY_DEFAULT_MAX_LISTENERS) || 100;

// Open-CDN dev mode: target https://api.qurancdn.com (no service prefix, no auth).
const stripServicePrefix = process.env.PROXY_STRIP_SERVICE_PREFIX === 'true';

// Quran Foundation authenticated public API mode (OAuth2 client-credentials).
// Targets the QF gateway (apis[-prelive].quran.foundation): content paths are
// rewritten /api/qdc -> /api/v4 and each request carries an OAuth bearer token
// (x-auth-token) + client id (x-client-id) instead of the legacy HMAC signature.
const QF_PUBLIC_API = process.env.USE_QF_PUBLIC_API === 'true';

// Headers the upstream WAF/gateway rejects when forwarded from localhost.
const STRIPPED_FORWARD_HEADERS = [
  'origin',
  'referer',
  'x-forwarded-host',
  'x-forwarded-for',
  'x-forwarded-port',
  'x-forwarded-proto',
  'x-invoke-path',
  'x-invoke-query',
  'x-invoke-output',
  'x-middleware-invoke',
];

// Cache the client-credentials access token in memory (valid ~3600s, no refresh
// token) and renew shortly before expiry.
let cachedQfToken: { token: string; expiresAt: number } | null = null;

const getQfAccessToken = async (): Promise<string> => {
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

const isOriginAllowed = (origin: string | undefined): boolean => {
  if (!origin) return false;
  const url = new URL(origin);
  const { hostname } = url;
  return ALLOWED_DOMAINS.includes(hostname);
};

const handleProxyReq = (proxyReq, req, res) => {
  // In the dev modes (open CDN / QF public API) the server-side proxy-signature
  // handshake doesn't round-trip locally, so skip it.
  const skipProxySignature = stripServicePrefix || QF_PUBLIC_API;
  const origin = req.headers.origin || req.headers.referer || '';
  if (origin) {
    if (!isOriginAllowed(origin)) {
      res.status(403).send({ error: ERROR_MESSAGES.FORBIDDEN });
      return;
    }
  } else if (!skipProxySignature && !verifySignature(req, res)) {
    return;
  }

  attachCookies(proxyReq, req);

  if (QF_PUBLIC_API) {
    // Authenticated QF gateway: OAuth bearer token (fetched in the handler) + client id.
    proxyReq.setHeader('x-auth-token', (req as any).qfAccessToken);
    proxyReq.setHeader('x-client-id', process.env.QF_CLIENT_ID as string);
  } else {
    attachSignatureHeaders(proxyReq, req);
  }

  // Strip the browser Origin/Referer and Next.js's injected forwarding headers
  // (notably x-forwarded-host: localhost:3000) so the upstream WAF doesn't 403
  // the request. Our allowlist/signature check above has already validated the
  // caller.
  if (stripServicePrefix || QF_PUBLIC_API) {
    STRIPPED_FORWARD_HEADERS.forEach((header) => proxyReq.removeHeader(header));
  }

  fixRequestBody(proxyReq, req);
};

const verifySignature = (req, res) => {
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const requestUrl = `${protocol}://${req.headers.host}/api/proxy${req.url}`;
  const timestampHeader = req.headers[X_PROXY_TIMESTAMP] as string;
  const { signature } = generateSignature(
    req,
    requestUrl,
    process.env.PROXY_SIGNATURE_TOKEN as string,
    timestampHeader,
  );

  if (req.headers[X_PROXY_SIGNATURE] !== signature) {
    res.status(403).send({ error: ERROR_MESSAGES.FORBIDDEN });
    return false;
  }
  return true;
};

const attachCookies = (proxyReq, req) => {
  if (req.headers.cookie) {
    proxyReq.setHeader('Cookie', req.headers.cookie);
  }
};

const attachSignatureHeaders = (proxyReq, req) => {
  const requestUrl = `${process.env.API_GATEWAY_URL}${req.url}`;
  const { signature, timestamp } = generateSignature(
    req,
    requestUrl,
    process.env.SIGNATURE_TOKEN as string,
  );

  proxyReq.setHeader(X_AUTH_SIGNATURE, signature);
  proxyReq.setHeader(X_TIMESTAMP, timestamp);
  proxyReq.setHeader(X_INTERNAL_CLIENT, process.env.INTERNAL_CLIENT_ID);
};

// QF v4's `verses/by_chapter` expects from/to as verse NUMBERS within the
// chapter (e.g. from=1&to=5), but the app sends verse KEYS (from=2:1&to=2:5)
// like the legacy/CDN API. Keys make QF return a single wrong verse, so only
// one verse loads per chapter. Strip the chapter prefix from from/to on
// by_chapter requests (handles both literal `:` and url-encoded `%3A`).
const stripChapterFromVerseRange = (path: string): string =>
  path.includes('/verses/by_chapter/')
    ? path.replace(/([?&](?:from|to)=)\d+(?::|%3A)(\d+)/gi, '$1$2')
    : path;

// Path rewrites per mode:
// - QF public API: keep the `/content` service prefix but map the app's
//   `/api/qdc` path onto the public `/api/v4` API, e.g.
//   /api/proxy/content/api/qdc/verses -> /content/api/v4/verses
//   (plus the by_chapter from/to verse-number fix above).
// - Open CDN (stripServicePrefix): drop the `/content|/auth|/search|/quran-reflect`
//   prefix that the open CDN host doesn't use.
// - Default (real internal gateway): just drop `/api/proxy`.
/* eslint-disable @typescript-eslint/naming-convention */
let pathRewrite: Record<string, string> | ((path: string) => string) = {
  '^/api/proxy': '',
};
if (QF_PUBLIC_API) {
  pathRewrite = (path: string): string =>
    stripChapterFromVerseRange(
      path.replace('/api/proxy/content/api/qdc', '/content/api/v4').replace(/^\/api\/proxy/, ''),
    );
} else if (stripServicePrefix) {
  pathRewrite = {
    '^/api/proxy/(content|auth|search|quran-reflect)': '',
    '^/api/proxy': '',
  };
}
/* eslint-enable @typescript-eslint/naming-convention */

const apiProxy = createProxyMiddleware<NextApiRequest, NextApiResponse>({
  target: process.env.API_GATEWAY_URL,
  changeOrigin: true,
  pathRewrite,
  secure: process.env.NEXT_PUBLIC_VERCEL_ENV === 'production', // Disable SSL verification to avoid UNABLE_TO_VERIFY_LEAF_SIGNATURE error for dev
  logger: console,

  on: {
    proxyReq: handleProxyReq,

    proxyRes: (proxyRes, req, res) => {
      // Set cookies from the proxy response to the original response
      const proxyCookies = proxyRes.headers['set-cookie'];
      if (proxyCookies) {
        res.setHeader('Set-Cookie', proxyCookies);
      }

      // Prevent intermediate proxy caching (Traefik, nginx, etc.)
      // This ensures fresh data flows through from the API Gateway's CF cache
      // Note: This does NOT affect CF caching at the API Gateway level
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    },

    error: (err, req, res) => {
      // BUGFIX: The original code was calling res.end() with a function that returns an object:
      // res.end(() => ({ error: ERROR_MESSAGES.PROXY_ERROR, message: err.message }))
      //
      // This caused a TypeError because res.end() expects a string, Buffer, or ArrayBuffer,
      // not a function. The function was being passed as the response body, which caused:
      // "The 'string' argument must be of type string... Received type function"
      //
      // The fix is to properly send JSON responses based on the response object type:

      // Check if res is a NextApiResponse (has status method) or a Socket
      if ('status' in res && typeof res.status === 'function') {
        res.status(500).json({ error: ERROR_MESSAGES.PROXY_ERROR, message: err.message });
      } else {
        // For Socket or other types, just end the response with a stringified error
        res.end(JSON.stringify({ error: ERROR_MESSAGES.PROXY_ERROR, message: err.message }));
      }
    },
  },
});

// Maximum request body size for API routes, aligned with backend limit for profile picture uploads
const API_BODY_SIZE_LIMIT = process.env.API_BODY_SIZE_LIMIT || '8mb';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: API_BODY_SIZE_LIMIT,
    },
  },
};

// The public Quran.com gateways don't serve `related_verses` (they 404), so
// answer it from the local curated data instead of forwarding upstream.
const RELATED_VERSES_BY_KEY_REGEX = /\/related_verses\/by_key\/([^/?#]+)/;

const tryServeRelatedVerses = (req: NextApiRequest, res: NextApiResponse): boolean => {
  const match = req.url?.match(RELATED_VERSES_BY_KEY_REGEX);
  if (!match) return false;

  const verseKey = decodeURIComponent(match[1]);
  const page = Number(
    new URL(req.url as string, 'http://localhost').searchParams.get('page') || '1',
  );
  const relatedKeys = getRelatedVerseKeys(verseKey);
  // Everything fits on one page; later pages are empty so infinite scroll stops.
  const pageKeys = page > 1 ? [] : relatedKeys;

  // snake_case mirrors the upstream API; the client `fetcher` camelizes it.
  /* eslint-disable @typescript-eslint/naming-convention */
  res.status(200).json({
    related_verses: pageKeys.map((key) => {
      const [chapter, verse] = key.split(':').map(Number);
      const id = chapter * 1000 + verse;
      return { id, verse_id: id, verse_key: key, relation: 'linked', chapter_name: '' };
    }),
    pagination: {
      per_page: relatedKeys.length || 1,
      current_page: page,
      next_page: null,
      total_records: relatedKeys.length,
      total_pages: 1,
    },
  });
  /* eslint-enable @typescript-eslint/naming-convention */
  return true;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (tryServeRelatedVerses(req, res)) return;
  if (QF_PUBLIC_API) {
    try {
      // Resolve a valid token before proxying so it's available synchronously
      // when proxyReq attaches the x-auth-token header.
      (req as any).qfAccessToken = await getQfAccessToken();
    } catch (err) {
      res.status(502).json({ error: 'QF auth failed', message: (err as Error).message });
      return;
    }
  }
  apiProxy(req, res, (err) => {
    if (err) {
      res.status(500).json({ error: ERROR_MESSAGES.PROXY_HANDLER_ERROR, message: err.message });
    }
  });
}
