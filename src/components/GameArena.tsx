import React, { useState, useEffect, useRef } from 'react';
import { generateQuestion, generateDailyChallengeSet, generatePuzzleQuestion, isValidEquation } from '../engine/questionGenerator';
import type { Question } from '../engine/questionGenerator';
import { calculateScore } from '../engine/scoreSystem';
import { Flame, Heart, RefreshCw, Delete } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { playClick, playSuccess, playError, playSpeedDemon } from '../services/audioService';

interface GameArenaProps {
  config: {
    difficulty: 'BASIC' | 'STANDARD' | 'PRO';
    operations: ('ADD' | 'SUBTRACT' | 'MULTIPLY' | 'DIVIDE')[];
    mode: 'CLASSIC' | 'TIME_ATTACK' | 'STREAK' | 'BLITZ' | 'DAILY_CHALLENGE' | 'PUZZLE';
    questionLimit: number;
  };
  onGameEnd: (results: {
    score: number;
    accuracy: number;
    maxStreak: number;
    avgResponseTime: number;
    totalQuestions: number;
    correctAnswers: number;
    difficulty: 'BASIC' | 'STANDARD' | 'PRO';
    mode: string;
    speedDemonCount: number;
    maxCombo: number;
    opPerformance: { op: string; answered: number; correct: number }[];
  }) => void;
  onExit: () => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  shape: 'circle' | 'square' | 'triangle' | 'plus';
}

const FUNNY_MESSAGES = [
  "MATH YIELD: EXCELLENT",
  "NERD SPEED: CHARGED",
  "CPU STATUS: COOLING",
  "BRAIN ENERGY: OVER 9000",
  "ALGEBRA FORCE: ACTIVE",
  "COMBO STACK: STABLE",
  "COGNITIVE YIELD: MAX",
  "SYSTEM STATUS: GLORIOUS"
];

