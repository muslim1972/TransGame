import React, { useState } from 'react';
import { Menu, Moon, Sun, HelpCircle, Gauge, Plus } from 'lucide-react'; // Using lucide-react for the menu icon

interface MenuButtonProps {
  onToggleDarkMode?: () => void;
  isDarkMode?: boolean;
  language?: 'en' | 'ar';
  gameSpeed?: number;
  onChangeSpeed?: (speed: number) => void;
  onAddWordClick?: () => void;
}

export const MenuButton: React.FC<MenuButtonProps> = ({ 
  onToggleDarkMode, 
  isDarkMode = false,
  language = 'en',
  gameSpeed = 5,
  onChangeSpeed,
  onAddWordClick
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showGameSpeed, setShowGameSpeed] = useState(false);

  const speedInSeconds = gameSpeed / 1000;
  const speedOptions = [3, 5, 10, 15, 20, 30, 35, 40, 45];

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleToggleDarkMode = () => {
    if (onToggleDarkMode) {
      onToggleDarkMode();
    }
    setIsOpen(false);
  };

  const handleShowHowToPlay = () => {
    setShowHowToPlay(true);
    setIsOpen(false);
  };

  const handleShowGameSpeed = () => {
    setShowGameSpeed(true);
    setIsOpen(false);
  };

  const handleAddWordClick = () => {
    if (onAddWordClick) {
      onAddWordClick();
    }
    setIsOpen(false);
  };

  const closeHowToPlay = () => {
    setShowHowToPlay(false);
  };

  const closeGameSpeed = () => {
    setShowGameSpeed(false);
  };

  const handleSpeedChange = (speed: number) => {
    if (onChangeSpeed) {
      onChangeSpeed(speed);
    }
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={toggleMenu}
          className="p-2 rounded-full bg-white shadow-lg text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Menu className="w-6 h-6" />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 dark:border dark:border-gray-700 rounded-md shadow-lg py-1 z-10">
            <button
              onClick={handleToggleDarkMode}
              className="flex items-center w-full px-4 py-2 text-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 mr-2" />
              ) : (
                <Moon className="w-4 h-4 mr-2" />
              )}
              {language === 'ar' 
                ? (isDarkMode ? 'الوضع النهاري' : 'الوضع الليلي') 
                : (isDarkMode ? 'Light Mode' : 'Dark Mode')
              }
            </button>
            <button
              onClick={handleShowGameSpeed}
              className="flex items-center w-full px-4 py-2 text-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Gauge className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'سرعة اللعبة' : 'Game Speed'}
            </button>
            <button
              onClick={handleShowHowToPlay}
              className="flex items-center w-full px-4 py-2 text-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'كيفية اللعب' : 'How to Play'}
            </button>
            <button
              onClick={handleAddWordClick}
              className="flex items-center w-full px-4 py-2 text-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'إضافة كلمة' : 'Add Word'}
            </button>
          </div>
        )}
      </div>

      {/* Game Speed Modal */}
      {showGameSpeed && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                  {language === 'ar' ? 'سرعة اللعبة' : 'Game Speed'}
                </h2>
                <button 
                  onClick={closeGameSpeed}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-gray-600 dark:text-gray-300">
                <p>
                  {language === 'ar' 
                    ? 'اختر سرعة اللعبة التي تناسبك. السرعة الحالية:'
                    : 'Choose the game speed that suits you. Current speed:'
                  }
                  <span className="font-bold"> {speedInSeconds} </span>
                  {language === 'ar' ? 'ثانية' : 'seconds'}
                </p>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>{language === 'ar' ? 'سريع' : 'Fast'}</span>
                    <span>{language === 'ar' ? 'بطيء' : 'Slow'}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {speedOptions.map((speed) => (
                      <button
                        key={speed}
                        onClick={() => {
                          handleSpeedChange(speed);
                          closeGameSpeed();
                        }}
                        className={`
                          py-2 px-1 text-xs font-semibold rounded transition-all duration-200
                          ${speedInSeconds === speed
                            ? 'bg-indigo-500 text-white shadow-lg'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                          }
                        `}
                      >
                        {speed}s
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={closeGameSpeed}
                    className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                  >
                    {language === 'ar' ? 'حفظ' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* How to Play Modal */}
      {showHowToPlay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                  {language === 'ar' ? 'كيفية اللعب' : 'How to Play'}
                </h2>
                <button 
                  onClick={closeHowToPlay}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-gray-600 dark:text-gray-300">
                <p>
                  {language === 'ar' 
                    ? 'مرحباً بك في لعبة القاموس التعليمية! الهدف من اللعبة هو اكتشاف الكلمات المخفية في الشبكة وتجميع النقاط.'
                    : 'Welcome to the Dictionary Word Game! The goal is to discover hidden words in the grid and collect points.'
                  }
                </p>

                <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                  {language === 'ar' ? 'قواعد اللعبة:' : 'Game Rules:'}
                </h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    {language === 'ar' 
                      ? 'انقر على الأحرف لتكوين كلمات ذات معنى.'
                      : 'Click on letters to form meaningful words.'
                    }
                  </li>
                  <li>
                    {language === 'ar' 
                      ? 'يجب أن تكون الكلمات أفقية أو رأسية أو قطرية.'
                      : 'Words can be horizontal, vertical, or diagonal.'
                    }
                  </li>
                  <li>
                    {language === 'ar' 
                      ? 'كل كلمة صحيحة تمنحك نقاطاً بناءً على طولها.'
                      : 'Each correct word gives you points based on its length.'
                    }
                  </li>
                  <li>
                    {language === 'ar' 
                      ? 'استخدم الأدوات المساعدة لمساعدتك في العثور على الكلمات.'
                      : 'Use power-ups to help you find words.'
                    }
                  </li>
                </ul>

                <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                  {language === 'ar' ? 'الأدوات المساعدة:' : 'Power-ups:'}
                </h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <span className="font-medium">
                      {language === 'ar' ? 'استبدال الأحرف:' : 'Replace Letters:'}
                    </span>
                    {language === 'ar' 
                      ? ' يستبدل نصف الأحرف في الشبكة بأحرف جديدة.'
                      : ' Replaces half of the letters on the grid with new ones.'
                    }
                  </li>
                  <li>
                    <span className="font-medium">
                      {language === 'ar' ? 'القنبلة:' : 'Bomb:'}
                    </span>
                    {language === 'ar' 
                      ? ' تكشف عن موقع كلمة عشوائية.'
                      : ' Reveals the location of a random word.'
                    }
                  </li>
                  <li>
                    <span className="font-medium">
                      {language === 'ar' ? 'الوحش:' : 'Monster:'}
                    </span>
                    {language === 'ar' 
                      ? ' يزيل جميع الأحرف غير المفيدة من الشبكة.'
                      : ' Removes all unhelpful letters from the grid.'
                    }
                  </li>
                </ul>

                <div className="pt-4">
                  <button
                    onClick={closeHowToPlay}
                    className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                  >
                    {language === 'ar' ? 'بدء اللعب' : 'Start Playing'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};