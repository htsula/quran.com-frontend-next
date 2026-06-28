/* eslint-disable max-lines */
import { NextApiRequest } from 'next';
import Router from 'next/router';
import { configureRefreshFetch } from 'refresh-fetch';

import { getTimezone } from '../datetime';
import { prepareGenerateMediaFileRequestData } from '../media/utils';

import { BANNED_USER_ERROR_ID } from './constants';
import { AuthErrorCodes } from './errors';
import { MappedPage, MappedVerse, MapMushafParams } from './types/MushafMapping';
import GetAllNotesQueryParams from './types/Note/GetAllNotesQueryParams';
import { ShortenUrlResponse } from './types/ShortenUrl';

import { fetcher } from '@/api';
import { addSentryBreadcrumb, logErrorToSentry } from '@/lib/sentry';
import {
  ActivityDay,
  ActivityDayType,
  FilterActivityDaysParams,
  QuranActivityDay,
  UpdateActivityDayBody,
  UpdateActivityDayParams,
  UpdateLessonActivityDayBody,
  UpdateQuranActivityDayBody,
  UpdateQuranReadingProgramActivityDayBody,
} from '@/types/auth/ActivityDay';
import ConsentType from '@/types/auth/ConsentType';
import { CreateGoalRequest, Goal, GoalCategory, UpdateGoalRequest } from '@/types/auth/Goal';
import { Note } from '@/types/auth/Note';
import QuranProgramWeekResponse from '@/types/auth/QuranProgramWeekResponse';
import { Response } from '@/types/auth/Response';
import { StreakWithMetadataParams, StreakWithUserMetadata } from '@/types/auth/Streak';
import UserProgramResponse from '@/types/auth/UserProgramResponse';
import GenerateMediaFileRequest, { MediaType } from '@/types/Media/GenerateMediaFileRequest';
import MediaRenderError from '@/types/Media/MediaRenderError';
import { Mushaf } from '@/types/QuranReader';
import {
  makeActivityDaysUrl,
  makeCompleteAnnouncementUrl,
  makeCompleteSignupUrl,
  makeCountNotesWithinRangeUrl,
  makeDeleteAccountUrl,
  makeDeleteOrUpdateNoteUrl,
  makeEnrollUserInQuranProgramUrl,
  makeEstimateRangesReadingTimeUrl,
  makeFilterActivityDaysUrl,
  makeFullUrlById,
  makeGenerateMediaFileUrl,
  makeGetMediaFileProgressUrl,
  makeGetMonthlyMediaFilesCountUrl,
  makeGetNoteByIdUrl,
  makeGetNotesByVerseUrl,
  makeGetQuranicWeekUrl,
  makeGetUserQuranProgramUrl,
  makeGoalUrl,
  makeLogoutUrl,
  makeNotesUrl,
  makeReadingSessionsUrl,
  makeRefreshTokenUrl,
  makeShortenUrlUrl,
  makeStreakUrl,
  makeSyncLocalDataUrl,
  makeUserBulkPreferencesUrl,
  makeUserConsentsUrl,
  makeUserFeatureFlagsUrl,
  makeUserPreferencesUrl,
  makeUserProfileUrl,
  makeVerificationCodeUrl,
  makeMapUrl,
  makeTranslationFeedbackUrl,
  makeAddPinnedItemUrl,
  makePinnedItemsUrl,
  makeSyncPinnedItemsUrl,
  makeBulkDeletePinnedItemsUrl,
  makeClearPinnedItemsUrl,
  makeDeletePinnedItemUrl,
} from '@/utils/auth/apiPaths';
import { getAdditionalHeaders } from '@/utils/headers';
import CompleteAnnouncementRequest from 'types/auth/CompleteAnnouncementRequest';
import PreferenceGroup from 'types/auth/PreferenceGroup';
import RefreshToken from 'types/auth/RefreshToken';
import { SyncLocalDataPayload } from 'types/auth/SyncDataType';
import SyncUserLocalDataResponse from 'types/auth/SyncUserLocalDataResponse';
import UserPreferencesResponse from 'types/auth/UserPreferencesResponse';
import UserProfile from 'types/auth/UserProfile';
import CompleteSignupRequest from 'types/CompleteSignupRequest';
import { PinnedItemDTO, PinnedItemTargetType, SyncPinnedItemPayload } from 'types/PinnedItem';

