import React, { useCallback, useEffect, useRef } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import AdvancedCopyModal from './AdvancedCopyModal';

import {
  closeStudyMode,
  openStudyMode,
  selectStudyModeIsOpen,
} from '@/redux/slices/QuranReader/studyMode';
import {
  closeVerseActionModal,
  selectVerseActionModalIsOpen,
  selectVerseActionModalIsTranslationView,
  selectVerseActionModalStudyModeRestoreState,
  selectVerseActionModalType,
  selectVerseActionModalVerse,
  selectVerseActionModalVerseKey,
  selectVerseActionModalWasOpenedFromStudyMode,
  VerseActionModalType,
} from '@/redux/slices/QuranReader/verseActionModal';
import { logEvent } from '@/utils/eventLogger';

const VerseActionModalContainer: React.FC = () => {
  const dispatch = useDispatch();
  const hasClosedStudyModeRef = useRef(false);

  const isOpen = useSelector(selectVerseActionModalIsOpen);
  const modalType = useSelector(selectVerseActionModalType);
  const verseKey = useSelector(selectVerseActionModalVerseKey);
  const verse = useSelector(selectVerseActionModalVerse);
  const isTranslationView = useSelector(selectVerseActionModalIsTranslationView);
  const wasOpenedFromStudyMode = useSelector(selectVerseActionModalWasOpenedFromStudyMode);
  const studyModeRestoreState = useSelector(selectVerseActionModalStudyModeRestoreState);
  const isStudyModeOpen = useSelector(selectStudyModeIsOpen);

  useEffect(() => {
    if (isOpen && wasOpenedFromStudyMode && !hasClosedStudyModeRef.current) {
      hasClosedStudyModeRef.current = true;
      // For SSR mode, the modal hides itself via Redux state (no action needed)
      // For regular mode, close the study mode modal
      if (!studyModeRestoreState?.isSsrMode && isStudyModeOpen) {
        dispatch(closeStudyMode());
      }
    }
  }, [isOpen, wasOpenedFromStudyMode, isStudyModeOpen, studyModeRestoreState, dispatch]);

  useEffect(() => {
    if (!isOpen) {
      hasClosedStudyModeRef.current = false;
    }
  }, [isOpen]);

  const handleBackToStudyMode = useCallback(() => {
    dispatch(closeVerseActionModal());

    // For SSR mode, the modal auto-shows when verse action closes (via Redux state)
    if (studyModeRestoreState?.isSsrMode) {
      return;
    }

    // For regular mode, re-open study mode with saved state
    if (studyModeRestoreState) {
      dispatch(
        openStudyMode({
          verseKey: studyModeRestoreState.verseKey,
          activeTab: studyModeRestoreState.activeTab,
          highlightedWordLocation: studyModeRestoreState.highlightedWordLocation,
        }),
      );
    } else if (verseKey) {
      dispatch(openStudyMode({ verseKey }));
    }
  }, [dispatch, studyModeRestoreState, verseKey]);

  const handleClose = useCallback(() => {
    if (wasOpenedFromStudyMode) {
      handleBackToStudyMode();
    } else {
      dispatch(closeVerseActionModal());
    }
  }, [dispatch, wasOpenedFromStudyMode, handleBackToStudyMode]);

  const handleAdvancedCopyClose = useCallback(() => {
    const view = isTranslationView ? 'translation_view' : 'reading_view';
    logEvent(`${view}_advanced_copy_modal_close`);
    handleClose();
  }, [isTranslationView, handleClose]);

  if (!isOpen || !verseKey) {
    return null;
  }

  if (modalType === VerseActionModalType.ADVANCED_COPY && verse) {
    return (
      <AdvancedCopyModal
        verse={verse}
        wasOpenedFromStudyMode={wasOpenedFromStudyMode}
        onClose={handleAdvancedCopyClose}
        onBack={handleBackToStudyMode}
      />
    );
  }

  return null;
};

export default VerseActionModalContainer;
