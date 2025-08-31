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
    <div className={`w-full bg-white border-l-4 border-green-300 p-4 space-y-2 ${isRTL ? 'text-right' : 'text-left'}`}>
      <div className="space-y-2">
        {targetWords.map((target, index) => (
          <div
            key={index}
            className={`p-2 rounded-lg transition-all duration-300 ${
              target.found
                ? 'bg-green-100 border-l-4 border-green-500'
                : 'bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {target.found ? (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                ) : (
                  <HelpCircle className="w-6 h-6 text-gray-400" />
                )}
                <span className="font-semibold text-4xl text-gray-700">
                  {target.word}
                </span>
              </div>
              {target.found && (
                <span className="font-bold text-green-600 text-4xl">
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