type RequestData = Record<string, any>;
const IGNORE_ERRORS = [
  MediaRenderError.MediaVersesRangeLimitExceeded,
  MediaRenderError.MediaFilesPerUserLimitExceeded,
  AuthErrorCodes.InvalidCredentials,
  AuthErrorCodes.NotFound,
  AuthErrorCodes.BadRequest,
  AuthErrorCodes.Invalid,
  AuthErrorCodes.Mismatch,
  AuthErrorCodes.Missing,
  AuthErrorCodes.Duplicate,
  AuthErrorCodes.Banned,
  AuthErrorCodes.Expired,
  AuthErrorCodes.Used,
  AuthErrorCodes.Immutable,
  AuthErrorCodes.ValidationError,
];

/**
 * Checks if an API response contains error information and throws an error if it does.
 * This is useful for handling responses from APIs that return error information in the response body
 * instead of rejecting the promise (like when ValidationError is in IGNORE_ERRORS).
 *
 * @param {unknown} response - The API response to check
 * @param {string} [errorMessage] - Optional custom error message to throw
 * @throws {Error} If the response contains error information
 * @returns {void}
 */
export const throwIfResponseContainsError = (response: unknown, errorMessage?: string): void => {
  if (
    response &&
    typeof response === 'object' &&
    ((response as any).error ||
      (response as any).details?.error ||
      (response as any).success === false)
  ) {
    const message =
      errorMessage ||
      (response as any).error?.message ||
      (response as any).details?.error?.message ||
      'API request failed';
    throw new Error(message);
  }
};

const handleErrors = async (res) => {
  const body = await res.json();
  const error = body?.error || body?.details?.error;
  const errorName = body?.name || body?.details?.name;

  // sometimes FE needs to handle the error from the API instead of showing a general something went wrong message
  const shouldIgnoreError = IGNORE_ERRORS.includes(error?.code);
  if (shouldIgnoreError) {
    return body;
  }
  // const toast = useToast();

  if (errorName === BANNED_USER_ERROR_ID) {
    await logoutUser();
    return Router.push(`/login?error=${errorName}`);
  }

  throw new Error(body?.message);
};

/**
 * Execute a POST request
 *
 * @param {string} url
 * @param {RequestData} requestData
 * @returns {Promise<T>}
 */
export const postRequest = <T>(url: string, requestData: RequestData): Promise<T> =>
  privateFetcher(url, {
    method: 'POST',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestData),
  });

/**
 * Execute a DELETE request.
 *
 * @param {string} url
 * @param {RequestData} requestData
 * @returns {Promise<T>}
 */
const deleteRequest = <T>(url: string, requestData?: RequestData): Promise<T> =>
  privateFetcher(url, {
    method: 'DELETE',
    ...(requestData && {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData),
    }),
  });

/**
 * Execute a PATCH request.
 *
 * @param {string} url
 * @param {RequestData} requestData
 * @returns {Promise<T>}
 */
const patchRequest = <T>(url: string, requestData?: RequestData): Promise<T> =>
  privateFetcher(url, {
    method: 'PATCH',
    ...(requestData && {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData),
    }),
  });

export const getUserProfile = async (): Promise<UserProfile> =>
  privateFetcher(makeUserProfileUrl());

export const getUserFeatureFlags = async (): Promise<Record<string, boolean>> =>
  privateFetcher(makeUserFeatureFlagsUrl());

export const refreshToken = async (): Promise<RefreshToken> =>
  privateFetcher(makeRefreshTokenUrl());

// Track token refresh progress to allow UI / logic to defer actions while refreshing
let tokenRefreshInProgress = false;
export const isTokenRefreshInProgress = () => tokenRefreshInProgress;

const refreshTokenWithFlag = async (): Promise<RefreshToken> => {
  if (!tokenRefreshInProgress) {
    tokenRefreshInProgress = true;
    addSentryBreadcrumb('auth.refresh', 'token refresh start');
  }
  try {
    const result = await refreshToken();
    addSentryBreadcrumb('auth.refresh', 'token refresh success');
    return result;
  } catch (e) {
    addSentryBreadcrumb('auth.refresh', 'token refresh failure');
    logErrorToSentry(e, {
      transactionName: 'auth.refresh',
    });
    throw e;
  } finally {
    tokenRefreshInProgress = false;
  }
};

export const completeSignup = async (data: CompleteSignupRequest): Promise<UserProfile> =>
  postRequest(makeCompleteSignupUrl(), data);

export const completeAnnouncement = async (data: CompleteAnnouncementRequest): Promise<any> => {
  return postRequest(makeCompleteAnnouncementUrl(), data);
};

export const updateUserConsent = async (data: {
  consentType: ConsentType;
  consented: boolean;
}): Promise<any> => {
  return postRequest(makeUserConsentsUrl(), data);
};

export const deleteAccount = async (): Promise<void> => deleteRequest(makeDeleteAccountUrl());

