export interface LetterBlock {
  id: string;
  letter: string;
  row: number;
  col: number;
  isSelected: boolean;
    isMatched: boolean;
  isReplacedRecently?: boolean;
  isMonsterHere?: boolean;
}

export interface TargetWord {
  word: string; // The word in the opposite language (e.g., 'House')
  meaning: string; // The word in the current language to be found (e.g., 'بيت')
  found: boolean;
}

export interface GameState {
  blocks: LetterBlock[];
  selectedBlocks: LetterBlock[];
  score: number;
  foundWords: Array<{
    word: string;
    meaning: string;
    timestamp: number;
  }>;
  gameStatus: 'playing' | 'paused' | 'gameOver';
  language: 'english' | 'arabic'; // تحديث القيم لتتوافق مع القاموس الجديد
  level: number;
  rowCount: number;
  gameSpeed: number;
  hintBlocks: string[];
  targetWords: TargetWord[];
}

export interface Position {
  row: number;
  col: number;
}

export interface WordDefinition {
  english: string; // English word
  arabic: string; // Arabic word
}