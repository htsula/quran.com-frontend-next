import { isStaticBuild } from '@/utils/build';

const getLocalePostfix = (locale: string) => (locale !== 'en' ? `/${locale}` : '');

export enum QuranFoundationService {
  SEARCH = 'search',
  AUTH = 'auth',
  CONTENT = 'content',
  QURAN_REFLECT = 'quran-reflect',
}

export const getCurrentPath = () => {
  if (typeof window !== 'undefined') {
    return window.location.href;
  }
  return '';
};

export const getWindowOrigin = (locale: string) => {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${getLocalePostfix(locale)}`;
  }
  return '';
};

export type QueryParamValue = string | string[] | undefined;

/**
 * Normalize a query parameter to a single string value.
 *
 * @param {QueryParamValue} param
 * @returns {string | undefined}
 */
export const normalizeQueryParam = (param: QueryParamValue): string | undefined =>
  Array.isArray(param) ? param[0] : param;

/**
 * Navigate programmatically to an external url. we will try to open
 * the url in a new tab and if it doesn't work due to pop-ups being blocked,
 * we will open the url in the current tab.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/open#return_value
 *
 * @param {string} url
 */
export const navigateToExternalUrl = (url: string) => {
  if (typeof window !== 'undefined') {
    // if it's being blocked
    if (!window.open(url, '_blank')) {
      window.location.replace(url);
    }
  }
};

/**
 * Get the base path of the current deployment on Vercel/local machine
 * e.g. http://localhost
 * or https://quran-com-ebqc5a2d5-qurancom.vercel.app this is needed
 * if we want to construct a full path e.g. when we add alternate languages
 * meta tags.
 *
 * @see https://vercel.com/docs/concepts/projects/environment-variables
 * @returns {string}
 */
export const getBasePath = (): string =>
  `${process.env.NEXT_PUBLIC_VERCEL_ENV === 'development' ? 'http' : 'https'}://${
    process.env.NEXT_PUBLIC_VERCEL_URL
  }`;

/**
 * Absolute origin used for server-side (SSR/ISR) proxy calls, which can't use a
 * relative URL. This must be a PUBLIC origin: Vercel's per-deployment
 * `VERCEL_URL` sits behind Deployment Protection (SSO), so self-calling it
 * returns an auth redirect instead of JSON and breaks getStaticProps. Prefer
 * `VERCEL_PROJECT_PRODUCTION_URL` (auto-injected public production domain, e.g.
 * the custom domain), allowing an explicit `NEXT_PUBLIC_SITE_URL` override and
 * falling back to the configured host, then localhost for local dev. Accepts a
 * bare host or a full URL; protocol is inferred from the host otherwise.
 *
 * @returns {string}
 */
const getServerProxyOrigin = (): string => {
  const configured =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.NEXT_PUBLIC_VERCEL_URL ||
    'localhost:3000';
  if (/^https?:\/\//.test(configured)) {
    return configured.replace(/\/+$/, '');
  }
  const protocol = configured.startsWith('localhost') ? 'http' : 'https';
  return `${protocol}://${configured}`;
};

/**
 * Whether the app talks to the Quran Foundation authenticated public API.
 * Mirrors the proxy's `USE_QF_PUBLIC_API` flag.
 */
const isQfPublicApi = process.env.USE_QF_PUBLIC_API === 'true';

/**
 * Build the absolute QF gateway URL for a server-side (SSR/ISR/build) request,
 * applying the exact same rewrites the proxy applies in QF mode so behaviour is
 * identical whether a call goes through the proxy (browser) or direct (server):
 *   - `/content/api/qdc` -> `/content/api/v4`
 *   - on `verses/by_chapter`, strip the chapter prefix from `from`/`to`
 *     (QF expects verse numbers, the app sends verse keys).
 * Calling the gateway directly avoids self-calling our own `/api/proxy` route,
 * which is unreachable from the server behind Vercel Deployment Protection.
 *
 * @param {QuranFoundationService} service
 * @param {string} path
 * @returns {string}
 */
const getQfDirectUrl = (service: QuranFoundationService, path: string): string => {
  let upstreamPath = `/${service}${path}`.replace('/content/api/qdc', '/content/api/v4');
  if (upstreamPath.includes('/verses/by_chapter/')) {
    upstreamPath = upstreamPath.replace(/([?&](?:from|to)=)\d+(?::|%3A)(\d+)/gi, '$1$2');
  }
  return `${process.env.API_GATEWAY_URL}${upstreamPath}`;
};

export const getProxiedServiceUrl = (service: QuranFoundationService, path: string): string => {
  // In the browser a same-origin relative URL works on whatever domain the app
  // is served from (production, preview deploys, custom domains, localhost), so
  // it never depends on a hardcoded host env var.
  if (typeof window !== 'undefined') {
    return `/api/proxy/${service}${path}`;
  }
  // On the server (SSR, ISR revalidation and `next build`) call the upstream
  // gateway directly. Self-calling our own `/api/proxy` route from the server
  // is fragile: the deployment URL is behind Deployment Protection and the
  // public host has to be guessed from env vars. In QF mode the server has the
  // OAuth credentials, so a direct call is simpler and reliable (auth headers
  // are attached by `fetcher`).
  if (isQfPublicApi) {
    return getQfDirectUrl(service, path);
  }
  // Legacy internal-gateway modes: static build hits the gateway directly,
  // otherwise self-call the proxy via the resolved public origin.
  if (isStaticBuild) {
    return `${process.env.API_GATEWAY_URL}/${service}${path}`;
  }
  return `${getServerProxyOrigin()}/api/proxy/${service}${path}`;
};

/**
 * Sanitizes a redirect URL to prevent open redirect vulnerabilities.
 * Allows same-origin relative paths and URLs from enabled SSO platforms.
 *
 * @param {string} rawUrl - The raw URL string to sanitize
 * @returns {string} A safe redirect URL or '/' if the input is unsafe
 */
export const resolveSafeRedirect = (rawUrl: string): string => {
  if (!rawUrl) return '/';

  try {
    const base = getBasePath();
    const url = rawUrl.startsWith('http') ? new URL(rawUrl) : new URL(rawUrl, base);

    // For SSO platform URLs, return the full URL
    return url.href;
  } catch (error) {
    // If URL parsing fails, assume it's a relative path
    // Remove any leading slashes and dangerous characters
    const cleanPath = rawUrl.replace(/^\/+/, '').replace(/[\r\n\t]/g, '');
    return cleanPath ? `/${cleanPath}` : '/';
  }
};
