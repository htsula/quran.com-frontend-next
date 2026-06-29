import { useSelector, shallowEqual } from 'react-redux';

import useDebounceNavbarVisibility from './useDebounceNavbarVisibility';

import { selectNavbar } from '@/redux/slices/navbar';

/**
 * A hook to determine if the navbar should be shown.
 * It reads the redux state `isNavbarVisible` with a debounce to prevent flickering.
 *
 * @returns {boolean} true if the navbar should be shown, false otherwise.
 */
const useShowNavbar = (): boolean => {
  const { isVisible: isNavbarVisible } = useSelector(selectNavbar, shallowEqual);
  const showNavbar = useDebounceNavbarVisibility(isNavbarVisible);

  return showNavbar;
};

export default useShowNavbar;
