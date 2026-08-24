import React from 'react';
import { useGame } from '../context/GameContext';
import { getRankStyles } from '../engine/progression';
import { Trophy, User, Home as HomeIcon, LogOut, Volume2, VolumeX, Volume1 } from 'lucide-react';
import { playClick } from '../services/audioService';

interface LayoutProps {
  children: React.ReactNode;
  currentScreen: string;
  setScreen: (screen: 'home' | 'play' | 'results' | 'profile' | 'leaderboard') => void;
  activeTheme: 'classic' | 'danger' | 'gameboy' | 'synthwave';
  setActiveTheme: (theme: 'classic' | 'danger' | 'gameboy' | 'synthwave') => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  volume: number;
  setVolume: (vol: number) => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  currentScreen,
  setScreen,
  activeTheme,
  setActiveTheme,
  isDarkMode,
  setIsDarkMode,
  volume,
  setVolume,
}) => {
  const { levelInfo, profile, resetProgress } = useGame();
  const rankStyle = getRankStyles(levelInfo.rank);

  // Play synthetic mechanical clicks on control actions
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

  const handleSkinChange = (themeName: any) => {
    playClick();
    setActiveTheme(themeName);
  };

  return (
    <div className={`min-h-screen theme-${activeTheme} ${isDarkMode ? 'dark' : ''} bg-ivory text-charcoal font-sans antialiased grid-bg flex flex-col selection:bg-electric selection:text-white relative`}>
      {/* Background Micro-Details (Atmosphere) */}
      <div className="absolute top-16 left-12 opacity-5 pointer-events-none select-none text-xs font-mono font-bold tracking-widest hidden md:block">
        [ SYSTEM_ACTIVE // LOG_MATH_ENG ]
      </div>
      <div className="absolute bottom-12 right-12 opacity-5 pointer-events-none select-none text-xs font-mono font-bold tracking-widest hidden md:block">
        [ ACC_REQ_50 // VER_3.0 ]
      </div>

      {/* Main Header (Fully Responsive flex-wrap setup) */}
      <header className="border-b-2 border-charcoal bg-white sticky top-0 z-40 px-3 md:px-8 py-3 flex flex-wrap gap-3 items-center justify-between">
        
        {/* Logo block */}
        <div 
          onClick={() => currentScreen !== 'play' && handleNavClick('home')} 
          className={`flex items-center gap-1.5 cursor-pointer select-none group ${currentScreen === 'play' ? 'pointer-events-none' : ''}`}
        >
          <div className="bg-charcoal text-ivory text-sm font-black px-2 py-0.5 tracking-tighter border border-charcoal">
            QM
          </div>
          <span className="font-display font-extrabold text-md tracking-tight">
            QUICK<span className="text-electric">MATH</span>
          </span>
          <span className="text-[9px] font-mono border border-charcoal/20 px-1 py-[1px] opacity-60 hidden sm:inline-block">
            V3.0
          </span>
        </div>

        {/* Arcade Physical Cabinet Configuration Control Box */}
        <div className="flex items-center gap-2.5 border-2 border-charcoal bg-neutral-50 px-2 py-1 shadow-[2px_2px_0px_0px_#1C1A17] shrink-0 text-xs rounded select-none">
          {/* Skin Faceplate select dots */}
          <div className="flex gap-1 items-center border-r border-charcoal/10 pr-2">
            <span className="text-[8px] font-mono font-bold text-neutral-400 mr-1">SKIN:</span>
            <button
              onClick={() => handleSkinChange('classic')}
              className={`w-3.5 h-3.5 rounded-full bg-blue-500 border border-charcoal cursor-pointer transition-all ${
                activeTheme === 'classic' ? 'ring-2 ring-charcoal scale-110' : 'opacity-50'
              }`}
              title="Classic Casing"
            />
            <button
              onClick={() => handleSkinChange('danger')}
              className={`w-3.5 h-3.5 rounded-full bg-yellow-500 border border-charcoal cursor-pointer transition-all ${
                activeTheme === 'danger' ? 'ring-2 ring-charcoal scale-110' : 'opacity-50'
              }`}
              title="Hazard Danger Deck"
            />
            <button
              onClick={() => handleSkinChange('gameboy')}
              className={`w-3.5 h-3.5 rounded-full bg-emerald-600 border border-charcoal cursor-pointer transition-all ${
                activeTheme === 'gameboy' ? 'ring-2 ring-charcoal scale-110' : 'opacity-50'
              }`}
              title="Sage GameBoy Screen"
            />
            <button
              onClick={() => handleSkinChange('synthwave')}
              className={`w-3.5 h-3.5 rounded-full bg-pink-500 border border-charcoal cursor-pointer transition-all ${
                activeTheme === 'synthwave' ? 'ring-2 ring-charcoal scale-110' : 'opacity-50'
              }`}
              title="Synthwave Neon Cadet"
            />
          </div>

          {/* Cabin lights switch toggle */}
          <button
            onClick={() => { playClick(); setIsDarkMode(!isDarkMode); }}
            className={`px-2 py-0.5 font-mono text-[9px] font-black border border-charcoal/20 hover:border-charcoal transition-all border-r pr-2 shrink-0 ${
              isDarkMode ? 'bg-charcoal text-ivory border-charcoal' : 'bg-white text-charcoal'
            }`}
            title="Toggle Cockpit Cabin Lights"
          >
            LIGHTS: {isDarkMode ? 'DARK' : 'BRIGHT'}
          </button>

          {/* 8-bit sound volume control */}
          <button
            onClick={cycleVolume}
            className="p-1 border border-charcoal/20 hover:border-charcoal hover:bg-neutral-100 cursor-pointer transition-all flex items-center justify-center shrink-0"
            title="8-Bit Synthesizer Volume"
          >
            {volume === 0 && <VolumeX className="w-3.5 h-3.5 text-coral" />}
            {volume === 0.3 && <Volume1 className="w-3.5 h-3.5 text-electric" />}
            {volume === 1.0 && <Volume2 className="w-3.5 h-3.5 text-lime" />}
          </button>
        </div>

        {/* Global Nav & Profile Panel */}
        {currentScreen !== 'play' && (
          <div className="flex items-center gap-3.5">
            <nav className="flex items-center gap-1">
              <button 
                onClick={() => handleNavClick('home')}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold font-display transition-all border-2 border-transparent hover:border-charcoal hover:bg-neutral-50 ${currentScreen === 'home' ? 'bg-charcoal text-ivory border-charcoal!' : ''}`}
              >
                <HomeIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">HOME</span>
              </button>
              <button 
                onClick={() => handleNavClick('leaderboard')}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold font-display transition-all border-2 border-transparent hover:border-charcoal hover:bg-neutral-50 ${currentScreen === 'leaderboard' ? 'bg-charcoal text-ivory border-charcoal!' : ''}`}
              >
                <Trophy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">RANKING</span>
              </button>
              <button 
                onClick={() => handleNavClick('profile')}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold font-display transition-all border-2 border-transparent hover:border-charcoal hover:bg-neutral-50 ${currentScreen === 'profile' ? 'bg-charcoal text-ivory border-charcoal!' : ''}`}
              >
                <User className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">PROFILE</span>
              </button>
            </nav>

            <div className="h-5 w-[1.5px] bg-charcoal/10 hidden md:block" />

            {/* Level stats badge details */}
            <div className="items-center gap-2.5 hidden md:flex select-none">
              <div className="text-right">
                <div className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-wider leading-none">
                  {profile.username}
                </div>
                <div className="text-[11px] font-bold mt-0.5">
                  LEVEL <span className="font-display font-extrabold text-charcoal">{levelInfo.level}</span>
                </div>
              </div>
              
              <div className="w-20 h-3.5 border-2 border-charcoal bg-neutral-100 overflow-hidden relative shadow-[1px_1px_0px_0px_rgba(28,26,23,1)]">
                <div 
                  className="h-full bg-lime border-r border-charcoal transition-all duration-300"
                  style={{ width: `${levelInfo.percentage}%` }}
                />
              </div>

              <div className={`text-[10px] font-bold px-2 py-0.5 border border-charcoal rounded uppercase ${rankStyle.bg} ${rankStyle.text}`}>
                {levelInfo.rank}
              </div>
            </div>
            
            {/* Simulated hard reset profile progress */}
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
                className="p-1 border border-charcoal/20 hover:border-coral hover:text-coral cursor-pointer transition-colors"
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>
            )}
          </div>
        )}

        {currentScreen === 'play' && (
          <div className="flex items-center gap-2 select-none">
            <span className="text-[9px] font-mono bg-coral/10 text-coral border border-coral/30 px-2 py-0.5 font-black uppercase tracking-wider animate-pulse">
              LIVE SESSION
            </span>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6 md:py-10 flex flex-col justify-center">
        {children}
      </main>

      {/* Bottom Footer Info */}
      <footer className="py-6 border-t border-charcoal/10 text-center select-none text-[10px] text-neutral-400 font-mono">
        QUICKMATH &copy; 2026 // INTELLECTUAL ARCADE RECREATION. KEYBOARD INTEGRATION ENABLED.
      </footer>
    </div>
  );
};
