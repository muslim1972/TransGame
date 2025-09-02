import { useCallback, useRef } from 'react';
import { GameState } from '../types/game';
import { useAchievements } from './useAchievements';

export const useGameControls = (
  gameState: GameState,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>,
  resetGameState: () => void,
  switchLanguage: () => void,
  generateTargetWords: () => void,
  generateRow: (rowNumber: number, language: 'english' | 'arabic', GRID_COLS: number) => any[],
  GRID_ROWS: number,
  GRID_COLS: number,
  playSound: (soundName: string) => void,
  resetBombState: () => void,
  resetMonsterState: () => void
) => {
  const hintTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Use the achievements hook
  const { trackLanguageSwitch } = useAchievements(gameState, setGameState);

  const resetGame = useCallback(() => {
    if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
    resetGameState();
    resetBombState(); // Call the reset bomb state function
    resetMonsterState(); // Call the reset monster state function
    generateTargetWords();
    playSound('click');

    // Add initial row after reset
    const initialRow = generateRow(GRID_ROWS - 1, gameState.language, GRID_COLS);
    setGameState(prevState => ({
      ...prevState,
      blocks: initialRow,
      rowCount: 1,
    }));
  }, [resetGameState, generateTargetWords, gameState.language, GRID_ROWS, GRID_COLS, generateRow, playSound, setGameState, resetBombState, resetMonsterState]);

  const handleSwitchLanguage = useCallback(() => {
    if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
    switchLanguage();
    playSound('click');

    // Add initial row after language switch
    const newLanguage = gameState.language === 'english' ? 'arabic' : 'english';
    const initialRow = generateRow(GRID_ROWS - 1, newLanguage, GRID_COLS);
    setGameState(prevState => {
      // Track language switch for achievements
      const languageSwitchCount = (prevState.languageSwitchCount || 0) + 1;

      return {
        ...prevState,
        blocks: initialRow,
        selectedBlocks: [],
        score: 0,
        foundWords: [],
        gameStatus: 'playing',
        level: 1,
        rowCount: 1,
        hintBlocks: [],
        languageSwitchCount
      };
    });

    // Track language switch for achievements
    trackLanguageSwitch();
  }, [switchLanguage, gameState.language, GRID_ROWS, GRID_COLS, generateRow, trackLanguageSwitch, playSound, setGameState]);

  const clearSelection = useCallback(() => {
    setGameState(prevState => ({
      ...prevState,
      selectedBlocks: [],
      blocks: prevState.blocks.map(block => ({ ...block, isSelected: false }))
    }));
    playSound('click');
  }, [setGameState, playSound]);

  const togglePause = useCallback(() => {
    setGameState(prevState => {
      if (prevState.gameStatus === 'paused') {
        return { ...prevState, gameStatus: 'playing' };
      }
      return { ...prevState, gameStatus: 'paused' };
    });
    playSound('click');
  }, [setGameState, playSound]);

  return {
    resetGame,
    handleSwitchLanguage,
    clearSelection,
    togglePause
  };
};