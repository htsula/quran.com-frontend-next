import { StudyModeTabId } from '@/components/QuranReader/ReadingView/StudyModeModal/StudyModeBottomActions';
import { ModalType } from '@/components/QuranReader/TranslationView/BottomActionsModals';
import BookIcon from '@/icons/book-open.svg';
import LightbulbIcon from '@/icons/lightbulb.svg';
import {
  getVerseAnswersNavigationUrl,
  getVerseSelectedTafsirNavigationUrl,
} from '@/utils/navigation';
import { getVerseAndChapterNumbersFromKey } from '@/utils/verse';

export interface ActionButton {
  key: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  namespace?: 'quran-reader' | 'common';
  /**
   * For Answers, use ModalType. For Tafsir/Reflections/Lessons, use StudyModeTabId
   */
  modalType?: ModalType;
  studyModeTabId?: StudyModeTabId;
  getNavigationUrl: (args: {
    chapterNumber: number;
    verseKey: string;
    selectedTafsirs: string[];
  }) => string;
}

export const buildTafsirUrl = ({
  chapterNumber,
  verseKey,
  selectedTafsirs,
}: {
  chapterNumber: number;
  verseKey: string;
  selectedTafsirs: string[];
}): string => {
  if (!selectedTafsirs?.length) return '';
  const [, verseNumber] = getVerseAndChapterNumbersFromKey(verseKey);
  const tafsirId = selectedTafsirs[0];
  return getVerseSelectedTafsirNavigationUrl(chapterNumber, Number(verseNumber), tafsirId);
};

export const ACTION_BUTTONS: ActionButton[] = [
  {
    key: 'tafsir.title',
    icon: BookIcon,
    namespace: 'common',
    studyModeTabId: StudyModeTabId.TAFSIR,
    getNavigationUrl: buildTafsirUrl,
  },
  {
    key: 'answers',
    icon: LightbulbIcon,
    namespace: 'common',
    studyModeTabId: StudyModeTabId.ANSWERS,
    getNavigationUrl: ({ verseKey }) => getVerseAnswersNavigationUrl(verseKey),
  },
];
