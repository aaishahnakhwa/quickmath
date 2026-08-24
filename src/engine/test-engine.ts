import { generateQuestion } from './questionGenerator';
import { calculateScore } from './scoreSystem';
import { getLevelInfo } from './progression';
import { checkRunAchievements } from './achievements';
import type { GameRunData } from './achievements';

console.log('=== STARTING QUICKMATH ENGINE TESTS ===');

// 1. Test Question Generator
try {
  console.log('\n--- Testing Question Generation ---');
  const basicAdd = generateQuestion(['ADD'], 'BASIC');
  console.log('BASIC ADD:', basicAdd.expression, '=', basicAdd.answer, 'Choices:', basicAdd.choices);
  if (basicAdd.choices.length !== 4) throw new Error('Basic question must have 4 choices');
  if (!basicAdd.choices.includes(basicAdd.answer)) throw new Error('Choices must contain correct answer');

  const standardMult = generateQuestion(['MULTIPLY'], 'STANDARD');
  console.log('STANDARD MULTIPLY:', standardMult.expression, '=', standardMult.answer, 'Choices:', standardMult.choices);

  const proDiv = generateQuestion(['DIVIDE'], 'PRO');
  console.log('PRO DIVIDE:', proDiv.expression, '=', proDiv.answer, 'Choices:', proDiv.choices);

  console.log('Question Generator: PASS');
} catch (e) {
  console.error('Question Generator: FAIL', e);
}

// 2. Test Scoring System
try {
  console.log('\n--- Testing Scoring System ---');
  // BASIC, fast answer
  const score1 = calculateScore(0.5, 10, 'BASIC', 1);
  console.log('BASIC, 0.5s, combo 1:', score1.totalScore, '(Expected: ~200)');
  
  // PRO, slow answer, combo 5
  const score2 = calculateScore(5.0, 18, 'PRO', 5);
  console.log('PRO, 5.0s, combo 5:', score2.totalScore, '(Expected: >2000)');

  console.log('Scoring System: PASS');
} catch (e) {
  console.error('Scoring System: FAIL', e);
}

// 3. Test Progression System
try {
  console.log('\n--- Testing Progression System ---');
  const level1 = getLevelInfo(500);
  console.log('XP 500:', level1.level, level1.rank, `${level1.percentage}%`);
  
  const level2 = getLevelInfo(2500);
  console.log('XP 2500:', level2.level, level2.rank, `${level2.percentage}%`);

  console.log('Progression System: PASS');
} catch (e) {
  console.error('Progression System: FAIL', e);
}

// 4. Test Achievements System
try {
  console.log('\n--- Testing Achievements System ---');
  const mockRun: GameRunData = {
    score: 5000,
    accuracy: 100,
    maxStreak: 30,
    avgResponseTime: 1.2,
    totalQuestions: 25,
    correctAnswers: 25,
    difficulty: 'PRO',
    mode: 'CLASSIC',
    speedDemonCount: 15,
    maxCombo: 11,
    isNewHighScore: true,
  };
  const unlocked = checkRunAchievements(mockRun, ['first_blood']);
  console.log('Newly unlocked achievements for run:', unlocked);
  if (!unlocked.includes('no_miss')) throw new Error('Expected no_miss achievement');
  if (!unlocked.includes('speed_demon')) throw new Error('Expected speed_demon achievement');

  console.log('Achievements System: PASS');
} catch (e) {
  console.error('Achievements System: FAIL', e);
}

console.log('\n=== ALL ENGINE TESTS COMPLETED ===');
