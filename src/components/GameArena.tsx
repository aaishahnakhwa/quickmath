import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playClick, playSuccess, playError, playSpeedDemon, playLevelUp } from '../services/audioService';
import { Flame, Delete, Check, X, Pause, Play, LogOut, RefreshCw, Layers, Sliders } from 'lucide-react';

interface GameArenaProps {
  config: {
    difficulty: 'BASIC' | 'STANDARD' | 'PRO';
    operations: ('ADD' | 'SUBTRACT' | 'MULTIPLY' | 'DIVIDE')[];
    mode: 'CLASSIC' | 'TIME_ATTACK' | 'STREAK' | 'BLITZ' | 'DAILY_CHALLENGE' | 'PUZZLE';
    questionLimit: number;
  };
  onGameEnd: (results: {
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    averageResponseTime: number;
    bestStreak: number;
    XP: number;
    dailyForfeited?: boolean;
  }) => void;
  onExit: () => void;
}

interface Equation {
  id: string;
  operand1: number;
  operand2: number;
  operator: string;
  expression: string;
  answer: number;
  choices: number[];
  isVertical: boolean;
}

export const GameArena: React.FC<GameArenaProps> = ({ config, onGameEnd, onExit }) => {
  // Screen Stage state matching Mockup: 'level-info' (Screen 02) | 'play' (Screen 03) | 'feedback' (Screen 04 & 05) | 'paused' (Screen 06)
  const [stage, setStage] = useState<'level-info' | 'play' | 'feedback' | 'paused'>('level-info');

  // Game states
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [combo, setCombo] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<Equation | null>(null);
  
  const [userTypedAnswer, setUserTypedAnswer] = useState("");
  const [inputMethod, setInputMethod] = useState<'choice' | 'input'>('choice');
  const [isGameOver, setIsGameOver] = useState(false);

  // Feedback states
  const [feedbackType, setFeedbackType] = useState<'correct' | 'incorrect'>('correct');
  const [pointsDelta, setPointsDelta] = useState(0);

  // Puzzle Swaps Mode
  const [puzzleTiles, setPuzzleTiles] = useState<string[]>([]);
  const [selectedTileIdx, setSelectedTileIdx] = useState<number | null>(null);

  // Time metrics
  const [timeLeft, setTimeLeft] = useState(10);
  const [activeLimit, setActiveLimit] = useState(10);
  const [timeAttackRemaining, setTimeAttackRemaining] = useState(60);

  // Time Elapsed format
  const [elapsedTime, setElapsedTime] = useState(0);

  // Animation triggers
  const [isShaking, setIsShaking] = useState(false);
  const [isSpeedDemon, setIsSpeedDemon] = useState(false);

  const questionStartTimeRef = useRef<number>(Date.now());
  const responseTimesRef = useRef<number[]>([]);
  const timerIntervalRef = useRef<any>(null);
  const timeAttackIntervalRef = useRef<any>(null);
  const elapsedIntervalRef = useRef<any>(null);

  // Anti-Reloading security lock
  useEffect(() => {
    if (config.mode === 'DAILY_CHALLENGE') {
      localStorage.setItem('quickmath_daily_started', 'true');
    }
  }, [config.mode]);

  // Generate equation
  const generateEquation = (idx: number): Equation => {
    const ops = config.operations.length > 0 ? config.operations : ['ADD'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    
    let operand1 = 1;
    let operand2 = 1;
    let operator = '+';
    let answer = 0;

    const diff = config.difficulty;

    if (op === 'ADD') {
      operator = '+';
      if (diff === 'BASIC') {
        operand1 = Math.floor(Math.random() * 20) + 1;
        operand2 = Math.floor(Math.random() * 20) + 1;
      } else if (diff === 'STANDARD') {
        operand1 = Math.floor(Math.random() * 80) + 10;
        operand2 = Math.floor(Math.random() * 80) + 10;
      } else {
        operand1 = Math.floor(Math.random() * 800) + 50;
        operand2 = Math.floor(Math.random() * 800) + 50;
      }
      answer = operand1 + operand2;
    } else if (op === 'SUBTRACT') {
      operator = '−';
      if (diff === 'BASIC') {
        operand1 = Math.floor(Math.random() * 20) + 5;
        operand2 = Math.floor(Math.random() * operand1);
      } else if (diff === 'STANDARD') {
        operand1 = Math.floor(Math.random() * 100) + 10;
        operand2 = Math.floor(Math.random() * operand1);
      } else {
        operand1 = Math.floor(Math.random() * 900) + 100;
        operand2 = Math.floor(Math.random() * operand1);
      }
      answer = operand1 - operand2;
    } else if (op === 'MULTIPLY') {
      operator = '×';
      if (diff === 'BASIC') {
        operand1 = Math.floor(Math.random() * 10) + 1;
        operand2 = Math.floor(Math.random() * 6) + 1;
      } else if (diff === 'STANDARD') {
        operand1 = Math.floor(Math.random() * 12) + 2;
        operand2 = Math.floor(Math.random() * 12) + 2;
      } else {
        operand1 = Math.floor(Math.random() * 30) + 5;
        operand2 = Math.floor(Math.random() * 20) + 5;
      }
      answer = operand1 * operand2;
    } else if (op === 'DIVIDE') {
      operator = '÷';
      if (diff === 'BASIC') {
        operand2 = Math.floor(Math.random() * 6) + 1;
        answer = Math.floor(Math.random() * 6) + 1;
      } else if (diff === 'STANDARD') {
        operand2 = Math.floor(Math.random() * 12) + 2;
        answer = Math.floor(Math.random() * 12) + 2;
      } else {
        operand2 = Math.floor(Math.random() * 25) + 3;
        answer = Math.floor(Math.random() * 25) + 3;
      }
      operand1 = operand2 * answer;
    }

    // Generate Multiple Choice numbers
    const choicesSet = new Set<number>([answer]);
    while (choicesSet.size < 4) {
      const offset = Math.floor(Math.random() * 15) - 7;
      if (offset !== 0) {
        choicesSet.add(answer + offset);
      }
    }
    const choices = Array.from(choicesSet).sort(() => Math.random() - 0.5);
    const isVertical = Math.random() > 0.6 && op !== 'DIVIDE';

    return {
      id: `q-${idx}-${Date.now()}`,
      operand1,
      operand2,
      operator,
      expression: `${operand1} ${operator} ${operand2}`,
      answer,
      choices,
      isVertical,
    };
  };

  // Setup timers
  const getQuestionTimeLimit = () => {
    if (config.mode === 'BLITZ') return 3;
    if (config.difficulty === 'BASIC') return 15;
    if (config.difficulty === 'STANDARD') return 10;
    return 8;
  };

  // Initialize first question data
  useEffect(() => {
    const firstQ = generateEquation(0);
    setCurrentQuestion(firstQ);
    
    const limit = getQuestionTimeLimit();
    setTimeLeft(limit);
    setActiveLimit(limit);
    questionStartTimeRef.current = Date.now();

    if (config.mode === 'PUZZLE') {
      setupPuzzleMode(firstQ);
    } else {
      setInputMethod(config.difficulty === 'PRO' ? 'input' : 'choice');
    }
  }, []);

  // Setup Puzzle blocks
  const setupPuzzleMode = (q: Equation) => {
    const tiles = [
      q.operand1.toString(),
      q.operator,
      q.operand2.toString(),
      "=",
      q.answer.toString()
    ];
    let shuffled = [...tiles];
    while (shuffled.join(' ') === tiles.join(' ')) {
      shuffled.sort(() => Math.random() - 0.5);
    }
    setPuzzleTiles(shuffled);
    setSelectedTileIdx(null);
  };

  // Start Level handler (Screen 02 -> Screen 03)
  const handleStartLevel = () => {
    playClick();
    setStage('play');
    questionStartTimeRef.current = Date.now();
  };

  // Main countdown timer interval
  useEffect(() => {
    if (isGameOver || stage !== 'play' || config.mode === 'TIME_ATTACK') return;

    timerIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0.1) {
          clearInterval(timerIntervalRef.current);
          handleTimeOut();
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);

    return () => clearInterval(timerIntervalRef.current);
  }, [currentQuestion, isGameOver, stage]);

  // Session clock countdown (For Time Attack runs)
  useEffect(() => {
    if (isGameOver || stage !== 'play' || config.mode !== 'TIME_ATTACK') return;

    timeAttackIntervalRef.current = setInterval(() => {
      setTimeAttackRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timeAttackIntervalRef.current);
          endSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timeAttackIntervalRef.current);
  }, [isGameOver, stage]);

  // General Elapsed Session Timer
  useEffect(() => {
    if (isGameOver || stage !== 'play') return;

    elapsedIntervalRef.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(elapsedIntervalRef.current);
  }, [isGameOver, stage]);

  // Formatted elapsed clock
  const getFormattedElapsed = () => {
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleTimeOut = () => {
    if (isGameOver) return;
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 250);
    
    // Penalize user
    playError();
    setCombo(0);

    setFeedbackType('incorrect');
    setPointsDelta(-10);
    setStage('feedback');

    if (config.mode === 'CLASSIC') {
      setLives((prev) => prev - 1);
    }
  };

  const handleAnswerSubmit = (submittedVal: number) => {
    if (stage !== 'play' || isGameOver || !currentQuestion) return;

    const responseTimeSec = (Date.now() - questionStartTimeRef.current) / 1000;
    responseTimesRef.current.push(responseTimeSec);

    const isCorrect = submittedVal === currentQuestion.answer;

    if (isCorrect) {
      playSuccess();
      
      const nextCombo = combo + 1;
      setCombo(nextCombo);
      if (nextCombo > bestStreak) {
        setBestStreak(nextCombo);
      }

      setCorrectAnswers((prev) => prev + 1);

      let addedPoints = 40; // Base score matching mockup +40 Points
      if (responseTimeSec <= 1.2 && config.mode !== 'PUZZLE') {
        playSpeedDemon();
        setIsSpeedDemon(true);
        addedPoints += 10; // Speed Demon bonus
        setTimeout(() => setIsSpeedDemon(false), 600);
      }

      setScore((prev) => prev + addedPoints);
      setPointsDelta(addedPoints);
      setFeedbackType('correct');
      setStage('feedback');
    } else {
      playError();
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 250);

      setCombo(0);
      setPointsDelta(-10); // Penalty
      setFeedbackType('incorrect');
      setStage('feedback');

      if (config.mode === 'CLASSIC') {
        setLives((prev) => prev - 1);
      }
    }
  };

  // Continue trigger from Feedback Overlays (Screen 04 & 05 -> next question or finish)
  const handleFeedbackContinue = () => {
    playClick();
    
    if (config.mode === 'CLASSIC' && lives <= 0) {
      endSession();
      return;
    }
    if (config.mode === 'STREAK' && combo === 0) {
      endSession();
      return;
    }

    loadNextQuestion();
  };

  const loadNextQuestion = () => {
    const limit = config.mode === 'DAILY_CHALLENGE' ? 20 : config.questionLimit;
    const nextIdx = currentQuestionIdx + 1;
    
    if (config.mode !== 'TIME_ATTACK' && nextIdx >= limit) {
      endSession();
      return;
    }

    setCurrentQuestionIdx(nextIdx);
    const nextQ = generateEquation(nextIdx);
    setCurrentQuestion(nextQ);
    setUserTypedAnswer("");
    setStage('play');

    if (config.mode === 'PUZZLE') {
      setupPuzzleMode(nextQ);
    }

    const nextLimit = getQuestionTimeLimit();
    setTimeLeft(nextLimit);
    setActiveLimit(nextLimit);
    questionStartTimeRef.current = Date.now();
  };

  const endSession = () => {
    setIsGameOver(true);
    clearInterval(timerIntervalRef.current);
    clearInterval(timeAttackIntervalRef.current);
    clearInterval(elapsedIntervalRef.current);

    playLevelUp();

    const totalRuns = responseTimesRef.current.length;
    const avgTime = totalRuns === 0 
      ? 0 
      : parseFloat((responseTimesRef.current.reduce((a, b) => a + b, 0) / totalRuns).toFixed(2));

    // XP calculation
    let calculatedXP = Math.floor(score * 0.15);
    if (calculatedXP < 20 && correctAnswers > 0) calculatedXP = 20;

    onGameEnd({
      score,
      correctAnswers,
      totalQuestions: totalRuns,
      averageResponseTime: avgTime,
      bestStreak,
      XP: calculatedXP,
    });
  };

  // Puzzle Swap check
  const handleTileClick = (idx: number) => {
    if (stage !== 'play' || isGameOver) return;
    playClick();

    if (selectedTileIdx === null) {
      setSelectedTileIdx(idx);
    } else {
      if (selectedTileIdx === idx) {
        setSelectedTileIdx(null);
        return;
      }
      const newTiles = [...puzzleTiles];
      const temp = newTiles[selectedTileIdx];
      newTiles[selectedTileIdx] = newTiles[idx];
      newTiles[idx] = temp;
      
      setPuzzleTiles(newTiles);
      setSelectedTileIdx(null);

      validatePuzzleEquation(newTiles);
    }
  };

  const validatePuzzleEquation = (tiles: string[]) => {
    try {
      const op1 = parseFloat(tiles[0]);
      const operator = tiles[1];
      const op2 = parseFloat(tiles[2]);
      const eqSign = tiles[3];
      const result = parseFloat(tiles[4]);

      const opSign = operator === '−' ? '-' : operator === '×' ? '*' : operator === '÷' ? '/' : '+';

      if (eqSign === '=') {
        let evaluatedLeft = 0;
        if (opSign === '+') evaluatedLeft = op1 + op2;
        else if (opSign === '-') evaluatedLeft = op1 - op2;
        else if (opSign === '*') evaluatedLeft = op1 * op2;
        else if (opSign === '/') evaluatedLeft = op1 / op2;

        if (evaluatedLeft === result) {
          handleAnswerSubmit(result);
          return;
        }
      }

      // Reverse layout check
      const op1Rev = parseFloat(tiles[4]);
      const operatorRev = tiles[3];
      const op2Rev = parseFloat(tiles[2]);
      const eqSignRev = tiles[1];
      const resultRev = parseFloat(tiles[0]);
      
      const opSignRev = operatorRev === '−' ? '-' : operatorRev === '×' ? '*' : operatorRev === '÷' ? '/' : '+';

      if (eqSignRev === '=') {
        let evaluatedRight = 0;
        if (opSignRev === '+') evaluatedRight = op1Rev + op2Rev;
        else if (opSignRev === '-') evaluatedRight = op1Rev - op2Rev;
        else if (opSignRev === '*') evaluatedRight = op1Rev * op2Rev;
        else if (opSignRev === '/') evaluatedRight = op1Rev / op2Rev;

        if (evaluatedRight === resultRev) {
          handleAnswerSubmit(resultRev);
        }
      }
    } catch (e) {}
  };

  // Keyboard binds integration
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isGameOver || stage !== 'play' || config.mode === 'PUZZLE') return;

      if (inputMethod === 'choice') {
        if (['1', '2', '3', '4'].includes(e.key) && currentQuestion) {
          const idx = parseInt(e.key) - 1;
          if (idx < currentQuestion.choices.length) {
            playClick();
            handleAnswerSubmit(currentQuestion.choices[idx]);
          }
        }
      } else {
        if (e.key >= '0' && e.key <= '9') {
          if (userTypedAnswer.length >= 6) return;
          playClick();
          setUserTypedAnswer((prev) => prev + e.key);
        } else if (e.key === 'Backspace') {
          playClick();
          setUserTypedAnswer((prev) => prev.slice(0, -1));
        } else if (e.key === 'Enter' && userTypedAnswer.trim() !== '') {
          playClick();
          handleAnswerSubmit(parseInt(userTypedAnswer));
        } else if (e.key === '-') {
          playClick();
          setUserTypedAnswer((prev) => (prev.startsWith('-') ? prev.slice(1) : '-' + prev));
        } else if (e.key === 'Escape' || e.key.toLowerCase() === 'c') {
          playClick();
          setUserTypedAnswer('');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQuestion, userTypedAnswer, inputMethod, stage, isGameOver]);

  // Restart trigger from Pause screen
  const handleRestart = () => {
    playClick();
    setScore(0);
    setLives(3);
    setCombo(0);
    setBestStreak(0);
    setCorrectAnswers(0);
    setCurrentQuestionIdx(0);
    setElapsedTime(0);
    setUserTypedAnswer("");
    
    const nextQ = generateEquation(0);
    setCurrentQuestion(nextQ);
    if (config.mode === 'PUZZLE') setupPuzzleMode(nextQ);
    
    setStage('play');
  };

  if (!currentQuestion) return null;

  // Level number mapping
  const levelNum = config.difficulty === 'BASIC' ? '01' : config.difficulty === 'STANDARD' ? '02' : '03';
  const levelName = config.difficulty === 'BASIC' ? 'BEGINNER' : config.difficulty === 'STANDARD' ? 'INTERMEDIATE' : 'ADVANCED';
  const levelColor = config.difficulty === 'BASIC' ? 'text-emerald-500' : config.difficulty === 'STANDARD' ? 'text-blue-500' : 'text-purple-500';
  const levelBgHex = config.difficulty === 'BASIC' ? 'bg-gradient-to-br from-emerald-400 to-emerald-600' : config.difficulty === 'STANDARD' ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-gradient-to-br from-purple-500 to-indigo-700';

  const totalQuestionsLimit = config.mode === 'DAILY_CHALLENGE' ? 20 : config.questionLimit;
  const timeEstimateStr = `${Math.ceil((totalQuestionsLimit * 15) / 60)} MIN`;

  return (
    <div className="flex justify-center items-center w-full min-h-[480px]">
      
      {/* SCREEN 02: LEVEL SELECT / PREVIEW SCREEN */}
      {stage === 'level-info' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm flex flex-col gap-6"
        >
          <div className="flex items-center gap-3 justify-center pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">// LEVEL SELECT</span>
          </div>

          <div className="chunky-card flex flex-col items-center gap-5 text-center">
            <h2 className="font-display font-extrabold text-slate-400 uppercase text-[10px] tracking-widest">
              LEVEL {levelNum} // {levelName}
            </h2>

            {/* Hexagonal Shield */}
            <div className={`w-24 h-24 flex items-center justify-center rounded-3xl ${levelBgHex} shadow-lg shadow-blue-500/10`}>
              <span className="font-display font-black text-white text-3xl leading-none">{levelNum}</span>
            </div>

            <div className="mt-1">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-sans max-w-xs font-semibold leading-relaxed">
                Questions get trickier.<br />Focus more. Score higher.
              </p>
            </div>

            {/* Info details Grid */}
            <div className="grid grid-cols-2 gap-4 w-full pt-4 border-t border-slate-100 dark:border-slate-800 text-left font-display">
              <div>
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Total Questions</span>
                <span className="text-base font-extrabold text-slate-800 dark:text-white mt-1 block">
                  {totalQuestionsLimit}
                </span>
              </div>
              <div>
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Est. Time</span>
                <span className="text-base font-extrabold text-slate-800 dark:text-white mt-1 block">
                  ~ {timeEstimateStr}
                </span>
              </div>
            </div>

            {/* Operations preview */}
            <div className="w-full text-left">
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">Operations Selected</span>
              <div className="flex gap-1.5 font-extrabold text-xs">
                {config.operations.map((op) => {
                  let sym = '+';
                  let col = 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20';
                  if (op === 'SUBTRACT') { sym = '−'; col = 'bg-blue-50 text-blue-600 dark:bg-blue-950/20'; }
                  else if (op === 'MULTIPLY') { sym = '×'; col = 'bg-purple-50 text-purple-600 dark:bg-purple-950/20'; }
                  else if (op === 'DIVIDE') { sym = '÷'; col = 'bg-amber-50 text-amber-600 dark:bg-amber-950/20'; }

                  return (
                    <div key={op} className={`w-8 h-8 rounded-lg border border-slate-200/20 flex items-center justify-center ${col}`}>
                      {sym}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          <button
            onClick={handleStartLevel}
            className="btn-chunky w-full bg-electric hover:bg-electric-hover text-white border-electric text-sm font-bold tracking-widest cursor-pointer"
          >
            START LEVEL
          </button>
        </motion.div>
      )}

      {/* SCREEN 03: GAMEPLAY CANVAS */}
      {stage === 'play' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md flex flex-col gap-6 relative"
        >
          {/* Header metrics */}
          <div className="flex items-center justify-between w-full font-display select-none">
            <div className="text-left">
              <span className="text-[8px] font-extrabold text-slate-400 block tracking-widest uppercase">LEVEL</span>
              <span className={`text-[11px] font-black tracking-wider ${levelColor}`}>{levelName}</span>
            </div>
            <div className="text-center">
              <span className="text-[8px] font-extrabold text-slate-400 block tracking-widest uppercase">QUESTION</span>
              <span className="text-[11px] font-extrabold font-mono dark:text-neutral-200">
                {(currentQuestionIdx + 1).toString().padStart(2, '0')} / {totalQuestionsLimit.toString().padStart(2, '0')}
              </span>
            </div>
            <div className="text-center">
              <span className="text-[8px] font-extrabold text-slate-400 block tracking-widest uppercase">TIME</span>
              <span className="text-[11px] font-extrabold font-mono dark:text-neutral-200">
                {config.mode === 'TIME_ATTACK' ? `${timeAttackRemaining}s` : getFormattedElapsed()}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[8px] font-extrabold text-slate-400 block tracking-widest uppercase">SCORE</span>
              <span className="text-[11px] font-black text-slate-800 dark:text-white font-mono">{score}</span>
            </div>
          </div>

          {/* Clean linear progress bar */}
          <div className="w-full h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden select-none border border-slate-200/20">
            {config.mode === 'TIME_ATTACK' ? (
              <div 
                className="h-full bg-electric rounded-full transition-all duration-1000"
                style={{ width: `${(timeAttackRemaining / 60) * 100}%` }}
              />
            ) : (
              <div 
                className={`h-full rounded-full transition-all duration-100 ${
                  timeLeft / activeLimit <= 0.25 ? 'bg-coral' : timeLeft / activeLimit <= 0.55 ? 'bg-rewards-yellow' : 'bg-lime'
                }`}
                style={{ width: `${(timeLeft / activeLimit) * 100}%` }}
              />
            )}
          </div>

          {/* Main Gameplay Screen Card */}
          <div className="chunky-card relative overflow-hidden flex flex-col items-center justify-center min-h-[240px] px-6 py-8">
            
            {/* Speed Demon Overlay notification */}
            <AnimatePresence>
              {isSpeedDemon && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-electric/5 pointer-events-none z-10 flex items-center justify-center border border-electric/30 rounded-3xl"
                >
                  <span className="bg-amber-400 text-slate-900 border border-amber-300 rounded-xl px-5 py-2 font-bold text-[10px] tracking-widest select-none">
                    ⚡ SPEED DEMON! +10 POINTS ⚡
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Flame Streak Indicator */}
            {combo > 0 && (
              <div className="absolute top-5 right-6 bg-coral/5 text-coral border border-coral/10 text-[9px] font-bold px-3 py-1 rounded-full flex items-center gap-1 select-none">
                <Flame className="w-3.5 h-3.5 fill-current" />
                <span>{combo} COMBO</span>
              </div>
            )}

            {/* Calculation expression */}
            {config.mode === 'PUZZLE' ? (
              <div className="flex flex-col items-center justify-center gap-6 w-full mt-2">
                <div className="flex flex-wrap items-center justify-center gap-2.5">
                  {puzzleTiles.map((tile, idx) => {
                    const isSelected = selectedTileIdx === idx;
                    let tileColors = "bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-neutral-300 border-slate-200/50 dark:border-slate-700";
                    if (tile === '=') {
                      tileColors = "bg-lime/5 text-lime border-lime/20";
                    } else if (['+', '−', '×', '÷'].includes(tile)) {
                      tileColors = "bg-rewards-yellow/5 text-rewards-yellow border-rewards-yellow/20";
                    }

                    return (
                      <button
                        key={`tile-${idx}-${tile}`}
                        onClick={() => handleTileClick(idx)}
                        className={`w-13 h-13 rounded-xl border flex items-center justify-center font-semibold text-lg cursor-pointer select-none transition-all duration-75 ${tileColors} ${
                          isSelected ? 'border-electric ring-2 ring-electric/30 scale-105' : ''
                        }`}
                      >
                        {tile}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex justify-center items-center py-6">
                <motion.div 
                  animate={isShaking ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
                  className="font-display font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-3 select-none"
                >
                  <span className="text-4xl sm:text-5xl">{currentQuestion.expression}</span>
                  <span className="text-3xl text-slate-300 dark:text-zinc-700">=</span>
                  <span className="text-4xl sm:text-5xl text-electric font-mono tracking-wide">
                    {inputMethod === 'choice' ? '?' : userTypedAnswer || '?'}
                  </span>
                </motion.div>
              </div>
            )}
          </div>

          {/* Choices or direct input pad */}
          <div className="min-h-[160px]">
            {config.mode === 'PUZZLE' ? (
              <div className="text-center font-display p-4 bg-slate-50/50 dark:bg-zinc-800/20 rounded-2xl border border-slate-100/50 dark:border-slate-800 select-none">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Tile Swap System</span>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 max-w-xs mx-auto leading-relaxed">
                  Tap one tile, then tap another to swap positions. Arrange them to complete a correct equation.
                </p>
              </div>
            ) : inputMethod === 'choice' ? (
              <div className="grid grid-cols-2 gap-3 font-display">
                {currentQuestion.choices.map((val, idx) => (
                  <button
                    key={`${currentQuestion.id}-choice-${idx}`}
                    onClick={() => { playClick(); handleAnswerSubmit(val); }}
                    className="mechanical-key relative hover:border-slate-200 dark:hover:border-slate-700 flex flex-col justify-center items-center cursor-pointer"
                  >
                    <span className="font-semibold text-lg">{val}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex gap-4 items-stretch select-none">
                {/* Minimal Keypad grid */}
                <div className="w-full grid grid-cols-3 gap-2 max-w-sm mx-auto">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                      key={num}
                      onClick={() => { 
                        if (userTypedAnswer.length >= 6) return;
                        playClick(); 
                        setUserTypedAnswer((prev) => prev + num.toString()); 
                      }}
                      className="mechanical-key text-base font-semibold"
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    onClick={() => { playClick(); setUserTypedAnswer((prev) => (prev.startsWith('-') ? prev.slice(1) : '-' + prev)); }}
                    className="mechanical-key text-sm font-semibold"
                  >
                    ±
                  </button>
                  <button
                    onClick={() => { 
                      if (userTypedAnswer.length >= 6) return;
                      playClick(); 
                      setUserTypedAnswer((prev) => prev + '0'); 
                    }}
                    className="mechanical-key text-base font-semibold"
                  >
                    0
                  </button>
                  <button
                    onClick={() => { playClick(); setUserTypedAnswer((prev) => prev.slice(0, -1)); }}
                    className="mechanical-key text-slate-400"
                  >
                    <Delete className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => { playClick(); setUserTypedAnswer(''); }}
                    className="mechanical-key text-[9px] tracking-wider font-bold text-coral bg-rose-50/50 hover:bg-rose-100/50"
                  >
                    CLEAR
                  </button>
                  <button
                    onClick={() => {
                      playClick();
                      if (userTypedAnswer.trim() !== '') {
                        handleAnswerSubmit(parseInt(userTypedAnswer));
                      }
                    }}
                    disabled={userTypedAnswer.trim() === ''}
                    className="mechanical-key col-span-2 text-[10px] tracking-widest font-bold bg-electric hover:bg-electric-hover text-white border-electric"
                  >
                    SUBMIT
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Pause Button (Screen 03 bottom) */}
          <div className="flex justify-center select-none pt-2">
            <button
              onClick={() => { playClick(); setStage('paused'); }}
              className="flex items-center gap-1.5 px-6 py-2 rounded-full border border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50/50 dark:hover:bg-zinc-800/40 cursor-pointer"
            >
              <Pause className="w-3.5 h-3.5" />
              PAUSE
            </button>
          </div>
        </motion.div>
      )}

      {/* SCREEN 04: CORRECT FEEDBACK & SCREEN 05: INCORRECT FEEDBACK */}
      {stage === 'feedback' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm flex flex-col gap-6"
        >
          <div className="flex items-center gap-3 justify-center pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
              {feedbackType === 'correct' ? '// CORRECT FEEDBACK' : '// WRONG FEEDBACK'}
            </span>
          </div>

          <div className="chunky-card flex flex-col items-center gap-6 text-center select-none">
            {feedbackType === 'correct' ? (
              <>
                {/* Circular ring with checkmark */}
                <div className="w-20 h-20 rounded-full border-4 border-emerald-500 flex items-center justify-center text-emerald-500 shadow-md shadow-emerald-500/10">
                  <Check className="w-10 h-10 stroke-[3]" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-emerald-500">Correct!</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">Great Work.</p>
                </div>
                <div className="px-5 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-full font-bold text-[10px] tracking-widest uppercase">
                  + {pointsDelta} Points
                </div>
              </>
            ) : (
              <>
                {/* Circular ring with crossmark */}
                <div className="w-20 h-20 rounded-full border-4 border-red-500 flex items-center justify-center text-red-500 shadow-md shadow-red-500/10">
                  <X className="w-10 h-10 stroke-[3]" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-red-500">Incorrect!</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">
                    The correct answer is <span className="font-mono font-bold text-slate-800 dark:text-white">{currentQuestion.answer}</span>.
                  </p>
                </div>
                <div className="px-5 py-1.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full font-bold text-[10px] tracking-widest uppercase">
                  - 10 Points
                </div>
              </>
            )}
          </div>

          <button
            onClick={handleFeedbackContinue}
            className={`btn-chunky w-full text-white text-sm font-bold tracking-widest cursor-pointer ${
              feedbackType === 'correct' 
                ? 'bg-electric hover:bg-electric-hover border-electric' 
                : 'bg-slate-800 hover:bg-slate-900 border-slate-800 dark:bg-zinc-800 dark:hover:bg-zinc-700'
            }`}
          >
            {feedbackType === 'correct' ? 'CONTINUE →' : 'TRY AGAIN'}
          </button>
        </motion.div>
      )}

      {/* SCREEN 06: PAUSE MENU */}
      {stage === 'paused' && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm flex flex-col gap-6"
        >
          <div className="flex items-center gap-3 justify-center pb-2 border-b border-slate-100 dark:border-slate-800 select-none">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">// GAME PAUSED</span>
          </div>

          <div className="chunky-card flex flex-col gap-4 text-center select-none">
            <h2 className="font-display font-extrabold text-slate-400 uppercase text-[10px] tracking-widest">
              PAUSE SETTINGS
            </h2>

            <div className="flex flex-col gap-3 font-display">
              {/* Resume */}
              <button
                onClick={() => { playClick(); setStage('play'); }}
                className="w-full py-3.5 bg-electric hover:bg-electric-hover text-white font-bold rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-500/10 text-xs tracking-wider uppercase"
              >
                <Play className="w-4 h-4 fill-white" />
                Resume
              </button>

              {/* Restart */}
              <button
                onClick={handleRestart}
                className="w-full py-3 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-neutral-300 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-50 cursor-pointer text-xs tracking-wider uppercase"
              >
                <RefreshCw className="w-4 h-4" />
                Restart
              </button>

              {/* Change Level */}
              <button
                onClick={() => { playClick(); setStage('level-info'); }}
                className="w-full py-3 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-neutral-300 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-50 cursor-pointer text-xs tracking-wider uppercase"
              >
                <Layers className="w-4 h-4" />
                Change Level
              </button>

              {/* Change Operations */}
              <button
                onClick={() => { playClick(); onExit(); }}
                className="w-full py-3 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-neutral-300 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-50 cursor-pointer text-xs tracking-wider uppercase"
              >
                <Sliders className="w-4 h-4" />
                Change Operations
              </button>

              {/* Back to Home */}
              <button
                onClick={() => { playClick(); onExit(); }}
                className="w-full py-3 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-slate-800 text-coral font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-red-50/30 cursor-pointer text-xs tracking-wider uppercase"
              >
                <LogOut className="w-4 h-4" />
                Back to Home
              </button>
            </div>
          </div>
        </motion.div>
      )}

    </div>
  );
};
