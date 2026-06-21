import { Note } from '@/types/auth/Note';

// eslint-disable-next-line import/prefer-default-export -- re-exported via utility/index barrel
export const mergeNote = (note: Note, noteFromResponse: Note): Note => {
  return {
    ...note,
    ...noteFromResponse,
  };
};
