import type { DifficultyType } from './questionGenerator';

export interface ScoreBreakdown {
  baseScore: number;
  speedBonus: number;
  difficultyBonus: number;
  comboMultiplier: number;
  totalScore: number;
}

/**
 * Calculates the score for an answered question.
 * @param responseTime Actual time taken to answer in seconds
 * @param timeLimit The total allocated time in seconds
 * @param difficulty BASIC, STANDARD, or PRO
 * @param combo The current combo counter BEFORE answering this question
 */
export const calculateScore = (
  responseTime: number,
  timeLimit: number,
  difficulty: DifficultyType,
  combo: number
): ScoreBreakdown => {
  // Base values per difficulty
  let baseScore = 100;
  let difficultyBonus = 0;

  if (difficulty === 'STANDARD') {
    baseScore = 200;
    difficultyBonus = 50;
  } else if (difficulty === 'PRO') {
    baseScore = 300;
    difficultyBonus = 150;
  }

  // Speed Bonus: 
  // Answering under 1.5 seconds gives a maximum speed bonus (100% of base value).
  // Answering slowly reduces the bonus linearly. No bonus if taking > 80% of the limit.
  const maxSpeedTime = 1.5;
  let speedBonus = 0;

  if (responseTime <= maxSpeedTime) {
    speedBonus = baseScore; // 100% speed bonus
  } else if (responseTime < timeLimit * 0.8) {
    // Linear scale between maxSpeedTime and 80% of limit
    const speedRange = (timeLimit * 0.8) - maxSpeedTime;
    const timePastMax = responseTime - maxSpeedTime;
    const speedRatio = Math.max(0, 1 - (timePastMax / speedRange));
    speedBonus = Math.round(speedRatio * baseScore);
  }

  // Combo multiplier: clamped between x1 and x10
  const comboMultiplier = Math.max(1, Math.min(10, combo));

  // Score Formula
  const totalScore = (baseScore + difficultyBonus + speedBonus) * comboMultiplier;

  return {
    baseScore,
    speedBonus,
    difficultyBonus,
    comboMultiplier,
    totalScore,
  };
};
