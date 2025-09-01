import { WordDefinition } from '../types/game';

// This function was in words1.ts, now a generic utility
const normalizeArabic = (word: string): string => {
  return word
    .replace(/[إأآا]/g, 'ا')
    .replace(/[ة]/g, 'ه')
    .replace(/[ى]/g, 'ي')
    .replace(/[ؤ]/g, 'و')
    .replace(/[ئ]/g, 'ي');
};

// This function was in words1.ts, now a generic utility
export const findWord = (letters: string[], isArabicMode: boolean, dictionary: WordDefinition[]): WordDefinition | undefined => {
  const normalizedLetters = isArabicMode
    ? letters.map(letter => normalizeArabic(letter)).join('')
    : letters.join('');

  const word = dictionary.find(w =>
    isArabicMode
      ? normalizeArabic(w.arabic) === normalizedLetters
      : w.english.toLowerCase() === normalizedLetters.toLowerCase()
  );

  return word;
};

// This function was in words1.ts, now a generic utility
export const getRandomWords = (count: number, dictionary: WordDefinition[]): WordDefinition[] => {
  const shuffled = [...dictionary].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};
