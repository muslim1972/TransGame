import React from 'react';

interface SidebarProps {
  score: number;
  foundWords: Array<{
    word: string;
    meaning: string;
    timestamp: number;
  }>;
  language: 'en' | 'ar';
  gameStatus: 'playing' | 'paused' | 'gameOver';
  onTogglePause: () => void;
  onResetGame: () => void;
  onSwitchLanguage: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  score,
  foundWords,
  language,
  gameStatus,
  onTogglePause,
  onResetGame,
  onSwitchLanguage,
}) => {
  // Empty sidebar component
  return null;
};