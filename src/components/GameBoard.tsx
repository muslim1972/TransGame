import React from 'react';
import { LetterBlock } from './LetterBlock';
import { LetterBlock as LetterBlockType } from '../types/game';
import { GestureHandler } from './GestureHandler';

interface GameBoardProps {
  blocks: LetterBlockType[];
  onSelectBlock: (blockId: string) => void;
  onClearSelection: () => void;
  language: 'en' | 'ar';
  gridRows: number;
  gridCols: number;
  gameStatus: 'playing' | 'paused' | 'gameOver';
  hintBlocks: string[];
  score: number;
  selectedBlocks: LetterBlock[];
}

export const GameBoard: React.FC<GameBoardProps> = ({
  blocks,
  onSelectBlock,
  onClearSelection,
  language,
  gridRows,
  gridCols,
  gameStatus,
  hintBlocks,
  score,
  selectedBlocks,
}) => {
  const handleBoardClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClearSelection();
    }
  };

  // Handle gestures
  const handleSwipeUp = () => {
    // Activate bomb power-up on swipe up
    const bombButton = document.querySelector('[data-bomb-button]') as HTMLButtonElement;
    if (bombButton && !bombButton.disabled) {
      bombButton.click();
    }
  };

  const handleSwipeDown = () => {
    // Clear selection on swipe down
    onClearSelection();
  };

  const handleSwipeLeft = () => {
    // Replace letters on swipe left
    const replaceButton = document.querySelector('[data-replace-button]') as HTMLButtonElement;
    if (replaceButton) {
      replaceButton.click();
    }
  };

  const handleSwipeRight = () => {
    // Reset game on swipe right
    const resetButton = document.querySelector('[data-reset-button]') as HTMLButtonElement;
    if (resetButton) {
      resetButton.click();
    }
  };

  const handleTap = () => {
    // Toggle pause on tap
    const pauseButton = document.querySelector('[data-pause-button]') as HTMLButtonElement;
    if (pauseButton) {
      pauseButton.click();
    }
  };

  return (
    <div className="relative">
      <GestureHandler
        onSwipeUp={handleSwipeUp}
        onSwipeDown={handleSwipeDown}
        onSwipeLeft={handleSwipeLeft}
        onSwipeRight={handleSwipeRight}
        onTap={handleTap}
      >
        {/* Game Over Overlay */}
        {gameStatus === 'gameOver' && (
          <div className="absolute inset-0 bg-red-600 bg-opacity-90 flex items-center justify-center z-[999] rounded-xl">
            <div className="text-center text-white">
              <h2 className="text-4xl font-bold mb-2">GAME OVER</h2>
              <p className="text-xl">
                {language === 'ar' ? 'انتهت اللعبة!' : 'Better luck next time!'}
              </p>
            </div>
          </div>
        )}

        {/* Pause Overlay */}
        {gameStatus === 'paused' && (
          <div className="absolute inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-40 rounded-xl">
            <div className="text-center text-white">
              <h2 className="text-3xl font-bold mb-2">
                {language === 'ar' ? 'مُوقف مؤقتاً' : 'PAUSED'}
              </h2>
            </div>
          </div>
        )}

        {/* Game Grid */}
        <div
          className="relative bg-gradient-to-b from-blue-50 to-blue-100 border-blue-300 rounded-xl overflow-hidden"
          style={{
            width: `${8 * 60}px`, // 8 columns with larger size to fill same space as 10x48
            height: `${gridRows * 56}px`,
          }}
          onClick={handleBoardClick}
        >
          {/* Score Display in Top Left Corner */}
          <div className="absolute top-2 left-2 z-10 bg-white bg-opacity-80 px-3 py-1 rounded-lg shadow-md">
            <span className="font-bold text-lg text-purple-600">{score.toLocaleString()}</span>
          </div>

          {/* Selected Letters Display in Top Center */}
          {selectedBlocks.length > 0 && (
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10 bg-white bg-opacity-80 px-3 py-1 rounded-lg shadow-md">
              <div className="flex items-center space-x-1">
                <span className="font-semibold text-gray-700 text-sm">
                  {language === 'ar' ? 'الحروف:' : 'Letters:'}
                </span>
                <div className="flex space-x-1">
                  {selectedBlocks.map((block, index) => (
                    <span key={block.id} className="bg-yellow-100 text-yellow-800 px-1 py-0.5 rounded font-bold text-sm">
                      {block.letter}
                      {index < selectedBlocks.length - 1 && '-'}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Letter Blocks */}
          <div className="relative w-full h-full">
            {blocks.map(block => (
              <LetterBlock
                key={block.id}
                block={block}
                onSelect={onSelectBlock}
                language={language}
                isHinting={hintBlocks.includes(block.id)}
              />
            ))}
          </div>


        </div>
        </GestureHandler>
    </div>
  );
};