import React from 'react';
import { useGame } from '../context/GameContext';
import { getRankStyles, getHumorousTitle } from '../engine/progression';
import { ALL_ACHIEVEMENTS } from '../engine/achievements';
import { Flame, CheckCircle, Clock, Lock, Unlock } from 'lucide-react';

interface ProfileProps {}

export const Profile: React.FC<ProfileProps> = () => {
  const { profile, levelInfo } = useGame();
  
  const rankStyle = getRankStyles(levelInfo.rank);
  const totalCorrect = profile.stats.totalCorrect;
  const totalAnswered = profile.stats.totalAnswered;
  const overallAccuracy = totalAnswered === 0 ? 0 : Math.round((totalCorrect / totalAnswered) * 100);
  const userNerdTitle = getHumorousTitle(levelInfo.level);

  return (
    <div className="flex flex-col gap-6 text-left select-none max-w-4xl mx-auto relative">
      
      {/* 1. Header Hero Card */}
      <div className="chunky-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-neutral-100 dark:bg-zinc-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center font-display font-black text-2xl rounded-xl shrink-0 dark:text-white">
            {profile.username.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 className="font-display font-extrabold text-xl text-charcoal dark:text-white">{profile.username}</h2>
            <div className="flex items-center gap-2.5 mt-1 font-mono text-[9px] font-bold text-neutral-400">
              <span>MODULE: PROFILE_DIAGNOSTICS_CARD</span>
              <span>•</span>
              <span>XP ACCUMULATED: {profile.totalXP.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Level Stats Segment */}
        <div className="flex items-center gap-4 border border-neutral-200 dark:border-neutral-800 p-3.5 bg-neutral-50 dark:bg-zinc-800/40 rounded-xl md:min-w-[220px]">
          <div>
            <span className="technical-label block text-[8px]">RANK TIER</span>
            <span className={`text-xs font-black font-display tracking-tight uppercase block mt-1 ${rankStyle.text}`}>
              {levelInfo.rank}
            </span>
            <span className="text-[9px] font-mono font-bold text-pro-purple mt-0.5 block">
              {userNerdTitle}
            </span>
          </div>
          <div className="h-8 w-[1px] bg-neutral-200 dark:bg-neutral-700" />
          <div>
            <span className="technical-label block text-[8px]">LEVEL</span>
            <span className="text-lg font-black block mt-0.5 font-mono dark:text-white">
              LV {levelInfo.level}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left pane: Operations and difficulty */}
        <div className="md:col-span-2 flex flex-col gap-6">
          
          {/* Operations accuracy */}
          <div className="chunky-card p-5 md:p-6">
            <h3 className="technical-label mb-4 block">
              // ACCURACY BY ARITHMETIC OPERATOR
            </h3>

            <div className="space-y-4 font-display">
              {[
                { key: 'ADD', label: 'ADDITION (+)', color: 'bg-electric' },
                { key: 'SUBTRACT', label: 'SUBTRACTION (−)', color: 'bg-coral' },
                { key: 'MULTIPLY', label: 'MULTIPLICATION (×)', color: 'bg-rewards-yellow' },
                { key: 'DIVIDE', label: 'DIVISION (÷)', color: 'bg-pro-purple' },
              ].map((op) => {
                const answered = profile.stats.opAnswered[op.key as 'ADD' | 'SUBTRACT' | 'MULTIPLY' | 'DIVIDE'] || 0;
                const correct = profile.stats.opCorrect[op.key as 'ADD' | 'SUBTRACT' | 'MULTIPLY' | 'DIVIDE'] || 0;
                const acc = answered === 0 ? 0 : Math.round((correct / answered) * 100);
                
                return (
                  <div key={op.key} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-charcoal dark:text-neutral-200">
                      <span>{op.label}</span>
                      <span className="font-mono text-[10px] text-neutral-400">
                        {correct} / {answered} <span className="text-charcoal dark:text-white font-bold font-sans text-xs">({acc}%)</span>
                      </span>
                    </div>
                    
                    {/* Minimalist Linear Progress Bar */}
                    <div className="w-full h-2 bg-neutral-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${op.color}`}
                        style={{ width: `${acc}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Difficulty yield logs */}
          <div className="chunky-card p-5 md:p-6">
            <h3 className="technical-label mb-4 block">
              // ACCURACY BY DIFFICULTY TIER
            </h3>

            <div className="space-y-4 font-display">
              {[
                { key: 'BASIC', label: 'BASIC TIER', color: 'bg-lime' },
                { key: 'STANDARD', label: 'STANDARD TIER', color: 'bg-electric' },
                { key: 'PRO', label: 'PRO ARCH-TIER', color: 'bg-pro-purple' },
              ].map((diff) => {
                const answered = profile.stats.diffAnswered[diff.key as 'BASIC' | 'STANDARD' | 'PRO'] || 0;
                const correct = profile.stats.diffCorrect[diff.key as 'BASIC' | 'STANDARD' | 'PRO'] || 0;
                const acc = answered === 0 ? 0 : Math.round((correct / answered) * 100);

                return (
                  <div key={diff.key} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-charcoal dark:text-neutral-200">
                      <span>{diff.label}</span>
                      <span className="font-mono text-[10px] text-neutral-400">
                        {correct} / {answered} <span className="text-charcoal dark:text-white font-bold font-sans text-xs">({acc}%)</span>
                      </span>
                    </div>

                    {/* Minimalist Linear Progress Bar */}
                    <div className="w-full h-2 bg-neutral-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${diff.color}`}
                        style={{ width: `${acc}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right pane: General stats and mode high scores */}
        <div className="flex flex-col gap-6">

          {/* Core metrics summary card */}
          <div className="chunky-card p-5">
            <div className="space-y-3 font-display mt-2">
              <div className="border-b border-neutral-100 dark:border-neutral-800 pb-2 flex justify-between items-center select-none">
                <span className="technical-label">// COMPLETED RUNS</span>
                <span className="font-bold text-charcoal dark:text-neutral-200 font-mono text-sm">{profile.stats.totalGames} runs</span>
              </div>
              <div className="border-b border-neutral-100 dark:border-neutral-800 pb-2 flex justify-between items-center select-none">
                <span className="technical-label">// MAX STREAK</span>
                <span className="font-bold text-charcoal dark:text-neutral-200 font-mono text-sm flex items-center gap-1">
                  <Flame className="w-4 h-4 text-coral fill-current" />
                  {profile.stats.bestStreak}
                </span>
              </div>
              <div className="border-b border-neutral-100 dark:border-neutral-800 pb-2 flex justify-between items-center select-none">
                <span className="technical-label">// ACCURACY</span>
                <span className="font-bold text-charcoal dark:text-neutral-200 font-mono text-sm flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-lime" />
                  {overallAccuracy}%
                </span>
              </div>
              <div className="pb-1 flex justify-between items-center select-none">
                <span className="technical-label">// AVG RESPONSE</span>
                <span className="font-bold text-charcoal dark:text-neutral-200 font-mono text-sm flex items-center gap-1">
                  <Clock className="w-4 h-4 text-electric" />
                  {profile.stats.averageResponseTime}s
                </span>
              </div>
            </div>
          </div>

          {/* High Scores per Mode */}
          <div className="chunky-card p-5">
            <h3 className="technical-label mb-3.5 block">
              // HIGH SCORE COMPILATIONS
            </h3>

            <div className="space-y-3 font-display">
              {[
                { id: 'CLASSIC', label: 'CLASSIC' },
                { id: 'TIME_ATTACK', label: 'TIME ATTACK' },
                { id: 'STREAK', label: 'STREAK' },
                { id: 'BLITZ', label: 'BLITZ' },
                { id: 'DAILY_CHALLENGE', label: 'DAILY RUN' },
                { id: 'PUZZLE', label: 'PUZZLE' },
              ].map((mode) => (
                <div key={mode.id} className="flex justify-between items-center text-xs font-mono font-bold text-charcoal dark:text-neutral-200 border-b border-neutral-100 dark:border-neutral-800 pb-2 last:border-0 last:pb-0 select-none">
                  <span>{mode.label}</span>
                  <span className="text-electric font-bold font-mono">{(profile.stats.bestScore[mode.id] || 0).toLocaleString()} pt</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* 3. Achievements grid */}
      <div className="chunky-card p-6">
        <h3 className="technical-label mb-4 block">
          // SYSTEM AWARDS AND ACHIEVEMENTS
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {ALL_ACHIEVEMENTS.map((ach) => {
            const isUnlocked = profile.unlockedAchievements.includes(ach.id);
            return (
              <div
                key={ach.id}
                className={`border p-3.5 flex flex-col justify-between h-36 font-display relative rounded-xl transition-all duration-200 ${
                  isUnlocked 
                    ? 'bg-amber-50/50 dark:bg-amber-950/10 border-amber-200 dark:border-amber-900/40 text-charcoal dark:text-neutral-200' 
                    : 'bg-neutral-50/30 dark:bg-neutral-900/30 opacity-40 border-dashed border-neutral-200 dark:border-neutral-800'
                }`}
              >
                {/* Padlock Icon */}
                <div className="absolute top-3.5 right-3.5">
                  {isUnlocked ? (
                    <Unlock className="w-3.5 h-3.5 text-amber-500" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-neutral-300" />
                  )}
                </div>

                <div className="w-8 h-8 rounded-full border border-neutral-200 dark:border-neutral-700 flex items-center justify-center font-bold text-xs bg-white dark:bg-zinc-800 select-none">
                  {isUnlocked ? '★' : '☆'}
                </div>

                <div className="text-left select-none">
                  <div className={`text-xs font-bold tracking-tight ${isUnlocked ? 'text-charcoal dark:text-neutral-100' : 'text-neutral-400'}`}>
                    {ach.title}
                  </div>
                  <div className="text-[9.5px] text-neutral-400 dark:text-neutral-500 font-sans font-medium leading-tight mt-1">
                    {ach.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
