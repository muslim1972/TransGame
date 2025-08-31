import { useCallback } from 'react';
import { findWord, Word, ValidateWordRequest, ValidateWordResponse } from '../data/words1';
import { GameState, TargetWord } from '../types/game';

export const useWordsLogic = (
  gameState: GameState,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
) => {
  const validateWord = useCallback((request: ValidateWordRequest): ValidateWordResponse => {
    const { word, isArabicMode } = request;

    // Find the word in the dictionary
    const foundWord = findWord(word.split(''), isArabicMode);

    if (foundWord) {
      return {
        isValid: true,
        meaning: isArabicMode ? foundWord.english : foundWord.arabic
      };
    }

    return {
      isValid: false
    };
  }, []);

  const checkSelectedWord = useCallback((selectedLetters: string[]) => {
    const foundWordDef = findWord(selectedLetters, gameState.language === 'arabic');

    if (foundWordDef) {
      const isAlreadyFound = gameState.foundWords.some(fw => fw.word === foundWordDef.english);

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
  }, [gameState.language, gameState.foundWords, gameState.targetWords]);

  const addFoundWord = useCallback((newFoundWord: any, updatedTargetWords: TargetWord[], points: number) => {
    setGameState(prevState => {
      // Find the index of the word that was just found
      const foundWordIndex = updatedTargetWords.findIndex(target => 
        (prevState.language === 'english' && target.word === newFoundWord.meaning) ||
        (prevState.language === 'arabic' && target.word === newFoundWord.meaning)
      );

      // Reorganize the target words array
      let reorganizedTargetWords = [...updatedTargetWords];

      if (foundWordIndex !== -1) {
        // Move the found word to the second position (index 1)
        const foundWord = reorganizedTargetWords[foundWordIndex];
        reorganizedTargetWords.splice(foundWordIndex, 1);
        reorganizedTargetWords.splice(1, 0, foundWord);

        // Find a non-found word to put at the top
        const nonFoundWordIndex = reorganizedTargetWords.findIndex((word, index) => 
          index !== 1 && !word.found
        );

        if (nonFoundWordIndex !== -1) {
          // Move the non-found word to the first position
          const nonFoundWord = reorganizedTargetWords[nonFoundWordIndex];
          reorganizedTargetWords.splice(nonFoundWordIndex, 1);
          reorganizedTargetWords.unshift(nonFoundWord);
        }

        // Check if all words have been found (game won)
        const allWordsFound = reorganizedTargetWords.every(word => word.found);
        if (allWordsFound) {
          // Game won - add bonus points and update game status
          return {
            ...prevState,
            selectedBlocks: [],
            score: prevState.score + points + 2000, // Add 2000 bonus points
            foundWords: [newFoundWord, ...prevState.foundWords].slice(0, 10),
            targetWords: reorganizedTargetWords,
            gameStatus: 'gameOver', // End the game
          };
        }
      }

      return {
        ...prevState,
        selectedBlocks: [],
        score: prevState.score + points,
        foundWords: [newFoundWord, ...prevState.foundWords].slice(0, 10),
        targetWords: reorganizedTargetWords,
      };
    });
  }, [setGameState]);

  return {
    validateWord,
    checkSelectedWord,
    addFoundWord
  };
};