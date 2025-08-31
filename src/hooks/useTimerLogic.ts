import { useEffect, useCallback, useRef } from 'react';
import { GameState } from '../types/game';
import { generateRow } from '../utils/grid';

export const useTimerLogic = (
  gameState: GameState,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>,
  GRID_ROWS: number,
  GRID_COLS: number,
  playSound: (soundName: string) => void,
  monsterActive: boolean // New parameter
) => {
  const gameIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const moveBlocksDown = useCallback(() => {
    setGameState(prevState => {
      // This check is an extra safeguard, the timer shouldn't even be running.
      if (prevState.gameStatus !== 'playing' || monsterActive) return prevState;

      const movedBlocks = prevState.blocks.map(block => ({ ...block, row: block.row - 1 }));

      const isGameOver = movedBlocks.some(b => b.row < 0);
      if (isGameOver) {
        playSound('gameOver');
        return { ...prevState, gameStatus: 'gameOver' };
      }

      const newRow = generateRow(GRID_ROWS - 1, prevState.language, GRID_COLS);
      const newBlocks = [...movedBlocks.filter(b => b.row >= 0), ...newRow];

      playSound('newRow');

      return {
        ...prevState,
        blocks: newBlocks,
        rowCount: prevState.rowCount + 1,
      };
    });
  }, [setGameState, GRID_ROWS, GRID_COLS, playSound, monsterActive]); // Added monsterActive

  // Start or stop the game timer based on game status
  useEffect(() => {
    if (gameIntervalRef.current) {
      clearInterval(gameIntervalRef.current);
    }

    // Only run the timer if the game is playing AND the monster is not active
    if (gameState.gameStatus === 'playing' && !monsterActive) {
      gameIntervalRef.current = setInterval(() => {
        moveBlocksDown();
      }, gameState.gameSpeed);
    }

    return () => {
      if (gameIntervalRef.current) {
        clearInterval(gameIntervalRef.current);
      }
    };
  }, [gameState.gameSpeed, gameState.gameStatus, moveBlocksDown, monsterActive]); // Added monsterActive

  const changeGameSpeed = useCallback((newSpeed: number) => {
    setGameState(prevState => ({ ...prevState, gameSpeed: newSpeed * 1000 }));
  }, [setGameState]);

  return {
    changeGameSpeed,
    moveBlocksDown
  };
};