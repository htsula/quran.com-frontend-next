import React from 'react';

import EndOfSurahSection from '../EndOfSurahSection';

import { VersesResponse } from 'types/ApiResponses';

interface Props {
  initialData: VersesResponse;
}

const ChapterControls: React.FC<Props> = ({ initialData }) => {
  const chapterIdAndLastVerse = initialData.pagesLookup.lookupRange.to;
  // example : "2:253" -> chapter 2 verse 253
  const chapterId = chapterIdAndLastVerse.split(':')[0];
  const chapterNumber = Number(chapterId);

  return (
    <>
      <EndOfSurahSection chapterNumber={chapterNumber} />
    </>
  );
};

export default ChapterControls;
