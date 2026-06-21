import { useContext, useMemo } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import modalStyles from './Modal.module.scss';
import styles from './NoteFormModal.module.scss';

import { LoadingState, useNotesStates } from '@/components/Notes/modal/hooks/useNotesStates';
import type { OnSaveNote } from '@/components/Notes/modal/hooks/useNotesStates';
import NotesOnVerseButton from '@/components/Notes/modal/NotesOnVerseButton';
import DataContext from '@/contexts/DataContext';
import Button, { ButtonSize } from '@/dls/Button/Button';
import ContentModal from '@/dls/ContentModal/ContentModal';
import TextArea from '@/dls/Forms/TextArea';
import { readableVerseRangeKeys } from '@/utils/verseKeys';

interface NoteFormModalProps {
  notesCount?: number;
  showNotesOnVerseButton?: boolean;
  initialNote?: string;
  ranges?: string[];
  header: React.ReactNode;
  onMyNotes: () => void;
  isModalOpen: boolean;
  onModalClose: () => void;
  onSaveNote: OnSaveNote;
  dataTestId?: string;
}

const NoteFormModal: React.FC<NoteFormModalProps> = ({
  notesCount = 0,
  showNotesOnVerseButton = true,
  initialNote = '',
  ranges,
  header,
  onMyNotes,
  isModalOpen,
  onModalClose,
  onSaveNote,
  dataTestId,
}) => {
  const { t, lang } = useTranslation();
  const chaptersData = useContext(DataContext);

  const { noteInput, errors, loading, onNoteInputChange, onPrivateSave } = useNotesStates(
    initialNote,
    onSaveNote,
    onMyNotes,
    isModalOpen,
  );

  const verseRanges = useMemo(() => {
    if (!ranges || ranges.length === 0) return [];
    return readableVerseRangeKeys(ranges, chaptersData, lang);
  }, [ranges, chaptersData, lang]);

  return (
    <ContentModal
      isOpen={isModalOpen}
      header={header}
      hasCloseButton
      onClose={onModalClose}
      onEscapeKeyDown={onModalClose}
      overlayClassName={modalStyles.overlay}
      headerClassName={modalStyles.headerClassName}
      closeIconClassName={modalStyles.closeIconContainer}
      contentClassName={classNames(modalStyles.content, modalStyles.formModalContent)}
      innerContentClassName={classNames(styles.container, modalStyles.formModalContent)}
      dataTestId={dataTestId}
    >
      {verseRanges.length > 0 && (
        <div className={styles.verseRangesContainer}>
          {verseRanges.map((range) => (
            <span key={range} className={styles.verseRangePill}>
              {range}
            </span>
          ))}
        </div>
      )}

      <div className={styles.inputGroup}>
        <TextArea
          id="note"
          name="note"
          placeholder={t('notes:body-placeholder')}
          containerClassName={styles.textArea}
          value={noteInput}
          onChange={onNoteInputChange}
          dataTestId="notes-textarea"
        />

        {errors.note && (
          <div className={styles.error} data-testid={`note-input-error-${errors.note.id}`}>
            {errors.note.message}
          </div>
        )}
      </div>

      {showNotesOnVerseButton && notesCount > 0 && (
        <NotesOnVerseButton
          notesCount={notesCount}
          onClick={onMyNotes}
          disabled={loading !== null}
        />
      )}

      <div className={styles.actions}>
        <Button
          className={classNames(styles.button)}
          size={ButtonSize.Small}
          isLoading={loading === LoadingState.Private}
          isDisabled={loading !== null}
          onClick={onPrivateSave}
          data-testid="save-private-button"
        >
          {t('notes:save-privately')}
        </Button>
      </div>
    </ContentModal>
  );
};

export default NoteFormModal;