export const addReadingGoal = async (data: CreateGoalRequest): Promise<{ data?: Goal }> => {
  const { category, mushafId, ...requestBody } = data;
  return postRequest(makeGoalUrl({ mushafId, type: category }), requestBody);
};

export const updateReadingGoal = async ({
  mushafId,
  category,
  ...data
}: UpdateGoalRequest): Promise<{ data?: Goal }> =>
  patchRequest(makeGoalUrl({ mushafId, type: category }), data);

export const deleteReadingGoal = async (params: { category: GoalCategory }): Promise<void> =>
  deleteRequest(makeGoalUrl({ type: params.category }));

export const filterReadingDays = async (
  params: FilterActivityDaysParams,
): Promise<{ data: ActivityDay<QuranActivityDay>[] }> =>
  privateFetcher(makeFilterActivityDaysUrl(params));

export const getActivityDay = async (
  type: ActivityDayType,
): Promise<{ data?: ActivityDay<QuranActivityDay> }> =>
  privateFetcher(makeActivityDaysUrl({ type }));

export const addReadingSession = async (chapterNumber: number, verseNumber: number) =>
  postRequest(makeReadingSessionsUrl(), {
    chapterNumber,
    verseNumber,
  });

export const updateActivityDay = async (
  params: UpdateActivityDayParams,
): Promise<ActivityDay<QuranActivityDay>> => {
  if (params.type === ActivityDayType.QURAN) {
    const { mushafId, type, ...body } = params as UpdateActivityDayBody<UpdateQuranActivityDayBody>;
    return postRequest(makeActivityDaysUrl({ mushafId, type }), body);
  }
  if (params.type === ActivityDayType.QURAN_READING_PROGRAM) {
    const { type, ...body } =
      params as UpdateActivityDayBody<UpdateQuranReadingProgramActivityDayBody>;
    return postRequest(makeActivityDaysUrl({ type }), body);
  }
  const { type, ...body } = params as UpdateActivityDayBody<UpdateLessonActivityDayBody>;
  return postRequest(makeActivityDaysUrl({ type }), body);
};

export const estimateRangesReadingTime = async (body: {
  ranges: string[];
}): Promise<{ data: { seconds: number } }> => {
  return privateFetcher(makeEstimateRangesReadingTimeUrl(body));
};

export const getStreakWithUserMetadata = async (
  params: StreakWithMetadataParams,
): Promise<{ data: StreakWithUserMetadata }> => privateFetcher(makeStreakUrl(params));

export const syncUserLocalData = async (
  payload: SyncLocalDataPayload,
): Promise<SyncUserLocalDataResponse> => postRequest(makeSyncLocalDataUrl(), payload);

export const getUserPreferences = async (): Promise<UserPreferencesResponse> => {
  const userPreferences = (await privateFetcher(
    makeUserPreferencesUrl(),
  )) as UserPreferencesResponse;
  return userPreferences;
};

export const addOrUpdateUserPreference = async (
  key: string,
  value: any,
  group: PreferenceGroup,
  mushafId?: Mushaf,
) =>
  postRequest(makeUserPreferencesUrl(mushafId), {
    key,
    value,
    group,
  });

export const getAllNotes = async (params: GetAllNotesQueryParams) => {
  return privateFetcher(makeNotesUrl(params));
};

export const countNotesWithinRange = async (from: string, to: string) => {
  return privateFetcher(makeCountNotesWithinRangeUrl(from, to));
};

export const addNote = async (payload: Pick<Note, 'body' | 'ranges'>) => {
  return postRequest(makeNotesUrl(), payload);
};

export const getNoteById = async (id: string): Promise<Note> =>
  privateFetcher(makeGetNoteByIdUrl(id));

export const getNotesByVerse = async (verseKey: string): Promise<Note[]> => {
  addSentryBreadcrumb('notes.split', 'fetching notes by verse', { verseKey });

  const notes: Note[] = await privateFetcher(makeGetNotesByVerseUrl(verseKey));

  addSentryBreadcrumb('notes.split', 'fetched notes', {
    notesCount: notes.length,
  });

  return notes;
};

export const updateNote = async (id: string, body: string) =>
  patchRequest(makeDeleteOrUpdateNoteUrl(id), {
    body,
  });

export const deleteNote = async (id: string) => deleteRequest(makeDeleteOrUpdateNoteUrl(id));

export const getMediaFileProgress = async (
  renderId: string,
): Promise<Response<{ isDone: boolean; progress: number; url?: string }>> =>
  privateFetcher(makeGetMediaFileProgressUrl(renderId));

export const getMonthlyMediaFilesCount = async (
  type: MediaType,
): Promise<Response<{ count: number; limit: number }>> =>
  privateFetcher(makeGetMonthlyMediaFilesCountUrl(type));

