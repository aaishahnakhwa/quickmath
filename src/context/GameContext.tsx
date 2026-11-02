import React, { createContext, useContext, useState, useEffect } from 'react';
import { getLevelInfo } from '../engine/progression';
import type { LevelInfo } from '../engine/progression';
import { checkRunAchievements } from '../engine/achievements';
import type { GameRunData } from '../engine/achievements';

export interface UserStats {
  totalGames: number;
  totalScore: number;
  bestScore: {
    [key: string]: number; // Mode keys e.g. CLASSIC, TIME_ATTACK, STREAK, BLITZ, DAILY_CHALLENGE
  };
  bestStreak: number;
  totalCorrect: number;
  totalAnswered: number;
  averageResponseTime: number;
  opCorrect: { ADD: number; SUBTRACT: number; MULTIPLY: number; DIVIDE: number };
  opAnswered: { ADD: number; SUBTRACT: number; MULTIPLY: number; DIVIDE: number };
  diffCorrect: { BASIC: number; STANDARD: number; PRO: number };
  diffAnswered: { BASIC: number; STANDARD: number; PRO: number };
}

export interface UserProfile {
  username: string;
  avatarSeed: string;
  totalXP: number;
  unlockedAchievements: string[]; // unlocked achievement IDs
  stats: UserStats;
  scoreHistory?: number[];
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
  accuracy: number;
  time: string;
  isUser?: boolean;
}

interface GameContextProps {
  profile: UserProfile;
  levelInfo: LevelInfo;
  isAuthenticated: boolean;
  saveGameRun: (runData: Omit<GameRunData, 'isNewHighScore'> & { mode: string; opPerformance: { op: string; answered: number; correct: number }[] }) => {
    isNewHighScore: boolean;
    unlockedAchievements: string[];
    xpGained: number;
    leveledUp: boolean;
    oldLevelInfo: LevelInfo;
    newLevelInfo: LevelInfo;
  };
  registerUser: (username: string) => void;
  resetProgress: () => void;
  dailyLeaderboard: LeaderboardEntry[];
  submitDailyChallengeScore: (score: number, accuracy: number, timeStr: string) => void;
  hasPlayedDailyToday: boolean;
  hasStartedDailyToday: boolean;
  startDailyChallenge: () => void;
}

const INITIAL_STATS: UserStats = {
  totalGames: 0,
  totalScore: 0,
  bestScore: {
    CLASSIC: 0,
    TIME_ATTACK: 0,
    STREAK: 0,
    BLITZ: 0,
    DAILY_CHALLENGE: 0,
  },
  bestStreak: 0,
  totalCorrect: 0,
  totalAnswered: 0,
  averageResponseTime: 0,
  opCorrect: { ADD: 0, SUBTRACT: 0, MULTIPLY: 0, DIVIDE: 0 },
  opAnswered: { ADD: 0, SUBTRACT: 0, MULTIPLY: 0, DIVIDE: 0 },
  diffCorrect: { BASIC: 0, STANDARD: 0, PRO: 0 },
  diffAnswered: { BASIC: 0, STANDARD: 0, PRO: 0 },
};

const INITIAL_PROFILE: UserProfile = {
  username: 'Guest Player',
  avatarSeed: '12',
  totalXP: 0,
  unlockedAchievements: [],
  stats: INITIAL_STATS,
  scoreHistory: [400, 700, 550, 900, 800, 1100, 950, 1240],
};

