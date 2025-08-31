import { LetterBlock } from '../types/game';

const ENGLISH_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const ARABIC_LETTERS = 'اأإآبتثجحخدذرزسشصضطظعغفقكلمنهويىةءئؤة';

const generateRandomLetter = (language: 'english' | 'arabic'): string => {
  const letters = language === 'english' ? ENGLISH_LETTERS : ARABIC_LETTERS;
  return letters[Math.floor(Math.random() * letters.length)];
};

export const generateRow = (rowNumber: number, language: 'english' | 'arabic', GRID_COLS: number): LetterBlock[] => {
  return Array.from({ length: GRID_COLS }, (_, colIndex) => ({
    id: `${rowNumber}-${colIndex}-${Date.now()}-${Math.random()}`,
    letter: generateRandomLetter(language),
    row: rowNumber,
    col: colIndex,
    isSelected: false,
    isMatched: false,
  }));
};