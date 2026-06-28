/* eslint-disable max-lines */
import stringify from '../qs-stringify';

import GetNoteByAttachedEntityParams from './types/GetNoteByAttachedEntityParams';
import GetAllNotesQueryParams from './types/Note/GetAllNotesQueryParams';

import { ActivityDayType, FilterActivityDaysParams } from '@/types/auth/ActivityDay';
import { EstimateGoalRequest, GoalCategory } from '@/types/auth/Goal';
import { StreakWithMetadataParams } from '@/types/auth/Streak';
import { MediaType } from '@/types/Media/GenerateMediaFileRequest';
import { Mushaf } from '@/types/QuranReader';
import { getProxiedServiceUrl, QuranFoundationService } from '@/utils/url';
import { PinnedItemTargetType } from 'types/PinnedItem';

export const makeUrl = (url: string, parameters?: Record<string, unknown>): string => {
  if (!parameters) {
    return getProxiedServiceUrl(QuranFoundationService.AUTH, `/${url}`);
  }
  return getProxiedServiceUrl(QuranFoundationService.AUTH, `/${url}${`?${stringify(parameters)}`}`);
};

export const makeUserProfileUrl = (): string => makeUrl('users/profile');

export const makeUserFeatureFlagsUrl = (): string => makeUrl('feature-flags');

export const makeUserConsentsUrl = (): string => makeUrl('consent/userConsents');

export const makeCompleteSignupUrl = (): string => makeUrl('users/completeSignup');

export const makeCompleteAnnouncementUrl = (): string => makeUrl('users/completeAnnouncement');

export const makeDeleteAccountUrl = (): string => makeUrl('users/deleteAccount');

export const makeSyncLocalDataUrl = (): string => makeUrl('users/syncLocalData');

export const makeVerificationCodeUrl = (): string => makeUrl('users/verificationCode');

export const makeUpdateUserProfileUrl = (): string => makeUrl('users/update');

export const makeUpdatePasswordUrl = (): string => makeUrl('users/updatePassword');

export const makeForgotPasswordUrl = (): string => makeUrl('users/forgetPassword');

export const makeResetPasswordUrl = (): string => makeUrl('users/resetPassword');

export const makeSendMagicLinkUrl = (redirect?: string): string =>
  makeUrl('auth/magiclogin', redirect ? { redirect } : undefined);

export const makeGoogleLoginUrl = (redirect?: string): string =>
  makeUrl('auth/google', redirect ? { redirect } : undefined);

export const makeFacebookLoginUrl = (redirect?: string): string =>
  makeUrl('auth/facebook', redirect ? { redirect } : undefined);

export const makeAppleLoginUrl = (redirect?: string): string =>
  makeUrl('auth/apple', redirect ? { redirect } : undefined);

export const makeSignInUrl = (): string => makeUrl('users/login');

export const makeSignUpUrl = (): string => makeUrl('users/signup');

export const makeGetNotesByVerseUrl = (verseKey: string) => makeUrl(`notes/by-verse/${verseKey}`);

export const makeGetNoteByIdUrl = (id: string) => makeUrl(`notes/${id}`);

export const makeCountNotesWithinRangeUrl = (startVerseKey: string, endVerseKey: string) =>
  makeUrl(`notes/count-within-range`, { from: startVerseKey, to: endVerseKey });

export const makeNotesUrl = (params?: GetAllNotesQueryParams) => makeUrl('notes', params as any);

export const makeGetNoteByAttachedEntityUrl = (queryParams: GetNoteByAttachedEntityParams) =>
  makeUrl(`notes`, queryParams);

export const makeDeleteOrUpdateNoteUrl = (id: string) => makeUrl(`notes/${id}`);

export const makeReadingSessionsUrl = () => makeUrl('reading-sessions');

export const makeActivityDaysUrl = (params: { mushafId?: Mushaf; type: ActivityDayType }) =>
  makeUrl('activity-days', params);

