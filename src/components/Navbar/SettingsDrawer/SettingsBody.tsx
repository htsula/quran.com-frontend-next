import React, { useEffect, useCallback } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import DoneButton from './DoneButton';
import ResetButton from './ResetButton';
import styles from './SettingsBody.module.scss';
import SettingTabs from './SettingTabs';

import { selectNavbar, setLastSettingsTab, SettingsTab, SettingsView } from '@/redux/slices/navbar';
import { logEvent } from '@/utils/eventLogger';

const SettingsBody = () => {
  const dispatch = useDispatch();
  const { lastSettingsView, lastSettingsTab } = useSelector(selectNavbar);

  const getTabFromSettingsView = (view: SettingsView): SettingsTab => {
    switch (view) {
      case SettingsView.Translation:
        return SettingsTab.Translation;
      case SettingsView.Reciter:
      case SettingsView.Body:
      default:
        return SettingsTab.Arabic;
    }
  };

  const handleTabChange = useCallback(
    (tab: SettingsTab, shouldLog = true) => {
      if (shouldLog) {
        logEvent(`settings_tab_${tab}`);
      }
      dispatch(setLastSettingsTab(tab));
    },
    [dispatch],
  );

  // Update active tab when returning from a sub-view (e.g., Translation selection)
  // Don't log since this is auto-navigation, not user-initiated
  useEffect(() => {
    if (lastSettingsView !== SettingsView.Body) {
      const targetTab = getTabFromSettingsView(lastSettingsView);
      handleTabChange(targetTab, false);
    }
  }, [lastSettingsView, handleTabChange]);

  return (
    <div className={styles.container}>
      <SettingTabs activeTab={lastSettingsTab} onTabChange={handleTabChange} />
      <div className={styles.buttonsContainer}>
        <ResetButton />
        <DoneButton />
      </div>
    </div>
  );
};

export default SettingsBody;
