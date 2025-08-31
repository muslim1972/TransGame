
import { useState, useCallback } from 'react';
import { GameState } from '../../types/game';
import { getRandomWords } from '../../data/words1';
import { TargetWord } from '../../types/game';

const GRID_COLS = 8;
const GRID_ROWS = 15;
const TARGET_WORD_COUNT = 7;

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>({
    blocks: [],
    selectedBlocks: [],
    score: 0,
    foundWords: [],
    targetWords: [],
    gameStatus: 'playing',
    language: 'english',
    level: 1,
    rowCount: 0,
    gameSpeed: 7500,
    hintBlocks: [],
  });

  const generateTargetWords = useCallback(() => {
    const words = getRandomWords(TARGET_WORD_COUNT);
    const targetWords: TargetWord[] = words.map(w => ({
      word: gameState.language === 'english' ? w.arabic : w.english,
      meaning: gameState.language === 'english' ? w.english : w.arabic,
      found: false,
    }));
    setGameState(prev => ({ ...prev, targetWords }));
  }, [gameState.language]);

  const updateGameState = useCallback((updates: Partial<GameState>) => {
    setGameState(prev => ({ ...prev, ...updates }));
  }, []);

  const resetGameState = useCallback(() => {
    const newLanguage = gameState.language;
    const words = getRandomWords(TARGET_WORD_COUNT);
    const targetWords: TargetWord[] = words.map(w => ({
      word: newLanguage === 'english' ? w.arabic : w.english,
      meaning: newLanguage === 'english' ? w.english : w.arabic,
      found: false,
    }));

    setGameState({
      blocks: [],
      selectedBlocks: [],
      score: 0,
      foundWords: [],
      targetWords,
      gameStatus: 'playing',
      language: newLanguage,
      level: 1,
      rowCount: 0,
      gameSpeed: 7500,
      hintBlocks: [],
    });
  }, [gameState.language]);

  const switchLanguage = useCallback(() => {
    const newLanguage = gameState.language === 'english' ? 'arabic' : 'english';

    const words = getRandomWords(TARGET_WORD_COUNT);
    const targetWords: TargetWord[] = words.map(w => ({
      word: newLanguage === 'english' ? w.arabic : w.english,
      meaning: newLanguage === 'english' ? w.english : w.arabic,
      found: false,
    }));

    setGameState(prev => ({
      ...prev,
      language: newLanguage,
      targetWords,
    }));
  }, [gameState.language]);

  return {
    gameState,
    setGameState,
    updateGameState,
    generateTargetWords,
    resetGameState,
    switchLanguage,
    GRID_ROWS,
    GRID_COLS,
  };
};
