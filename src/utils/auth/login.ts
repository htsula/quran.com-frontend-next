import { USER_ID_COOKIE_NAME } from './constants';

// eslint-disable-next-line import/prefer-default-export
export const getUserIdCookie = (): string | undefined => {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${USER_ID_COOKIE_NAME}=`));
  return match ? decodeURIComponent(match.slice(USER_ID_COOKIE_NAME.length + 1)) : undefined;
};
