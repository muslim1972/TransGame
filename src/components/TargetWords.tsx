import React from 'react';
import { TargetWord } from '../types/game';
import { HelpCircle, CheckCircle } from 'lucide-react';

interface TargetWordsProps {
  targetWords: TargetWord[];
  language: 'en' | 'ar';
}

export const TargetWords: React.FC<TargetWordsProps> = ({ targetWords, language }) => {
  const isRTL = language === 'ar';

  return (
    <div className={`w-full bg-white dark:bg-gray-800 border-l-4 border-green-300 dark:border-green-600 p-4 space-y-2 ${isRTL ? 'text-right' : 'text-left'}`}>
      <div className="space-y-2">
        {targetWords.map((target, index) => (
          <div
            key={index}
            className={`p-2 rounded-lg transition-all duration-300 ${
              target.found
                ? 'bg-green-100 dark:bg-green-900/30 border-l-4 border-green-500 dark:border-green-600'
                : 'bg-gray-100 dark:bg-gray-700/50'
            }`}
          >
            <div className="flex flex-col items-start space-y-2">
              <div className="flex items-center space-x-3">
                {target.found ? (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                ) : (
                  <HelpCircle className="w-6 h-6 text-gray-400" />
                )}
                <span className="font-semibold text-4xl text-gray-700 dark:text-gray-200">
                  {target.word}
                </span>
              </div>
              {target.found && (
                <span className="font-bold text-green-600 dark:text-green-400 text-3xl ml-9">
                  {target.meaning}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      
      
    </div>
  );
};