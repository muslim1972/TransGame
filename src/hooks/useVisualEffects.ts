import { useCallback, useRef } from 'react';
import { GameState, LetterBlock } from '../types/game';

export const useVisualEffects = (
  gameState: GameState,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
) => {
  const hintTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showHint = useCallback(() => {
    if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);

    // Find a random word from target words
    if (gameState.targetWords.length === 0) return;

    const randomWord = gameState.targetWords[Math.floor(Math.random() * gameState.targetWords.length)];
    const wordLetters = randomWord.word.split('');

    // Find blocks that match the word letters
    const matchingBlocks = gameState.blocks.filter(block => 
      wordLetters.includes(block.letter) && !block.isMatched
    );

    if (matchingBlocks.length < wordLetters.length) return;

    // Select the required number of blocks
    const hintBlocks = [...matchingBlocks]
      .sort(() => 0.5 - Math.random())
      .slice(0, wordLetters.length);

    setGameState(prevState => ({
      ...prevState,
      hintBlocks: hintBlocks.map(block => block.id)
    }));

    // Clear hint after 3 seconds
    hintTimeoutRef.current = setTimeout(() => {
      setGameState(prevState => ({
        ...prevState,
        hintBlocks: []
      }));
    }, 3000);
  }, [gameState.blocks, gameState.targetWords]);

  const animateBlockMatch = useCallback((blockIds: string[]) => {
    setGameState(prevState => ({
      ...prevState,
      blocks: prevState.blocks.map(block => 
        blockIds.includes(block.id) 
          ? { ...block, isMatched: true, isAnimating: true } 
          : block
      )
    }));

    // Remove animation after a delay
    setTimeout(() => {
      setGameState(prevState => ({
        ...prevState,
        blocks: prevState.blocks.map(block => 
          blockIds.includes(block.id) 
            ? { ...block, isAnimating: false } 
            : block
        )
      }));
    }, 500);
  }, []);

  const animateBlockReplacement = useCallback((blockIds: string[]) => {
    setGameState(prevState => ({
      ...prevState,
      blocks: prevState.blocks.map(block => 
        blockIds.includes(block.id) 
          ? { ...block, isReplacedRecently: true, isAnimating: true } 
          : block
      )
    }));

    // Remove animation after a delay
    setTimeout(() => {
      setGameState(prevState => ({
        ...prevState,
        blocks: prevState.blocks.map(block => 
          blockIds.includes(block.id) 
            ? { ...block, isReplacedRecently: false, isAnimating: false } 
            : block
        )
      }));
    }, 500);
  }, []);

  const animateBombExplosion = useCallback(() => {
    setGameState(prevState => ({
      ...prevState,
      isBombExploding: true
    }));

    // Remove explosion animation after a delay
    setTimeout(() => {
      setGameState(prevState => ({
        ...prevState,
        isBombExploding: false
      }));
    }, 1000);
  }, []);

  return {
    showHint,
    animateBlockMatch,
    animateBlockReplacement,
    animateBombExplosion
  };
};