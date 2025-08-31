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

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-gray-800 via-gray-900 to-black' : 'bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100'}`}>
      {/* Floating Menu Button */}
      <div className="fixed top-4 right-4 z-50">
        <MenuButton 
          onToggleDarkMode={toggleDarkMode}
          isDarkMode={isDarkMode}
          language={gameState.language}
          gameSpeed={gameState.gameSpeed}
          onChangeSpeed={changeGameSpeed}
        />
      </div>

      {/* Main Game Area */}
      <main className="max-w-screen-xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row justify-center items-start lg:space-x-8 space-y-8 lg:space-y-0">

          {/* Game Board with Controls */}
          <div className="flex flex-col items-center">

            {/* Score Display */}
            <div className="flex items-center justify-center w-full mb-4">
              <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-xl shadow-lg">
                <Trophy className="w-6 h-6" />
                <span className="text-xl font-bold">{gameState.score.toLocaleString()}</span>
              </div>
            </div>

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
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : gameState.gameStatus === 'paused'
                        ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg'
                        : 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-lg'
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
                  className="w-14 h-14 flex flex-col items-center justify-center p-1 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold text-xs transition-all duration-200 shadow-lg"
                >
                  <RotateCcw className="w-6 h-6" />
                  <span className="text-xs">
                    {gameState.language === 'ar' ? 'إعادة' : 'Reset'}
                  </span>
                </button>

                {/* Language Switch Button */}
                <button
                  onClick={switchLanguage}
                  className="w-14 h-14 flex flex-col items-center justify-center p-1 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-semibold text-xs transition-all duration-200 shadow-lg"
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
                  className="w-14 h-14 flex flex-col items-center justify-center p-1 rounded-xl font-semibold text-xs transition-all duration-200 bg-purple-500 hover:bg-purple-600 text-white shadow-lg"
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
                    ${isBombReady ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}
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
                    ${isMonsterReady ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}
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

          {/* Right Sidebar */}
          {gameState.targetWords && (
            <div className="w-full lg:w-64">
              <TargetWords
                targetWords={gameState.targetWords}
                foundWords={gameState.foundWords}
                language={gameState.language}
              />
            </div>
          )}
        </div>

        {/* Found Words Section */}
        {gameState.foundWords.length > 0 && (
          <div className="mt-12 w-full max-w-2xl mx-auto">
            <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              {gameState.language === 'ar' ? 'الكلمات المكتشفة' : 'Found Words'}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {gameState.foundWords.map((word, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg text-center ${
                    isDarkMode
                      ? 'bg-gray-800 text-green-400 border border-green-600'
                      : 'bg-green-50 text-green-800 border border-green-200'
                  }`}
                >
                  <div className="font-bold">{word.word}</div>
                  <div className="text-sm mt-1">{word.meaning}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected Letters Display */}
        {gameState.selectedBlocks.length > 0 && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-xl p-4 border-2 border-yellow-400">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-gray-700">
                {gameState.language === 'ar' ? 'الحروف المختارة:' : 'Selected:'}
              </span>
              <div className="flex space-x-1">
                {gameState.selectedBlocks.map((block, index) => (
                  <span key={block.id} className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-bold">
                    {block.letter}
                    {index < gameState.selectedBlocks.length - 1 && '-'}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;