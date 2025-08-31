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
    setGameState(prevState => ({
      ...prevState,
      selectedBlocks: [],
      score: prevState.score + points,
      foundWords: [newFoundWord, ...prevState.foundWords].slice(0, 10),
      targetWords: updatedTargetWords,
    }));
  }, [setGameState]);

  return {
    validateWord,
    checkSelectedWord,
    addFoundWord
  };
};