const GameContext = createContext<GameContextProps | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  
  // Anti-cheat daily status parameters
  const [hasPlayedDailyToday, setHasPlayedDailyToday] = useState<boolean>(false);
  const [hasStartedDailyToday, setHasStartedDailyToday] = useState<boolean>(false);
  const [dailyLeaderboard, setDailyLeaderboard] = useState<LeaderboardEntry[]>([]);

  // 1. Load profile and daily challenge state from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('quickmath_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProfile(parsed);
        if (parsed.username !== 'Guest Player') {
          setIsAuthenticated(true);
        }
      } catch (e) {
        console.error('Failed to parse saved profile', e);
      }
    }

    const today = new Date().toDateString();

    const dailyStarted = localStorage.getItem('quickmath_daily_started');
    if (dailyStarted === today) {
      setHasStartedDailyToday(true);
    }

    const dailyPlayed = localStorage.getItem('quickmath_daily_played');
    if (dailyPlayed === today) {
      setHasPlayedDailyToday(true);
    }

    // Generate initial leaderboard
    generateLeaderboard();
  }, []);

  // Sync profile state with local storage
  const saveProfileToStorage = (newProfile: UserProfile) => {
    localStorage.setItem('quickmath_profile', JSON.stringify(newProfile));
    setProfile(newProfile);
  };

  const generateLeaderboard = (userScore?: { score: number; accuracy: number; time: string }) => {
    // Standard mock list of players
    const botPlayers = [
      { username: 'Hypotenuse_Hero', score: 8400, accuracy: 100, time: '1.4s' },
      { username: 'Matrix_Neo', score: 7120, accuracy: 96, time: '1.8s' },
      { username: 'Euclid_300', score: 6580, accuracy: 94, time: '2.1s' },
      { username: 'FibonacciStreak', score: 5850, accuracy: 100, time: '1.9s' },
      { username: 'Algebraic_Flow', score: 4950, accuracy: 88, time: '2.5s' },
      { username: 'Derivator', score: 4200, accuracy: 92, time: '2.4s' },
      { username: 'ZeroSumGame', score: 3600, accuracy: 80, time: '3.1s' },
      { username: 'PI_rate', score: 3100, accuracy: 85, time: '3.3s' },
      { username: 'Asymptote', score: 2150, accuracy: 76, time: '4.2s' },
    ];

    let entries = botPlayers.map((bot) => ({ ...bot, isUser: false }));

    if (userScore) {
      entries.push({
        username: profile.username === 'Guest Player' ? 'You' : profile.username,
        score: userScore.score,
        accuracy: userScore.accuracy,
        time: userScore.time,
        isUser: true,
      });
    } else {
      // Check if user has daily challenge score from storage
      const dailyScore = localStorage.getItem('quickmath_daily_score');
      if (dailyScore) {
        try {
          const parsed = JSON.parse(dailyScore);
          entries.push({
            username: profile.username === 'Guest Player' ? 'You' : profile.username,
            score: parsed.score,
            accuracy: parsed.accuracy,
            time: parsed.time,
            isUser: true,
          });
        } catch {}
      }
    }

    // Sort entries descending by score
    entries.sort((a, b) => b.score - a.score);

    // Apply ranks
    const finalLeaderboard = entries.map((entry, idx) => ({
      ...entry,
      rank: idx + 1,
    }));

    setDailyLeaderboard(finalLeaderboard);
  };

  const registerUser = (username: string) => {
    const trimmed = username.trim();
    if (!trimmed) return;

    const newProfile = {
      ...profile,
      username: trimmed,
    };
    setIsAuthenticated(true);
    saveProfileToStorage(newProfile);
  };

  const resetProgress = () => {
    localStorage.removeItem('quickmath_profile');
    localStorage.removeItem('quickmath_daily_played');
    localStorage.removeItem('quickmath_daily_started');
    localStorage.removeItem('quickmath_daily_score');
    setProfile(INITIAL_PROFILE);
    setIsAuthenticated(false);
    setHasPlayedDailyToday(false);
    setHasStartedDailyToday(false);
    generateLeaderboard();
  };

  const startDailyChallenge = () => {
    const today = new Date().toDateString();
    localStorage.setItem('quickmath_daily_started', today);
    setHasStartedDailyToday(true);
  };

  const submitDailyChallengeScore = (score: number, accuracy: number, timeStr: string) => {
    const today = new Date().toDateString();
    localStorage.setItem('quickmath_daily_played', today);
    localStorage.setItem(
      'quickmath_daily_score',
      JSON.stringify({ score, accuracy, time: timeStr })
    );

    setHasPlayedDailyToday(true);
    generateLeaderboard({ score, accuracy, time: timeStr });
  };

  const saveGameRun = (runData: Omit<GameRunData, 'isNewHighScore'> & { mode: string; opPerformance: { op: string; answered: number; correct: number }[] }) => {
    const oldLevelInfo = getLevelInfo(profile.totalXP);
    
    // Calculate XP Gained
    const xpGained = Math.round(runData.score * 0.08 + runData.correctAnswers * 12);
    const newXP = profile.totalXP + xpGained;
    
    // Check if new score is a record for this mode
    const currentRecord = profile.stats.bestScore[runData.mode] || 0;
    const isNewHighScore = runData.score > currentRecord;

    const fullRunData: GameRunData = {
      ...runData,
      isNewHighScore,
    };

    const newAchievementsUnlocked = checkRunAchievements(fullRunData, profile.unlockedAchievements);
    const updatedAchievements = [...profile.unlockedAchievements, ...newAchievementsUnlocked];

    const newLevelInfo = getLevelInfo(newXP);
    const leveledUp = newLevelInfo.level > oldLevelInfo.level;

    // Update Stats Accumulation
    const s = profile.stats;
    const newTotalGames = s.totalGames + 1;
    const newTotalScore = s.totalScore + runData.score;
    const newBestStreak = Math.max(s.bestStreak, runData.maxStreak);
    const newTotalCorrect = s.totalCorrect + runData.correctAnswers;
    const newTotalAnswered = s.totalAnswered + runData.totalQuestions;

    const newAverageResponseTime = s.averageResponseTime === 0
      ? runData.avgResponseTime
      : Number(((s.averageResponseTime * s.totalGames + runData.avgResponseTime) / newTotalGames).toFixed(2));

    // Update operator performance
    const newOpCorrect = { ...s.opCorrect };
    const newOpAnswered = { ...s.opAnswered };
    runData.opPerformance.forEach((item) => {
      const opKey = item.op as 'ADD' | 'SUBTRACT' | 'MULTIPLY' | 'DIVIDE';
      if (newOpCorrect[opKey] !== undefined) {
        newOpCorrect[opKey] += item.correct;
        newOpAnswered[opKey] += item.answered;
      }
    });

    // Update difficulty performance
    const newDiffCorrect = { ...s.diffCorrect };
    const newDiffAnswered = { ...s.diffAnswered };
    const diffKey = runData.difficulty;
    newDiffCorrect[diffKey] += runData.correctAnswers;
    newDiffAnswered[diffKey] += runData.totalQuestions;

    // Set best scores
    const newBestScore = { ...s.bestScore };
    if (isNewHighScore) {
      newBestScore[runData.mode] = runData.score;
    }

    const currentHistory = profile.scoreHistory || [400, 700, 550, 900, 800, 1100, 950, 1240];
    const updatedHistory = [...currentHistory, runData.score];

    const updatedProfile: UserProfile = {
      ...profile,
      totalXP: newXP,
      unlockedAchievements: updatedAchievements,
      scoreHistory: updatedHistory,
      stats: {
        totalGames: newTotalGames,
        totalScore: newTotalScore,
        bestScore: newBestScore,
        bestStreak: newBestStreak,
        totalCorrect: newTotalCorrect,
        totalAnswered: newTotalAnswered,
        averageResponseTime: newAverageResponseTime,
        opCorrect: newOpCorrect,
        opAnswered: newOpAnswered,
        diffCorrect: newDiffCorrect,
        diffAnswered: newDiffAnswered,
      },
    };

    saveProfileToStorage(updatedProfile);

    // If Daily Challenge mode, submit to leaderboard
    if (runData.mode === 'DAILY_CHALLENGE') {
      submitDailyChallengeScore(runData.score, runData.accuracy, `${runData.avgResponseTime}s`);
    }

    return {
      isNewHighScore,
      unlockedAchievements: newAchievementsUnlocked,
      xpGained,
      leveledUp,
      oldLevelInfo,
      newLevelInfo,
    };
  };

  return (
    <GameContext.Provider
      value={{
        profile,
        levelInfo: getLevelInfo(profile.totalXP),
        isAuthenticated,
        saveGameRun,
        registerUser,
        resetProgress,
        dailyLeaderboard,
        submitDailyChallengeScore,
        hasPlayedDailyToday,
        hasStartedDailyToday,
        startDailyChallenge,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
