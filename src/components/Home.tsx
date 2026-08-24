import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { getRankStyles, getHumorousTitle } from '../engine/progression';
import { Play, Flame, CheckCircle, Clock, LogIn, ChevronRight } from 'lucide-react';
import { playClick } from '../services/audioService';

interface HomeProps {
  onStartGame: (config: {
    difficulty: 'BASIC' | 'STANDARD' | 'PRO';
    operations: ('ADD' | 'SUBTRACT' | 'MULTIPLY' | 'DIVIDE')[];
    mode: 'CLASSIC' | 'TIME_ATTACK' | 'STREAK' | 'BLITZ' | 'DAILY_CHALLENGE' | 'PUZZLE';
    questionLimit: number;
  }) => void;
  setScreen: (screen: 'home' | 'play' | 'results' | 'profile' | 'leaderboard') => void;
}

export const Home: React.FC<HomeProps> = ({ onStartGame, setScreen }) => {
  const { 
    profile, 
    levelInfo, 
    isAuthenticated, 
    registerUser, 
    hasPlayedDailyToday,
    hasStartedDailyToday,
    startDailyChallenge 
  } = useGame();
  
  // Game Setup State
  const [selectedDifficulty, setSelectedDifficulty] = useState<'BASIC' | 'STANDARD' | 'PRO'>('STANDARD');
  const [selectedOps, setSelectedOps] = useState<('ADD' | 'SUBTRACT' | 'MULTIPLY' | 'DIVIDE')[]>(['ADD', 'SUBTRACT']);
  const [selectedMode, setSelectedMode] = useState<'CLASSIC' | 'TIME_ATTACK' | 'STREAK' | 'BLITZ' | 'DAILY_CHALLENGE' | 'PUZZLE'>('CLASSIC');
  const [selectedQuestionLimit, setSelectedQuestionLimit] = useState<number>(10);
  
  // Registration Inputs
  const [regUsername, setRegUsername] = useState('');
  const [showRegForm, setShowRegForm] = useState(false);

  const toggleOp = (op: 'ADD' | 'SUBTRACT' | 'MULTIPLY' | 'DIVIDE') => {
    playClick();
    if (selectedOps.includes(op)) {
      if (selectedOps.length > 1) {
        setSelectedOps(selectedOps.filter((x) => x !== op));
      }
    } else {
      setSelectedOps([...selectedOps, op]);
    }
  };

  const handlePlayClick = () => {
    playClick();
    onStartGame({
      difficulty: selectedDifficulty,
      operations: selectedOps,
      mode: selectedMode,
      questionLimit: selectedMode === 'DAILY_CHALLENGE' ? 20 : selectedQuestionLimit,
    });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    playClick();
    if (regUsername.trim()) {
      registerUser(regUsername);
      setShowRegForm(false);
    }
  };

  const rankStyle = getRankStyles(levelInfo.rank);
  const userNerdTitle = getHumorousTitle(levelInfo.level);

  // Dynamic colors for the play button based on difficulty
  const getPlayBtnStyle = () => {
    switch (selectedDifficulty) {
      case 'BASIC':
        return 'bg-lime text-charcoal shadow-maximal-green hover:bg-lime-hover';
      case 'PRO':
        return 'bg-pro-purple text-white shadow-maximal-purple hover:bg-pro-purple-hover';
      case 'STANDARD':
      default:
        return 'bg-electric text-white shadow-maximal-blue hover:bg-electric-hover';
    }
  };

  const isDaily = selectedMode === 'DAILY_CHALLENGE';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative select-none">
      
      {/* Decorative Technical Top Rule */}
      <div className="lg:col-span-12 blueprint-line-h pb-2 mb-2 font-mono text-[9px] text-neutral-400 font-bold flex justify-between">
        <span>QM // TACTICAL_INTERFACE_v3.0_MAXIMALIST</span>
        <span>STATUS: EXTREME_YIELD</span>
      </div>

      {/* LEFT COLUMN: BRANDING & CONTROL CONSOLE (60% Width) */}
      <div className="lg:col-span-7 flex flex-col gap-6 text-left">
        
        {/* Asymmetrical Swiss Title Block */}
        <div className="flex gap-4 items-start relative">
          <div className="hidden sm:block bg-stripes-yellow w-4 h-24 mt-2 border-2 border-charcoal shrink-0 animate-pulse" />
          <div>
            <div className="technical-label mb-1 glow-text-blue">// MOTHERBOARD_ONLINE</div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-black text-charcoal leading-[0.9] tracking-tight">
              TRAIN YOUR BRAIN.<br />
              PLAY THE <span className="text-electric glow-text-blue">NUMBERS.</span>
            </h1>
            <p className="text-xs text-neutral-500 font-sans mt-3 max-w-lg leading-relaxed font-semibold">
              The arithmetic is the hero. Test computation speeds, establish multipliers, and compete against mathematical challenges. Designed for absolute mechanical feedback.
            </p>
          </div>
          
          {/* Retro Stamps */}
          <div className="absolute right-4 top-0 hidden md:flex flex-col gap-2 select-none">
            <div className="system-stamp text-lime border-lime rotate-12 bg-white/40 shadow-sm font-black tracking-widest text-[9px]">
              QM APPROVED v3.0
            </div>
            <div className="system-stamp text-coral border-coral rotate-[-8deg] bg-amber-50/90 font-black tracking-widest text-[8px] animate-pulse text-center">
              COGNITIVE COMBUSTION ZONE
            </div>
          </div>
        </div>

        {/* Master Control Panel */}
        <div className="chunky-card bg-white border-charcoal shadow-maximal-blue glass-reflection">
          
          {/* Header Warning Stripe */}
          <div className="h-3 bg-stripes-yellow w-full border-b-[3px] border-charcoal" />

          <div className="p-5 md:p-6 flex flex-col gap-6 relative">
            <div className="absolute top-1 left-2 text-[9px] font-mono text-neutral-300 font-extrabold">[01]</div>
            <div className="absolute bottom-1 right-2 text-[9px] font-mono text-neutral-300 font-extrabold">[SYS.CNF]</div>

            {/* 1. Operation Select Matrix (Multi-Color Active Layout with glow) */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="technical-label text-charcoal font-black">01 // OPERATIONS INTEGRATION</span>
                <span className="text-[9px] font-mono font-bold text-neutral-400 border border-charcoal/20 px-1.5 py-[1px] rounded bg-neutral-50">
                  MULTI-SELECT ENABLED
                </span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-display">
                {[
                  { id: 'ADD', label: 'ADD', symbol: '+', activeClass: 'bg-electric text-white shadow-glow-blue' },
                  { id: 'SUBTRACT', label: 'SUBTRACT', symbol: '−', activeClass: 'bg-coral text-white shadow-glow-coral' },
                  { id: 'MULTIPLY', label: 'MULTIPLY', symbol: '×', activeClass: 'bg-rewards-yellow text-charcoal shadow-glow-yellow' },
                  { id: 'DIVIDE', label: 'DIVIDE', symbol: '÷', activeClass: 'bg-pro-purple text-white shadow-glow-purple' },
                ].map((op) => {
                  const isActive = selectedOps.includes(op.id as any);
                  return (
                    <button
                      key={op.id}
                      onClick={() => toggleOp(op.id as any)}
                      className={`btn-chunky flex flex-col items-center justify-center p-3 h-20 glass-reflection ${
                        isActive 
                          ? `${op.activeClass} translate-x-[2px] translate-y-[2px]` 
                          : 'bg-white text-charcoal hover:bg-neutral-50 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_#1C1A17]'
                      }`}
                      style={isActive ? {} : { boxShadow: '2px 2px 0px 0px #1C1A17' }}
                    >
                      <span className="text-xl font-black">{op.symbol}</span>
                      <span className="text-[9px] font-extrabold tracking-wide mt-1 block">{op.label}</span>
                    </button>
                  );
                })}

                {/* All Operations override */}
                <button
                  onClick={() => { playClick(); setSelectedOps(['ADD', 'SUBTRACT', 'MULTIPLY', 'DIVIDE']); }}
                  className={`btn-chunky flex flex-col items-center justify-center p-3 h-20 glass-reflection col-span-2 sm:col-span-1 ${
                    selectedOps.length === 4 
                      ? 'bg-charcoal text-ivory shadow-[2px_2px_0px_0px_#2563EB] translate-x-[2px] translate-y-[2px]' 
                      : 'bg-white text-charcoal hover:bg-neutral-50 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_#1C1A17]'
                  }`}
                  style={selectedOps.length === 4 ? { boxShadow: '2px 2px 0px 0px #2563EB' } : {}}
                >
                  <span className="text-xl font-black">∞</span>
                  <span className="text-[9px] font-extrabold tracking-wide mt-1 block">ALL OPS</span>
                </button>
              </div>
            </div>

            {/* 2. Difficulty Tiers (Responsive stack on mobile) */}
            <div>
              <span className="technical-label block mb-3 text-charcoal font-black">02 // SELECT COMPUTATION LEVEL</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-display">
                {[
                  { id: 'BASIC', label: 'BASIC', desc: 'Simple ops. Easy XP.', activeStyle: 'bg-lime text-charcoal shadow-glow-green' },
                  { id: 'STANDARD', label: 'STANDARD', desc: 'Thinking cap math.', activeStyle: 'bg-electric text-white shadow-glow-blue' },
                  { id: 'PRO', label: 'PRO ARCH', desc: 'Brain combustion risk!', activeStyle: 'bg-pro-purple text-white shadow-glow-purple' },
                ].map((diff) => {
                  const isActive = selectedDifficulty === diff.id;
                  return (
                    <button
                      key={diff.id}
                      onClick={() => { playClick(); setSelectedDifficulty(diff.id as any); }}
                      className={`btn-chunky p-3.5 flex flex-col items-start justify-between text-left h-24 sm:h-28 glass-reflection ${
                        isActive 
                          ? `${diff.activeStyle} translate-x-[2px] translate-y-[2px]` 
                          : 'bg-white text-charcoal hover:bg-neutral-50 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_#1C1A17]'
                      }`}
                      style={isActive ? {} : { boxShadow: '2px 2px 0px 0px #1C1A17' }}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-black text-sm tracking-tight">{diff.label}</span>
                        {isActive && <span className="text-[8px] font-mono font-bold uppercase leading-none opacity-80 shrink-0">● ACTIVE</span>}
                      </div>
                      <span className={`text-[9px] font-sans font-semibold mt-2.5 leading-snug tracking-tight ${
                        isActive ? 'text-current opacity-90' : 'text-neutral-400'
                      }`}>
                        {diff.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Selector of Game Modes (Dynamic Colors matching Plan) */}
            <div>
              <span className="technical-label block mb-3 text-charcoal font-black">03 // GAMEPLAY SIMULATOR MODE</span>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 font-display">
                {[
                  { id: 'CLASSIC', name: 'CLASSIC', desc: '3 strikes system.', activeStyle: 'bg-lime text-charcoal shadow-glow-green' },
                  { id: 'TIME_ATTACK', name: 'TIME ATTACK', desc: '60s computation.', activeStyle: 'bg-rewards-yellow text-charcoal shadow-glow-yellow' },
                  { id: 'STREAK', name: 'STREAK', desc: 'Sudden death limit.', activeStyle: 'bg-coral text-white shadow-glow-coral' },
                  { id: 'BLITZ', name: 'BLITZ', desc: 'Shortening 3s timers.', activeStyle: 'bg-pro-purple text-white shadow-glow-purple' },
                  { id: 'DAILY_CHALLENGE', name: 'DAILY RUN', desc: 'Synchronized seed.', activeStyle: 'bg-rewards-yellow text-charcoal shadow-glow-yellow' },
                  { id: 'PUZZLE', name: 'PUZZLE', desc: 'Super addictive swap!', activeStyle: 'bg-rose-400 text-white shadow-glow-coral' },
                ].map((mode) => {
                  const isActive = selectedMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => { playClick(); setSelectedMode(mode.id as any); }}
                      className={`btn-chunky p-3 flex flex-col items-start justify-between text-left h-24 glass-reflection ${
                        isActive 
                          ? `${mode.activeStyle} translate-x-[2px] translate-y-[2px]` 
                          : 'bg-white text-charcoal hover:bg-neutral-50 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_#1C1A17]'
                      }`}
                      style={isActive ? {} : { boxShadow: '2px 2px 0px 0px #1C1A17' }}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-extrabold text-xs tracking-tight">{mode.name}</span>
                        {isActive && <span className="text-[8px] font-mono leading-none shrink-0">● ON</span>}
                      </div>
                      <span className={`text-[9px] font-sans font-medium leading-snug mt-1.5 block ${
                        isActive ? 'text-current opacity-80' : 'text-neutral-400'
                      }`}>
                        {mode.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Session Length Select row (Chunky tags) */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="technical-label text-charcoal font-black">04 // SESSION EQUATION LENGTH</span>
                {isDaily && (
                  <span className="text-[8.5px] font-mono font-black text-coral border border-coral/30 bg-red-50 px-2 py-[1px]">
                    FIXED TO 20 ON DAILY RUNS
                  </span>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2 font-display">
                {[5, 7, 10, 15, 20, 25, 30].map((num) => {
                  const isActive = isDaily ? num === 20 : selectedQuestionLimit === num;
                  return (
                    <button
                      key={num}
                      disabled={isDaily}
                      onClick={() => { playClick(); setSelectedQuestionLimit(num); }}
                      className={`btn-chunky px-3.5 py-1.5 text-xs font-black glass-reflection transition-all ${
                        isActive 
                          ? 'bg-electric text-white shadow-glow-blue' 
                          : 'bg-white text-charcoal hover:bg-neutral-50'
                      } ${isDaily ? 'opacity-40 cursor-not-allowed' : ''}`}
                      style={isActive ? {} : { boxShadow: '2px 2px 0px 0px #1C1A17' }}
                    >
                      {num} Qs
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* Massive Play Button with dynamic background & glow matching selected difficulty */}
        <button
          onClick={handlePlayClick}
          className={`btn-chunky w-full py-5 inline-flex items-center justify-center gap-2 select-none font-display font-black text-xl tracking-widest transition-all glass-reflection ${getPlayBtnStyle()}`}
        >
          <Play className="fill-current w-5 h-5 animate-bounce" />
          START GAME SESSION
        </button>

      </div>

      {/* RIGHT COLUMN: HARDWARE SUMMARY & RECORDS (40% Width) */}
      <div className="lg:col-span-5 flex flex-col gap-6">

        {/* Technical Registry Card */}
        <div className="chunky-card bg-white text-left border-charcoal shadow-maximal-blue glass-reflection">
          {/* Top Stripe */}
          <div className="h-2 bg-stripes-light w-full border-b-2 border-charcoal" />

          <div className="p-5 relative">
            <div className="absolute top-1 left-2 text-[9px] font-mono text-neutral-300 font-extrabold select-none">[02]</div>
            <div className="absolute top-1 right-2 text-[9px] font-mono text-neutral-300 font-extrabold select-none">[PLR.REG]</div>

            <div className="flex items-center gap-4 mt-2">
              <div className="w-14 h-14 bg-charcoal text-ivory border-[3px] border-charcoal flex items-center justify-center font-display font-black text-2xl shadow-glow-blue shrink-0 animate-pulse">
                {profile.username.substring(0, 2).toUpperCase()}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="technical-label text-charcoal">MODULE:</span>
                  <span className="text-[9px] font-mono font-black text-electric select-none glow-text-blue">
                    {isAuthenticated ? 'ONLINE_REGISTRY' : 'LOCAL_TEMP_GUEST'}
                  </span>
                </div>
                <h3 className="font-display font-black text-xl text-charcoal truncate mt-0.5">
                  {profile.username}
                </h3>
                
                <div className="flex flex-col gap-1 mt-1 leading-none">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[9px] font-mono font-extrabold px-1.5 py-[1px] border-2 border-charcoal uppercase leading-none ${rankStyle.bg} ${rankStyle.text}`}>
                      {levelInfo.rank}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-neutral-500">
                      SYSTEM LEVEL {levelInfo.level}
                    </span>
                  </div>
                  <span className="text-[9.5px] font-mono font-black text-pro-purple glow-text-purple mt-1 select-none">
                    {userNerdTitle}
                  </span>
                </div>

              </div>
            </div>

            {/* Level segments */}
            <div className="mt-4 pt-4 border-t-2 border-dashed border-charcoal/10">
              <div className="flex justify-between items-end text-xs font-mono font-bold text-neutral-400 mb-1.5">
                <span className="text-charcoal">XP METERS SYSTEM</span>
                <span>{levelInfo.currentLevelXP} / {levelInfo.nextLevelXP} XP</span>
              </div>
              
              {/* Chunky Segmented Progress Bar */}
              <div className="flex items-center border-[3px] border-charcoal bg-neutral-100 p-0.5 h-6 shadow-[2px_2px_0px_0px_#1C1A17]">
                {Array.from({ length: 20 }).map((_, idx) => {
                  const stepVal = (idx / 20) * 100;
                  const isFilled = levelInfo.percentage > stepVal;
                  return (
                    <div
                      key={idx}
                      className={`h-full flex-1 border-r border-charcoal last:border-0 transition-colors ${
                        isFilled ? 'bg-lime shadow-glow-green' : 'bg-transparent'
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Simulated Register Block */}
            {!isAuthenticated && (
              <div className="mt-5 pt-4 border-t-2 border-dashed border-charcoal/10">
                {!showRegForm ? (
                  <button
                    onClick={() => { playClick(); setShowRegForm(true); }}
                    className="w-full border-2 border-dashed border-charcoal/40 hover:border-charcoal py-2 text-xs font-bold font-display text-center flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <LogIn className="w-3.5 h-3.5 text-electric" />
                    PERSIST PLAYER SYSTEM LOGS
                  </button>
                ) : (
                  <form onSubmit={handleRegister} className="flex gap-2">
                    <input
                      type="text"
                      required
                      maxLength={16}
                      placeholder="Registry nick..."
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      className="flex-1 border-[3px] border-charcoal px-3 py-1 text-xs font-display font-black focus:outline-none focus:border-electric"
                    />
                    <button
                      type="submit"
                      className="btn-chunky border-[3px] py-1 shadow-glow-green bg-lime px-4 inline-flex items-center justify-center text-charcoal font-black"
                    >
                      SAVE
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Daily Ticker event (Amber Glow highlight + stripes) */}
        <div className="chunky-card bg-white text-left border-charcoal shadow-maximal-yellow glass-reflection">
          {/* Header Warning Stripe */}
          <div className="h-3 bg-stripes-yellow w-full border-b-[3px] border-charcoal" />

          <div className="p-5 relative">
            <div className="absolute top-1 left-2 text-[9px] font-mono text-neutral-300 font-extrabold select-none">[03]</div>
            <div className="absolute top-1 right-2 text-[9px] font-mono text-neutral-300 font-extrabold select-none">[DLY.EVT]</div>

            <div>
              <div className="flex items-center justify-between mt-2">
                <h4 className="font-display font-black text-md text-charcoal">
                  DAILY SYSTEM COMPILATION
                </h4>
                <span className="text-[9px] font-mono font-extrabold bg-neutral-100 border border-charcoal/20 px-2 py-[1px] rounded shadow-[1px_1px_0px_0px_rgba(28,26,23,0.15)]">
                  {new Date().toLocaleDateString(undefined, { month: '2-digit', day: '2-digit', year: '2-digit' }).replace(/\//g, '.')}
                </span>
              </div>
              
              <p className="text-xs text-neutral-500 font-sans mt-2 leading-relaxed font-semibold">
                Exactly 20 identical arithmetic equations. Compete globally on the clock.
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              {hasPlayedDailyToday ? (
                <>
                  <span className="text-xs font-black text-lime flex items-center gap-1 glow-text-green">
                    <CheckCircle className="w-4 h-4" /> LOGGED TODAY
                  </span>
                  <button
                    onClick={() => { playClick(); setScreen('leaderboard'); }}
                    className="btn-chunky border-[3px] shadow-[2px_2px_0px_0px_#1C1A17] bg-neutral-100 py-2 px-4 inline-flex items-center justify-center"
                  >
                    VIEW LADDER
                  </button>
                </>
              ) : hasStartedDailyToday ? (
                <>
                  <span className="text-xs font-black text-coral flex items-center gap-1.5 glow-text-coral animate-pulse select-none">
                    ⚠️ ATTEMPT FORFEITED
                  </span>
                  <button
                    onClick={() => { playClick(); setScreen('leaderboard'); }}
                    className="btn-chunky border-[3px] shadow-[2px_2px_0px_0px_#1C1A17] bg-neutral-100 py-2 px-4 inline-flex items-center justify-center"
                  >
                    VIEW LADDER
                  </button>
                </>
              ) : (
                <>
                  <span className="text-[10px] font-mono font-black text-red-500 animate-pulse flex items-center gap-1.5 glow-text-coral">
                    ● ACTIVE CHALLENGE
                  </span>
                  <button
                    onClick={() => {
                      playClick();
                      startDailyChallenge();
                      onStartGame({
                        difficulty: 'STANDARD',
                        operations: ['ADD', 'SUBTRACT', 'MULTIPLY', 'DIVIDE'],
                        mode: 'DAILY_CHALLENGE',
                        questionLimit: 20,
                      });
                    }}
                    className="btn-chunky border-[3px] shadow-glow-yellow bg-rewards-yellow py-2 px-4 text-charcoal inline-flex items-center justify-center"
                  >
                    ENTER LOBBY <ChevronRight className="w-4 h-4 animate-ping" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Blueprint Dashboard with various glowing indicators */}
        <div className="chunky-card bg-white text-left border-charcoal shadow-maximal-green glass-reflection">
          {/* Header Stripes */}
          <div className="h-2 bg-stripes-light w-full border-b-2 border-charcoal" />

          <div className="p-5 relative">
            <div className="absolute top-1 left-2 text-[9px] font-mono text-neutral-300 font-extrabold select-none">[04]</div>
            <div className="absolute top-1 right-2 text-[9px] font-mono text-neutral-300 font-extrabold select-none">[ARC.DAT]</div>

            <div className="grid grid-cols-2 gap-4 mt-2">
              <div 
                onClick={() => playClick()}
                className="border-2 border-charcoal p-2.5 bg-neutral-50 shadow-[1.5px_1.5px_0px_0px_#1C1A17] hover:shadow-glow-blue transition-all relative overflow-hidden cursor-pointer"
              >
                <span className="technical-label">TOTAL GAMES</span>
                <span className="font-display font-black text-lg text-charcoal block mt-1">{profile.stats.totalGames} runs</span>
              </div>
              <div 
                onClick={() => playClick()}
                className="border-2 border-charcoal p-2.5 bg-neutral-50 shadow-[1.5px_1.5px_0px_0px_#1C1A17] hover:shadow-glow-coral transition-all relative overflow-hidden cursor-pointer"
              >
                <span className="technical-label">RECORD STREAK</span>
                <span className="font-display font-black text-lg text-charcoal flex items-center gap-1 mt-1 glow-text-coral">
                  <Flame className="w-4 h-4 text-red-500 fill-red-400" />
                  {profile.stats.bestStreak}
                </span>
              </div>
              <div 
                onClick={() => playClick()}
                className="border-2 border-charcoal p-2.5 bg-neutral-50 shadow-[1.5px_1.5px_0px_0px_#1C1A17] hover:shadow-glow-green transition-all relative overflow-hidden cursor-pointer"
              >
                <span className="technical-label">ACCURACY RATING</span>
                <span className="font-display font-black text-lg text-charcoal flex items-center gap-1 mt-1 glow-text-green">
                  <CheckCircle className="w-4 h-4 text-lime" />
                  {profile.stats.totalAnswered === 0
                    ? '0%'
                    : `${Math.round((profile.stats.totalCorrect / profile.stats.totalAnswered) * 100)}%`}
                </span>
              </div>
              <div 
                onClick={() => playClick()}
                className="border-2 border-charcoal p-2.5 bg-neutral-50 shadow-[1.5px_1.5px_0px_0px_#1C1A17] hover:shadow-glow-blue transition-all relative overflow-hidden cursor-pointer"
              >
                <span className="technical-label">AVG RESPONSE</span>
                <span className="font-display font-black text-lg text-charcoal flex items-center gap-1 mt-1 glow-text-blue">
                  <Clock className="w-4 h-4 text-electric" />
                  {profile.stats.averageResponseTime === 0 ? '0.0s' : `${profile.stats.averageResponseTime}s`}
                </span>
              </div>
            </div>
            
            <button
              onClick={() => { playClick(); setScreen('profile'); }}
              className="btn-chunky w-full border-[3px] shadow-[2px_2px_0px_0px_#1C1A17] py-2.5 mt-4 bg-white text-charcoal inline-flex items-center justify-center hover:shadow-glow-blue"
            >
              OPEN SYSTEM BLUEPRINTS
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
