import React from 'react';
import { LetterBlock as LetterBlockType } from '../types/game';

interface LetterBlockProps {
  block: LetterBlockType;
  onSelect: (blockId: string) => void;
  language: 'en' | 'ar';
  isHinting?: boolean;
}

export const LetterBlock: React.FC<LetterBlockProps> = ({
  block,
  onSelect,
  language,
  isHinting = false
}) => {
  const handleClick = () => {
    onSelect(block.id);
  };

  return (
    <div
      className={`
        w-14 h-14 border-2 rounded-lg cursor-pointer
        flex items-center justify-center font-bold text-4xl
        absolute
        ${block.isMonsterHere
          ? 'border-purple-700 bg-purple-500 text-white shadow-lg ring-2 ring-purple-400'
          : block.isReplacedRecently
            ? 'border-green-500 bg-green-200 dark:bg-green-800/50 text-green-900 dark:text-green-200 shadow-lg ring-2 ring-green-400 animate-fade-out'
            : isHinting
              ? 'border-orange-400 bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200 shadow-lg ring-2 ring-orange-300 animate-pulse'
              : block.isSelected
                ? 'border-yellow-400 bg-yellow-100 dark:bg-yellow-800/50 text-yellow-800 dark:text-yellow-200 shadow-lg ring-2 ring-yellow-300'
                : 'border-green-400 bg-green-50 dark:bg-gray-700/50 text-green-800 dark:text-green-200 hover:border-green-500 hover:bg-green-100 dark:hover:bg-gray-600'
        }
        ${language === 'ar' ? 'font-arabic' : 'font-mono'}
      `}
      onClick={handleClick}
      style={{
        left: `${block.col * 60 - 1}px`,
        top: `${block.row * 56}px`,
        transition: 'top 0.5s ease-in-out',
        zIndex: block.row * 10 + block.col,
      }}
    >
      {block.isMonsterHere ? '👾' : block.letter}
    </div>
  );
};
