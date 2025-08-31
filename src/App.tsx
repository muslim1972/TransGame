import React, { useState } from 'react';
import { GameBoard } from './components/GameBoard';
import { Sidebar } from './components/Sidebar';
import { TargetWords } from './components/TargetWords';
import { useGameLogic } from './hooks/useGameLogic';
import { BookOpen, Shuffle, Bomb, RotateCcw, Languages, Trophy } from 'lucide-react';
import { Pause, Play } from 'lucide-react'; // Explicitly import Pause and Play to resolve potential issues
import { MenuButton } from './components/MenuButton';

function App() {
  const {
    gameState,
    selectBlock,
    togglePause,
    resetGame,
    switchLanguage,
    clearSelection,
    changeGameSpeed,
    replaceHalfLetters,
    activateBomb,
    isBombReady,
    animationProgress,
    GRID_ROWS,
    GRID_COLS,
    activateMonster,
    isMonsterReady,
  } = useGameLogic();

  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check for system dark mode preference on initial load
  React.useEffect(() => {
    const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDarkMode) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);

    // Add or remove 'dark' class from the html element
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className={`min-h-screen w-full ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
      {/* Floating Menu Button */}
      <div className="fixed top-4 right-4 z-[9999]">
        <MenuButton 
          onToggleDarkMode={toggleDarkMode}
          isDarkMode={isDarkMode}
          language={gameState.language}
          gameSpeed={gameState.gameSpeed}
          onChangeSpeed={changeGameSpeed}
        />
      </div>

      {/* Main Game Area */}
      <main className="mx-auto px-6 py-8 w-full">
        <div className="flex flex-col lg:flex-row justify-center items-start lg:space-x-8 space-y-8 lg:space-y-0">

          {/* Game Board with Controls */}
          <div className="flex flex-col items-center">

            {/* Game Board */}
            <div className="flex-shrink-0">
              <GameBoard
                blocks={gameState.blocks}
                onSelectBlock={selectBlock}
                onClearSelection={clearSelection}
                language={gameState.language}
                gridRows={GRID_ROWS}
                gridCols={GRID_COLS}
                gameStatus={gameState.gameStatus}
                hintBlocks={gameState.hintBlocks}
                animationProgress={animationProgress}
                score={gameState.score}
                selectedBlocks={gameState.selectedBlocks}
              />

              {/* Game Controls - Moved Below Game Board */}
              <div className="flex space-x-1 mt-2 justify-center">
                {/* Pause/Play Button */}
                <button
                  onClick={togglePause}
                  disabled={gameState.gameStatus === 'gameOver'}
                  data-pause-button="true"
                  className={`
                    w-14 h-14 flex flex-col items-center justify-center p-1 rounded-xl font-semibold text-xs transition-all duration-200
                    ${gameState.gameStatus === 'gameOver'
                      ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      : gameState.gameStatus === 'paused'
                        ? 'bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white shadow-lg'
                        : 'bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700 text-white shadow-lg'
                    }
                  `}
                >
                  {gameState.gameStatus === 'paused' ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
                  <span className="text-xs">
                    {gameState.gameStatus === 'paused'
                      ? (gameState.language === 'ar' ? 'تشغيل' : 'Resume')
                      : (gameState.language === 'ar' ? 'إيقاف' : 'Pause')
                    }
                  </span>
                </button>

                {/* Reset Button */}
                <button
                  onClick={resetGame}
                  data-reset-button="true"
                  className="w-14 h-14 flex flex-col items-center justify-center p-1 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white rounded-xl font-semibold text-xs transition-all duration-200 shadow-lg"
                >
                  <RotateCcw className="w-6 h-6" />
                  <span className="text-xs">
                    {gameState.language === 'ar' ? 'إعادة' : 'Reset'}
                  </span>
                </button>

                {/* Language Switch Button */}
                <button
                  onClick={switchLanguage}
                  className="w-14 h-14 flex flex-col items-center justify-center p-1 bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white rounded-xl font-semibold text-xs transition-all duration-200 shadow-lg"
                >
                  <Languages className="w-6 h-6" />
                  <span className="text-xs">
                    {gameState.language === 'ar' ? 'لغة' : 'Lang'}
                  </span>
                </button>

                {/* Replace Half Letters Button */}
                <button
                  onClick={replaceHalfLetters}
                  data-replace-button="true"
                  className="w-14 h-14 flex flex-col items-center justify-center p-1 rounded-xl font-semibold text-xs transition-all duration-200 bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700 text-white shadow-lg"
                >
                  <Shuffle className="w-6 h-6" />
                  <span className="text-xs">
                    {gameState.language === 'ar' ? 'استبدال' : 'Replace'}
                  </span>
                </button>

                {/* Bomb Button */}
                <button
                  onClick={activateBomb}
                  disabled={!isBombReady}
                  data-bomb-button="true"
                  className={`w-14 h-14 flex flex-col items-center justify-center p-1 rounded-xl font-semibold text-xs transition-all duration-200 shadow-lg
                    ${isBombReady ? 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white' : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'}
                  `}
                >
                  <Bomb className="w-6 h-6" />
                  <span className="text-xs">
                    {gameState.language === 'ar' ? 'قنبلة' : 'Bomb'}
                  </span>
                </button>

                {/* Monster Button */}
                <button
                  onClick={activateMonster}
                  disabled={!isMonsterReady}
                  className={`w-14 h-14 flex flex-col items-center justify-center p-1 rounded-xl font-semibold text-xs transition-all duration-200 shadow-lg z-40
                    ${isMonsterReady ? 'bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700 text-white' : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'}
                  `}
                >
                  <span className="w-6 h-6">👹</span>
                  <span className="text-xs">
                    {gameState.language === 'ar' ? 'وحش' : 'Monster'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Words Sections */}
          <div className="flex flex-row gap-2" style={{ width: '480px' }}>
            {/* Target Words */}
            {gameState.targetWords && (
              <div className="w-2/3">
                <TargetWords
                  targetWords={gameState.targetWords}
                  foundWords={gameState.foundWords}
                  language={gameState.language}
                />
              </div>
            )}

            {/* Found Words */}
            {gameState.foundWords.length > 0 && (
              <div className="w-1/3">
            <div className="flex flex-col gap-2">
              {gameState.foundWords.map((word, index) => (
                <div
                  key={index}
                  className={`p-2 rounded-lg text-center ${
                    isDarkMode
                      ? 'bg-gray-800/80 text-green-300 border border-green-600/50 shadow-lg'
                      : 'bg-green-50 text-green-800 border border-green-200'
                  }`}
                >
                  <div className="font-bold text-3xl">{word.word}</div>
                  <div className="text-xl mt-1">{word.meaning}</div>
                </div>
              ))}
            </div>
          </div>
            )}
          </div>
        </div>

        {/* Selected Letters Display - Moved to GameBoard component */}
      </main>
    </div>
  );
}

export default App;