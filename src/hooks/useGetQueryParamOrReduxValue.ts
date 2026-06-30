/* eslint-disable @typescript-eslint/no-explicit-any */

import { useRouter } from 'next/router';
import { shallowEqual, useSelector } from 'react-redux';

import { RootState } from '@/redux/RootState';
import { selectWordByWordLocale } from '@/redux/slices/QuranReader/readingPreferences';
import { selectSelectedTranslations } from '@/redux/slices/QuranReader/translations';
import ChaptersData from '@/types/ChaptersData';
import { areArraysEqual } from '@/utils/array';
import {
  getQueryParamValueByType,
  isQueryParamDifferentThanReduxValue,
  QueryParamValueType,
} from '@/utils/query-params';
import { isValidTranslationsQueryParamValue } from '@/utils/queryParamValidator';
import QueryParam from 'types/QueryParam';

type QueryParamsData = Record<
  QueryParam,
  {
    reduxValueSelector: (state: RootState) => any;
    queryParamValueType: QueryParamValueType;
    reduxValueEqualityFunction?: (left: any, right: any) => boolean;
    isValidQueryParam: (
      queryParamValue?: any,
      chaptersData?: ChaptersData,
      query?: Record<string, string | string[] | undefined>,
      reduxSelectorValueOrValues?: any,
      extraData?: any,
    ) => boolean;
    reduxObjectKey?: string;
    customValueGetterWhenParamIsInvalid?: <T>(
      reduxSelectorValueOrValues?: T,
      reduxParamValue?: any,
    ) => any;
  }
>;

export const QUERY_PARAMS_DATA = {
  [QueryParam.TRANSLATIONS]: {
    reduxValueSelector: selectSelectedTranslations,
    reduxValueEqualityFunction: areArraysEqual,
    queryParamValueType: QueryParamValueType.ArrayOfNumbers,
    isValidQueryParam: (val) => isValidTranslationsQueryParamValue(val),
  },
  [QueryParam.WBW_LOCALE]: {
    reduxValueSelector: selectWordByWordLocale,
    reduxValueEqualityFunction: shallowEqual,
    queryParamValueType: QueryParamValueType.String,
    isValidQueryParam: () => true,
  },
} as QueryParamsData;

/**
 * A hook that searches the query params of the url for specific values,
 * parses them if found and if not, falls back to the Redux value and detects
 * when there is a mismatch between the query param value and the Redux value.
 *
 * @param {QueryParam} queryParam
 * @returns {{value: any, isQueryParamDifferent: boolean}}
 */
const useGetQueryParamOrReduxValue = (
  queryParam: QueryParam,
  chaptersData?: ChaptersData,
  extraData?: any,
): { value: any; isQueryParamDifferent: boolean } => {
  const { query, isReady } = useRouter();

  // either pass the redux selector or the redux selector and the equality function as well
  let reduxValueSelectorWithOrWithoutEqualityFunction = [
    QUERY_PARAMS_DATA[queryParam].reduxValueSelector,
  ];
  if (QUERY_PARAMS_DATA[queryParam].reduxValueEqualityFunction) {
    reduxValueSelectorWithOrWithoutEqualityFunction = [
      QUERY_PARAMS_DATA[queryParam].reduxValueSelector,
      // @ts-ignore
      QUERY_PARAMS_DATA[queryParam].reduxValueEqualityFunction,
    ];
  }
  const reduxSelectorValueOrValues = useSelector(
    // @ts-ignore
    ...reduxValueSelectorWithOrWithoutEqualityFunction,
  );
  const {
    queryParamValueType,
    isValidQueryParam,
    reduxObjectKey,
    customValueGetterWhenParamIsInvalid,
  } = QUERY_PARAMS_DATA[queryParam];
  const reduxParamValue = reduxObjectKey
    ? reduxSelectorValueOrValues[reduxObjectKey]
    : reduxSelectorValueOrValues;

  // if the param exists in the url
  if (isReady && query[queryParam] !== undefined) {
    const queryParamStringValue = String(query[queryParam]);
    const parsedQueryParamValue = getQueryParamValueByType(
      queryParamStringValue,
      queryParamValueType,
    );

    // Check if the URL parameter is valid
    const isValidValue = isValidQueryParam(
      queryParamStringValue,
      chaptersData,
      query,
      reduxSelectorValueOrValues,
      extraData,
    );

    // If the URL parameter is not valid, return the Redux value
    if (!isValidValue) {
      if (customValueGetterWhenParamIsInvalid) {
        return {
          value: customValueGetterWhenParamIsInvalid(reduxSelectorValueOrValues, query),
          isQueryParamDifferent: false,
        };
      }
      return { value: reduxParamValue, isQueryParamDifferent: false };
    }

    // Check if the URL value is different from Redux
    const isQueryParamDifferent = isQueryParamDifferentThanReduxValue(
      queryParamStringValue,
      queryParamValueType,
      reduxParamValue,
    );

    // Always return the URL value if it's valid, regardless of whether it's different
    return {
      value: parsedQueryParamValue,
      isQueryParamDifferent,
    };
  }

  // If no URL parameter exists, use the Redux value
  return {
    value: reduxParamValue,
    isQueryParamDifferent: false,
  };
};

export default useGetQueryParamOrReduxValue;
