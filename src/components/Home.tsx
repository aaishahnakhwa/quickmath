import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { getRankStyles, getHumorousTitle } from '../engine/progression';
import { playClick } from '../services/audioService';
import { 
  Flame, 
  Clock, 
  CheckCircle, 
  ChevronRight, 
  LogIn,
  Gamepad2,
  Calendar,
  Layers,
  HelpCircle
} from 'lucide-react';

interface HomeProps {
  onStartGame: (config: {
    difficulty: 'BASIC' | 'STANDARD' | 'PRO';
    operations: ('ADD' | 'SUBTRACT' | 'MULTIPLY' | 'DIVIDE')[];
    mode: 'CLASSIC' | 'TIME_ATTACK' | 'STREAK' | 'BLITZ' | 'DAILY_CHALLENGE' | 'PUZZLE';
    questionLimit: number;
  }) => void;
  setScreen: (screen: 'home' | 'play' | 'results' | 'profile' | 'leaderboard' | 'how-to-play') => void;
}

export const Home: React.FC<HomeProps> = ({ onStartGame, setScreen }) => {
  const { profile, levelInfo, hasPlayedDailyToday, hasStartedDailyToday, startDailyChallenge, isAuthenticated, registerUser } = useGame();
  const rankStyle = getRankStyles(levelInfo.rank);
  const userNerdTitle = getHumorousTitle(levelInfo.level);

  // Default game selections matching Screen 01
  const [selectedOps, setSelectedOps] = useState<('ADD' | 'SUBTRACT' | 'MULTIPLY' | 'DIVIDE')[]>(['ADD', 'SUBTRACT']);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'BASIC' | 'STANDARD' | 'PRO'>('STANDARD');
  const [selectedMode, setSelectedMode] = useState<'CLASSIC' | 'TIME_ATTACK' | 'STREAK' | 'BLITZ' | 'DAILY_CHALLENGE' | 'PUZZLE'>('CLASSIC');
  const [selectedQuestionLimit, setSelectedQuestionLimit] = useState<number>(10);

  // Form guest persist
  const [showRegForm, setShowRegForm] = useState(false);
  const [regUsername, setRegUsername] = useState("");

  const isDaily = selectedMode === 'DAILY_CHALLENGE';

  const toggleOp = (op: 'ADD' | 'SUBTRACT' | 'MULTIPLY' | 'DIVIDE') => {
    playClick();
    if (selectedOps.includes(op)) {
      if (selectedOps.length > 1) {
        setSelectedOps(selectedOps.filter(o => o !== op));
      }
    } else {
      setSelectedOps([...selectedOps, op]);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (regUsername.trim()) {
      registerUser(regUsername.trim());
      setShowRegForm(false);
    }
  };

  const handlePlayClick = () => {
    playClick();
    
    if (selectedMode === 'DAILY_CHALLENGE') {
      if (hasStartedDailyToday && !hasPlayedDailyToday) {
        alert("Daily Run Forfeited: A daily run was already initiated today.");
        return;
      }
      if (hasPlayedDailyToday) {
        alert("Daily Run Logged: You have already submitted today's run.");
        return;
      }
      startDailyChallenge();
    }

    onStartGame({
      difficulty: selectedDifficulty,
      operations: selectedOps,
      mode: selectedMode,
      questionLimit: selectedMode === 'DAILY_CHALLENGE' ? 20 : selectedQuestionLimit,
    });
  };

  // Recompute overall accuracy for stats box
  const totalCorrect = profile.stats.totalCorrect;
  const totalAnswered = profile.stats.totalAnswered;
  const overallAccuracy = totalAnswered === 0 ? 0 : Math.round((totalCorrect / totalAnswered) * 100);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start select-none">
      
      {/* LEFT COLUMN: BRANDING & CONTROL CONSOLE (60% Width) - Matches Screen 01 */}
      <div className="lg:col-span-7 flex flex-col gap-6 text-left">
        
        {/* Title block */}
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-800 dark:text-white leading-tight tracking-tight">
            MATH<span className="text-electric">.</span>
          </h1>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
            Think <span className="text-electric">Faster</span>. Solve <span className="text-electric">Smarter</span>.
          </p>
        </div>

        {/* Master Screen 01 Card */}
        <div className="chunky-card flex flex-col gap-6">
          
          {/* Horizontal Stats Row */}
          <div className="grid grid-cols-3 gap-2 bg-slate-50/60 dark:bg-slate-900/40 p-4.5 rounded-2xl border border-slate-100/50 dark:border-slate-800 text-center font-display">
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Best Score</span>
              <span className="text-sm font-extrabold text-slate-800 dark:text-white mt-1 block">
                {(profile.stats.bestScore[selectedMode] || 0).toLocaleString()}
              </span>
            </div>
            <div className="border-x border-slate-200/60 dark:border-slate-800/80">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Games Played</span>
              <span className="text-sm font-extrabold text-slate-800 dark:text-white mt-1 block">
                {profile.stats.totalGames}
              </span>
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Accuracy</span>
              <span className="text-sm font-extrabold text-slate-800 dark:text-white mt-1 block">
                {overallAccuracy}%
              </span>
            </div>
          </div>

          {/* Choose Your Level Section */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 tracking-wider block uppercase">
                Choose Your Level
              </span>
              <button 
                onClick={() => setScreen('how-to-play')}
                className="text-[10px] font-bold text-electric hover:underline flex items-center gap-1 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" /> How to Play
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-3 font-display">
              {/* Beginner */}
              <button
                onClick={() => { playClick(); setSelectedDifficulty('BASIC'); }}
                className={`flex flex-col items-center justify-between p-3.5 rounded-2xl border text-center h-28 transition-all duration-200 cursor-pointer ${
                  selectedDifficulty === 'BASIC'
                    ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-500/10'
                    : 'bg-white dark:bg-zinc-900 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-neutral-300 hover:bg-slate-50/50'
                }`}
              >
                <div className="text-[9px] font-extrabold tracking-widest block uppercase opacity-85">Level 01</div>
                <div className="font-extrabold text-lg font-mono">01</div>
                <div className="text-[9px] font-extrabold tracking-wide uppercase opacity-90">Beginner</div>
              </button>

              {/* Intermediate */}
              <button
                onClick={() => { playClick(); setSelectedDifficulty('STANDARD'); }}
                className={`flex flex-col items-center justify-between p-3.5 rounded-2xl border text-center h-28 transition-all duration-200 cursor-pointer ${
                  selectedDifficulty === 'STANDARD'
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-blue-500 shadow-md shadow-blue-500/10'
                    : 'bg-white dark:bg-zinc-900 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-neutral-300 hover:bg-slate-50/50'
                }`}
              >
                <div className="text-[9px] font-extrabold tracking-widest block uppercase opacity-85">Level 02</div>
                <div className="font-extrabold text-lg font-mono">02</div>
                <div className="text-[9px] font-extrabold tracking-wide uppercase opacity-90">Intermediate</div>
              </button>

              {/* Advanced */}
              <button
                onClick={() => { playClick(); setSelectedDifficulty('PRO'); }}
                className={`flex flex-col items-center justify-between p-3.5 rounded-2xl border text-center h-28 transition-all duration-200 cursor-pointer ${
                  selectedDifficulty === 'PRO'
                    ? 'bg-gradient-to-br from-purple-500 to-indigo-700 text-white border-purple-500 shadow-md shadow-purple-500/10'
                    : 'bg-white dark:bg-zinc-900 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-neutral-300 hover:bg-slate-50/50'
                }`}
              >
                <div className="text-[9px] font-extrabold tracking-widest block uppercase opacity-85">Level 03</div>
                <div className="font-extrabold text-lg font-mono">03</div>
                <div className="text-[9px] font-extrabold tracking-wide uppercase opacity-90">Advanced</div>
              </button>
            </div>
          </div>

          {/* Choose Operations Matrix */}
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 tracking-wider block uppercase mb-3">
              Choose Operations
            </span>
            
            <div className="grid grid-cols-4 gap-2 font-display">
              {[
                { id: 'ADD', symbol: '+', activeClass: 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/10', unactiveText: 'text-emerald-500' },
                { id: 'SUBTRACT', symbol: '−', activeClass: 'bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-500/10', unactiveText: 'text-blue-500' },
                { id: 'MULTIPLY', symbol: '×', activeClass: 'bg-purple-500 text-white border-purple-500 shadow-md shadow-purple-500/10', unactiveText: 'text-purple-500' },
                { id: 'DIVIDE', symbol: '÷', activeClass: 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/10', unactiveText: 'text-amber-500' },
              ].map((op) => {
                const isActive = selectedOps.includes(op.id as any);
                return (
                  <button
                    key={op.id}
                    onClick={() => toggleOp(op.id as any)}
                    className={`h-14 rounded-xl border flex items-center justify-center font-extrabold text-2xl transition-all duration-200 cursor-pointer ${
                      isActive 
                        ? op.activeClass 
                        : `bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 ${op.unactiveText} hover:bg-slate-50 dark:hover:bg-zinc-800/60`
                    }`}
                  >
                    {op.symbol}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mode Selector Row */}
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 tracking-wider block uppercase mb-2.5">
              Gameplay Simulator Mode
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-display">
              {[
                { id: 'CLASSIC', name: 'CLASSIC', desc: '3 strikes standard.' },
                { id: 'TIME_ATTACK', name: 'TIME ATTACK', desc: '60s ticking clock.' },
                { id: 'STREAK', name: 'STREAK', desc: 'Sudden death mode.' },
                { id: 'BLITZ', name: 'BLITZ', desc: 'Short 3s timer limit.' },
                { id: 'DAILY_CHALLENGE', name: 'DAILY RUN', desc: 'Rank globally.' },
                { id: 'PUZZLE', name: 'PUZZLE', desc: 'Swap tiles equation.' },
              ].map((mode) => {
                const isActive = selectedMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    onClick={() => { playClick(); setSelectedMode(mode.id as any); }}
                    className={`p-2.5 rounded-2xl border text-left flex flex-col justify-between h-20 transition-all duration-150 cursor-pointer ${
                      isActive 
                        ? 'bg-electric text-white border-electric shadow-md shadow-blue-500/10' 
                        : 'bg-white dark:bg-zinc-900 border-slate-100 dark:border-slate-800 hover:bg-slate-50/50'
                    }`}
                  >
                    <span className="font-extrabold text-[10px] tracking-tight">{mode.name}</span>
                    <span className={`text-[8.5px] font-sans leading-tight mt-1 font-medium block ${
                      isActive ? 'text-white/80' : 'text-slate-400'
                    }`}>
                      {mode.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Session Length row */}
          <div>
            <div className="flex justify-between items-center mb-2.5">
              <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 tracking-wider block uppercase">
                Session Length
              </span>
              {isDaily && (
                <span className="text-[8.5px] font-bold text-coral bg-coral/5 px-2 py-0.5 rounded border border-coral/10">
                  LOCKED TO 20 ON DAILY RUNS
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
                    className={`px-3.5 py-1.5 text-[10px] font-extrabold rounded-xl border transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-electric text-white border-electric shadow-sm' 
                        : 'bg-white dark:bg-zinc-900 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-neutral-300 hover:bg-slate-50'
                    } ${isDaily ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    {num} Qs
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Large Play Button */}
        <button
          onClick={handlePlayClick}
          className="btn-chunky w-full py-4.5 bg-electric hover:bg-electric-hover text-white border-electric text-sm font-bold tracking-widest cursor-pointer inline-flex items-center justify-center gap-2"
        >
          <span>PLAY</span>
          <ChevronRight className="w-4 h-4" />
        </button>

      </div>

      {/* RIGHT COLUMN: PROFILE & DATA SUMMARY (40% Width) - Sleek Sidebar details */}
      <div className="lg:col-span-5 flex flex-col gap-6">

        {/* Technical Registry Card */}
        <div className="chunky-card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center font-display font-black text-xl rounded-2xl shrink-0 dark:text-white">
              {profile.username.substring(0, 2).toUpperCase()}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">MODULE:</span>
                <span className="text-[9px] font-mono font-bold text-electric">
                  {isAuthenticated ? 'ONLINE_REGISTRY' : 'LOCAL_GUEST'}
                </span>
              </div>
              <h3 className="font-display font-extrabold text-lg text-slate-800 dark:text-white truncate">
                {profile.username}
              </h3>
              
              <div className="flex flex-col gap-1 mt-1 leading-none">
                <div className="flex items-center gap-1.5">
                  <span className={`text-[8.5px] font-mono font-bold px-1.5 py-0.5 rounded border border-slate-100 dark:border-slate-800 uppercase leading-none ${rankStyle.bg} ${rankStyle.text}`}>
                    {levelInfo.rank}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    LEVEL {levelInfo.level}
                  </span>
                </div>
                <span className="text-[9.5px] font-mono font-semibold text-pro-purple mt-1 select-none">
                  {userNerdTitle}
                </span>
              </div>

            </div>
          </div>

          {/* Level segments */}
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-850">
            <div className="flex justify-between items-end text-[10px] font-mono font-bold text-slate-400 mb-1.5">
              <span>XP METERS SYSTEM</span>
              <span>{levelInfo.currentLevelXP} / {levelInfo.nextLevelXP} XP</span>
            </div>
            
            {/* Segmented Progress Bar */}
            <div className="flex items-center border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-zinc-800/40 p-0.5 h-4.5 rounded-full overflow-hidden">
              {Array.from({ length: 15 }).map((_, idx) => {
                const stepVal = (idx / 15) * 100;
                const isFilled = levelInfo.percentage > stepVal;
                return (
                  <div
                    key={idx}
                    className={`h-full flex-1 border-r border-slate-200/20 dark:border-zinc-700 last:border-0 transition-colors ${
                      isFilled ? 'bg-lime' : 'bg-transparent'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Persist Guest form */}
          {!isAuthenticated && (
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-850">
              {!showRegForm ? (
                <button
                  onClick={() => { playClick(); setShowRegForm(true); }}
                  className="w-full border border-dashed border-slate-250 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 py-2 rounded-2xl text-xs font-semibold text-slate-500 dark:text-slate-400 text-center flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5 text-electric" />
                  PERSIST PROFILE DATA
                </button>
              ) : (
                <form onSubmit={handleRegister} className="flex gap-2">
                  <input
                    type="text"
                    required
                    maxLength={16}
                    placeholder="Enter username..."
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    className="flex-1 border border-slate-200 dark:border-slate-700 bg-white dark:bg-zinc-800 rounded-2xl px-3 py-1.5 text-xs focus:outline-none focus:border-electric dark:text-white"
                  />
                  <button
                    type="submit"
                    className="btn-chunky px-4 py-1.5 bg-lime hover:bg-lime/90 text-white border-lime font-bold"
                  >
                    SAVE
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Daily Challenge Card */}
        <div className="chunky-card">
          <div className="flex items-center justify-between">
            <h4 className="font-display font-extrabold text-sm text-slate-800 dark:text-white flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-electric" />
              DAILY ARITHMETIC RUN
            </h4>
            <span className="text-[9px] font-mono font-bold bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-slate-800 px-2 py-0.5 rounded text-slate-500">
              {new Date().toLocaleDateString(undefined, { month: '2-digit', day: '2-digit', year: '2-digit' }).replace(/\//g, '.')}
            </span>
          </div>
          
          <p className="text-xs text-slate-400 dark:text-slate-500 font-sans mt-2 leading-relaxed font-medium">
            A synchronized daily seed of exactly 20 equations. Compete globally on the global rankings ladder.
          </p>

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between gap-3">
            {hasPlayedDailyToday ? (
              <>
                <span className="text-xs font-bold text-lime flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> LOGGED TODAY
                </span>
                <button
                  onClick={() => { playClick(); setScreen('leaderboard'); }}
                  className="btn-chunky py-1.5 px-4"
                >
                  VIEW LADDER
                </button>
              </>
            ) : hasStartedDailyToday ? (
              <>
                <span className="text-xs font-bold text-coral flex items-center gap-1 select-none">
                  ⚠️ ATTEMPT FORFEITED
                </span>
                <button
                  onClick={() => { playClick(); setScreen('leaderboard'); }}
                  className="btn-chunky py-1.5 px-4"
                >
                  VIEW LADDER
                </button>
              </>
            ) : (
              <>
                <span className="text-[10px] font-mono font-bold text-slate-400">
                  STATUS: ACTIVE TODAY
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
                  className="btn-chunky bg-rewards-yellow text-white border-rewards-yellow py-1.5 px-4 inline-flex items-center gap-1 cursor-pointer"
                >
                  ENTER RUN <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* System Performance stats */}
        <div className="chunky-card">
          <h4 className="font-display font-extrabold text-sm text-slate-800 dark:text-white flex items-center gap-1.5 mb-3">
            <Layers className="w-4 h-4 text-lime" />
            SYSTEM PERFORMANCE METRICS
          </h4>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'TOTAL GAMES', val: `${profile.stats.totalGames} runs`, icon: Gamepad2, color: 'text-slate-400' },
              { label: 'RECORD STREAK', val: profile.stats.bestStreak, icon: Flame, color: 'text-coral' },
              { label: 'ACCURACY', val: profile.stats.totalAnswered === 0 ? '0%' : `${Math.round((profile.stats.totalCorrect / profile.stats.totalAnswered) * 100)}%`, icon: CheckCircle, color: 'text-lime' },
              { label: 'AVG RESPONSE', val: profile.stats.averageResponseTime === 0 ? '0.0s' : `${profile.stats.averageResponseTime}s`, icon: Clock, color: 'text-electric' },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div 
                  key={i}
                  className="border border-slate-50 dark:border-slate-800/80 p-3 bg-slate-50/50 dark:bg-zinc-800/30 rounded-2xl"
                >
                  <span className="technical-label text-[9px] block">{stat.label}</span>
                  <span className="font-display font-bold text-base text-slate-850 dark:text-white flex items-center gap-1 mt-1">
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                    {stat.val}
                  </span>
                </div>
              );
            })}
          </div>
          
          <button
            onClick={() => { playClick(); setScreen('profile'); }}
            className="btn-chunky w-full py-2 mt-4"
          >
            OPEN SYSTEM PROFILE
          </button>
        </div>

      </div>
    </div>
  );
};
