import React from 'react';

import DisableAnimationsUntilHydration from './DisableAnimationsUntilHydration';
import GlobalPersistGateHydrationListener from './GlobalPersistGateHydrationListener';

import GlobalScrollListener from '@/components/GlobalScrollListener';
import GuestBookmarksMigrationModal from '@/components/GuestBookmarksMigrationModal';

const GlobalListeners = () => {
  return (
    <>
      <GlobalScrollListener />
      <GlobalPersistGateHydrationListener />
      <DisableAnimationsUntilHydration />
      <GuestBookmarksMigrationModal />
    </>
  );
};

export default GlobalListeners;
