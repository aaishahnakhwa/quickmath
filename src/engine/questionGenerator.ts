export type OperatorType = 'ADD' | 'SUBTRACT' | 'MULTIPLY' | 'DIVIDE' | 'ALL';
export type DifficultyType = 'BASIC' | 'STANDARD' | 'PRO';

export interface Question {
  id: string;
  operand1?: number;
  operand2?: number;
  operator?: '+' | '−' | '×' | '÷' | 'mixed';
  expression: string;
  isVertical: boolean;
  answer: number;
  choices: number[];
  timeLimit: number; // in seconds
  puzzleTiles?: string[];
}

// Helper to generate a random integer in [min, max]
const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Helper to shuffle an array
const shuffle = <T>(array: T[]): T[] => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// Generate intelligent distractors for multiple choice
const generateChoices = (answer: number, operator: string): number[] => {
  const choicesSet = new Set<number>();
  choicesSet.add(answer);

  // Generate up to 15 candidate distractors and pick the best 3
  const candidates: number[] = [];

  // Simple shifts
  candidates.push(answer + 1, answer - 1);
  candidates.push(answer + 2, answer - 2);

  // Tens shifts
  if (Math.abs(answer) > 10) {
    candidates.push(answer + 10, answer - 10);
    candidates.push(answer + 5, answer - 5);
  }

  // Double shifts for larger numbers
  if (Math.abs(answer) > 50) {
    candidates.push(answer + 20, answer - 20);
    candidates.push(answer + 100, answer - 100);
  }

  // Operator-specific heuristics
  if (operator === '×') {
    // Distractors sharing units digit
    for (let i = 1; i <= 4; i++) {
      candidates.push(answer + i * 10);
      candidates.push(answer - i * 10);
    }
  }

  // Off-by-one operand error simulator
  // If answer was a * b, try simulating (a+1)*b or a*(b-1)
  // Let's just shuffle the candidates and pick unique ones
  const filteredCandidates = shuffle(
    Array.from(new Set(candidates))
      .filter((c) => c !== answer && (answer >= 0 ? c >= 0 : true)) // Keep sign consistent if positive
  );

  for (const c of filteredCandidates) {
    if (choicesSet.size < 4) {
      choicesSet.add(c);
    } else {
      break;
    }
  }

  // Fallback if we don't have 4 choices yet
  while (choicesSet.size < 4) {
    const offset = randomInt(1, 10) * (Math.random() > 0.5 ? 1 : -1);
    const candidate = answer + offset;
    if (candidate !== answer && (answer >= 0 ? candidate >= 0 : true)) {
      choicesSet.add(candidate);
    }
  }

  return shuffle(Array.from(choicesSet));
};

