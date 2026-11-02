import React from 'react';
import { useGame } from '../context/GameContext';
import { Trophy, Clock, CheckCircle } from 'lucide-react';

export const Leaderboard: React.FC = () => {
  const { dailyLeaderboard, hasPlayedDailyToday } = useGame();

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6 select-none text-left relative">
      
      <div className="text-center font-display mb-2 select-none">
        <span className="technical-label block mb-1">
          // COMPETITIVE CHALLENGE ARCHIVES
        </span>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-charcoal dark:text-white flex items-center justify-center gap-2">
          <Trophy className="w-8 h-8 text-rewards-yellow fill-rewards-yellow stroke-[1.5]" />
          DAILY <span className="text-electric">RANKING</span>
        </h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 font-sans mt-2 max-w-md mx-auto font-medium">
          Rankings are calculated dynamically based on correct equation rates, elapsed seconds, and speed multipliers.
        </p>
      </div>

      {/* Main Leaderboard Panel */}
      <div className="chunky-card p-5 md:p-6">
        
        {/* Banner with challenge state */}
        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4 mb-4">
          <div>
            <span className="technical-label">TARGET LOG EVENT</span>
            <span className="text-sm font-bold text-charcoal dark:text-neutral-200 font-display block mt-1">
              DAILY RUN // {new Date().toISOString().split('T')[0].replace(/-/g, '.')}
            </span>
          </div>
          
          <div className="text-right">
            {!hasPlayedDailyToday ? (
              <span className="text-[9px] font-mono font-bold text-coral bg-coral/5 border border-coral/20 px-2 py-0.5 rounded">
                UNSOLVED BY YOU
              </span>
            ) : (
              <span className="text-[9px] font-mono font-bold text-lime bg-lime/5 border border-lime/20 px-2.5 py-0.5 rounded">
                RUN COMPLETED
              </span>
            )}
          </div>
        </div>

        {/* Leaderboard Rankings List */}
        <div className="flex flex-col gap-3">
          {dailyLeaderboard.length === 0 ? (
            <div className="text-center py-10 font-display text-xs text-neutral-400 font-semibold">
              // NO SCORES RECORDED FOR TODAY YET.
            </div>
          ) : (
            dailyLeaderboard.map((entry) => {
              const isCurrentUser = entry.isUser;
              
              // Custom rank colors
              let rankStyle = 'bg-neutral-100 dark:bg-zinc-800 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700';
              let ledType = 'led-off';
              if (entry.rank === 1) {
                rankStyle = 'bg-rewards-yellow/15 text-rewards-yellow border-rewards-yellow/30 font-bold';
                ledType = 'led-active-green';
              } else if (entry.rank === 2) {
                rankStyle = 'bg-blue-50 dark:bg-blue-900/10 text-blue-500 border-blue-200 dark:border-blue-900/30 font-bold';
                ledType = 'led-active-blue';
              } else if (entry.rank === 3) {
                rankStyle = 'bg-purple-50 dark:bg-purple-900/10 text-purple-500 border-purple-200 dark:border-purple-900/30 font-bold';
                ledType = 'led-active-purple';
              }

              return (
                <div
                  key={`${entry.username}-${entry.rank}`}
                  className={`border p-3 flex items-center justify-between font-display relative rounded-xl transition-all duration-150 ${
                    isCurrentUser 
                      ? 'bg-electric/5 dark:bg-electric/10 border-electric text-charcoal dark:text-neutral-100' 
                      : 'bg-white dark:bg-zinc-900 border-neutral-100 dark:border-neutral-800/80 hover:bg-neutral-50/50 dark:hover:bg-zinc-800/50 text-charcoal dark:text-neutral-200'
                  }`}
                >
                  <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                    
                    {/* Rank Circle */}
                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-mono text-xs ${rankStyle} shrink-0 select-none`}>
                      {entry.rank}
                    </div>

                    {/* Name */}
                    <div className="text-left font-display font-extrabold text-sm text-charcoal dark:text-neutral-200 truncate flex items-center gap-2 flex-1 min-w-0">
                      {ledType !== 'led-off' && <span className={`led ${ledType}`} />}
                      <span className="truncate">{entry.username}</span>
                      {isCurrentUser && (
                        <span className="bg-electric text-white text-[8px] font-mono px-1.5 py-0.5 rounded leading-none font-bold shrink-0">
                          YOU
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right data columns */}
                  <div className="flex items-center gap-4 sm:gap-8 font-mono text-xs text-right select-none">
                    
                    {/* Accuracy Column */}
                    <div className="hidden sm:block">
                      <span className="technical-label text-[7px] text-right block mb-0.5">ACCURACY</span>
                      <span className="font-bold text-neutral-600 dark:text-neutral-300 flex items-center justify-end gap-1 font-sans text-xs">
                        <CheckCircle className="w-3 h-3 text-lime" />
                        {entry.accuracy}%
                      </span>
                    </div>

                    {/* Avg Time Column */}
                    <div className="hidden sm:block">
                      <span className="technical-label text-[7px] text-right block mb-0.5">SPEED</span>
                      <span className="font-bold text-neutral-600 dark:text-neutral-300 flex items-center justify-end gap-1 font-sans text-xs">
                        <Clock className="w-3.5 h-3.5 text-neutral-400" />
                        {entry.time}
                      </span>
                    </div>

                    {/* Total Score */}
                    <div>
                      <span className="technical-label text-[7px] text-right block mb-0.5">SCORE</span>
                      <span className="font-bold text-sm text-charcoal dark:text-white tracking-tight font-mono block">
                        {entry.score.toLocaleString()} pt
                      </span>
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

    </div>
  );
};
