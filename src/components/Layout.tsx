import React from 'react';
import { useGame } from '../context/GameContext';
import { getRankStyles } from '../engine/progression';
import { Trophy, User, Home as HomeIcon, LogOut, Volume2, VolumeX, Volume1, Sun, Moon } from 'lucide-react';
import { playClick } from '../services/audioService';

interface LayoutProps {
  children: React.ReactNode;
  currentScreen: string;
  setScreen: (screen: 'home' | 'play' | 'results' | 'profile' | 'leaderboard') => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  volume: number;
  setVolume: (vol: number) => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  currentScreen,
  setScreen,
  isDarkMode,
  setIsDarkMode,
  volume,
  setVolume,
}) => {
  const { levelInfo, profile, resetProgress } = useGame();
  const rankStyle = getRankStyles(levelInfo.rank);

  const handleNavClick = (screenName: any) => {
    playClick();
    setScreen(screenName);
  };

  const cycleVolume = () => {
    playClick();
    if (volume === 0) setVolume(0.3);
    else if (volume === 0.3) setVolume(1.0);
    else setVolume(0);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''} bg-ivory text-charcoal font-sans antialiased flex flex-col selection:bg-electric selection:text-white relative`}>
      
      {/* Main Header (Sleek minimalist bar) */}
      <header className="border-b border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-zinc-900 sticky top-0 z-40 px-4 md:px-8 py-3.5 flex flex-wrap gap-4 items-center justify-between transition-colors duration-200">
        
        {/* Logo block */}
        <div 
          onClick={() => currentScreen !== 'play' && handleNavClick('home')} 
          className={`flex items-center gap-2 cursor-pointer select-none group ${currentScreen === 'play' ? 'pointer-events-none' : ''}`}
        >
          <div className="bg-electric text-white text-xs font-bold px-2 py-0.5 rounded">
            QM
          </div>
          <span className="font-display font-extrabold text-lg tracking-tight dark:text-white">
            QUICK<span className="text-electric">MATH</span>
          </span>
        </div>

        {/* Minimalist Controls and Navigation */}
        <div className="flex items-center gap-4 flex-wrap">
          
          {/* Header Action Controls */}
          <div className="flex items-center gap-2 border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-zinc-800/50 p-1 rounded-lg select-none">
            {/* Dark Mode Switcher */}
            <button
              onClick={() => { playClick(); setIsDarkMode(!isDarkMode); }}
              className="p-1.5 rounded-md hover:bg-neutral-200/60 dark:hover:bg-zinc-700/60 text-neutral-500 dark:text-neutral-400 transition-all flex items-center justify-center shrink-0 cursor-pointer"
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Mute/Sound controls */}
            <button
              onClick={cycleVolume}
              className="p-1.5 rounded-md hover:bg-neutral-200/60 dark:hover:bg-zinc-700/60 text-neutral-500 dark:text-neutral-400 transition-all flex items-center justify-center shrink-0 cursor-pointer"
              title="Mute / Adjust Volume"
            >
              {volume === 0 && <VolumeX className="w-4 h-4 text-coral" />}
              {volume === 0.3 && <Volume1 className="w-4 h-4 text-electric" />}
              {volume === 1.0 && <Volume2 className="w-4 h-4 text-lime" />}
            </button>
          </div>

          {/* Navigation Links */}
          {currentScreen !== 'play' && (
            <div className="flex items-center gap-2">
              <nav className="flex items-center gap-1">
                {[
                  { screen: 'home', label: 'HOME', icon: HomeIcon },
                  { screen: 'leaderboard', label: 'RANKING', icon: Trophy },
                  { screen: 'profile', label: 'PROFILE', icon: User },
                ].map((item) => {
                  const isActive = currentScreen === item.screen;
                  const Icon = item.icon;
                  return (
                    <button 
                      key={item.screen}
                      onClick={() => handleNavClick(item.screen as any)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                        isActive 
                          ? 'bg-neutral-100 dark:bg-zinc-800 text-neutral-900 dark:text-white font-bold' 
                          : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-zinc-800/40 hover:text-neutral-900 dark:hover:text-white'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="h-4 w-[1px] bg-neutral-200 dark:bg-neutral-800 hidden md:block" />

              {/* Profile progress */}
              <div className="items-center gap-3 hidden md:flex select-none pl-1">
                <div className="text-right">
                  <div className="text-[10px] font-mono font-bold text-neutral-400 uppercase leading-none">
                    {profile.username}
                  </div>
                  <div className="text-[11px] font-bold mt-1 dark:text-neutral-300">
                    LEVEL <span className="font-display font-extrabold text-electric">{levelInfo.level}</span>
                  </div>
                </div>
                
                <div className="w-20 h-2 bg-neutral-100 dark:bg-zinc-800 rounded-full overflow-hidden relative border border-neutral-200/30">
                  <div 
                    className="h-full bg-lime rounded-full transition-all duration-300"
                    style={{ width: `${levelInfo.percentage}%` }}
                  />
                </div>

                <div className={`text-[9px] font-bold px-2 py-0.5 rounded border border-neutral-200 dark:border-neutral-700 uppercase ${rankStyle.bg} ${rankStyle.text}`}>
                  {levelInfo.rank}
                </div>
              </div>
              
              {/* Hard reset */}
              {profile.stats.totalGames > 0 && (
                <button
                  onClick={() => {
                    playClick();
                    if (confirm('Are you sure you want to completely reset your local game progress and stats?')) {
                      resetProgress();
                      setScreen('home');
                    }
                  }}
                  title="Reset Game Progress"
                  className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:border-coral hover:text-coral cursor-pointer transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {currentScreen === 'play' && (
            <div className="flex items-center select-none">
              <span className="text-[9px] font-mono bg-coral/10 text-coral border border-coral/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                LIVE SESSION
              </span>
            </div>
          )}

        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-6 md:py-8 flex flex-col justify-center">
        {children}
      </main>

      {/* Bottom Footer Info */}
      <footer className="py-6 border-t border-neutral-200/50 dark:border-neutral-800/40 text-center select-none text-[10px] text-neutral-400 dark:text-neutral-500 font-mono transition-colors duration-200">
        QUICKMATH &copy; 2026 // MINIMALIST MATHEMATICAL RECREATION.
      </footer>
    </div>
  );
};