export const generateQuestion = (
  allowedOps: ('ADD' | 'SUBTRACT' | 'MULTIPLY' | 'DIVIDE')[],
  difficulty: DifficultyType
): Question => {
  // If no operations selected, default to ADD
  const ops = allowedOps.length > 0 ? allowedOps : ['ADD'];
  const op = ops[randomInt(0, ops.length - 1)];

  let operand1 = 0;
  let operand2 = 0;
  let operatorSign: '+' | '−' | '×' | '÷' | 'mixed' = '+';
  let expression = '';
  let isVertical = false;
  let answer = 0;
  let timeLimit = 10;

  if (difficulty === 'BASIC') {
    timeLimit = 12; // Generous timer for basic
    switch (op) {
      case 'ADD':
        operand1 = randomInt(2, 20);
        operand2 = randomInt(2, 20);
        answer = operand1 + operand2;
        operatorSign = '+';
        expression = `${operand1} + ${operand2}`;
        break;
      case 'SUBTRACT':
        // Ensure non-negative to build confidence
        operand1 = randomInt(5, 25);
        operand2 = randomInt(1, operand1);
        answer = operand1 - operand2;
        operatorSign = '−';
        expression = `${operand1} − ${operand2}`;
        break;
      case 'MULTIPLY':
        operand1 = randomInt(2, 10);
        operand2 = randomInt(2, 9);
        answer = operand1 * operand2;
        operatorSign = '×';
        expression = `${operand1} × ${operand2}`;
        break;
      case 'DIVIDE':
        // Generate divisor and answer first to ensure integer quotient
        operand2 = randomInt(2, 9); // divisor
        answer = randomInt(1, 9); // quotient
        operand1 = answer * operand2; // dividend
        operatorSign = '÷';
        expression = `${operand1} ÷ ${operand2}`;
        break;
    }
  } else if (difficulty === 'STANDARD') {
    timeLimit = 15;
    // 15% chance of mixed operation if standard
    const isMixed = Math.random() < 0.15;

    if (isMixed) {
      // Mixed operations are horizontal
      operatorSign = 'mixed';
      const mixType = randomInt(0, 2);
      if (mixType === 0) {
        // a * b + c
        const a = randomInt(2, 9);
        const b = randomInt(2, 9);
        const c = randomInt(5, 30);
        answer = a * b + c;
        expression = `(${a} × ${b}) + ${c}`;
      } else if (mixType === 1) {
        // a * b - c
        const a = randomInt(2, 9);
        const b = randomInt(2, 9);
        const c = randomInt(2, 20);
        answer = a * b - c;
        expression = `(${a} × ${b}) − ${c}`;
      } else {
        // a + b - c
        const a = randomInt(20, 100);
        const b = randomInt(20, 100);
        const c = randomInt(10, 50);
        answer = a + b - c;
        expression = `${a} + ${b} − ${c}`;
      }
    } else {
      switch (op) {
        case 'ADD':
          operand1 = randomInt(15, 150);
          operand2 = randomInt(15, 150);
          answer = operand1 + operand2;
          operatorSign = '+';
          expression = `${operand1}\n+ ${operand2}`;
          isVertical = true;
          break;
        case 'SUBTRACT':
          operand1 = randomInt(30, 200);
          operand2 = randomInt(10, 180);
          // 80% chance of positive answer, 20% negative
          if (Math.random() < 0.2) {
            // Negative answer
            const temp = operand1;
            operand1 = Math.min(operand1, operand2);
            operand2 = Math.max(temp, operand2);
          }
          answer = operand1 - operand2;
          operatorSign = '−';
          expression = `${operand1}\n− ${operand2}`;
          isVertical = true;
          break;
        case 'MULTIPLY':
          // double by single or simple double by double
          if (Math.random() < 0.5) {
            operand1 = randomInt(11, 40);
            operand2 = randomInt(3, 9);
          } else {
            operand1 = randomInt(11, 15);
            operand2 = randomInt(11, 15);
          }
          answer = operand1 * operand2;
          operatorSign = '×';
          expression = `${operand1} × ${operand2}`;
          break;
        case 'DIVIDE':
          operand2 = randomInt(4, 12); // divisor
          answer = randomInt(6, 16); // quotient
          operand1 = answer * operand2; // dividend
          operatorSign = '÷';
          expression = `${operand1} ÷ ${operand2}`;
          break;
      }
    }
  } else {
    // PRO difficulty - fast and challenging
    timeLimit = 18; // Genuinely hard calculations need slightly more time but still tight
    const isMixed = Math.random() < 0.25;

    if (isMixed) {
      operatorSign = 'mixed';
      const mixType = randomInt(0, 3);
      if (mixType === 0) {
        // a * b + c * d
        const a = randomInt(3, 12);
        const b = randomInt(3, 12);
        const c = randomInt(2, 9);
        const d = randomInt(2, 9);
        answer = a * b + c * d;
        expression = `(${a} × ${b}) + (${c} × ${d})`;
      } else if (mixType === 1) {
        // a * (b - c)
        const a = randomInt(4, 15);
        const b = randomInt(12, 30);
        const c = randomInt(2, 11);
        answer = a * (b - c);
        expression = `${a} × (${b} − ${c})`;
      } else if (mixType === 2) {
        // a + b * c - d
        const a = randomInt(50, 200);
        const b = randomInt(3, 12);
        const c = randomInt(12, 25);
        const d = randomInt(20, 100);
        answer = a + b * c - d;
        expression = `${a} + (${b} × ${c}) − ${d}`;
      } else {
        // Double digit multiplication combined
        const a = randomInt(11, 19);
        const b = randomInt(11, 19);
        const c = randomInt(30, 80);
        answer = a * b - c;
        expression = `(${a} × ${b}) − ${c}`;
      }
    } else {
      switch (op) {
        case 'ADD':
          operand1 = randomInt(100, 999);
          operand2 = randomInt(100, 999);
          answer = operand1 + operand2;
          operatorSign = '+';
          expression = `${operand1}\n+ ${operand2}`;
          isVertical = true;
          break;
        case 'SUBTRACT':
          operand1 = randomInt(100, 999);
          operand2 = randomInt(100, 999);
          answer = operand1 - operand2;
          operatorSign = '−';
          expression = `${operand1}\n− ${operand2}`;
          isVertical = true;
          break;
        case 'MULTIPLY':
          // Tough multiplications like 847 x 26 or 47 x 82 or 17 x 13
          if (Math.random() < 0.4) {
            // Extreme (vertical style multiplication)
            operand1 = randomInt(100, 999);
            operand2 = randomInt(12, 35);
            isVertical = true;
          } else {
            // Tough double digit multiplication
            operand1 = randomInt(12, 99);
            operand2 = randomInt(12, 99);
            isVertical = Math.random() < 0.5;
          }
          answer = operand1 * operand2;
          operatorSign = '×';
          expression = isVertical 
            ? `${operand1}\n× ${operand2}`
            : `${operand1} × ${operand2}`;
          break;
        case 'DIVIDE':
          operand2 = randomInt(11, 25); // Divisor
          answer = randomInt(12, 45); // Quotient
          operand1 = answer * operand2; // Dividend
          operatorSign = '÷';
          // 40% vertical division format representing a box or clean expression
          expression = `${operand1} ÷ ${operand2}`;
          break;
      }
    }
  }

  // Build unique ID
  const id = `q-${Date.now()}-${randomInt(1000, 9999)}`;

  // Generate multiple choice answers
  const choices = generateChoices(answer, operatorSign);

  return {
    id,
    operand1,
    operand2,
    operator: operatorSign,
    expression,
    isVertical,
    answer,
    choices,
    timeLimit,
  };
};

