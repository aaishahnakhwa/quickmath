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
      
      {/* Decorative Technical Top Rule */}
      <div className="blueprint-line-h pb-2 mb-1 font-mono text-[9px] text-neutral-400 font-bold flex justify-between select-none">
        <span>QM // SYSTEM_LOG_DIAGRAM</span>
        <span>INDEX: PLR-LOG-01</span>
      </div>

      {/* 1. Header Hero Card */}
      <div className="chunky-card p-6 bg-white flex flex-col md:flex-row md:items-center justify-between gap-6 border-charcoal shadow-glow-blue glass-reflection">
        <div className="absolute top-1 left-2 text-[9px] font-mono text-neutral-300 font-extrabold select-none">[01]</div>
        
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-charcoal text-ivory border-[3px] border-charcoal flex items-center justify-center font-display font-black text-3xl shadow-glow-blue animate-pulse">
            {profile.username.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 className="font-display font-black text-2xl text-charcoal">{profile.username}</h2>
            <div className="flex items-center gap-2.5 mt-1 font-mono text-[9px] font-extrabold text-neutral-400">
              <span>MODULE: ONLINE_DIAGNOSTICS_CARD</span>
              <span>•</span>
              <span>XP ACCUMULATED: {profile.totalXP.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Level Stats Segment */}
        <div className="flex items-center gap-4 border-[3px] border-dashed border-charcoal/20 p-3.5 bg-neutral-50 md:min-w-[220px] shadow-glow-purple relative overflow-hidden">
          <div className="absolute top-0 right-0 w-6 h-6 bg-stripes-light opacity-30" />
          
          <div>
            <span className="technical-label block text-[8px] text-charcoal">RANK TIER</span>
            <span className={`text-xs font-black font-display tracking-tight uppercase block mt-1 ${rankStyle.text} glow-text-purple`}>
              {levelInfo.rank}
            </span>
            <span className="text-[9px] font-mono font-black text-pro-purple glow-text-purple mt-0.5 block">
              {userNerdTitle}
            </span>
          </div>
          <div className="h-10 w-[1.5px] bg-charcoal/10" />
          <div>
            <span className="technical-label block text-[8px] text-charcoal">LEVEL</span>
            <span className="text-xl font-display font-black text-charcoal block mt-0.5 font-mono">
              LV {levelInfo.level}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Stats Grid Blueprint */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left pane: Operations and difficulty */}
        <div className="md:col-span-2 flex flex-col gap-6">
          
          {/* Operations accuracy */}
          <div className="chunky-card p-5 md:p-6 bg-white border-charcoal shadow-glow-blue glass-reflection">
            <div className="absolute top-1 left-2 text-[9px] font-mono text-neutral-300 font-extrabold select-none">[02]</div>
            
            <h3 className="technical-label mb-4 block">
              // ACCURACY BY ARITHMETIC OPERATOR
            </h3>

            <div className="space-y-4 font-display">
              {[
                { key: 'ADD', label: 'ADDITION (+)', color: 'bg-electric shadow-glow-blue' },
                { key: 'SUBTRACT', label: 'SUBTRACTION (−)', color: 'bg-coral shadow-glow-coral' },
                { key: 'MULTIPLY', label: 'MULTIPLICATION (×)', color: 'bg-rewards-yellow shadow-glow-yellow' },
                { key: 'DIVIDE', label: 'DIVISION (÷)', color: 'bg-pro-purple shadow-glow-purple' },
              ].map((op) => {
                const answered = profile.stats.opAnswered[op.key as 'ADD' | 'SUBTRACT' | 'MULTIPLY' | 'DIVIDE'] || 0;
                const correct = profile.stats.opCorrect[op.key as 'ADD' | 'SUBTRACT' | 'MULTIPLY' | 'DIVIDE'] || 0;
                const acc = answered === 0 ? 0 : Math.round((correct / answered) * 100);
                
                return (
                  <div key={op.key} className="space-y-1">
                    <div className="flex justify-between text-xs font-black text-charcoal">
                      <span>{op.label}</span>
                      <span className="font-mono text-[11px] text-neutral-400">
                        {correct} / {answered} <span className="text-charcoal font-black font-sans text-xs">({acc}%)</span>
                      </span>
                    </div>
                    
                    {/* Segmented bar indicator */}
                    <div className="flex items-center border-[2px] border-charcoal bg-neutral-100 p-0.5 h-4 select-none">
                      {Array.from({ length: 10 }).map((_, idx) => {
                        const stepVal = idx * 10;
                        const isFilled = acc > stepVal;
                        return (
                          <div
                            key={idx}
                            className={`h-full flex-1 border-r border-charcoal/20 last:border-0 transition-colors ${
                              isFilled ? op.color : 'bg-transparent'
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Difficulty yield logs */}
          <div className="chunky-card p-5 md:p-6 bg-white border-charcoal shadow-glow-green glass-reflection">
            <div className="absolute top-1 left-2 text-[9px] font-mono text-neutral-300 font-extrabold select-none">[03]</div>

            <h3 className="technical-label mb-4 block">
              // ACCURACY BY DIFFICULTY TIER
            </h3>

            <div className="space-y-4 font-display">
              {[
                { key: 'BASIC', label: 'BASIC TIER', color: 'bg-lime shadow-glow-green' },
                { key: 'STANDARD', label: 'STANDARD TIER', color: 'bg-electric shadow-glow-blue' },
                { key: 'PRO', label: 'PRO ARCH-TIER', color: 'bg-pro-purple shadow-glow-purple' },
              ].map((diff) => {
                const answered = profile.stats.diffAnswered[diff.key as 'BASIC' | 'STANDARD' | 'PRO'] || 0;
                const correct = profile.stats.diffCorrect[diff.key as 'BASIC' | 'STANDARD' | 'PRO'] || 0;
                const acc = answered === 0 ? 0 : Math.round((correct / answered) * 100);

                return (
                  <div key={diff.key} className="space-y-1">
                    <div className="flex justify-between text-xs font-black text-charcoal">
                      <span>{diff.label}</span>
                      <span className="font-mono text-[11px] text-neutral-400">
                        {correct} / {answered} <span className="text-charcoal font-black font-sans text-xs">({acc}%)</span>
                      </span>
                    </div>

                    {/* Segmented bar indicator */}
                    <div className="flex items-center border-[2px] border-charcoal bg-neutral-100 p-0.5 h-4 select-none">
                      {Array.from({ length: 10 }).map((_, idx) => {
                        const stepVal = idx * 10;
                        const isFilled = acc > stepVal;
                        return (
                          <div
                            key={idx}
                            className={`h-full flex-1 border-r border-charcoal/20 last:border-0 transition-colors ${
                              isFilled ? diff.color : 'bg-transparent'
                            }`}
                          />
                        );
                      })}
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
          <div className="chunky-card p-5 bg-white border-charcoal shadow-glow-blue glass-reflection">
            <div className="absolute top-1 left-2 text-[9px] font-mono text-neutral-300 font-extrabold select-none">[04]</div>

            <div className="space-y-3 font-display mt-2">
              <div className="border-b border-charcoal/10 pb-2 flex justify-between items-center select-none">
                <span className="technical-label">// COMPLETED RUNS</span>
                <span className="font-black text-charcoal font-mono text-sm">{profile.stats.totalGames} runs</span>
              </div>
              <div className="border-b border-charcoal/10 pb-2 flex justify-between items-center select-none">
                <span className="technical-label">// MAX STREAK</span>
                <span className="font-black text-charcoal font-mono text-sm flex items-center gap-1 glow-text-coral">
                  <Flame className="w-3.5 h-3.5 text-red-500 fill-red-400" />
                  {profile.stats.bestStreak}
                </span>
              </div>
              <div className="border-b border-charcoal/10 pb-2 flex justify-between items-center select-none">
                <span className="technical-label">// ACCURACY</span>
                <span className="font-black text-charcoal font-mono text-sm flex items-center gap-1 glow-text-green">
                  <CheckCircle className="w-3.5 h-3.5 text-lime" />
                  {overallAccuracy}%
                </span>
              </div>
              <div className="pb-1 flex justify-between items-center select-none">
                <span className="technical-label">// AVG RESPONSE</span>
                <span className="font-black text-charcoal font-mono text-sm flex items-center gap-1 glow-text-blue">
                  <Clock className="w-3.5 h-3.5 text-electric" />
                  {profile.stats.averageResponseTime}s
                </span>
              </div>
            </div>
          </div>

          {/* High Scores per Mode */}
          <div className="chunky-card p-5 bg-white border-charcoal shadow-glow-yellow glass-reflection">
            <div className="absolute top-1 left-2 text-[9px] font-mono text-neutral-300 font-extrabold select-none">[05]</div>

            <h3 className="technical-label mb-3.5 block">
              // HIGHEST COMPILATIONS
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
                <div key={mode.id} className="flex justify-between items-center text-xs font-mono font-bold text-charcoal border-b border-neutral-100 pb-2 last:border-0 last:pb-0 select-none">
                  <span>{mode.label}</span>
                  <span className="text-electric font-black font-mono">{(profile.stats.bestScore[mode.id] || 0).toLocaleString()} pt</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* 3. Achievements cassette deck */}
      <div className="chunky-card p-6 bg-white border-charcoal shadow-glow-purple glass-reflection">
        <div className="absolute top-1 left-2 text-[9px] font-mono text-neutral-300 font-extrabold select-none">[06]</div>
        <div className="absolute top-1 right-2 text-[9px] font-mono text-neutral-300 font-extrabold select-none">[ACH.DEC]</div>

        <h3 className="technical-label mb-4 block">
          // ACQUIRED AWARDS AND SYSTEM MEDALS
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {ALL_ACHIEVEMENTS.map((ach) => {
            const isUnlocked = profile.unlockedAchievements.includes(ach.id);
            return (
              <div
                key={ach.id}
                className={`border-3 border-charcoal p-3.5 flex flex-col justify-between h-36 font-display relative transition-all duration-100 hover-wiggle ${
                  isUnlocked 
                    ? 'bg-amber-50 shadow-glow-yellow border-charcoal' 
                    : 'bg-neutral-50/50 opacity-40 border-dashed shadow-[1px_1px_0px_0px_#1C1A17] border-charcoal/40'
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

                <div className="w-8 h-8 rounded-full border-2 border-charcoal flex items-center justify-center font-bold text-xs bg-white shadow-[1.5px_1.5px_0px_0px_#1C1A17] select-none">
                  {isUnlocked ? '★' : '☆'}
                </div>

                <div className="text-left select-none">
                  <div className={`text-xs font-black tracking-tight ${isUnlocked ? 'text-charcoal' : 'text-neutral-500'}`}>
                    {ach.title}
                  </div>
                  <div className="text-[9px] text-neutral-500 font-sans font-semibold leading-tight mt-1">
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
