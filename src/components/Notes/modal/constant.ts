/**
 * Default deduping interval for SWR cache invalidation in milliseconds.
 * Determines how long identical requests are deduped to prevent unnecessary API calls.
 */
export const DEFAULT_DEDUPING_INTERVAL = 1 * 1000;

/**
 * Timeout delay in milliseconds after closing the notes modal before triggering action callbacks.
 * Provides sufficient time for modal close animations to complete smoothly.
 */
export const CLOSE_POPOVER_AFTER_MS = 150;
