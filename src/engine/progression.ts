export type RankType = 'ROOKIE' | 'QUICK' | 'SHARP' | 'ELITE' | 'SAVANT';

export interface LevelInfo {
  level: number;
  currentLevelXP: number; // XP accumulated in the current level
  nextLevelXP: number;    // XP required to reach the next level
  percentage: number;     // 0 to 100 representing level completion
  rank: RankType;
  totalXP: number;
}

/**
 * Get the total XP required to level up from `level` to `level + 1`.
 */
export const getXPNeededForLevel = (level: number): number => {
  return Math.round(1000 * Math.pow(1.15, level - 1));
};

/**
 * Calculates current level, relative XP progress, percentage and rank from total XP.
 */
export const getLevelInfo = (totalXP: number): LevelInfo => {
  let level = 1;
  let remainingXP = totalXP;

  while (true) {
    const xpRequired = getXPNeededForLevel(level);
    if (remainingXP >= xpRequired) {
      remainingXP -= xpRequired;
      level++;
    } else {
      break;
    }
  }

  const xpRequiredForNext = getXPNeededForLevel(level);
  const percentage = Math.min(100, Math.max(0, Math.round((remainingXP / xpRequiredForNext) * 100)));

  let rank: RankType = 'ROOKIE';
  if (level >= 35) {
    rank = 'SAVANT';
  } else if (level >= 20) {
    rank = 'ELITE';
  } else if (level >= 10) {
    rank = 'SHARP';
  } else if (level >= 5) {
    rank = 'QUICK';
  }

  return {
    level,
    currentLevelXP: remainingXP,
    nextLevelXP: xpRequiredForNext,
    percentage,
    rank,
    totalXP,
  };
};

/**
 * Returns Tailwind CSS class names associated with a rank.
 */
export const getRankStyles = (rank: RankType): { text: string; bg: string; border: string } => {
  switch (rank) {
    case 'ROOKIE':
      return { text: 'text-neutral-500', bg: 'bg-neutral-100', border: 'border-neutral-300' };
    case 'QUICK':
      return { text: 'text-electric', bg: 'bg-blue-50', border: 'border-electric/30' };
    case 'SHARP':
      return { text: 'text-lime font-medium', bg: 'bg-lime/10', border: 'border-lime/40' };
    case 'ELITE':
      return { text: 'text-amber-600 font-semibold', bg: 'bg-amber-50', border: 'border-amber-400/40' };
    case 'SAVANT':
      return { text: 'text-pro-purple font-bold tracking-tight', bg: 'bg-pro-purple/10', border: 'border-pro-purple/40' };
  }
};

/**
 * Resolves a level to a funny, gamified progression title.
 */
export const getHumorousTitle = (level: number): string => {
  if (level >= 35) return '👽 NERD SUPREME';
  if (level >= 25) return '🚀 SYSTEM BRAINIAC';
  if (level >= 18) return '🧙 MATHEMAGICIAN';
  if (level >= 12) return '🥋 ALGEBRA GLADIATOR';
  if (level >= 8)  return '⚡ SPEED CALCULATOR';
  if (level >= 4)  return '🤓 SUM SOLVER';
  return '👶 ARITHMETIC TODDLER';
};