/**
 * Generate a deterministic sequence of questions for the Daily Challenge
 * based on the date seed (YYYYMMDD).
 */
export const generateDailyChallengeSet = (dateStr: string, count = 20): Question[] => {
  // Convert date string e.g. "2026-08-24" or "20260824" to seed number
  const seedStr = dateStr.replace(/-/g, '');
  const seedNum = parseInt(seedStr, 10) || 20260824;

  const questions: Question[] = [];

  // Simple LCG pseudo-random generator to make seed reproducible
  let currentSeed = seedNum;
  const nextRandom = () => {
    currentSeed = (currentSeed * 1664525 + 1013904223) % 4294967296;
    return currentSeed / 4294967296;
  };

  const ops: ('ADD' | 'SUBTRACT' | 'MULTIPLY' | 'DIVIDE')[] = ['ADD', 'SUBTRACT', 'MULTIPLY', 'DIVIDE'];

  for (let i = 0; i < count; i++) {
    // Determine difficulty progression for the daily challenge:
    // First 5 questions: BASIC
    // Next 10 questions: STANDARD
    // Last 5 questions: PRO
    const diff: DifficultyType = i < 5 ? 'BASIC' : i < 15 ? 'STANDARD' : 'PRO';

    // Mock math random momentarily to use seed
    const oldMathRandom = Math.random;
    Math.random = () => nextRandom();

    // Pick operator based on seed
    const allowed: ('ADD' | 'SUBTRACT' | 'MULTIPLY' | 'DIVIDE')[] = [
      ops[Math.floor(nextRandom() * ops.length)]
    ];

    questions.push(generateQuestion(allowed, diff));

    // Restore Math.random
    Math.random = oldMathRandom;
  }

  return questions;
};

/**
 * Validates if the 5-tile sequence is a correct arithmetic equation.
 */
export const isValidEquation = (tiles: string[]): boolean => {
  if (tiles.length !== 5) return false;

  const checkExpr = (aStr: string, op: string, bStr: string, cStr: string): boolean => {
    const a = parseInt(aStr, 10);
    const b = parseInt(bStr, 10);
    const c = parseInt(cStr, 10);
    if (isNaN(a) || isNaN(b) || isNaN(c)) return false;

    switch (op) {
      case '+': return a + b === c;
      case '−': return a - b === c;
      case '×': return a * b === c;
      case '÷': return b !== 0 && a / b === c;
      default: return false;
    }
  };

  // Case 1: A op B = C
  if (tiles[3] === '=') {
    return checkExpr(tiles[0], tiles[1], tiles[2], tiles[4]);
  }

  // Case 2: C = A op B
  if (tiles[1] === '=') {
    return checkExpr(tiles[2], tiles[3], tiles[4], tiles[0]);
  }

  return false;
};

