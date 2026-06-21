import React, { useEffect } from 'react';

import useTranslation from 'next-translate/useTranslation';
import useSWR from 'swr';

import styles from './MyNotes.module.scss';

import { DEFAULT_DEDUPING_INTERVAL } from '@/components/Notes/modal/constant';
import NoteCard from '@/components/Notes/modal/MyNotes/Card/NoteCard';
import Button, { ButtonSize } from '@/dls/Button/Button';
import Spinner, { SpinnerSize } from '@/dls/Spinner/Spinner';
import PlusIcon from '@/icons/plus.svg';
import { Note } from '@/types/auth/Note';
import { getNotesByVerse } from '@/utils/auth/api';
import { makeGetNotesByVerseUrl } from '@/utils/auth/apiPaths';

interface MyNotesProps {
  onAddNote: () => void;
  onEditNote: (note: Note) => void;
  verseKey: string;
  deletingNoteId: string | undefined;
  processingNoteId: string | undefined;
  onDeleteNoteClick: (note: Note) => void;
}

const MyNotes: React.FC<MyNotesProps> = ({
  onAddNote,
  onEditNote,
  verseKey,
  deletingNoteId,
  processingNoteId,
  onDeleteNoteClick,
}) => {
  const { t } = useTranslation('notes');

  const { data, error } = useSWR(
    makeGetNotesByVerseUrl(verseKey),
    () => getNotesByVerse(verseKey),
    {
      revalidateOnReconnect: true,
      revalidateOnFocus: true,
      dedupingInterval: DEFAULT_DEDUPING_INTERVAL,
    },
  );

  const isLoading = !data && !error;

  const notes = Array.isArray(data) ? data : [];

  const showEmptyState = !isLoading && !error && notes.length === 0;
  const showStatus = isLoading || error || showEmptyState;

  useEffect(() => {
    if (processingNoteId) {
      const noteElement = document.querySelector(`[data-testid="note-card-${processingNoteId}"]`);
      if (noteElement) noteElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [processingNoteId]);

  return (
    <>
      {showStatus ? (
        <div className={styles.statusContainer} data-error={!!error}>
          {isLoading && <Spinner size={SpinnerSize.Large} />}
          {error && t('common:error.general')}
          {showEmptyState && t('empty-notes')}
        </div>
      ) : (
        <div className={styles.notesList}>
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={onEditNote}
              onDelete={onDeleteNoteClick}
              isDeletingNote={note.id === deletingNoteId}
            />
          ))}
        </div>
      )}

      <div className={styles.actions}>
        <Button
          className={styles.addNoteButton}
          size={ButtonSize.Small}
          prefix={<PlusIcon />}
          onClick={onAddNote}
          data-testid="add-another-note-button"
        >
          {t('add-another-note')}
        </Button>
      </div>
    </>
  );
};

export default MyNotes;
