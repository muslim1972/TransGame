import { useCallback, useEffect, useRef } from 'react';
import { GameState } from '../types/game';

// Define achievement types
interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
}

// Define all possible achievements
const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_word',
    title: 'First Steps',
    description: 'Find your first word',
    icon: '🎯',
    unlocked: false
  },
  {
    id: 'word_master',
    title: 'Word Master',
    description: 'Find 10 words',
    icon: '📚',
    unlocked: false
  },
  {
    id: 'high_scorer',
    title: 'High Scorer',
    description: 'Score 10,000 points',
    icon: '💯',
    unlocked: false
  },
  {
    id: 'level_up',
    title: 'Level Up',
    description: 'Reach level 5',
    icon: '🚀',
    unlocked: false
  },
  {
    id: 'bomb_expert',
    title: 'Bomb Expert',
    description: 'Use 5 bombs',
    icon: '💣',
    unlocked: false
  },
  {
    id: 'language_switcher',
    title: 'Polyglot',
    description: 'Switch between languages 3 times',
    icon: '🌐',
    unlocked: false
  },
  {
    id: 'perfect_game',
    title: 'Perfect Game',
    description: 'Find 5 words in a row without mistakes',
    icon: '⭐',
    unlocked: false
  }
];

export const useAchievements = (
  gameState: GameState,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
) => {
  const achievementsRef = useRef<Record<string, Achievement>>({});

  // Initialize achievements
  useEffect(() => {
    const initializedAchievements: Record<string, Achievement> = {};
    ACHIEVEMENTS.forEach(achievement => {
      initializedAchievements[achievement.id] = { ...achievement };
    });
    achievementsRef.current = initializedAchievements;
  }, []);

  // Check and unlock achievements
  const checkAchievements = useCallback(() => {
    const achievements = achievementsRef.current;
    let newAchievementUnlocked = false;

    // First word achievement
    if (!achievements.first_word.unlocked && gameState.foundWords.length > 0) {
      achievements.first_word.unlocked = true;
      achievements.first_word.unlockedAt = new Date();
      newAchievementUnlocked = true;
    }

    // Word master achievement
    if (!achievements.word_master.unlocked && gameState.foundWords.length >= 10) {
      achievements.word_master.unlocked = true;
      achievements.word_master.unlockedAt = new Date();
      newAchievementUnlocked = true;
    }

    // High scorer achievement
    if (!achievements.high_scorer.unlocked && gameState.score >= 10000) {
      achievements.high_scorer.unlocked = true;
      achievements.high_scorer.unlockedAt = new Date();
      newAchievementUnlocked = true;
    }

    // Level up achievement
    if (!achievements.level_up.unlocked && gameState.level >= 5) {
      achievements.level_up.unlocked = true;
      achievements.level_up.unlockedAt = new Date();
      newAchievementUnlocked = true;
    }

    // Save achievements to game state
    if (newAchievementUnlocked) {
      setGameState(prevState => ({
        ...prevState,
        achievements: { ...achievements }
      }));
    }
  }, [gameState.foundWords, gameState.score, gameState.level, setGameState]);

  // Track bomb usage
  const trackBombUsage = useCallback(() => {
    const achievements = achievementsRef.current;
    const currentBombCount = gameState.bombCount || 0;

    if (!achievements.bomb_expert.unlocked && currentBombCount >= 5) {
      achievements.bomb_expert.unlocked = true;
      achievements.bomb_expert.unlockedAt = new Date();

      setGameState(prevState => ({
        ...prevState,
        achievements: { ...achievements }
      }));
    }
  }, [gameState.bombCount, setGameState]);

  // Track language switches
  const trackLanguageSwitch = useCallback(() => {
    const achievements = achievementsRef.current;
    const currentSwitchCount = gameState.languageSwitchCount || 0;

    if (!achievements.language_switcher.unlocked && currentSwitchCount >= 3) {
      achievements.language_switcher.unlocked = true;
      achievements.language_switcher.unlockedAt = new Date();

      setGameState(prevState => ({
        ...prevState,
        achievements: { ...achievements }
      }));
    }
  }, [gameState.languageSwitchCount, setGameState]);

  // Track perfect game
  const trackPerfectGame = useCallback(() => {
    const achievements = achievementsRef.current;
    const currentStreak = gameState.perfectStreak || 0;

    if (!achievements.perfect_game.unlocked && currentStreak >= 5) {
      achievements.perfect_game.unlocked = true;
      achievements.perfect_game.unlockedAt = new Date();

      setGameState(prevState => ({
        ...prevState,
        achievements: { ...achievements }
      }));
    }
  }, [gameState.perfectStreak, setGameState]);

  // Check for level up
  const checkLevelUp = useCallback(() => {
    const newLevel = Math.floor(gameState.score / 5000) + 1;

    if (newLevel > gameState.level) {
      // Play level up sound
      setGameState(prevState => ({
        ...prevState,
        level: newLevel,
        showLevelUpAnimation: true
      }));

      // Hide level up animation after delay
      setTimeout(() => {
        setGameState(prevState => ({
          ...prevState,
          showLevelUpAnimation: false
        }));
      }, 2000);

      return true;
    }

    return false;
  }, [gameState.score, gameState.level, setGameState]);

  // Calculate bonus points
  const calculateBonusPoints = useCallback((wordLength: number, timeTaken: number) => {
    let bonus = 0;

    // Length bonus
    if (wordLength >= 6) bonus += 500;
    else if (wordLength >= 4) bonus += 200;

    // Speed bonus
    if (timeTaken < 5) bonus += 300;
    else if (timeTaken < 10) bonus += 100;

    return bonus;
  }, []);

  // Get all achievements
  const getAchievements = useCallback(() => {
    return Object.values(achievementsRef.current);
  }, []);

  // Get unlocked achievements
  const getUnlockedAchievements = useCallback(() => {
    return Object.values(achievementsRef.current).filter(a => a.unlocked);
  }, []);

  // Get locked achievements
  const getLockedAchievements = useCallback(() => {
    return Object.values(achievementsRef.current).filter(a => !a.unlocked);
  }, []);

  // Get achievement progress
  const getAchievementProgress = useCallback((achievementId: string) => {
    const achievement = achievementsRef.current[achievementId];
    if (!achievement || achievement.unlocked) return 100;

    switch (achievementId) {
      case 'first_word':
        return gameState.foundWords.length > 0 ? 100 : 0;
      case 'word_master':
        return Math.min(100, (gameState.foundWords.length / 10) * 100);
      case 'high_scorer':
        return Math.min(100, (gameState.score / 10000) * 100);
      case 'level_up':
        return Math.min(100, (gameState.level / 5) * 100);
      case 'bomb_expert':
        return Math.min(100, ((gameState.bombCount || 0) / 5) * 100);
      case 'language_switcher':
        return Math.min(100, ((gameState.languageSwitchCount || 0) / 3) * 100);
      case 'perfect_game':
        return Math.min(100, ((gameState.perfectStreak || 0) / 5) * 100);
      default:
        return 0;
    }
  }, [gameState.foundWords, gameState.score, gameState.level, gameState.bombCount, gameState.languageSwitchCount, gameState.perfectStreak]);

  return {
    checkAchievements,
    trackBombUsage,
    trackLanguageSwitch,
    trackPerfectGame,
    checkLevelUp,
    calculateBonusPoints,
    getAchievements,
    getUnlockedAchievements,
    getLockedAchievements,
    getAchievementProgress
  };
};