/**
 * Generates an equation puzzle (operands, operator, and '=') shuffled into 5 tiles.
 */
export const generatePuzzleQuestion = (difficulty: DifficultyType): Question => {
  const ops: ('ADD' | 'SUBTRACT' | 'MULTIPLY' | 'DIVIDE')[] = ['ADD', 'SUBTRACT', 'MULTIPLY', 'DIVIDE'];
  const op = ops[randomInt(0, ops.length - 1)];

  let operand1 = 0;
  let operand2 = 0;
  let operatorSign: '+' | '−' | '×' | '÷' = '+';
  let answer = 0;

  if (difficulty === 'BASIC') {
    switch (op) {
      case 'ADD':
        operand1 = randomInt(2, 10);
        operand2 = randomInt(2, 10);
        answer = operand1 + operand2;
        operatorSign = '+';
        break;
      case 'SUBTRACT':
        operand1 = randomInt(5, 12);
        operand2 = randomInt(1, operand1 - 1);
        answer = operand1 - operand2;
        operatorSign = '−';
        break;
      case 'MULTIPLY':
        operand1 = randomInt(2, 5);
        operand2 = randomInt(2, 5);
        answer = operand1 * operand2;
        operatorSign = '×';
        break;
      case 'DIVIDE':
        operand2 = randomInt(2, 4);
        answer = randomInt(2, 4);
        operand1 = answer * operand2;
        operatorSign = '÷';
        break;
    }
  } else if (difficulty === 'STANDARD') {
    switch (op) {
      case 'ADD':
        operand1 = randomInt(10, 40);
        operand2 = randomInt(10, 40);
        answer = operand1 + operand2;
        operatorSign = '+';
        break;
      case 'SUBTRACT':
        operand1 = randomInt(20, 60);
        operand2 = randomInt(5, operand1 - 5);
        answer = operand1 - operand2;
        operatorSign = '−';
        break;
      case 'MULTIPLY':
        operand1 = randomInt(2, 10);
        operand2 = randomInt(2, 8);
        answer = operand1 * operand2;
        operatorSign = '×';
        break;
      case 'DIVIDE':
        operand2 = randomInt(3, 8);
        answer = randomInt(3, 10);
        operand1 = answer * operand2;
        operatorSign = '÷';
        break;
    }
  } else {
    // PRO
    switch (op) {
      case 'ADD':
        operand1 = randomInt(40, 150);
        operand2 = randomInt(40, 150);
        answer = operand1 + operand2;
        operatorSign = '+';
        break;
      case 'SUBTRACT':
        operand1 = randomInt(80, 250);
        operand2 = randomInt(10, operand1 - 10);
        answer = operand1 - operand2;
        operatorSign = '−';
        break;
      case 'MULTIPLY':
        operand1 = randomInt(4, 12);
        operand2 = randomInt(4, 12);
        answer = operand1 * operand2;
        operatorSign = '×';
        break;
      case 'DIVIDE':
        operand2 = randomInt(4, 12);
        answer = randomInt(5, 15);
        operand1 = answer * operand2;
        operatorSign = '÷';
        break;
    }
  }

  const solutionTiles = [operand1.toString(), operatorSign, operand2.toString(), '=', answer.toString()];
  
  // Shuffle logic ensuring we don't start with a correct equation
  let shuffled = shuffle(solutionTiles);
  let iterations = 0;
  while (isValidEquation(shuffled) && iterations < 50) {
    shuffled = shuffle(solutionTiles);
    iterations++;
  }

  return {
    id: `q-puzzle-${Date.now()}-${randomInt(1000, 9999)}`,
    operand1,
    operand2,
    operator: operatorSign,
    expression: `${operand1} ${operatorSign} ${operand2} = ${answer}`,
    isVertical: false,
    answer,
    choices: [],
    timeLimit: difficulty === 'BASIC' ? 30 : difficulty === 'STANDARD' ? 25 : 20, // Puzzle gets shorter as difficulty increases
    puzzleTiles: shuffled,
  };
};
