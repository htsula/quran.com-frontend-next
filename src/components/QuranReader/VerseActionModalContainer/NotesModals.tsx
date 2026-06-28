import React, { useMemo } from 'react';

import AddNoteModal from '@/components/Notes/modal/AddNoteModal';
import EditNoteModal from '@/components/Notes/modal/EditNoteModal';
import MyNotesModal from '@/components/Notes/modal/MyNotes';
import { VerseActionModalType as ModalType } from '@/redux/slices/QuranReader/verseActionModal';
import { Note } from '@/types/auth/Note';

interface NotesModalsProps {
  modalType: ModalType;
  verseKey: string;
  notesCount: number;
  editingNote: Note | null;
  wasOpenedFromStudyMode: boolean;
  onClose: () => void;
  onBack?: () => void;
  onOpenMyNotes: () => void;
  onOpenAddNote: () => void;
  onOpenEditNote: (note: Note) => void;
}

const NotesModals: React.FC<NotesModalsProps> = ({
  modalType,
  verseKey,
  notesCount,
  editingNote,
  wasOpenedFromStudyMode,
  onClose,
  onBack,
  onOpenMyNotes,
  onOpenAddNote,
  onOpenEditNote,
}) => {
  const getBackHandler = () => {
    if (wasOpenedFromStudyMode) return onBack;
    return undefined;
  };

  const verseKeys = useMemo(() => [verseKey], [verseKey]);

  return (
    <>
      <AddNoteModal
        isModalOpen={modalType === ModalType.ADD_NOTE}
        onModalClose={onClose}
        onMyNotes={onOpenMyNotes}
        notesCount={notesCount}
        verseKeys={verseKeys}
        onBack={getBackHandler()}
      />
      <MyNotesModal
        isOpen={modalType === ModalType.MY_NOTES}
        onClose={onClose}
        notesCount={notesCount}
        onAddNote={onOpenAddNote}
        onEditNote={onOpenEditNote}
        verseKey={verseKey}
      />
      <EditNoteModal
        note={editingNote}
        isModalOpen={modalType === ModalType.EDIT_NOTE}
        onModalClose={onClose}
        onMyNotes={onOpenMyNotes}
        onBack={onOpenMyNotes}
      />
    </>
  );
};

export default NotesModals;
