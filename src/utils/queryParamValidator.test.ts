/* eslint-disable react-func/max-lines-per-function */
/* eslint-disable max-lines */
import { describe, it, expect } from 'vitest';

import {
  isValidTranslationsQueryParamValueWithExistingKey,
  isValidReciterId,
  isValidBooleanQueryParamValue,
  isValidNumberQueryParamValue,
  isValidFontScaleQueryParamValue,
} from './queryParamValidator';

import AvailableTranslation from '@/types/AvailableTranslation';
import Reciter from '@/types/Reciter';

const reciters = [
  {
    id: 7,
    reciterId: 1,
    name: 'Mishari Rashid al-`Afasy',
    translatedName: {
      name: 'Mishari Rashid al-`Afasy',
      languageName: 'english',
    },
    style: {
      name: 'Murattal',
      languageName: 'english',
      description: 'Murattal is Quranic recitation at a slower pace, used for study and practice.',
    },
    qirat: {
      name: 'Hafs',
      languageName: 'english',
    },
  },
] as Reciter[];

const translations = [
  {
    id: 131,
    name: 'Dr. Mustafa Khattab, The Clear Quran',
    authorName: 'Dr. Mustafa Khattab',
    slug: 'clearquran-with-tafsir',
    languageName: 'english',
    translatedName: {
      name: 'Dr. Mustafa Khattab',
      languageName: 'english',
    },
  },
] as AvailableTranslation[];

describe('isValidTranslationsQueryParamValueWithExistingKey', () => {
  it('Returns true when empty', () => {
    expect(isValidTranslationsQueryParamValueWithExistingKey('', translations)).toBe(true);
  });
  it('Returns true when 1 valid translation id exists', () => {
    expect(isValidTranslationsQueryParamValueWithExistingKey('131', translations)).toBe(true);
  });
  it('Returns false when 1 invalid translation id exists', () => {
    expect(isValidTranslationsQueryParamValueWithExistingKey('99', translations)).toBe(false);
  });
  it('Returns false when 1 invalid translation id and 1 empty id exist', () => {
    expect(isValidTranslationsQueryParamValueWithExistingKey('sdfsdf,', translations)).toBe(false);
  });
  it('Returns false when 1 valid id and 1 empty id exist', () => {
    expect(isValidTranslationsQueryParamValueWithExistingKey('131,', translations)).toBe(false);
  });
  it('Returns false when a valid id and an empty id exist', () => {
    expect(isValidTranslationsQueryParamValueWithExistingKey('131,', translations)).toBe(false);
  });
  it('Returns false when an invalid translation id exist', () => {
    expect(isValidTranslationsQueryParamValueWithExistingKey('123,131,85', translations)).toBe(
      false,
    );
  });
  it('Returns false when one of many ids is not valid', () => {
    expect(isValidTranslationsQueryParamValueWithExistingKey('123,sdfsdf,1234', translations)).toBe(
      false,
    );
  });
});

describe('isValidReciterId', () => {
  it('Returns false when empty', () => {
    expect(isValidReciterId('', reciters)).toBe(false);
  });
  it('Returns true when a valid reciter id exists', () => {
    expect(isValidReciterId('7', reciters)).toBe(true);
  });
  it('Returns false when 1 invalid reciter id exists', () => {
    expect(isValidReciterId('sdfsdfdf', reciters)).toBe(false);
  });
});

describe('isValidBooleanQueryParamValue', () => {
  it('Returns false when strings', () => {
    expect(isValidBooleanQueryParamValue('invalid1')).toBe(false);
  });
  it('Returns false for numbers', () => {
    expect(isValidBooleanQueryParamValue('invalid1')).toBe(false);
  });
  it('Returns true for True', () => {
    expect(isValidBooleanQueryParamValue('true')).toBe(true);
  });
  it('Returns true for False', () => {
    expect(isValidBooleanQueryParamValue('false')).toBe(true);
  });
});

describe('isValidNumberQueryParamValue', () => {
  it('Returns true for valid number', () => {
    expect(isValidNumberQueryParamValue('123')).toBe(true);
  });
  it('Returns false for invalid number', () => {
    expect(isValidNumberQueryParamValue('abc')).toBe(false);
  });
});

describe('isValidFontScaleQueryParamValue', () => {
  it('Returns true for valid font scale', () => {
    expect(isValidFontScaleQueryParamValue('5')).toBe(true);
  });
  it('Returns false for invalid font scale', () => {
    expect(isValidFontScaleQueryParamValue('11')).toBe(false);
  });
});
