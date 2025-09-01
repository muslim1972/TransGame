import React, { useState, useEffect } from 'react';
import { WordDefinition } from '../types/game';
import { Loader, Search, CheckCircle, XCircle, Plus } from 'lucide-react';

const GEMINI_API_KEY = 'AIzaSyB6KXq-1XrBYZwHJzilB938ToQkDbpGgIA';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

interface AddWordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWord: (word: WordDefinition) => void;
  dictionary: WordDefinition[];
  language: 'english' | 'arabic';
}

export const AddWordDialog: React.FC<AddWordDialogProps> = ({ isOpen, onClose, onAddWord, dictionary, language }) => {
  const [englishWord, setEnglishWord] = useState('');
  const [arabicWord, setArabicWord] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isWordVerified, setIsWordVerified] = useState(false);

  useEffect(() => {
    setEnglishWord('');
    setArabicWord('');
    setMessage('');
    setIsLoading(false);
    setIsWordVerified(false);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSearch = async () => {
    setIsLoading(true);
    setMessage('');
    setIsWordVerified(false);

    const wordToSearch = englishWord || arabicWord;
    const searchInEnglish = !!englishWord;

    if (!wordToSearch) {
      setMessage(language === 'ar' ? 'الرجاء إدخال كلمة للبحث.' : 'Please enter a word to search.');
      setIsLoading(false);
      return;
    }

    const foundInDict = dictionary.find(w => 
        (searchInEnglish && w.english.toLowerCase() === wordToSearch.toLowerCase()) ||
        (!searchInEnglish && w.arabic === wordToSearch)
    );

    if (foundInDict) {
      setEnglishWord(foundInDict.english);
      setArabicWord(foundInDict.arabic);
      setMessage(language === 'ar' ? 'الكلمة موجودة بالفعل في القاموس.' : 'Word already exists in the dictionary.');
      setIsLoading(false);
      return;
    }

    try {
      const targetLanguage = searchInEnglish ? 'Arabic' : 'English';
      const prompt = `Translate the word "${wordToSearch}" to ${targetLanguage}. Provide only the single translated word, for a language learning game.`;
      
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      });

      if (!response.ok) {
        throw new Error('API Error');
      }

      const data = await response.json();
      const translation = data.candidates[0].content.parts[0].text.trim();

      if (translation.includes(' ') || translation.toLowerCase().includes('i cannot provide')) {
        setMessage(language === 'ar' ? 'لم يتم العثور على ترجمة صالحة لكلمة واحدة.' : 'Could not find a valid single-word translation.');
        setIsLoading(false);
        return;
      }

      const translationExists = dictionary.find(w => 
        (searchInEnglish && w.arabic === translation) ||
        (!searchInEnglish && w.english.toLowerCase() === translation.toLowerCase())
      );

      if (translationExists) {
        setMessage(language === 'ar' ? 'تم العثور على ترجمة، لكنها موجودة بالفعل لكلمة أخرى.' : 'A translation was found, but it already exists for another word.');
        setIsLoading(false);
        return;
      }

      if (searchInEnglish) {
        setArabicWord(translation);
      } else {
        setEnglishWord(translation);
      }
      setMessage(language === 'ar' ? 'تم التحقق من الكلمة بنجاح! جاهزة للإضافة.' : 'Word verified successfully! Ready to add.');
      setIsWordVerified(true);

    } catch (error) {
      console.error('Error fetching translation:', error);
      setMessage(language === 'ar' ? 'حدث خطأ أثناء البحث عن الترجمة.' : 'An error occurred while fetching the translation.');
    }

    setIsLoading(false);
  };

  const handleAdd = async () => {
    const newWord = { english: englishWord, arabic: arabicWord };
    
    const formData = new FormData();
    formData.append('entry.837056513', newWord.english);
    formData.append('entry.826154259', newWord.arabic);

    try {
        await fetch('https://docs.google.com/forms/d/e/1FAIpQLSePrcpacIlWDN_Q4z_Yyk3TKp_IT9BRCP4fqvts2vTCzkA2cw/formResponse', {
            method: 'POST',
            body: formData,
            mode: 'no-cors',
        });
    } catch (e) {
        console.error('Could not submit to Google Form', e);
    }

    onAddWord(newWord);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
              {language === 'ar' ? 'إضافة كلمة جديدة للقاموس' : 'Add New Word to Dictionary'}
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-white">✕</button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{language === 'ar' ? 'الكلمة الإنجليزية' : 'English Word'}</label>
              <input 
                type="text" 
                value={englishWord}
                onChange={(e) => setEnglishWord(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{language === 'ar' ? 'الكلمة العربية' : 'Arabic Word'}</label>
              <input 
                type="text" 
                value={arabicWord}
                onChange={(e) => setArabicWord(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-right"
              />
            </div>

            {message && (
              <div className={`p-3 rounded-md text-sm flex items-center ${isWordVerified ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200' : 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200'}`}>
                {isWordVerified ? <CheckCircle className="w-5 h-5 mr-2" /> : <XCircle className="w-5 h-5 mr-2" />}
                {message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <button 
                onClick={handleSearch}
                disabled={isLoading}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 dark:disabled:bg-indigo-800"
              >
                {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5 mr-2" />}
                {language === 'ar' ? 'بحث / تحقق' : 'Search / Verify'}
              </button>
              <button 
                onClick={handleAdd}
                disabled={!isWordVerified || isLoading}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-300 dark:disabled:bg-green-800"
              >
                <Plus className="w-5 h-5 mr-2" />
                {language === 'ar' ? 'إضافة وإرسال' : 'Add & Submit'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};