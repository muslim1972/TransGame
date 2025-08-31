import { useState, useCallback } from 'react';
import { LetterBlock } from '../types/game';

const ENGLISH_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const ARABIC_LETTERS = 'اأإآبتثجحخدذرزسشصضطظعغفقكلمنهويىةءئؤة';

const generateRandomLetter = (language: 'english' | 'arabic'): string => {
  const letters = language === 'english' ? ENGLISH_LETTERS : ARABIC_LETTERS;
  return letters[Math.floor(Math.random() * letters.length)];
};

export const useBlocksLogic = (
  gameState: any,
  setGameState: React.Dispatch<React.SetStateAction<any>>,
  GRID_ROWS: number,
  GRID_COLS: number,
  playSound: (soundName: string) => void,
  isBombReady: boolean,
  deactivateBombState: () => void
) => {

  const applyGravity = useCallback((blocks: LetterBlock[]): LetterBlock[] => {
    // Create a grid matrix to handle gravity
    const gridMatrix: (LetterBlock | null)[][] = Array(GRID_ROWS).fill(null).map(() => Array(GRID_COLS).fill(null));
    blocks.forEach(b => {
      if (b.row >= 0 && b.row < GRID_ROWS && b.col >= 0 && b.col < GRID_COLS) {
        gridMatrix[b.row][b.col] = b;
      }
    });

    // Apply gravity
    const finalBlocks: LetterBlock[] = [];
    for (let col = 0; col < GRID_COLS; col++) {
      let emptySpaces = 0;
      for (let row = GRID_ROWS - 1; row >= 0; row--) {
        if (gridMatrix[row][col]) {
          const newRow = row + emptySpaces;
          finalBlocks.push({ ...gridMatrix[row][col]!, row: newRow });
        } else {
          emptySpaces++;
        }
      }
    }

    return finalBlocks;
  }, [GRID_ROWS, GRID_COLS]);

  const replaceHalfLetters = useCallback(() => {
    setGameState(prevState => {
      if (prevState.gameStatus !== 'playing') return prevState;

      const nonSelectedBlocks = prevState.blocks.filter(block => !block.isSelected);
      const blocksToReplaceCount = Math.floor(nonSelectedBlocks.length / 2);

      if (blocksToReplaceCount === 0) return prevState;

      const shuffledBlocks = [...nonSelectedBlocks].sort(() => 0.5 - Math.random());
      const blocksToReplaceIds = shuffledBlocks.slice(0, blocksToReplaceCount).map(block => block.id);

      const updatedBlocks = prevState.blocks.map(block => {
        if (blocksToReplaceIds.includes(block.id)) {
          return {
            ...block,
            letter: generateRandomLetter(prevState.language),
            isReplacedRecently: true
          };
        }
        return {
          ...block,
          isReplacedRecently: false
        };
      });

      return {
        ...prevState,
        blocks: updatedBlocks
      };
    });

    // Animate the replaced blocks
    // Play replace sound
    playSound('replace');

    setTimeout(() => {
      setGameState(prevState => ({
        ...prevState,
        blocks: prevState.blocks.map(block => ({
          ...block,
          isReplacedRecently: false
        }))
      }));
    }, 2000);
  }, [setGameState, playSound]);

  const activateBomb = useCallback(() => {
    setGameState(prevState => {
      if (prevState.gameStatus !== 'playing' || !isBombReady) return prevState;

      const bombCount = (prevState.bombCount || 0) + 1;
      const nonSelectedBlocks = prevState.blocks.filter(block => !block.isSelected);
      const blocksToRemoveCount = Math.min(15, nonSelectedBlocks.length);

      let blocksToRemoveIds: string[] = []; // Initialize to empty array

      if (blocksToRemoveCount > 0) {
        const shuffledBlocks = [...nonSelectedBlocks].sort(() => 0.5 - Math.random());
        blocksToRemoveIds = shuffledBlocks.slice(0, blocksToRemoveCount).map(block => block.id);
      } else {
        // If no blocks to remove, return early to prevent further processing
        return prevState;
      }

      const remainingBlocks = prevState.blocks.filter(block => !blocksToRemoveIds.includes(block.id));
      const finalBlocks = applyGravity(remainingBlocks);

      // Play bomb sound immediately
      playSound('bomb');

      // Set isBombExploding to true and then false after a delay
      setTimeout(() => {
        setGameState(prev => ({
          ...prev,
          isBombExploding: false
        }));
      }, 1000);

      return {
        ...prevState,
        blocks: finalBlocks,
        isBombExploding: true,
        bombCount,
      };
    });
    deactivateBombState(); // Call the deactivation function after state update
  }, [setGameState, playSound, applyGravity, deactivateBombState, isBombReady]);

  return {
    applyGravity,
    replaceHalfLetters,
    activateBomb,
    isBombReady,
  };
};