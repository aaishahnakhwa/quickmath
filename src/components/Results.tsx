import React, { useEffect, useState } from 'react';
import { getRankStyles } from '../engine/progression';
import { ALL_ACHIEVEMENTS } from '../engine/achievements';
import { Flame, CheckCircle, Clock, Zap, Award, Play } from 'lucide-react';
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
  setScreen: (screen: 'home' | 'play' | 'results' | 'profile' | 'leaderboard') => void;
}

export const Results: React.FC<ResultsProps> = ({ runResults, saveResponse, onReplay, setScreen }) => {
  // Bar animation progress states
  const [animatedPercent, setAnimatedPercent] = useState(0);
  const [currentDisplayLevel, setCurrentDisplayLevel] = useState(1);

  useEffect(() => {
    if (!saveResponse) return;

    const { oldLevelInfo, newLevelInfo, leveledUp } = saveResponse;
    
    // Play celebratory synthetic audio feedback
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
      <div className="py-20 text-center font-display font-bold select-none">
        <span>COMPILING SCORE SEGMENTS...</span>
      </div>
    );
  }

  const { isNewHighScore, unlockedAchievements, xpGained, leveledUp, newLevelInfo } = saveResponse;
  const rankStyle = getRankStyles(newLevelInfo.rank);

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6 select-none relative">
      
      {/* Decorative Technical Top Rule */}
      <div className="blueprint-line-h pb-2 mb-1 font-mono text-[9px] text-neutral-400 font-bold flex justify-between select-none">
        <span>QM // MISSION_SUMMARY</span>
        <span>STATUS: EXECUTED</span>
      </div>

      <div className="text-center font-display">
        <span className="technical-label block mb-1">
          // PERFORMANCE RUN EVALUATED
        </span>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-charcoal">
          SESSION <span className="text-electric glow-text-blue">OVER</span>
        </h1>
      </div>

      {/* Main Results Card Panel (Maximalist theme) */}
      <div className={`chunky-card bg-white border-charcoal glass-reflection relative overflow-hidden ${
        isNewHighScore ? 'shadow-maximal-yellow' : 'shadow-maximal-blue'
      }`}>
        
        {/* Header Warning Stripe */}
        <div className="h-3 bg-stripes-yellow w-full border-b-[3px] border-charcoal" />

        {/* Tilted System Stamps */}
        {isNewHighScore ? (
          <div className="absolute right-6 top-6 select-none z-10 hidden sm:block">
            <div className="system-stamp text-rewards-yellow border-rewards-yellow rotate-12 bg-white/95 px-4 py-2 font-black tracking-widest text-xs shadow-glow-yellow animate-bounce">
              RECORD CREDITED
            </div>
          </div>
        ) : (
          <div className="absolute right-6 top-6 select-none z-10 hidden sm:block">
            <div className="system-stamp text-electric border-electric rotate-12 bg-white/95 px-4 py-2 font-black tracking-widest text-xs shadow-glow-blue">
              RUN ACCREDITED
            </div>
          </div>
        )}

        <div className="p-6 md:p-8 flex flex-col gap-6 relative">
          
          <div className="text-center pb-6 border-b-2 border-dashed border-charcoal/15 mt-2">
            <span className="technical-label text-charcoal font-black">TOTAL SCORE COMPUTED</span>
            <div className="font-display font-black text-6xl md:text-7xl text-charcoal mt-1.5 font-mono tracking-tight glow-text-blue">
              {runResults.score.toLocaleString()}
            </div>
            
            <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded border-[2px] border-charcoal bg-lime/10 text-lime font-mono text-xs font-bold shadow-glow-green select-none">
              <Zap className="w-3.5 h-3.5 fill-lime text-charcoal shrink-0" />
              +{xpGained} XP ACCUMULATED
            </div>
          </div>

          {/* 2. Key stats details grid with stripes on hover */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-3 border-b-2 border-dashed border-charcoal/15 font-display">
            <div className="border border-charcoal/10 p-2.5 text-center bg-neutral-50 shadow-[1px_1px_0px_0px_rgba(28,26,23,0.15)] hover:shadow-glow-green hover:bg-neutral-100 transition-all relative overflow-hidden">
              <span className="technical-label">ACCURACY</span>
              <span className="font-black text-lg text-charcoal flex items-center justify-center gap-1 mt-1 glow-text-green">
                <CheckCircle className="w-3.5 h-3.5 text-lime" />
                {runResults.accuracy}%
              </span>
              <span className="text-[9px] text-neutral-500 font-mono font-bold block mt-0.5 leading-none">
                {runResults.correctAnswers}/{runResults.totalQuestions} ANS
              </span>
            </div>

            <div className="border border-charcoal/10 p-2.5 text-center bg-neutral-50 shadow-[1px_1px_0px_0px_rgba(28,26,23,0.15)] hover:shadow-glow-coral hover:bg-neutral-100 transition-all relative overflow-hidden">
              <span className="technical-label">MAX STREAK</span>
              <span className="font-black text-lg text-charcoal flex items-center justify-center gap-1 mt-1 glow-text-coral">
                <Flame className="w-3.5 h-3.5 text-red-500 fill-red-400" />
                {runResults.maxStreak}
              </span>
              <span className="text-[9px] text-neutral-500 font-mono font-bold block mt-0.5 leading-none">
                CONSECUTIVE
              </span>
            </div>

            <div className="border border-charcoal/10 p-2.5 text-center bg-neutral-50 shadow-[1px_1px_0px_0px_rgba(28,26,23,0.15)] hover:shadow-glow-blue hover:bg-neutral-100 transition-all relative overflow-hidden">
              <span className="technical-label">AVG SPEED</span>
              <span className="font-black text-lg text-charcoal flex items-center justify-center gap-1 mt-1 glow-text-blue">
                <Clock className="w-3.5 h-3.5 text-electric" />
                {runResults.avgResponseTime}s
              </span>
              <span className="text-[9px] text-neutral-500 font-mono font-bold block mt-0.5 leading-none">
                PER Q
              </span>
            </div>

            <div className="border border-charcoal/10 p-2.5 text-center bg-neutral-50 shadow-[1px_1px_0px_0px_rgba(28,26,23,0.15)] hover:shadow-glow-yellow hover:bg-neutral-100 transition-all relative overflow-hidden">
              <span className="technical-label">MAX COMBO</span>
              <span className="font-black text-lg text-charcoal flex items-center justify-center gap-1 mt-1 glow-text-yellow">
                <Award className="w-3.5 h-3.5 text-rewards-yellow" />
                ×{runResults.maxCombo}
              </span>
              <span className="text-[9px] text-neutral-500 font-mono font-bold block mt-0.5 leading-none">
                MULTIPLIER
              </span>
            </div>
          </div>

          {/* 3. Segmented XP Loading progress bar with glow */}
          <div className="py-2 border-b-2 border-dashed border-charcoal/15 text-left">
            <div className="flex justify-between items-end mb-2.5">
              <div>
                <span className="technical-label text-charcoal">XP METRICS PROGRESSION</span>
                <div className="font-display font-black text-lg text-charcoal mt-1.5 flex items-center gap-1.5">
                  LEVEL {currentDisplayLevel}
                  {leveledUp && (
                    <span className="text-[9px] font-mono font-black border border-lime text-lime bg-lime/10 px-2 py-[1px] animate-bounce uppercase shadow-glow-green">
                      LEVEL UP!
                    </span>
                  )}
                </div>
              </div>
              
              <div className="text-right select-none">
                <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-wider block">
                  RANK TIER: <span className={`${rankStyle.text} font-black`}>{newLevelInfo.rank}</span>
                </span>
              </div>
            </div>

            {/* Chunky Segmented Loader with glows */}
            <div className="flex items-center border-[3px] border-charcoal bg-neutral-100 p-0.5 h-6 shadow-[2px_2px_0px_0px_#1C1A17]">
              {Array.from({ length: 20 }).map((_, idx) => {
                const stepVal = (idx / 20) * 100;
                const isFilled = animatedPercent > stepVal;
                return (
                  <div
                    key={idx}
                    className={`h-full flex-1 border-r border-charcoal last:border-0 transition-colors duration-200 ${
                      isFilled ? 'bg-lime shadow-glow-green' : 'bg-transparent'
                    }`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between text-[10px] font-mono text-neutral-400 mt-1.5 font-bold">
              <span>XP: {newLevelInfo.currentLevelXP} / {newLevelInfo.nextLevelXP} XP</span>
              <span>NEXT TIER PERCENT: {Math.round(animatedPercent)}%</span>
            </div>
          </div>

          {/* 4. Unlocked Achievements list */}
          {unlockedAchievements.length > 0 && (
            <div className="pt-2 text-left">
              <div className="technical-label mb-3 text-charcoal font-black">
                🔓 UNLOCKED ARCHIVES ({unlockedAchievements.length})
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {unlockedAchievements.map((id) => {
                  const spec = ALL_ACHIEVEMENTS.find((x) => x.id === id);
                  if (!spec) return null;
                  return (
                    <div
                      key={id}
                      className="border-2 border-charcoal bg-amber-50 p-2.5 flex items-center gap-2.5 shadow-glow-yellow relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-6 h-6 bg-stripes-light opacity-50" />
                      <div className="w-8 h-8 rounded-full bg-rewards-yellow border-2 border-charcoal flex items-center justify-center font-bold text-charcoal shrink-0 select-none shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                        ★
                      </div>
                      <div className="text-left font-display z-10">
                        <div className="text-xs font-black tracking-tight text-charcoal">
                          {spec.title}
                        </div>
                        <div className="text-[9px] text-neutral-500 font-sans leading-tight mt-0.5 font-semibold">
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

      {/* Primary Actions (Maximalist theme) */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-center font-display">
        <button
          onClick={() => { playClick(); onReplay(); }}
          className="btn-chunky w-full sm:w-auto px-10 bg-electric text-white border-[3px] shadow-maximal-blue py-3.5 glass-reflection inline-flex items-center justify-center gap-2 hover-wiggle"
        >
          <Play className="fill-white w-4 h-4" />
          PLAY AGAIN
        </button>

        <button
          onClick={() => { playClick(); setScreen('profile'); }}
          className="btn-chunky w-full sm:w-auto px-8 bg-white text-charcoal border-[3px] shadow-[4px_4px_0px_0px_#1C1A17] hover:shadow-maximal-purple py-3.5 hover-wiggle"
        >
          <Award className="w-4 h-4 text-electric inline-block mr-1" />
          VIEW STATS
        </button>

        <button
          onClick={() => { playClick(); setScreen('home'); }}
          className="w-full sm:w-auto text-xs font-mono font-bold text-neutral-400 hover:text-charcoal transition-colors px-4 py-2"
        >
          // RETURN TO CONSOLE
        </button>
      </div>

    </div>
  );
};
