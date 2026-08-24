export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlockedAt?: string; // ISO date string if unlocked
  iconName: string;
}

export const ALL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_blood',
    title: 'FIRST BLOOD',
    description: 'Complete your first game.',
    iconName: 'Zap',
  },
  {
    id: 'no_miss',
    title: 'NO MISS',
    description: 'Answer 25 questions consecutively with 100% accuracy.',
    iconName: 'ShieldCheck',
  },
  {
    id: 'speed_demon',
    title: 'SPEED DEMON',
    description: 'Answer 10 questions under 2 seconds in a single game.',
    iconName: 'Flame',
  },
  {
    id: 'multiplier',
    title: 'MULTIPLIER',
    description: 'Reach a ×10 combo.',
    iconName: 'Award',
  },
  {
    id: 'problem_child',
    title: 'PROBLEM CHILD',
    description: 'Complete a PRO game with at least 10 correct answers.',
    iconName: 'Brain',
  },
  {
    id: 'untouchable',
    title: 'UNTOUCHABLE',
    description: 'Maintain a 50-question streak across any game modes.',
    iconName: 'Crown',
  },
  {
    id: 'new_record',
    title: 'NEW RECORD',
    description: 'Beat your previous high score in any mode.',
    iconName: 'TrendingUp',
  },
];

export interface GameRunData {
  score: number;
  accuracy: number; // percentage, e.g., 94 for 94%
  maxStreak: number;
  avgResponseTime: number; // in seconds
  totalQuestions: number;
  correctAnswers: number;
  difficulty: 'BASIC' | 'STANDARD' | 'PRO';
  mode: string;
  speedDemonCount: number; // answers solved under 2 seconds in this run
  maxCombo: number;
  isNewHighScore: boolean;
}

/**
 * Checks a completed game run for newly unlocked achievements.
 * Returns the IDs of the newly unlocked achievements.
 */
export const checkRunAchievements = (
  run: GameRunData,
  unlockedIds: string[]
): string[] => {
  const newUnlocks: string[] = [];
  const isAlreadyUnlocked = (id: string) => unlockedIds.includes(id);

  // 1. First Blood
  if (!isAlreadyUnlocked('first_blood')) {
    newUnlocks.push('first_blood');
  }

  // 2. No Miss
  if (!isAlreadyUnlocked('no_miss') && run.correctAnswers >= 25 && run.accuracy === 100) {
    newUnlocks.push('no_miss');
  }

  // 3. Speed Demon
  if (!isAlreadyUnlocked('speed_demon') && run.speedDemonCount >= 10) {
    newUnlocks.push('speed_demon');
  }

  // 4. Multiplier
  if (!isAlreadyUnlocked('multiplier') && run.maxCombo >= 10) {
    newUnlocks.push('multiplier');
  }

  // 5. Problem Child
  if (!isAlreadyUnlocked('problem_child') && run.difficulty === 'PRO' && run.correctAnswers >= 10) {
    newUnlocks.push('problem_child');
  }

  // 6. Untouchable
  if (!isAlreadyUnlocked('untouchable') && run.maxStreak >= 50) {
    newUnlocks.push('untouchable');
  }

  // 7. New Record
  if (!isAlreadyUnlocked('new_record') && run.isNewHighScore) {
    newUnlocks.push('new_record');
  }

  return newUnlocks;
};
