import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, LetterBlock, TargetWord } from '../types/game';
import { useGameState } from './game/useGameState';
import { useBlocksLogic } from './useBlocksLogic';
import { useWordsLogic } from './useWordsLogic';
import { useTimerLogic } from './useTimerLogic';
import { useGameControls } from './useGameControls';
import { useVisualEffects } from './useVisualEffects';
import { useSoundManager } from './useSoundManager';
import { useAchievements } from './useAchievements';
import { useBombLogic } from '././useBombLogic';
import { useMonsterLogic } from './useMonsterLogic';
import { generateRow } from '../utils/grid';

export const useGameLogic = () => {
  const { gameState, setGameState, updateGameState, generateTargetWords, resetGameState, switchLanguage, GRID_ROWS, GRID_COLS } = useGameState();

  // Use the sound manager hook
  const {
    playSound,
    toggleMute,
    isMuted
  } = useSoundManager();

  const { isBombReady, deactivateBombState, resetBombState } = useBombLogic(gameState.rowCount);

  // Use the monster logic hook
  const { isMonsterReady, activateMonster, resetMonsterState, monsterBlockId, monsterActive, blockToRemove } = useMonsterLogic(gameState.blocks, GRID_ROWS, GRID_COLS, playSound);

  // Use the blocks logic hook
  const {
    applyGravity,
    replaceHalfLetters,
    activateBomb,
  } = useBlocksLogic(gameState, setGameState, GRID_ROWS, GRID_COLS, playSound, isBombReady, deactivateBombState);

  // Use the words logic hook
  const {
    checkSelectedWord,
    addFoundWord,
  } = useWordsLogic(gameState, setGameState);

  // Use the timer logic hook
  const {
    changeGameSpeed,
    moveBlocksDown
  } = useTimerLogic(gameState, setGameState, GRID_ROWS, GRID_COLS, playSound, monsterActive);

  // Use the game controls hook
  const {
    resetGame,
    handleSwitchLanguage,
    clearSelection,
    togglePause
  } = useGameControls(
    gameState, 
    setGameState, 
    resetGameState, 
    switchLanguage, 
    generateTargetWords, 
    generateRow, 
    GRID_ROWS, 
    GRID_COLS,
    playSound,
    resetBombState, // New argument
    resetMonsterState // New argument
  );

  // Use the visual effects hook
  const {
    showHint,
    animateBlockMatch,
    animateBlockReplacement,
    animateBombExplosion,
    animationProgress
  } = useVisualEffects(gameState, setGameState);

  // Use the achievements hook
  const {
    checkAchievements,
    trackBombUsage,
    trackLanguageSwitch,
    trackPerfectGame,
    checkLevelUp,
    calculateBonusPoints,
    getAchievements,
    getUnlockedAchievements,
    getLockedAchievements,
    getAchievementProgress
  } = useAchievements(gameState, setGameState);

  // This combined effect handles all monster-related state changes to prevent race conditions.
  useEffect(() => {
    setGameState(prev => {
      // Guard condition to prevent running when not needed
      const monsterIsOnBoard = prev.blocks.some(b => b.isMonsterHere);
      if (!monsterActive && !monsterIsOnBoard && !blockToRemove) {
        return prev;
      }

      let newBlocks = prev.blocks;
      let changed = false;

      // --- Step 1: Handle Block Destruction ---
      if (blockToRemove && newBlocks.some(b => b.id === blockToRemove)) {
        newBlocks = newBlocks.filter(b => b.id !== blockToRemove); // Gravity applied only at the end of monster's run
        playSound('bomb_botton');
        changed = true;
      }

      // --- Step 2: Sync Monster's Visual Position ---
      // We check if the visual representation of the monster in the grid
      // is out of sync with the definitive state from useMonsterLogic (monsterBlockId).
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
  }, [monsterActive, monsterBlockId, blockToRemove, applyGravity, playSound, setGameState]);

  const prevMonsterActiveRef = useRef(false);

  useEffect(() => {
    // Detect transition from monsterActive: true to false
    if (prevMonsterActiveRef.current === true && monsterActive === false) {
      setGameState(prev => ({
        ...prev,
        blocks: applyGravity(prev.blocks)
      }));
    }
    prevMonsterActiveRef.current = monsterActive;
  }, [monsterActive, applyGravity, setGameState]);

  // generateTargetWords is now imported from useGameState

  const selectBlock = useCallback((blockId: string) => {
    if (monsterActive) return; // Disable when monster is active

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

        // Apply gravity using the function from useBlocksLogic
        const finalBlocks = applyGravity(remainingBlocks).map(block => ({ ...block, isSelected: false }));

        // Calculate bonus points
        const bonusPoints = calculateBonusPoints(newSelectedBlocks.length, 5); // Assuming 5 seconds for now

        // Add the found word using the function from useWordsLogic
        addFoundWord(wordCheckResult.newFoundWord, wordCheckResult.updatedTargetWords, wordCheckResult.points + bonusPoints);

        // Animate the matched blocks
        animateBlockMatch(newSelectedBlocks.map(b => b.id));

        // Play sound for match
        playSound('match');

        // Check for achievements
        checkAchievements();

        // Check for level up
        if (checkLevelUp()) {
          // TODO: Add sound for level up
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
  }, [applyGravity, checkSelectedWord, addFoundWord, animateBlockMatch, checkAchievements, checkLevelUp, calculateBonusPoints, setGameState, monsterActive]);

  // --- Guarded actions for when monster is active ---
  const guardedReplaceHalfLetters = useCallback(() => {
    if (monsterActive) return;
    replaceHalfLetters();
  }, [monsterActive, replaceHalfLetters]);

  const guardedActivateBomb = useCallback(() => {
    if (monsterActive) return;
    activateBomb();
  }, [monsterActive, activateBomb]);

  const guardedShowHint = useCallback(() => {
    if (monsterActive) return;
    showHint();
  }, [monsterActive, showHint]);

  const guardedSwitchLanguage = useCallback((lang: 'english' | 'arabic') => {
    if (monsterActive) return;
    handleSwitchLanguage(lang);
  }, [monsterActive, handleSwitchLanguage]);


  // Initialize game on first load
  useEffect(() => {
    resetGame();
  }, [resetGame]);

  useEffect(() => {
    generateTargetWords();
  }, [generateTargetWords]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    gameState,
    selectBlock,
    togglePause,
    resetGame,
    switchLanguage: guardedSwitchLanguage,
    clearSelection,
    changeGameSpeed,
    replaceHalfLetters: guardedReplaceHalfLetters,
    activateBomb: guardedActivateBomb,
    isBombReady,
    showHint: guardedShowHint,
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
    resetMonsterState,
    monsterActive,
    monsterBlockId,
  };
};