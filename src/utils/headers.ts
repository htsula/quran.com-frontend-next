import { NextApiRequest } from 'next';

import generateSignature from './auth/signature';
import { isStaticBuild } from './build';

export const X_AUTH_SIGNATURE = 'x-auth-signature';
export const X_TIMESTAMP = 'x-timestamp';
export const X_PROXY_SIGNATURE = 'x-proxy-signature';
export const X_PROXY_TIMESTAMP = 'x-proxy-timestamp';
export const X_INTERNAL_CLIENT = 'x-internal-client';

export const getAdditionalHeaders = (req: NextApiRequest) => {
  let additionalHeaders = {};

  if (isStaticBuild && process.env.SIGNATURE_TOKEN) {
    const { signature, timestamp } = generateSignature(req, req.url, process.env.SIGNATURE_TOKEN);
    additionalHeaders = {
      [X_AUTH_SIGNATURE]: signature,
      [X_TIMESTAMP]: timestamp,
      [X_INTERNAL_CLIENT]: process.env.INTERNAL_CLIENT_ID,
    };
  }

  // The proxy signature only matters when the server self-calls our own
  // /api/proxy route (which verifies it). In QF public-API mode the server calls
  // the QF gateway directly with OAuth and the proxy skips signature verification,
  // so there is nothing to sign. Critically, when PROXY_SIGNATURE_TOKEN is unset
  // (e.g. on Vercel — it's a gitignored var and this fork uses OAuth) crypto-js's
  // HmacSHA512 throws on the undefined key, which crashed EVERY server-side fetch
  // and made chapter pages 404. Only sign when a token is actually configured.
  if (typeof window === 'undefined' && process.env.PROXY_SIGNATURE_TOKEN) {
    const { signature: proxySignature, timestamp: proxyTimestamp } = generateSignature(
      req,
      req.url,
      process.env.PROXY_SIGNATURE_TOKEN,
    );
    additionalHeaders = {
      ...additionalHeaders,
      [X_PROXY_SIGNATURE]: proxySignature,
      [X_PROXY_TIMESTAMP]: proxyTimestamp,
    };
  }

  return additionalHeaders;
};