export const makeFilterActivityDaysUrl = (params: FilterActivityDaysParams) =>
  makeUrl('activity-days/filter', params);

export const makeEstimateRangesReadingTimeUrl = (params: { ranges: string[] }) =>
  makeUrl('activity-days/estimate-reading-time', { ranges: params.ranges.join(',') });

export const makeGoalUrl = (params: { mushafId?: Mushaf; type: GoalCategory }) =>
  makeUrl('goal', params);

export const makeReadingGoalCountUrl = (params: { type: GoalCategory }) =>
  makeUrl('goal/count', params);

export const makeReadingGoalStatusUrl = (params: { type: GoalCategory }) =>
  makeUrl('goal/status', params);

export const makeEstimateReadingGoalUrl = (data: EstimateGoalRequest) =>
  makeUrl('goal/estimate', data);

export const makeStreakUrl = (params?: StreakWithMetadataParams) => makeUrl('streak', params);

export const makeReadingGoalProgressUrl = (mushafId: Mushaf) =>
  makeUrl('goal/status', {
    mushafId,
  });

export const makeUserPreferencesUrl = (mushafId?: Mushaf) =>
  makeUrl(
    'preferences',
    mushafId && {
      mushafId,
    },
  );

export const makeUserBulkPreferencesUrl = (mushafId: Mushaf) =>
  makeUrl('preferences/bulk', {
    mushafId,
  });

export const makeLogoutUrl = () => makeUrl('auth/logout');

export const makeRefreshTokenUrl = () => makeUrl('tokens/refreshToken');

export const makeRedirectTokenUrl = (token: string) => makeUrl('tokens/redirectToken', { token });

export const makeGenerateMediaFileUrl = () => makeUrl('media/generate');

export const makeGetMediaFileProgressUrl = (renderId: string) =>
  makeUrl(`media/progress/${renderId}`);

export const makeGetMonthlyMediaFilesCountUrl = (type: MediaType) =>
  makeUrl(`media/monthly-count`, { type });

/**
 * Compose the url for shorten-url API.
 *
 * @returns {string}
 */
export const makeShortenUrlUrl = (): string => makeUrl('shorten-url');

/**
 * Compose the url for get full URL by id.
 *
 * @param {string} id
 * @returns {string}
 */
export const makeFullUrlById = (id: string): string => makeUrl(`shorten-url/${id}`);

export const makeGetUserQuranProgramUrl = (programId: string): string =>
  makeUrl(`quran-reading-program/${programId}`);

export const makeEnrollUserInQuranProgramUrl = (): string =>
  makeUrl('quran-reading-program/enroll');

export const makeGetQuranicWeekUrl = (programId: string, weekId: string): string =>
  makeUrl(`quran-reading-program/week/${programId}/${weekId}`);

/**
 * Compose the URL for the translation feedback API endpoint.
 * This endpoint is used for submitting user feedback about translations.
 *
 * @returns {string} The complete URL for the translation feedback API
 */
export const makeTranslationFeedbackUrl = (): string => makeUrl('translation-feedback');

export const makeMapUrl = (): string => makeUrl('mushaf/map');

// Pinned Items
export const PINNED_ITEMS_CACHE_PATHS = {
  LIST: 'pinned-items?',
} as const;

export const makePinnedItemsUrl = (targetType?: PinnedItemTargetType): string =>
  makeUrl('pinned-items', targetType ? { targetType } : undefined);

export const makeAddPinnedItemUrl = (): string => makeUrl('pinned-items');

export const makeSyncPinnedItemsUrl = (): string => makeUrl('pinned-items/sync');

export const makeClearPinnedItemsUrl = (): string => makeUrl('pinned-items/clear');

export const makeDeletePinnedItemUrl = (pinnedItemId: string): string =>
  makeUrl(`pinned-items/${pinnedItemId}`);

export const makeBulkDeletePinnedItemsUrl = (): string => makeUrl('pinned-items/bulk');
