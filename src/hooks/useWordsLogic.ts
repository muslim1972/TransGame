import { useCallback } from 'react';
import { findWord } from '../utils/words';
import { GameState, TargetWord, WordDefinition } from '../types/game';

export const useWordsLogic = (
  gameState: GameState,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>,
  dictionary: WordDefinition[]
) => {

  const checkSelectedWord = useCallback((selectedLetters: string[]) => {
    const foundWordDef = findWord(selectedLetters, gameState.language === 'arabic', dictionary);

    if (foundWordDef) {
      const isAlreadyFound = gameState.foundWords.some(fw => 
        (gameState.language === 'english' && fw.word === foundWordDef.english) ||
        (gameState.language === 'arabic' && fw.meaning === foundWordDef.english)
      );

      if (!isAlreadyFound) {
        const points = selectedLetters.length * 100; // POINTS_PER_LETTER
        const newFoundWord = {
          word: foundWordDef.english,
          meaning: foundWordDef.arabic,
          timestamp: Date.now(),
        };

        const updatedTargetWords = gameState.targetWords.map(target => {
          if (!target.found) {
            const isMatch =
              (gameState.language === 'english' && target.word === foundWordDef.arabic) ||
              (gameState.language === 'arabic' && target.word === foundWordDef.english);

            if (isMatch) {
              return { ...target, found: true };
            }
          }
          return target;
        });

        return {
          isValid: true,
          points,
          newFoundWord,
          updatedTargetWords
        };
      }
    }

    return {
      isValid: false
    };
  }, [gameState.language, gameState.foundWords, gameState.targetWords, dictionary]);

  const addFoundWord = useCallback((newFoundWord: any, updatedTargetWords: TargetWord[], points: number) => {
    setGameState(prevState => {
      const allWordsFound = updatedTargetWords.every(word => word.found);
      if (allWordsFound) {
        return {
          ...prevState,
          selectedBlocks: [],
          score: prevState.score + points + 2000, // Add 2000 bonus points
          foundWords: [newFoundWord, ...prevState.foundWords].slice(0, 10),
          targetWords: updatedTargetWords,
          gameStatus: 'gameOver', // End the game
        };
      }

      return {
        ...prevState,
        selectedBlocks: [],
        score: prevState.score + points,
        foundWords: [newFoundWord, ...prevState.foundWords].slice(0, 10),
        targetWords: updatedTargetWords,
      };
    });
  }, [setGameState]);

  return {
    checkSelectedWord,
    addFoundWord
  };
};