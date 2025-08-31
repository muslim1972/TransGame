import { useState, useEffect, useCallback, useRef } from 'react';
import { LetterBlock } from '../types/game';

const MONSTER_MAX_CONSUMED = 20;
const MONSTER_MOVE_INTERVAL = 500; // ms

export const useMonsterLogic = (blocks: LetterBlock[], GRID_ROWS: number, GRID_COLS: number, playSound: (soundName: string) => void) => {
  const [isMonsterReady, setIsMonsterReady] = useState(false);
  const [monsterWasUsed, setMonsterWasUsed] = useState(false);
  const prevHighestBlockRowRef = useRef(GRID_ROWS);
  const blocksRef = useRef(blocks);

  useEffect(() => {
    blocksRef.current = blocks;
  }, [blocks]);

  // Monster's internal state
  const [monsterBlockId, setMonsterBlockId] = useState<string | null>(null);
  const [blocksConsumedCount, setBlocksConsumedCount] = useState(0);
  const [monsterActive, setMonsterActive] = useState(false);
  const [blockToRemove, setBlockToRemove] = useState<string | null>(null);

  // --- Activation/Deactivation Logic ---
  const highestBlockRow = blocks.reduce((minRow, block) => Math.min(minRow, block.row), GRID_ROWS);
  useEffect(() => {
    const crossedThreshold5 = highestBlockRow <= 5 && prevHighestBlockRowRef.current > 5;
    const crossedThreshold2 = highestBlockRow <= 2 && prevHighestBlockRowRef.current > 2;
    if (!isMonsterReady) {
      if (crossedThreshold5 && !monsterWasUsed) setIsMonsterReady(true);
      else if (crossedThreshold2 && monsterWasUsed) {
        setIsMonsterReady(true);
        setMonsterWasUsed(false);
      }
    } else {
      if (highestBlockRow > 5 && !monsterWasUsed) setIsMonsterReady(false);
      else if (highestBlockRow > 2 && monsterWasUsed) setIsMonsterReady(false);
    }
    prevHighestBlockRowRef.current = highestBlockRow;
  }, [highestBlockRow, isMonsterReady, monsterWasUsed]);

  // --- Core Monster Movement Logic ---
  useEffect(() => {
    if (!monsterActive || !monsterBlockId) {
      return;
    }

    const moveTimer = setTimeout(() => {
      const currentMonsterBlock = blocksRef.current.find(b => b.id === monsterBlockId);
      if (!currentMonsterBlock) {
        setMonsterActive(false);
        setMonsterBlockId(null);
        return;
      }

      // 1. Stop after 20 blocks
      if (blocksConsumedCount >= MONSTER_MAX_CONSUMED) {
        setBlockToRemove(monsterBlockId);
        setMonsterBlockId(null);
        setMonsterActive(false);
        playSound('bomb'); // Monster end sound
        return;
      }

      // 2. Find all valid next positions
      const { row, col } = currentMonsterBlock;
      const directions = [
        { r: row - 1, c: col }, { r: row + 1, c: col },
        { r: row, c: col - 1 }, { r: row, c: col + 1 },
      ];
      
      const validTargetBlocks = blocksRef.current.filter(b => !b.isSelected);
      const validTargetPositions = new Set(validTargetBlocks.map(b => `${b.row},${b.col}`));

      const validMoves = directions.filter(dir => 
        !(dir.r < 0 || dir.r >= GRID_ROWS || dir.c < 0 || dir.c >= GRID_COLS) &&
        validTargetPositions.has(`${dir.r},${dir.c}`)
      );

      // 3. Decide what to do
      if (validMoves.length === 0) {
        // If stuck, find a new random block to move to.
        const availableBlocks = blocksRef.current.filter(b => !b.isSelected && b.id !== monsterBlockId);
        if (availableBlocks.length > 0) {
          const newStartBlock = availableBlocks[Math.floor(Math.random() * availableBlocks.length)];
          setBlockToRemove(monsterBlockId); // Remove the block it was stuck on
          setMonsterBlockId(newStartBlock.id); // Teleport to a new block
          setBlocksConsumedCount(prev => prev + 1); // Count this as a consumed block
        } else {
          // No available blocks left on the board, monster has nowhere to go.
          setBlockToRemove(monsterBlockId); // Remove the block it was stuck on
          setMonsterBlockId(null);
          setMonsterActive(false);
          playSound('bomb'); // Monster end sound
        }
        return;
      }

      const nextMoveCoords = validMoves[Math.floor(Math.random() * validMoves.length)];
      const nextBlock = blocksRef.current.find(b => b.row === nextMoveCoords.r && b.col === nextMoveCoords.c);

      if (nextBlock) {
        setBlockToRemove(monsterBlockId); // Remove current block
        setMonsterBlockId(nextBlock.id);   // Move to next block's ID
        setBlocksConsumedCount(prev => prev + 1);
        playSound('click'); // Monster movement sound
      } else {
        // Can't find the next block, get "stuck" for one cycle
        setBlocksConsumedCount(prev => prev + 1);
      }
      
    }, MONSTER_MOVE_INTERVAL);

    return () => clearTimeout(moveTimer);
  }, [monsterActive, monsterBlockId, blocksConsumedCount, GRID_ROWS, GRID_COLS, playSound]);

  const activateMonster = useCallback(() => {
    const allRows = blocks.map(b => b.row);
    if (allRows.length === 0) return;
    const bottomRow = Math.max(...allRows);
    const bottomRowBlocks = blocks.filter(b => b.row === bottomRow);
    
    if (bottomRowBlocks.length === 0) return;
    
    const startBlock = bottomRowBlocks[Math.floor(Math.random() * bottomRowBlocks.length)];
    
    setIsMonsterReady(false);
    setMonsterWasUsed(true);
    setBlocksConsumedCount(0);
    setBlockToRemove(null);
    setMonsterBlockId(startBlock.id);
    setMonsterActive(true);
    playSound('gameOver'); // Monster start sound
  }, [blocks, playSound]);

  const resetMonsterState = useCallback(() => {
    setIsMonsterReady(false);
    setMonsterWasUsed(false);
    setMonsterActive(false);
    setMonsterBlockId(null);
    setBlocksConsumedCount(0);
    setBlockToRemove(null);
    prevHighestBlockRowRef.current = GRID_ROWS;
  }, [GRID_ROWS]);

  return {
    isMonsterReady,
    activateMonster,
    resetMonsterState,
    monsterBlockId,
    monsterActive,
    blockToRemove,
  };
};