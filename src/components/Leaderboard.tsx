import React from 'react';
import { useGame } from '../context/GameContext';
import { Trophy, Clock, CheckCircle } from 'lucide-react';

export const Leaderboard: React.FC = () => {
  const { dailyLeaderboard, hasPlayedDailyToday } = useGame();

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6 select-none text-left relative">
      
      {/* Decorative Technical Top Rule */}
      <div className="blueprint-line-h pb-2 mb-1 font-mono text-[9px] text-neutral-400 font-bold flex justify-between select-none">
        <span>QM // GLOBAL_LADDER_REGISTRY</span>
        <span>INDEX: LD-EVENT-09</span>
      </div>

      <div className="text-center font-display mb-2 select-none">
        <span className="technical-label block mb-1">
          // COMPETITIVE CHALLENGE ARCHIVES
        </span>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-charcoal flex items-center justify-center gap-2">
          <Trophy className="w-10 h-10 text-rewards-yellow fill-rewards-yellow stroke-[1.5] glow-text-yellow animate-bounce" />
          DAILY <span className="text-electric glow-text-blue">RANKING</span>
        </h1>
        <p className="text-xs text-neutral-500 font-sans mt-2 max-w-md mx-auto font-semibold">
          Rankings are calculated dynamically based on correct equation rates, elapsed seconds, and speed multipliers.
        </p>
      </div>

      {/* Main Leaderboard Panel */}
      <div className="chunky-card p-5 md:p-6 bg-white border-charcoal shadow-maximal-yellow glass-reflection">
        
        {/* Banner with challenge state */}
        <div className="flex items-center justify-between border-b-2 border-dashed border-charcoal/15 pb-4 mb-2">
          <div>
            <span className="technical-label">TARGET LOG EVENT</span>
            <span className="text-sm font-black text-charcoal font-display block mt-1">
              DAILY RUN // {new Date().toISOString().split('T')[0].replace(/-/g, '.')}
            </span>
          </div>
          
          <div className="text-right">
            {!hasPlayedDailyToday ? (
              <span className="text-[9px] font-mono font-black text-coral bg-red-50 border-[2px] border-coral/30 px-2 py-0.5 animate-pulse uppercase shadow-[0_0_10px_rgba(239,68,68,0.25)]">
                UNSOLVED BY YOU
              </span>
            ) : (
              <span className="text-[9px] font-mono font-black text-lime bg-lime/10 border-[2px] border-lime/30 px-2.5 py-0.5 uppercase shadow-[0_0_10px_rgba(132,204,22,0.25)]">
                RUN COMPLETED
              </span>
            )}
          </div>
        </div>

        {/* Leaderboard Rankings List */}
        <div className="flex flex-col gap-3">
          {dailyLeaderboard.length === 0 ? (
            <div className="text-center py-10 font-display text-xs text-neutral-400 font-bold">
              // NO SCORES RECORDED FOR TODAY YET.
            </div>
          ) : (
            dailyLeaderboard.map((entry) => {
              const isCurrentUser = entry.isUser;
              
              // Custom rank colors and glows
              let rankStyle = 'bg-neutral-100 text-charcoal border-charcoal';
              let ledType = 'led-off';
              if (entry.rank === 1) {
                rankStyle = 'bg-rewards-yellow text-charcoal border-charcoal font-black text-sm shadow-glow-yellow';
                ledType = 'led-active-green';
              } else if (entry.rank === 2) {
                rankStyle = 'bg-neutral-200 text-charcoal border-charcoal font-black text-sm shadow-glow-blue';
                ledType = 'led-active-blue';
              } else if (entry.rank === 3) {
                rankStyle = 'bg-amber-100 text-charcoal border-charcoal font-black text-sm shadow-glow-purple';
                ledType = 'led-active-purple';
              }

              return (
                <div
                  key={`${entry.username}-${entry.rank}`}
                  className={`border-[3px] border-charcoal p-3 flex items-center justify-between font-display relative transition-all duration-100 hover-wiggle ${
                    isCurrentUser 
                      ? 'bg-electric/5 border-electric shadow-glow-blue translate-x-1' 
                      : 'bg-white shadow-[3px_3px_0px_0px_rgba(28,26,23,1)] hover:bg-neutral-50/50 hover:shadow-glow-blue'
                  }`}
                >
                  <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                    
                    {/* Rank Circle */}
                    <div className={`w-8 h-8 rounded-full border-2 border-charcoal flex items-center justify-center font-mono ${rankStyle} shrink-0 select-none`}>
                      {entry.rank}
                    </div>

                    {/* Name */}
                    <div className="text-left font-display font-black text-sm text-charcoal truncate flex items-center gap-2 flex-1 min-w-0">
                      {ledType !== 'led-off' && <span className={`led ${ledType}`} />}
                      <span className="truncate">{entry.username}</span>
                      {isCurrentUser && (
                        <span className="bg-electric text-white text-[8px] font-mono px-1.5 py-[1px] uppercase leading-none font-bold shrink-0 shadow-[0_0_6px_#2563EB]">
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
                      <span className="font-bold text-charcoal flex items-center justify-end gap-1 font-sans text-xs glow-text-green">
                        <CheckCircle className="w-3 h-3 text-lime" />
                        {entry.accuracy}%
                      </span>
                    </div>

                    {/* Avg Time Column */}
                    <div className="hidden sm:block">
                      <span className="technical-label text-[7px] text-right block mb-0.5">SPEED</span>
                      <span className="font-bold text-charcoal flex items-center justify-end gap-1 font-sans text-xs glow-text-blue">
                        <Clock className="w-3.5 h-3.5 text-neutral-400" />
                        {entry.time}
                      </span>
                    </div>

                    {/* Total Score */}
                    <div>
                      <span className="technical-label text-[7px] text-right block mb-0.5">COMPUTED SCORE</span>
                      <span className="font-black text-sm text-charcoal tracking-tight font-mono block glow-text-blue">
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
