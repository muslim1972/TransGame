import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, LetterBlock, TargetWord, WordDefinition } from '../types/game';
import { useGameState } from './game/useGameState';
import { useBlocksLogic } from './useBlocksLogic';
import { useWordsLogic } from './useWordsLogic';
import { useTimerLogic } from './useTimerLogic';
import { useVisualEffects } from './useVisualEffects';
import { useSoundManager } from './useSoundManager';
import { useAchievements } from './useAchievements';
import { useBombLogic } from './useBombLogic';
import { useMonsterLogic } from './useMonsterLogic';
import { generateRow } from '../utils/grid';
import { getRandomWords } from '../utils/words';

const TARGET_WORD_COUNT = 7;

export const useGameLogic = (dictionary: WordDefinition[]) => {
  const { gameState, setGameState, updateGameState, resetCoreGameState, switchLanguage: switchLanguageInState, GRID_ROWS, GRID_COLS } = useGameState();

  const { playSound, toggleMute, isMuted } = useSoundManager();
  const { isBombReady, deactivateBombState, resetBombState } = useBombLogic(gameState.rowCount);
  const { isMonsterReady, activateMonster, resetMonsterState, monsterBlockId, monsterActive, blockToRemove } = useMonsterLogic(gameState.blocks, GRID_ROWS, GRID_COLS, playSound);
  const { applyGravity, replaceHalfLetters, activateBomb } = useBlocksLogic(gameState, setGameState, GRID_ROWS, GRID_COLS, playSound, isBombReady, deactivateBombState);
  const { checkSelectedWord, addFoundWord } = useWordsLogic(gameState, setGameState, dictionary);
  const { changeGameSpeed, moveBlocksDown } = useTimerLogic(gameState, setGameState, GRID_ROWS, GRID_COLS, playSound, monsterActive);
  const { showHint, animateBlockMatch, animationProgress } = useVisualEffects(gameState, setGameState);
  const { checkAchievements, trackLanguageSwitch, checkLevelUp, calculateBonusPoints, getAchievements, getUnlockedAchievements, getLockedAchievements, getAchievementProgress } = useAchievements(gameState, setGameState);

  const generateAndSetTargetWords = useCallback((lang: 'english' | 'arabic') => {
    const words = getRandomWords(TARGET_WORD_COUNT, dictionary);
    const targetWords: TargetWord[] = words.map(w => ({
      word: lang === 'english' ? w.arabic : w.english,
      meaning: lang === 'english' ? w.english : w.arabic,
      found: false,
    }));
    updateGameState({ targetWords });
  }, [dictionary, updateGameState]);

  const resetGame = useCallback(() => {
    resetCoreGameState();
    resetBombState();
    resetMonsterState();
    generateAndSetTargetWords(gameState.language);
    playSound('click');

    const initialRow = generateRow(GRID_ROWS - 1, gameState.language, GRID_COLS);
    setGameState(prevState => ({
      ...prevState,
      blocks: initialRow,
      rowCount: 1,
    }));
  }, [resetCoreGameState, resetBombState, resetMonsterState, generateAndSetTargetWords, gameState.language, playSound, setGameState, GRID_ROWS, GRID_COLS]);

  const switchLanguage = useCallback(() => {
    switchLanguageInState();
    const newLanguage = gameState.language === 'english' ? 'arabic' : 'english';
    generateAndSetTargetWords(newLanguage);
    trackLanguageSwitch();
    playSound('click');

    const initialRow = generateRow(GRID_ROWS - 1, newLanguage, GRID_COLS);
    setGameState(prevState => ({
        ...prevState,
        blocks: initialRow,
        selectedBlocks: [],
        score: 0,
        foundWords: [],
        gameStatus: 'playing',
        level: 1,
        rowCount: 1,
        hintBlocks: [],
      }));

  }, [switchLanguageInState, gameState.language, generateAndSetTargetWords, trackLanguageSwitch, playSound, setGameState, GRID_ROWS, GRID_COLS]);

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
      if (prevState.gameStatus === 'gameOver') return prevState;
      return { ...prevState, gameStatus: prevState.gameStatus === 'playing' ? 'paused' : 'playing' };
    });
    playSound('click');
  }, [setGameState, playSound]);

  useEffect(() => {
    // Initialize game on first load
    generateAndSetTargetWords(gameState.language);
  }, [generateAndSetTargetWords, gameState.language]);


  // This combined effect handles all monster-related state changes to prevent race conditions.
  useEffect(() => {
    setGameState(prev => {
      const monsterIsOnBoard = prev.blocks.some(b => b.isMonsterHere);
      if (!monsterActive && !monsterIsOnBoard && !blockToRemove) {
        return prev;
      }

      let newBlocks = prev.blocks;
      let changed = false;

      if (blockToRemove && newBlocks.some(b => b.id === blockToRemove)) {
        newBlocks = newBlocks.filter(b => b.id !== blockToRemove);
        playSound('bomb_botton');
        changed = true;
      }

      let needsSync = false;
      for (const block of newBlocks) {
        const shouldBeMonster = block.id === monsterBlockId;
        if (block.isMonsterHere !== shouldBeMonster) {
          needsSync = true;
          break;
        }
      }

      if (needsSync) {
        changed = true;
        newBlocks = newBlocks.map(b => ({
          ...b,
          isMonsterHere: b.id === monsterBlockId,
          letter: b.id === monsterBlockId ? '' : b.letter,
        }));
      }

      if (!changed) {
        return prev;
      }

      return { ...prev, blocks: newBlocks };
    });
  }, [monsterActive, monsterBlockId, blockToRemove, playSound, setGameState]);

  const prevMonsterActiveRef = useRef(false);

  useEffect(() => {
    if (prevMonsterActiveRef.current === true && monsterActive === false) {
      setGameState(prev => ({
        ...prev,
        blocks: applyGravity(prev.blocks)
      }));
    }
    prevMonsterActiveRef.current = monsterActive;
  }, [monsterActive, applyGravity, setGameState]);


  const selectBlock = useCallback((blockId: string) => {
    if (monsterActive) return;

    setGameState(prevState => {
      const block = prevState.blocks.find(b => b.id === blockId);
      if (!block || block.isMatched) return prevState;

      const selectedIndex = prevState.selectedBlocks.findIndex(b => b.id === blockId);
      if (selectedIndex !== -1) {
        const newSelectedBlocks = prevState.selectedBlocks.filter((_, index) => index !== selectedIndex);
        return {
          ...prevState,
          blocks: prevState.blocks.map(b => b.id === blockId ? { ...b, isSelected: false } : b),
          selectedBlocks: newSelectedBlocks,
        };
      }

      const newSelectedBlocks = [...prevState.selectedBlocks, block];
      const updatedBlocksWithSelection = prevState.blocks.map(b =>
        b.id === blockId ? { ...b, isSelected: true } : b
      );

      const selectedLetters = newSelectedBlocks.map(b => b.letter);
      const wordCheckResult = checkSelectedWord(selectedLetters);

      if (wordCheckResult.isValid) {
        const blocksToRemove = new Set(newSelectedBlocks.map(b => b.id));
        const remainingBlocks = updatedBlocksWithSelection.filter(b => !blocksToRemove.has(b.id));

        const finalBlocks = applyGravity(remainingBlocks).map(block => ({ ...block, isSelected: false }));

        const bonusPoints = calculateBonusPoints(newSelectedBlocks.length, 5);

        addFoundWord(wordCheckResult.newFoundWord, wordCheckResult.updatedTargetWords, wordCheckResult.points + bonusPoints);

        animateBlockMatch(newSelectedBlocks.map(b => b.id));

        playSound('match');

        checkAchievements();

        if (checkLevelUp()) {
          // playSound('levelUp');
        }

        return {
          ...prevState,
          blocks: finalBlocks,
          selectedBlocks: [],
        };
      }

      return {
        ...prevState,
        blocks: updatedBlocksWithSelection,
        selectedBlocks: newSelectedBlocks,
      };
    });
  }, [applyGravity, checkSelectedWord, addFoundWord, animateBlockMatch, checkAchievements, checkLevelUp, calculateBonusPoints, setGameState, monsterActive, playSound]);

  return {
    gameState,
    selectBlock,
    togglePause,
    resetGame,
    switchLanguage,
    clearSelection,
    changeGameSpeed,
    replaceHalfLetters,
    activateBomb,
    isBombReady,
    showHint,
    toggleMute,
    isMuted,
    getAchievements,
    getUnlockedAchievements,
    getLockedAchievements,
    getAchievementProgress,
    animationProgress,
    GRID_ROWS,
    GRID_COLS,
    activateMonster,
    isMonsterReady,
  };
};