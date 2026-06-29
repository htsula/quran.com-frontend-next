/**
 * Error-monitoring shims.
 *
 * This fork ships without Sentry. These helpers keep their original signatures so the ~18
 * call sites stay unchanged, and fall back to the console (stripped from production builds by
 * `compiler.removeConsole` in next.config.js) — matching the previous Sentry-disabled behavior.
 */

interface LogOptions {
  metadata?: Record<string, unknown>;
  transactionName?: string;
}

/**
 * Log an error. No-op aside from a console fallback in development.
 *
 * @param {unknown} error
 * @param {LogOptions} options
 */
export const logErrorToSentry = (error: unknown, options: LogOptions = {}) => {
  // eslint-disable-next-line no-console
  console.error(error, options);
};

/**
 * Log a message. No-op aside from a console fallback in development.
 *
 * @param {string} message
 * @param {LogOptions} options
 */
export const logMessageToSentry = (message: string, options: LogOptions = {}) => {
  // eslint-disable-next-line no-console
  console.log(message, options);
};

/**
 * Add a breadcrumb. No-op aside from a console fallback in development.
 *
 * @param {string} category Logical category e.g. 'auth.redirect'
 * @param {string} message Short description
 * @param {Record<string, unknown>} data Additional context data
 */
export const addSentryBreadcrumb = (
  category: string,
  message: string,
  data?: Record<string, unknown>,
) => {
  // eslint-disable-next-line no-console
  console.debug(`[breadcrumb] ${category}: ${message}`, data);
};
