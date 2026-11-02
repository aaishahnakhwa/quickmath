import React, { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';
import { getRankStyles } from '../engine/progression';
import { ALL_ACHIEVEMENTS } from '../engine/achievements';
import { Play, LogOut, ArrowUp } from 'lucide-react';
import { playSuccess, playLevelUp, playClick } from '../services/audioService';

interface ResultsProps {
  runResults: {
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
  };
  saveResponse: {
    isNewHighScore: boolean;
    unlockedAchievements: string[];
    xpGained: number;
    leveledUp: boolean;
    oldLevelInfo: any;
    newLevelInfo: any;
  } | null;
  onReplay: () => void;
  setScreen: (screen: 'home' | 'play' | 'results' | 'profile' | 'leaderboard' | 'how-to-play') => void;
}

export const Results: React.FC<ResultsProps> = ({ runResults, saveResponse, onReplay, setScreen }) => {
  const { profile } = useGame();
  
  // Bar animation progress states
  const [animatedPercent, setAnimatedPercent] = useState(0);
  const [currentDisplayLevel, setCurrentDisplayLevel] = useState(1);

  useEffect(() => {
    if (!saveResponse) return;

    const { oldLevelInfo, newLevelInfo, leveledUp } = saveResponse;
    
    if (leveledUp) {
      playLevelUp();
    } else {
      playSuccess();
    }

    setCurrentDisplayLevel(oldLevelInfo.level);
    setAnimatedPercent(oldLevelInfo.percentage);

    const timer = setTimeout(() => {
      if (leveledUp) {
        setAnimatedPercent(100);
        setTimeout(() => {
          setCurrentDisplayLevel(newLevelInfo.level);
          setAnimatedPercent(newLevelInfo.percentage);
        }, 600);
      } else {
        setAnimatedPercent(newLevelInfo.percentage);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [saveResponse]);

  if (!saveResponse) {
    return (
      <div className="py-20 text-center font-display font-bold select-none dark:text-neutral-300">
        <span>COMPILING SCORE SEGMENTS...</span>
      </div>
    );
  }

  const { isNewHighScore, unlockedAchievements, xpGained, leveledUp, newLevelInfo } = saveResponse;
  const rankStyle = getRankStyles(newLevelInfo.rank);

  // Estimate Time Taken matching format 02:18
  const estimatedTimeSeconds = Math.round(runResults.totalQuestions * runResults.avgResponseTime);
  const minutes = Math.floor(estimatedTimeSeconds / 60);
  const seconds = estimatedTimeSeconds % 60;
  const timeTakenStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // SVG Line Chart Drawer matching mockup
  const drawPerformanceChart = () => {
    const history = profile.scoreHistory || [400, 700, 550, 900, 800, 1100, 950, 1240];
    if (history.length < 2) {
      return (
        <div className="text-center py-8 text-slate-400 text-xs font-semibold">
          // PROGRESS TRACKS WILL APPEAR AFTER MULTIPLE RUNS
        </div>
      );
    }

    const width = 450;
    const height = 120;
    const paddingX = 25;
    const paddingY = 15;

    const maxScore = Math.max(...history, 1000);
    const minScore = Math.min(...history, 100);
    const scoreRange = maxScore - minScore || 1;

    const points = history.slice(-8).map((scoreVal, idx) => {
      const totalItems = Math.min(history.length, 8);
      const x = paddingX + (idx / (totalItems - 1)) * (width - 2 * paddingX);
      const y = height - paddingY - ((scoreVal - minScore) / scoreRange) * (height - 2 * paddingY);
      return { x, y, val: scoreVal };
    });

    let linePath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      linePath += ` L ${points[i].x} ${points[i].y}`;
    }

    const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-36 mt-2 select-none overflow-visible">
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        
        {/* Horizontal gridlines */}
        <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" className="dark:stroke-slate-800/80" />
        <line x1={paddingX} y1={height/2} x2={width - paddingX} y2={height/2} stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" className="dark:stroke-slate-800/80" />
        <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" className="dark:stroke-slate-800/80" />

        {/* Gradient fill */}
        <path d={areaPath} fill="url(#chartGradient)" />

        {/* Connecting line */}
        <path d={linePath} fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" />

        {/* Circle indicators */}
        {points.map((pt, idx) => (
          <g key={idx}>
            <circle cx={pt.x} cy={pt.y} r="3.5" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="1.5" className="dark:stroke-zinc-900" />
            {idx === points.length - 1 && (
              <text x={pt.x} y={pt.y - 8} textAnchor="middle" className="font-sans font-bold text-[8px] fill-electric dark:fill-blue-400">
                {pt.val}
              </text>
            )}
          </g>
        ))}
      </svg>
    );
  };

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-6 select-none relative">
      
      <div className="text-center font-display">
        <span className="technical-label block mb-1">
          // PERFORMANCE RUN EVALUATED
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-800 dark:text-white">
          Well Played!
        </h1>
        <p className="text-xs text-slate-400 mt-1.5 font-semibold">You've completed the game.</p>
      </div>

      {/* Main Results Card Panel */}
      <div className="chunky-card">
        <div className="p-2 md:p-4 flex flex-col gap-6 relative">
          
          {/* Horizontal Stats metrics row */}
          <div className="grid grid-cols-3 gap-2 text-center pb-6 border-b border-slate-100 dark:border-slate-800 font-display">
            <div>
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Score</span>
              <span className="text-2xl font-black text-slate-800 dark:text-white mt-1.5 font-mono block">
                {runResults.score.toLocaleString()}
              </span>
              {isNewHighScore && (
                <span className="text-[7.5px] font-bold bg-amber-400/10 text-amber-500 border border-amber-400/20 px-2 py-0.5 rounded-full mt-1.5 inline-flex items-center gap-0.5">
                  <ArrowUp className="w-2 h-2" /> RECORD
                </span>
              )}
            </div>
            
            <div className="border-x border-slate-100 dark:border-slate-800">
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Accuracy</span>
              <span className="text-2xl font-black text-emerald-500 mt-1.5 font-mono block">
                {runResults.accuracy}%
              </span>
              <span className="text-[8px] text-slate-400 block mt-1">
                {runResults.correctAnswers}/{runResults.totalQuestions} Qs
              </span>
            </div>

            <div>
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Time Taken</span>
              <span className="text-2xl font-black text-slate-800 dark:text-white mt-1.5 font-mono block">
                {timeTakenStr}
              </span>
              <span className="text-[8px] text-slate-400 block mt-1">
                avg {runResults.avgResponseTime}s
              </span>
            </div>
          </div>

          {/* Performance chart */}
          <div className="pt-2 border-b border-slate-100 dark:border-slate-800 text-left">
            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">
              Performance Over Time
            </span>
            <div className="w-full flex justify-center py-2 bg-slate-50/50 dark:bg-slate-900/20 rounded-2xl border border-slate-100/50 dark:border-slate-800/80">
              {drawPerformanceChart()}
            </div>
          </div>

          {/* Level progression meter */}
          <div className="pt-2 text-left">
            <div className="flex justify-between items-end mb-2.5">
              <div>
                <span className="text-[9px] font-extrabold text-slate-400 uppercase block tracking-wider">XP METRICS PROGRESSION</span>
                <div className="font-display font-extrabold text-sm text-slate-800 dark:text-white mt-1.5 flex items-center gap-1.5">
                  LEVEL {currentDisplayLevel}
                  {leveledUp && (
                    <span className="text-[8.5px] font-bold border border-lime text-lime bg-lime/5 px-2 py-0.5 rounded-full">
                      LEVEL UP!
                    </span>
                  )}
                </div>
              </div>
              
              <div className="text-right select-none">
                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase block">
                  TIER: <span className={`${rankStyle.text} font-bold`}>{newLevelInfo.rank}</span>
                </span>
              </div>
            </div>

            <div className="w-full h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden relative">
              <div 
                className="h-full bg-lime rounded-full transition-all duration-300"
                style={{ width: `${animatedPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] font-mono text-slate-400 mt-1.5 font-bold">
              <span>XP: {newLevelInfo.currentLevelXP} / {newLevelInfo.nextLevelXP} XP</span>
              <span className="text-electric">+{xpGained} XP Gained</span>
            </div>
          </div>

          {/* Achievements list */}
          {unlockedAchievements.length > 0 && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-left">
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block mb-3">
                Achievements Unlocked ({unlockedAchievements.length})
              </span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {unlockedAchievements.map((id) => {
                  const spec = ALL_ACHIEVEMENTS.find((x) => x.id === id);
                  if (!spec) return null;
                  return (
                    <div
                      key={id}
                      className="border border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/10 p-2.5 flex items-center gap-2.5 rounded-2xl"
                    >
                      <div className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900 flex items-center justify-center font-bold text-amber-500 shrink-0 text-xs">
                        ★
                      </div>
                      <div className="text-left font-display">
                        <div className="text-xs font-bold tracking-tight text-slate-800 dark:text-neutral-200">
                          {spec.title}
                        </div>
                        <div className="text-[9.5px] text-slate-400 dark:text-slate-500 font-sans leading-tight mt-0.5">
                          {spec.description}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Primary Actions (Screen 07 bottom buttons) */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-center font-display">
        <button
          onClick={() => { playClick(); onReplay(); }}
          className="btn-chunky w-full sm:w-auto px-10 bg-electric hover:bg-electric-hover text-white border-electric py-3 inline-flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-500/10"
        >
          <Play className="fill-white w-3.5 h-3.5" />
          PLAY AGAIN
        </button>

        <button
          onClick={() => { playClick(); setScreen('home'); }}
          className="btn-chunky w-full sm:w-auto px-8 py-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-neutral-300 font-bold rounded-full flex items-center justify-center gap-2 hover:bg-slate-50 cursor-pointer text-xs tracking-wider uppercase"
        >
          <LogOut className="w-4 h-4" />
          BACK TO HOME
        </button>
      </div>

    </div>
  );
};
