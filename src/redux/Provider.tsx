import { useEffect, useRef } from 'react';

import { Provider } from 'react-redux';
import { persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';

import getStore from './store';

import syncLocaleDependentSettings from '@/redux/actions/sync-locale-dependent-settings';
import isClient from '@/utils/isClient';

/**
 * A wrapper around the Provider component to skip rendering <PersistGate />
 * on the server. PersistGate prevents children from rendering until the persisted
 * state is retrieved from localstorage, this results in an empty DOM for SSR and SSG.
 * For more info: https://github.com/rt2zz/redux-persist/issues/1008
 *
 * @param {any} props
 * @returns {Provider}
 */
const ReduxProvider = ({ children, locale }) => {
  /**
   * Keep a single Redux store instance for the lifetime of the app.
   *
   * We previously recreated the store on every locale change, which made locale switching
   * depend on redux-persist timing (rehydration vs. pending writes) and could cause
   * "stuck" locale-dependent settings in production after multiple flips.
   */
  const storeRef = useRef<ReturnType<typeof getStore> | null>(null);
  if (!storeRef.current) {
    // Intentionally create the store once; locale-dependent defaults should be synced via actions,
    // not by recreating the Redux store (which can race redux-persist rehydration/writes).
    storeRef.current = getStore(locale);
  }
  const store = storeRef.current;

  // Browser back/forward can change the URL locale without going through our explicit
  // language-switch handlers. Keep locale-dependent "tabs" aligned with the URL locale
  // unless the user customized them.
  const prevLocaleRef = useRef(locale);
  useEffect(() => {
    const prevLocale = prevLocaleRef.current;
    if (prevLocale === locale) return;
    prevLocaleRef.current = locale;

    if (isClient) {
      store.dispatch(syncLocaleDependentSettings({ prevLocale, nextLocale: locale }));
    }
  }, [locale, store]);

  const persistorRef = useRef<ReturnType<typeof persistStore> | null>(null);
  if (!persistorRef.current) {
    persistorRef.current = persistStore(store);
  }
  const persistor = persistorRef.current;

  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>{() => <>{children}</>}</PersistGate>
    </Provider>
  );
};

export default ReduxProvider;