export const GameArena: React.FC<GameArenaProps> = ({ config, onGameEnd, onExit }) => {
  // Input Method: 'choice' (multiple choice) or 'input' (direct typing)
  const [inputMethod, setInputMethod] = useState<'choice' | 'input'>('choice');
  
  // Game Questions and State
  const [questionsList, setQuestionsList] = useState<Question[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [userTypedAnswer, setUserTypedAnswer] = useState('');

  // Puzzle-specific states
  const [activeTiles, setActiveTiles] = useState<string[]>([]);
  const [selectedTileIdx, setSelectedTileIdx] = useState<number | null>(null);
  
  // Game Counters
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  
  // Question & Session Timers
  const [timeLeft, setTimeLeft] = useState(10);
  const [timeUsedForCurrent, setTimeUsedForCurrent] = useState(0);
  
  // Analytics
  const [answersLog, setAnswersLog] = useState<{ op: string; isCorrect: boolean; time: number }[]>([]);
  const [speedDemonCount, setSpeedDemonCount] = useState(0);

  // FX & Visual States
  const [isShaking, setIsShaking] = useState(false);
  const [isSpeedDemon, setIsSpeedDemon] = useState(false);
  const [tickerMessage, setTickerMessage] = useState("COGNITIVE COMPILING: OK");
  const [borderFeedback, setBorderFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [comboPopup, setComboPopup] = useState<string | null>(null);
  
  // Anti-Loophole Double Click Lock Flags
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  // Timers Refs
  const timerRef = useRef<any>(null);

  // 1. Initial Setup: Load Questions
  useEffect(() => {
    if (config.mode === 'DAILY_CHALLENGE') {
      const todayStr = new Date().toISOString().split('T')[0];
      const dailySet = generateDailyChallengeSet(todayStr, 20);
      setQuestionsList(dailySet);
      setCurrentQuestion(dailySet[0]);
      setTimeLeft(dailySet[0].timeLimit);
    } else if (config.mode === 'PUZZLE') {
      const first = generatePuzzleQuestion(config.difficulty);
      setQuestionsList([first]);
      setCurrentQuestion(first);
      setTimeLeft(first.timeLimit);
    } else {
      const first = generateQuestion(config.operations, config.difficulty);
      setQuestionsList([first]);
      setCurrentQuestion(first);
      setTimeLeft(config.mode === 'BLITZ' ? 3.0 : first.timeLimit);
    }

    if (config.difficulty === 'PRO' && config.mode !== 'PUZZLE') {
      setInputMethod('input');
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [config]);

  // 2. Question Change Trigger
  useEffect(() => {
    if (!currentQuestion) return;

    setTimeUsedForCurrent(0);
    const start = Date.now();

    if (timerRef.current) clearInterval(timerRef.current);
    
    let activeLimit = currentQuestion.timeLimit;
    if (config.mode === 'BLITZ') {
      activeLimit = Math.max(1.2, 3.0 - Math.floor(streak / 5) * 0.3);
    }
    setTimeLeft(activeLimit);

    // Sync puzzle tiles if in PUZZLE mode
    if (config.mode === 'PUZZLE' && currentQuestion.puzzleTiles) {
      setActiveTiles(currentQuestion.puzzleTiles);
      setSelectedTileIdx(null);
    }

    // Set funny message on each calculation ticker
    setTickerMessage(FUNNY_MESSAGES[Math.floor(Math.random() * FUNNY_MESSAGES.length)]);
    setIsSubmitting(false);

    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - start) / 1000;
      setTimeUsedForCurrent(elapsed);
      
      const remaining = activeLimit - elapsed;
      if (remaining <= 0) {
        setTimeLeft(0);
        handleTimeout();
      } else {
        setTimeLeft(remaining);
      }
    }, 50);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentQuestion, currentQuestionIdx]);

  // 3. Timeout handler
  const handleTimeout = () => {
    if (isGameOver) return;
    playError();
    setBorderFeedback('wrong');
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 300);
    setTimeout(() => setBorderFeedback(null), 500);

    setAnswersLog((prev) => [
      ...prev,
      { op: currentQuestion?.operator || 'ADD', isCorrect: false, time: currentQuestion?.timeLimit || 10 },
    ]);

    setCombo(0);
    setStreak(0);

    if (config.mode === 'CLASSIC') {
      setLives((prev) => {
        const nextLives = prev - 1;
        if (nextLives <= 0) {
          endGameRun();
        } else {
          loadNextQuestion();
        }
        return nextLives;
      });
    } else if (config.mode === 'STREAK' || config.mode === 'BLITZ') {
      endGameRun();
    } else {
      loadNextQuestion();
    }
  };

  // 4. Input Submission handler
  const handleAnswerSubmit = (value: number) => {
    if (!currentQuestion || isSubmitting || isGameOver) return;
    setIsSubmitting(true);

    const isCorrect = value === currentQuestion.answer;
    const timeUsed = timeUsedForCurrent;

    setAnswersLog((prev) => [
      ...prev,
      { op: currentQuestion.operator || 'ADD', isCorrect, time: timeUsed },
    ]);

    if (isCorrect) {
      setBorderFeedback('correct');
      setTimeout(() => setBorderFeedback(null), 400);
      triggerSuccessFX();

      // Audio synthesized responses based on speed demon triggers
      if (timeUsed <= 1.2) {
        setSpeedDemonCount((prev) => prev + 1);
        setIsSpeedDemon(true);
        playSpeedDemon();
        setTimeout(() => setIsSpeedDemon(false), 800);
      } else {
        playSuccess();
      }

      const newStreak = streak + 1;
      const newCombo = combo + 1;
      setStreak(newStreak);
      setMaxStreak((prev) => Math.max(prev, newStreak));
      setCombo(newCombo);
      setMaxCombo((prev) => Math.max(prev, newCombo));

      if (newCombo % 5 === 0) {
        setComboPopup(`COMBO ×${newCombo}!`);
        setTimeout(() => setComboPopup(null), 1000);
      } else if (newCombo === 3) {
        setComboPopup('ON FIRE!');
        setTimeout(() => setComboPopup(null), 800);
      }

      let activeLimit = currentQuestion.timeLimit;
      if (config.mode === 'BLITZ') {
        activeLimit = Math.max(1.2, 3.0 - Math.floor(streak / 5) * 0.3);
      }

      const scoreBreakdown = calculateScore(timeUsed, activeLimit, config.difficulty, combo);
      setScore((prev) => prev + scoreBreakdown.totalScore);
      loadNextQuestion();
    } else {
      playError();
      setBorderFeedback('wrong');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 300);
      setTimeout(() => setBorderFeedback(null), 400);

      setCombo(0);
      setStreak(0);

      if (config.mode === 'CLASSIC') {
        setLives((prev) => {
          const nextLives = prev - 1;
          if (nextLives <= 0) {
            endGameRun();
          } else {
            loadNextQuestion();
          }
          return nextLives;
        });
      } else if (config.mode === 'STREAK' || config.mode === 'BLITZ') {
        endGameRun();
      } else {
        loadNextQuestion();
      }
    }

    setUserTypedAnswer('');
  };

  // Puzzle mode tile click/swap handler
  const handleTileClick = (idx: number) => {
    if (isSubmitting || isGameOver) return;
    playClick();
    if (selectedTileIdx === null) {
      setSelectedTileIdx(idx);
    } else if (selectedTileIdx === idx) {
      setSelectedTileIdx(null);
    } else {
      const newTiles = [...activeTiles];
      const temp = newTiles[selectedTileIdx];
      newTiles[selectedTileIdx] = newTiles[idx];
      newTiles[idx] = temp;
      
      setActiveTiles(newTiles);
      setSelectedTileIdx(null);

      // Validate equation arrangement
      if (isValidEquation(newTiles)) {
        handleAnswerSubmit(currentQuestion!.answer);
      }
    }
  };

  // 5. Load Next Question
  const loadNextQuestion = () => {
    const limit = config.mode === 'DAILY_CHALLENGE' ? 20 : config.questionLimit;
    if (currentQuestionIdx + 1 >= limit) {
      endGameRun();
      return;
    }

    if (config.mode === 'DAILY_CHALLENGE') {
      const nextIdx = currentQuestionIdx + 1;
      setCurrentQuestionIdx(nextIdx);
      setCurrentQuestion(questionsList[nextIdx]);
    } else if (config.mode === 'PUZZLE') {
      const nextQuestion = generatePuzzleQuestion(config.difficulty);
      setQuestionsList((prev) => [...prev, nextQuestion]);
      setCurrentQuestionIdx((prev) => prev + 1);
      setCurrentQuestion(nextQuestion);
    } else {
      const nextQuestion = generateQuestion(config.operations, config.difficulty);
      setQuestionsList((prev) => [...prev, nextQuestion]);
      setCurrentQuestionIdx((prev) => prev + 1);
      setCurrentQuestion(nextQuestion);
    }
  };

  // 6. Game Arena Global timer
  const [timeAttackRemaining, setTimeAttackRemaining] = useState(60);
  useEffect(() => {
    if (config.mode !== 'TIME_ATTACK') return;

    const taTimer = setInterval(() => {
      setTimeAttackRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(taTimer);
          endGameRun();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(taTimer);
  }, [config.mode]);

  // 7. End Game Session & Roll Up Statistics
  const endGameRun = () => {
    if (isGameOver) return;
    setIsGameOver(true);

    if (timerRef.current) clearInterval(timerRef.current);

    const totalQuestions = answersLog.length;
    const correctAnswers = answersLog.filter((x) => x.isCorrect).length;
    const accuracy = totalQuestions === 0 ? 0 : Math.round((correctAnswers / totalQuestions) * 100);
    
    const correctResponses = answersLog.filter((x) => x.isCorrect);
    const avgResponseTime = correctResponses.length === 0
      ? 0
      : Number((correctResponses.reduce((sum, x) => sum + x.time, 0) / correctResponses.length).toFixed(2));

    const opTypes = ['ADD', 'SUBTRACT', 'MULTIPLY', 'DIVIDE'];
    const opPerformance = opTypes.map((opName) => {
      const symbolMap: { [key: string]: string } = { '+': 'ADD', '−': 'SUBTRACT', '×': 'MULTIPLY', '÷': 'DIVIDE' };
      const matchingLogs = answersLog.filter((log) => {
        if (log.op === 'mixed') {
          return false; 
        }
        return log.op === opName || symbolMap[log.op] === opName;
      });

      return {
        op: opName,
        answered: matchingLogs.length,
        correct: matchingLogs.filter((x) => x.isCorrect).length,
      };
    });

    onGameEnd({
      score: score,
      accuracy,
      maxStreak,
      avgResponseTime,
      totalQuestions,
      correctAnswers,
      difficulty: config.difficulty,
      mode: config.mode,
      speedDemonCount,
      maxCombo,
      opPerformance,
    });
  };

  // Keyboard controls
  useEffect(() => {
    if (config.mode === 'PUZZLE') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSubmitting || isGameOver) return;

      if (e.key === 'Backspace' && inputMethod === 'input') {
        playClick();
        e.preventDefault();
        setUserTypedAnswer((prev) => prev.slice(0, -1));
        return;
      }

      if (inputMethod === 'choice' && currentQuestion) {
        if (['1', '2', '3', '4'].includes(e.key)) {
          playClick();
          const choiceIdx = parseInt(e.key) - 1;
          if (currentQuestion.choices[choiceIdx] !== undefined) {
            handleAnswerSubmit(currentQuestion.choices[choiceIdx]);
          }
        }
      } else if (inputMethod === 'input') {
        if (/^[0-9]$/.test(e.key)) {
          if (userTypedAnswer.length >= 6) return; // Prevent number overflow loopholes
          playClick();
          setUserTypedAnswer((prev) => prev + e.key);
        } else if (e.key === '-') {
          playClick();
          setUserTypedAnswer((prev) => (prev.startsWith('-') ? prev.slice(1) : '-' + prev));
        } else if (e.key === 'Enter' && userTypedAnswer.trim() !== '') {
          playClick();
          handleAnswerSubmit(parseInt(userTypedAnswer));
        } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
          playClick();
          setUserTypedAnswer('');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inputMethod, currentQuestion, userTypedAnswer, config.mode, isSubmitting, isGameOver]);

  // Success FX particles
  const triggerSuccessFX = () => {
    const shapes: ('circle' | 'square' | 'triangle' | 'plus')[] = ['circle', 'square', 'triangle', 'plus'];
    const colors = ['#84CC16', '#2563EB', '#EAB308', '#7C3AED'];
    const list: Particle[] = [];
    for (let i = 0; i < 20; i++) {
      list.push({
        id: Date.now() + i + Math.random(),
        x: (Math.random() - 0.5) * 200,
        y: (Math.random() - 0.5) * 200,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: shapes[Math.floor(Math.random() * shapes.length)],
      });
    }
    setParticles(list);
    setTimeout(() => setParticles([]), 800);
  };

  const activeLimit = currentQuestion
    ? config.mode === 'BLITZ'
      ? Math.max(1.2, 3.0 - Math.floor(streak / 5) * 0.3)
      : currentQuestion.timeLimit
    : 10;

  const segmentsCount = 12;

  // Themed backlight color based on difficulty
  const getArenaThemeGlow = () => {
    if (borderFeedback === 'correct') return 'shadow-glow-green border-lime bg-lime/5';
    if (borderFeedback === 'wrong') return 'shadow-glow-coral border-coral bg-coral/5';
    
    switch (config.difficulty) {
      case 'BASIC': return 'shadow-glow-green border-charcoal';
      case 'PRO': return 'shadow-glow-purple border-charcoal';
      case 'STANDARD':
      default: return 'shadow-glow-blue border-charcoal';
    }
  };

  if (!currentQuestion) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-charcoal font-display select-none">
        <RefreshCw className="w-10 h-10 animate-spin mb-4" />
        <span className="font-bold tracking-widest text-sm text-neutral-400">// INITIALIZING ARITHMETIC CORE...</span>
      </div>
    );
  }

  // Warning stripes visibility on danger low time (<=25% left)
  const isTimeCritical = (timeLeft / activeLimit) <= 0.25;

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 relative select-none">
      
      {/* Visual lightning speed demon overlay */}
      <AnimatePresence>
        {isSpeedDemon && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-electric/15 pointer-events-none z-50 flex items-center justify-center border-[8px] border-electric shadow-[inset_0_0_50px_rgba(37,99,235,0.4)]"
          >
            <motion.div
              initial={{ scale: 0.5, rotate: -15 }}
              animate={{ scale: 1.1, rotate: -5 }}
              exit={{ scale: 0.8 }}
              className="bg-stripes-yellow text-charcoal border-[3px] border-charcoal px-6 py-3 font-display font-black text-xl shadow-glow-yellow flex items-center gap-2"
            >
              ⚡ SPEED DEMON! +50 XP ⚡
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Structural layout crosshairs */}
      <div className="absolute -top-3 -left-3 text-neutral-300 font-mono text-sm pointer-events-none select-none font-bold">+</div>
      <div className="absolute -top-3 -right-3 text-neutral-300 font-mono text-sm pointer-events-none select-none font-bold">+</div>

      <motion.div
        animate={isShaking ? { x: [-12, 12, -9, 9, -5, 5, 0] } : {}}
        transition={{ duration: 0.25 }}
        className="w-full flex flex-col gap-5"
      >
        
        {/* LED Arcade Stats Panel */}
        <div className="chunky-card bg-white flex flex-col shadow-maximal-blue font-display border-charcoal overflow-hidden glass-reflection">
          {/* Top border stripes */}
          <div className="absolute top-0 left-0 w-full h-[6px] bg-stripes-light" />
          
          <div className="p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between w-full mt-1.5 gap-3.5">
            {/* Left section: Mode & Tier */}
            <div className="flex items-center justify-between sm:justify-start gap-3">
              <div className="flex items-center gap-2">
                <span className="led led-active-green" />
                <div className="text-left leading-none">
                  <span className="technical-label block text-[8px] text-charcoal">ENGINE MODE</span>
                  <span className="text-[11px] font-black tracking-wider text-charcoal uppercase">
                    {config.mode.replace('_', ' ')}
                  </span>
                </div>
              </div>
              <div className="h-5 w-[1.5px] bg-charcoal/10 mx-1 hidden sm:block" />
              <div className="text-left leading-none">
                <span className="technical-label block text-[8px] text-charcoal">LEVEL TIER</span>
                <span className={`text-[11px] font-black tracking-wider uppercase ${
                  config.difficulty === 'PRO' ? 'text-pro-purple glow-text-purple' : 'text-charcoal'
                }`}>
                  {config.difficulty}
                </span>
              </div>
            </div>

            {/* Right section: Combo, Lives/Clock, Yield score */}
            <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-dashed border-charcoal/10 pt-2 sm:pt-0">
              
              {/* Multiplier Dial */}
              {combo > 0 && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  key={combo}
                  className="bg-charcoal text-ivory border-[2px] border-charcoal text-[9px] font-black tracking-widest px-2.5 py-0.5 shadow-glow-coral flex items-center gap-1 glow-text-coral"
                >
                  <Flame className="w-3 h-3 text-red-500 fill-red-400" />
                  ×{combo} COMBO
                </motion.div>
              )}

              {/* Lives, Clock, or Streak Counters */}
              {config.mode === 'CLASSIC' && (
                <div className="flex gap-1.5 items-center">
                  {[1, 2, 3].map((heart) => (
                    <Heart
                      key={heart}
                      className={`w-4.5 h-4.5 transition-all ${
                        heart <= lives 
                          ? 'text-coral fill-coral scale-110 glow-text-coral' 
                          : 'text-neutral-200'
                      }`}
                    />
                  ))}
                </div>
              )}

              {config.mode === 'TIME_ATTACK' && (
                <div className="text-right">
                  <span className="technical-label block text-[8px] text-charcoal">SESSION CLOCK</span>
                  <span className="text-sm font-black text-coral font-mono glow-text-coral">{timeAttackRemaining}s</span>
                </div>
              )}

              {/* Progress Tracker ticker */}
              <div className="text-right">
                <span className="technical-label block text-[8px] text-charcoal">PROGRESS</span>
                <span className="text-sm font-black text-charcoal font-mono">
                  {currentQuestionIdx + 1} / {config.mode === 'DAILY_CHALLENGE' ? 20 : config.questionLimit}
                </span>
              </div>

              <div className="h-5 w-[1.5px] bg-charcoal/10 mx-1 hidden sm:block" />

              <div className="text-right leading-none">
                <span className="technical-label block text-[8px] text-charcoal font-black">TOTAL YIELD</span>
                <span className="text-sm font-black text-electric font-mono tracking-tight glow-text-blue">{score}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Scoreboard cockpit card */}
        <div 
          className={`chunky-card bg-white relative overflow-hidden flex flex-col items-center justify-center min-h-[250px] transition-colors duration-150 border-[3px] shadow-maximal-blue glass-reflection ${getArenaThemeGlow()}`}
        >
          {/* Critical Timer warning stripes */}
          {isTimeCritical && (
            <div className="absolute top-0 left-0 w-full h-[6px] bg-stripes-coral animate-pulse" />
          )}

          {/* Segmented LED Progress Bar Timer with glow */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[90%] flex gap-1 select-none">
            {Array.from({ length: segmentsCount }).map((_, idx) => {
              const segmentPct = (idx / segmentsCount) * 100;
              const remainingPct = (timeLeft / activeLimit) * 100;
              const isActive = remainingPct > segmentPct;
              
              // Segment color and corresponding neon glow
              let ledColor = 'bg-lime shadow-[0_0_8px_#84CC16]';
              if (remainingPct <= 25) ledColor = 'bg-coral shadow-[0_0_8px_#EF4444] animate-pulse';
              else if (remainingPct <= 55) ledColor = 'bg-rewards-yellow shadow-[0_0_8px_#EAB308]';

              return (
                <div
                  key={idx}
                  className={`h-2.5 border border-charcoal/20 transition-all ${
                    isActive ? `${ledColor} flex-1` : 'bg-neutral-100 opacity-20 w-4'
                  }`}
                />
              );
            })}
          </div>

          {/* Floating Combo Popup with glow */}
          <AnimatePresence>
            {comboPopup && (
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.8 }}
                animate={{ opacity: 1, y: -20, scale: 1.1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute top-8 right-6 bg-stripes-yellow text-charcoal text-[10px] font-display font-black px-4 py-1.5 border-2 border-charcoal shadow-glow-yellow"
              >
                {comboPopup}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success particles layer */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {particles.map((p) => (
              <motion.div
                key={p.id}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{ x: p.x, y: p.y, opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: p.size,
                  height: p.size,
                  backgroundColor: p.color,
                  borderRadius: p.shape === 'circle' ? '50%' : '0%',
                }}
              />
            ))}
          </div>

          {/* Core Arithmetic Canvas */}
          <div className="flex flex-col items-center justify-center select-none font-display w-full py-8">
            {config.mode === 'PUZZLE' ? (
              <div className="flex flex-col items-center gap-6 w-full">
                {/* Instruction */}
                <p className="text-[10px] font-mono font-bold text-neutral-400 text-center select-none uppercase tracking-wider animate-pulse">
                  Tap one tile, then tap another to swap positions
                </p>

                {/* 3D Colorful Tiles Row */}
                <div className="flex flex-row justify-center gap-2 sm:gap-4.5 py-3 w-full max-w-full overflow-x-auto no-scrollbar">
                  {activeTiles.map((tile, idx) => {
                    const isSelected = selectedTileIdx === idx;
                    
                    // Themed visual design colors based on symbols
                    let tileColorClass = "";
                    if (tile === '=') {
                      tileColorClass = "bg-lime text-charcoal shadow-[0_5px_0_0_#4D7C0F]";
                    } else if (['+', '−', '×', '÷'].includes(tile)) {
                      tileColorClass = "bg-rewards-yellow text-charcoal shadow-[0_5px_0_0_#B45309]";
                    } else {
                      // alternating Pink / Orange tiles
                      if (idx % 2 === 0) {
                        tileColorClass = "bg-rose-400 text-white shadow-[0_5px_0_0_#9F1239]";
                      } else {
                        tileColorClass = "bg-orange-400 text-white shadow-[0_5px_0_0_#C2410C]";
                      }
                    }

                    return (
                      <motion.button
                        key={`tile-${idx}-${tile}`}
                        layout
                        onClick={() => handleTileClick(idx)}
                        className={`w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl border-[3px] border-charcoal flex items-center justify-center font-display font-black text-xl sm:text-2xl cursor-pointer select-none transition-all duration-75 relative glass-reflection ${tileColorClass} ${
                          isSelected 
                            ? 'translate-y-[3px] shadow-[0_2px_0_0_#1C1A17] border-electric border-[4px] shadow-glow-blue scale-105 animate-pulse' 
                            : 'hover:translate-y-[1px] hover:shadow-[0_4px_0_0_#1C1A17] active:translate-y-[5px] active:shadow-[0_0px_0_0_#1C1A17]'
                        }`}
                      >
                        {tile}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Sub-instruction */}
                <div className="bg-neutral-50 border-2 border-charcoal/15 px-4 py-2 text-center text-xs font-display font-black text-charcoal shadow-[2px_2px_0px_0px_rgba(28,26,23,0.1)] rounded">
                  Arrange these cards to form a valid equation.
                </div>
              </div>
            ) : (
              /* Core layout split: Speedometer on left, Equation on right */
              <div className="flex flex-col md:flex-row items-center justify-center gap-8 w-full px-6">
                
                {/* SVG Dial Gauge Combo Speedometer (Shakes when combo >= 10) */}
                <div className="flex flex-col items-center shrink-0 p-3 border-2 border-charcoal/10 bg-neutral-50/50 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-4 h-4 bg-stripes-light opacity-40" />
                  <svg width="110" height="65" viewBox="0 0 100 60" className="select-none">
                    {/* Gauge Arc Background */}
                    <path
                      d="M 10 50 A 40 40 0 0 1 90 50"
                      fill="none"
                      stroke="#E2E8F0"
                      strokeWidth="8"
                      strokeLinecap="round"
                    />
                    {/* Active Speedometer color arc */}
                    <path
                      d="M 10 50 A 40 40 0 0 1 90 50"
                      fill="none"
                      stroke={combo >= 10 ? "#EF4444" : combo >= 5 ? "#EAB308" : "#2563EB"}
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray="126"
                      strokeDashoffset={126 - (Math.min(combo, 15) / 15) * 126}
                      className="transition-all duration-300"
                    />
                    {/* Needle pointing from left to right (-180 to 0 degrees) */}
                    <line 
                      x1="50" 
                      y1="50" 
                      x2={50 + 38 * Math.cos(((-180 + (Math.min(combo, 15) / 15) * 180) * Math.PI) / 180)} 
                      y2={50 + 38 * Math.sin(((-180 + (Math.min(combo, 15) / 15) * 180) * Math.PI) / 180)} 
                      stroke="#1C1A17" 
                      strokeWidth="3.5" 
                      strokeLinecap="round"
                      className={`transition-all duration-300 origin-center ${combo >= 10 ? 'needle-shake' : ''}`}
                      style={{ transformOrigin: '50px 50px' }}
                    />
                    <circle cx="50" cy="50" r="6.5" fill="#1C1A17" />
                    <circle cx="50" cy="50" r="3" fill="#FAF9F6" />
                    <text x="50" y="48" textAnchor="middle" className="font-mono font-black text-[9px] fill-charcoal">
                      {combo > 0 ? `×${combo}` : 'IDLE'}
                    </text>
                  </svg>
                  <span className="technical-label text-[7.5px] mt-1 text-charcoal font-black">COMBO_SPEEDOMETER</span>
                </div>

                {/* Equation Core Canvas */}
                <div className="flex-1 flex justify-center items-center">
                  {currentQuestion.isVertical ? (
                    /* Monospace vertical receipt layout with dynamic printing ticker status messages */
                    <div className="font-mono text-4xl sm:text-5xl font-black text-charcoal tracking-tight text-right flex flex-col items-end gap-1 px-5 py-3 border-l-2 border-r-2 border-dashed border-charcoal/20 min-w-[160px] max-w-[240px] bg-white shadow-md relative">
                      <span className="text-[8px] font-mono text-neutral-300 font-extrabold select-none self-center mb-2">// CALC_TICKER</span>
                      <div>{currentQuestion.operand1}</div>
                      <div>{currentQuestion.operator} {currentQuestion.operand2}</div>
                      <div className="h-[3px] bg-charcoal w-full my-1" />
                      <div className="text-electric w-full text-center mt-1 glow-text-blue font-black font-mono">
                        {inputMethod === 'choice' ? '?' : userTypedAnswer || '?'}
                      </div>
                      {/* Dynamically printed funny ticker log */}
                      <span className="text-[7.5px] font-mono text-lime font-bold tracking-tight text-center w-full self-center mt-3 animate-pulse">
                        {tickerMessage}
                      </span>
                    </div>
                  ) : (
                    /* Horizontal Layout with dynamic printing ticker status messages */
                    <div className="flex flex-col items-center gap-3">
                      <div className="font-display font-black text-charcoal tracking-tight flex items-center gap-3">
                        <span className="text-4xl sm:text-5xl md:text-6xl">{currentQuestion.expression}</span>
                        <span className="text-3xl sm:text-4xl md:text-5xl text-neutral-300">=</span>
                        <span className="text-4xl sm:text-5xl md:text-6xl text-electric font-mono tracking-wide glow-text-blue">
                          {inputMethod === 'choice' ? '?' : userTypedAnswer || '?'}
                        </span>
                      </div>
                      <span className="text-[8px] font-mono text-lime font-extrabold tracking-widest uppercase mt-2 px-2 py-0.5 border border-lime/30 bg-lime/5 rounded">
                        {tickerMessage}
                      </span>
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        </div>

        {/* Input Toggle (Hidden in Puzzle Mode since interactions are direct swaps) */}
        {config.mode !== 'PUZZLE' && (
          <div className="flex justify-between items-center select-none">
            <div className="flex border-[3px] border-charcoal p-0.5 bg-white shadow-[3px_3px_0px_0px_rgba(28,26,23,1)]">
              <button
                onClick={() => { playClick(); setInputMethod('choice'); setUserTypedAnswer(''); }}
                className={`px-4 py-1.5 text-[10px] font-display font-black transition-all ${
                  inputMethod === 'choice' ? 'bg-charcoal text-ivory' : 'bg-white text-charcoal hover:bg-neutral-50'
                }`}
              >
                CHOICES
              </button>
              <button
                onClick={() => { playClick(); setInputMethod('input'); setUserTypedAnswer(''); }}
                className={`px-4 py-1.5 text-[10px] font-display font-black transition-all ${
                  inputMethod === 'input' ? 'bg-charcoal text-ivory' : 'bg-white text-charcoal hover:bg-neutral-50'
                }`}
              >
                KEYPAD INPUT
              </button>
            </div>

            <button
              onClick={() => {
                playClick();
                if (confirm('Resign current game session? Score logs will be discarded.')) {
                  onExit();
                }
              }}
              className="text-xs font-mono font-bold text-neutral-400 hover:text-coral transition-colors"
            >
              // EXIT SESSION
            </button>
          </div>
        )}

        {/* Tactile Entry Panel / Puzzle Placeholder */}
        <div className="min-h-[180px]">
          {config.mode === 'PUZZLE' ? (
            <div className="flex flex-col items-center justify-between p-5 border-[3px] border-dashed border-charcoal/20 bg-white shadow-maximal-coral relative overflow-hidden glass-reflection">
              {/* warning stripe footer */}
              <div className="absolute bottom-0 left-0 w-full h-[6px] bg-stripes-light" />
              <div className="absolute top-1 left-2 text-[8px] font-mono text-neutral-300 font-extrabold">[SWAP.LOG]</div>
              <span className="technical-label mb-2 text-center select-none text-charcoal font-black">// DIRECT TILE SWAP INTERFACE ACTIVE</span>
              <p className="text-[10px] font-mono font-bold text-neutral-400 text-center max-w-sm leading-relaxed select-none mb-3">
                NO KEYPAD ENTRY NEEDED. CLICK ONE CARD, THEN A SECOND CARD TO SHIFT PLACEMENTS. EQUALITY INTEGRITY CHECKS WILL RUN DYNAMICALLY.
              </p>
              
              <button
                onClick={() => {
                  playClick();
                  if (confirm('Resign current game session? Score logs will be discarded.')) {
                    onExit();
                  }
                }}
                className="text-[10px] font-mono font-black text-coral border border-coral/30 bg-red-50 hover:bg-red-100 px-3 py-1 uppercase shadow-sm"
              >
                Resign Game
              </button>
            </div>
          ) : inputMethod === 'choice' ? (
            /* Chunky Choice selectors with dynamic layout hover and clicks */
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-display">
              {currentQuestion.choices.map((val, idx) => (
                <button
                  key={`${currentQuestion.id}-choice-${idx}`}
                  disabled={isSubmitting || isGameOver}
                  onClick={() => { playClick(); handleAnswerSubmit(val); }}
                  className="mechanical-key flex-col h-20 relative bg-white border-[3px] border-charcoal hover:bg-neutral-50 hover:shadow-glow-blue glass-reflection"
                >
                  <span className="font-mono text-xl font-black text-charcoal">{val}</span>
                  <span className="absolute bottom-1 right-2 key-hint select-none leading-none">
                    {idx + 1}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            /* Direct entry pad with themed glows */
            <div className="flex flex-col md:flex-row gap-5 items-stretch justify-center w-full select-none">
              
              {/* Technical indicators */}
              <div className="flex-1 border-[3px] border-dashed border-charcoal/20 p-4 rounded-lg text-left hidden md:flex flex-col justify-center bg-white shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-8 h-8 bg-stripes-light" />
                <span className="technical-label mb-2.5 text-charcoal font-black">// HARDWARE BINDINGS DETECTED</span>
                <ul className="text-[10px] font-mono font-bold text-neutral-500 space-y-1.5 leading-snug">
                  <li>● PRESS KEYS <span className="key-hint">0</span>-<span className="key-hint">9</span> FOR VALUES.</li>
                  <li>● PRESS <span className="key-hint">Enter</span> TO REGISTER COMPUTATION.</li>
                  <li>● PRESS <span className="key-hint">Backspace</span> TO ERASE DIGITS.</li>
                  <li>● PRESS <span className="key-hint">-</span> TO INVERT NUMERIC SIGN.</li>
                  <li>● PRESS <span className="key-hint">Esc</span> OR <span className="key-hint">C</span> TO PURGE.</li>
                </ul>
              </div>

              {/* Chunky Numpad with colored glows */}
              <div className="w-full md:w-80 grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    disabled={isSubmitting || isGameOver}
                    onClick={() => { 
                      if (userTypedAnswer.length >= 6) return;
                      playClick(); 
                      setUserTypedAnswer((prev) => prev + num.toString()); 
                    }}
                    className="mechanical-key text-lg font-black border-[3px] border-charcoal bg-white flex items-center justify-center hover:bg-neutral-50 hover:shadow-glow-blue glass-reflection"
                  >
                    {num}
                  </button>
                ))}
                
                <button
                  disabled={isSubmitting || isGameOver}
                  onClick={() => { playClick(); setUserTypedAnswer((prev) => (prev.startsWith('-') ? prev.slice(1) : '-' + prev)); }}
                  className="mechanical-key text-base font-black border-[3px] border-charcoal bg-neutral-100 flex items-center justify-center hover:bg-neutral-200"
                >
                  ±
                </button>
                <button
                  disabled={isSubmitting || isGameOver}
                  onClick={() => { 
                    if (userTypedAnswer.length >= 6) return;
                    playClick(); 
                    setUserTypedAnswer((prev) => prev + '0'); 
                  }}
                  className="mechanical-key text-lg font-black border-[3px] border-charcoal bg-white flex items-center justify-center hover:bg-neutral-50 hover:shadow-glow-blue glass-reflection"
                >
                  0
                </button>
                <button
                  disabled={isSubmitting || isGameOver}
                  onClick={() => { playClick(); setUserTypedAnswer((prev) => prev.slice(0, -1)); }}
                  className="mechanical-key text-lg font-black border-[3px] border-charcoal bg-red-50 text-coral flex items-center justify-center hover:bg-red-100 shadow-[0_0_10px_rgba(239,68,68,0.15)]"
                >
                  <Delete className="w-4.5 h-4.5" />
                </button>

                <button
                  disabled={isSubmitting || isGameOver}
                  onClick={() => { playClick(); setUserTypedAnswer(''); }}
                  className="mechanical-key col-span-1 text-[10px] tracking-wide font-black border-[3px] border-charcoal bg-amber-50 text-amber-700 flex items-center justify-center hover:bg-amber-100 shadow-[0_0_10px_rgba(234,179,8,0.15)]"
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
                  disabled={userTypedAnswer.trim() === '' || isSubmitting || isGameOver}
                  className="mechanical-key col-span-2 text-[10px] tracking-wide font-black border-[3px] border-charcoal bg-lime text-charcoal flex items-center justify-center disabled:opacity-40 shadow-glow-green glass-reflection"
                >
                  SUBMIT (Enter)
                </button>
              </div>

            </div>
          )}
        </div>

      </motion.div>
    </div>
  );
};