export const generateMediaFile = async (
  payload: GenerateMediaFileRequest,
): Promise<Response<{ renderId?: string; url?: string }>> => {
  return postRequest(makeGenerateMediaFileUrl(), prepareGenerateMediaFileRequestData(payload));
};

export const requestVerificationCode = async (emailToVerify) => {
  return postRequest(makeVerificationCodeUrl(), { email: emailToVerify });
};
export const addOrUpdateBulkUserPreferences = async (
  preferences: Record<PreferenceGroup, any>,
  mushafId: Mushaf,
) => postRequest(makeUserBulkPreferencesUrl(mushafId), preferences);

/**
 * Shorten a URL.
 *
 * @param {string} url
 * @returns {Promise<ShortenUrlResponse>}
 */
export const shortenUrl = async (url: string): Promise<ShortenUrlResponse> => {
  return postRequest(makeShortenUrlUrl(), { url });
};

/**
 * Get full URL by id.
 *
 * @param {string} id
 * @returns {Promise<ShortenUrlResponse>}
 */
export const getFullUrlById = async (id: string): Promise<ShortenUrlResponse> => {
  return privateFetcher(makeFullUrlById(id));
};

export const getUserPrograms = async ({
  programId,
}: {
  programId: string;
}): Promise<{ data: UserProgramResponse }> => {
  return privateFetcher(makeGetUserQuranProgramUrl(programId));
};

export const enrollUserInQuranProgram = async (
  programId: string,
): Promise<{ success: boolean }> => {
  return postRequest(makeEnrollUserInQuranProgramUrl(), {
    programId,
  });
};

export const getQuranProgramWeek = async (
  programId: string,
  weekId: string,
): Promise<{ data: QuranProgramWeekResponse }> => {
  return privateFetcher(makeGetQuranicWeekUrl(programId, weekId));
};

export const logoutUser = async () => {
  return postRequest(makeLogoutUrl(), {});
};

export const submitTranslationFeedback = async (params: {
  translationId: number;
  surahNumber: number;
  ayahNumber: number;
  feedback: string;
}): Promise<{ success: boolean; message: string; feedbackId?: string }> => {
  return postRequest(makeTranslationFeedbackUrl(), params);
};

// Pinned Items
export const getPinnedItems = async (
  targetType?: PinnedItemTargetType,
): Promise<{ success: boolean; data: { data: PinnedItemDTO[] } }> =>
  privateFetcher(makePinnedItemsUrl(targetType));

export const addPinnedItem = async (params: {
  targetType: PinnedItemTargetType;
  targetId: string;
  metadata?: Record<string, unknown>;
}): Promise<PinnedItemDTO> => postRequest(makeAddPinnedItemUrl(), params);

export const deletePinnedItemById = async (pinnedItemId: string) =>
  deleteRequest(makeDeletePinnedItemUrl(pinnedItemId));

export const syncPinnedItems = async (
  items: SyncPinnedItemPayload[],
): Promise<{ synced: number; lastSyncAt: Date }> =>
  postRequest(makeSyncPinnedItemsUrl(), { items });

export const bulkDeletePinnedItems = async (
  targetType: PinnedItemTargetType,
  targetIds: string[],
) => deleteRequest(makeBulkDeletePinnedItemsUrl(), { targetType, targetIds });

export const clearPinnedItems = async (targetType?: PinnedItemTargetType) =>
  deleteRequest(makeClearPinnedItemsUrl(), targetType ? { targetType } : undefined);

const shouldRefreshToken = (error) => {
  return error?.message === 'must refresh token';
};

export const withCredentialsFetcher = async <T>(
  input: RequestInfo,
  init?: RequestInit,
): Promise<T> => {
  try {
    const request: NextApiRequest = {
      url: typeof input === 'string' ? input : input.url,
      method: init?.method || 'GET',
      body: init?.body,
      headers: init?.headers,
      query: {},
    } as NextApiRequest;
    const additionalHeaders = getAdditionalHeaders(request);
    const data = await fetcher<T>(input, {
      ...init,
      credentials: 'include',
      headers: {
        ...init?.headers,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'x-timezone': getTimezone(),
        ...additionalHeaders,
      },
    });
    return data;
  } catch (error) {
    return handleErrors(error);
  }
};

export const privateFetcher = configureRefreshFetch({
  shouldRefreshToken,
  // @ts-ignore
  refreshToken: refreshTokenWithFlag,
  fetch: withCredentialsFetcher,
});

export const mapMushaf = <T = MappedPage | MappedVerse>(
  params: MapMushafParams,
): Promise<{ success: boolean; data: T }> => {
  return postRequest<{ success: boolean; data: T }>(makeMapUrl(), params);
};
