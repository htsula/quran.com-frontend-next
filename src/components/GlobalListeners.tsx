import React from 'react';

import DisableAnimationsUntilHydration from './DisableAnimationsUntilHydration';
import GlobalPersistGateHydrationListener from './GlobalPersistGateHydrationListener';

import GlobalScrollListener from '@/components/GlobalScrollListener';

const GlobalListeners = () => {
  return (
    <>
      <GlobalScrollListener />
      <GlobalPersistGateHydrationListener />
      <DisableAnimationsUntilHydration />
    </>
  );
};

export default GlobalListeners;
