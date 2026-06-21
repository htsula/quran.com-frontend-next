import { useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSWRConfig } from 'swr';

import Header from '@/components/Notes/modal/Header';
import type { OnSaveNote } from '@/components/Notes/modal/hooks/useNotesStates';
import NoteFormModal from '@/components/Notes/modal/NoteFormModal';
import {
  CacheAction,
  getNoteFromResponse,
  invalidateCache,
} from '@/components/Notes/modal/utility';
import { getNoteServerErrors } from '@/components/Notes/modal/validation';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import { addNote } from '@/utils/auth/api';
import { isValidationError } from '@/utils/error';
import { verseKeysToRanges } from '@/utils/verseKeys';

interface AddNoteModalProps {
  notesCount?: number;
  isModalOpen: boolean;
  verseKeys: string[];
  showRanges?: boolean;
  onMyNotes: () => void;
  onModalClose: () => void;
  onBack?: () => void;
}

const AddNoteModal: React.FC<AddNoteModalProps> = ({
  notesCount = 0,
  isModalOpen,
  verseKeys,
  showRanges = false,
  onModalClose,
  onMyNotes,
  onBack,
}) => {
  const { t, lang } = useTranslation('notes');
  const toast = useToast();
  const { mutate, cache } = useSWRConfig();

  /**
   * Calculate optimized verse ranges from verse keys.
   *
   * Groups sequential verse keys into ranges within the same chapter.
   * Ranges never span across chapter boundaries.
   *
   * @example
   * Input:  ['1:1', '1:2', '1:3', '1:4', '1:5', '1:6', '1:7', '2:1', '2:2', '2:7']
   * Output: ['1:1-1:7', '2:1-2:2', '2:7-2:7']
   */
  const ranges = useMemo(() => {
    return verseKeysToRanges(verseKeys);
  }, [verseKeys]);

  const handleSaveNote: OnSaveNote = async ({ note: noteBody }) => {
    try {
      const data = await addNote({ body: noteBody, ranges });

      const hasValidationError = isValidationError(data);
      const noteFromResponse = getNoteFromResponse(data);

      if (hasValidationError) return getNoteServerErrors(data, t, lang);

      if (noteFromResponse?.id && noteFromResponse?.createdAt) {
        toast(t('notes:save-success'), { status: ToastStatus.Success });
      } else {
        throw data;
      }

      return invalidateCache({
        mutate,
        cache,
        verseKeys,
        note: noteFromResponse,
        invalidateCount: true,
        flushNotesList: true,
        action: CacheAction.CREATE,
      });
    } catch (error) {
      toast(t('common:error.general'), { status: ToastStatus.Error });
      throw error;
    }
  };

  return (
    <NoteFormModal
      header={
        <Header onClick={onBack} data-testid="add-note-modal-title">
          {t('take-a-note-or-reflection')}
        </Header>
      }
      isModalOpen={isModalOpen}
      onModalClose={onModalClose}
      onMyNotes={onMyNotes}
      notesCount={notesCount}
      onSaveNote={handleSaveNote}
      ranges={showRanges ? ranges : undefined}
      dataTestId="add-note-modal-content"
    />
  );
};

export default AddNoteModal;
