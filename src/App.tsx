import { useState, useEffect } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { GameArena } from './components/GameArena';
import { Results } from './components/Results';
import { Profile } from './components/Profile';
import { Leaderboard } from './components/Leaderboard';
import { setGlobalVolume } from './services/audioService';

function GameApp() {
  const [screen, setScreen] = useState<'home' | 'play' | 'results' | 'profile' | 'leaderboard'>('home');
  const [gameConfig, setGameConfig] = useState<{
    difficulty: 'BASIC' | 'STANDARD' | 'PRO';
    operations: ('ADD' | 'SUBTRACT' | 'MULTIPLY' | 'DIVIDE')[];
    mode: 'CLASSIC' | 'TIME_ATTACK' | 'STREAK' | 'BLITZ' | 'DAILY_CHALLENGE' | 'PUZZLE';
    questionLimit: number;
  } | null>(null);
  
  const [runResults, setRunResults] = useState<any>(null);
  const [saveResponse, setSaveResponse] = useState<any>(null);
  
  // Custom Arcade Hardware Console Options
  const [activeTheme, setActiveTheme] = useState<'classic' | 'danger' | 'gameboy' | 'synthwave'>('classic');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.3); // 0 = Mute, 0.3 = Low, 1.0 = High
  
  const { saveGameRun } = useGame();

  // Sync volume with 8-bit synthesizer service on change
  useEffect(() => {
    setGlobalVolume(volume);
  }, [volume]);

  const handleStartGame = (config: any) => {
    setGameConfig(config);
    setRunResults(null);
    setSaveResponse(null);
    setScreen('play');
  };

  const handleGameEnd = (results: any) => {
    setRunResults(results);
    
    // Save score calculations and compute XP upgrades
    const response = saveGameRun(results);
    setSaveResponse(response);
    setScreen('results');
  };

  const handleReplay = () => {
    if (gameConfig) {
      setRunResults(null);
      setSaveResponse(null);
      setScreen('play');
    }
  };

  return (
    <Layout
      currentScreen={screen}
      setScreen={setScreen}
      activeTheme={activeTheme}
      setActiveTheme={setActiveTheme}
      isDarkMode={isDarkMode}
      setIsDarkMode={setIsDarkMode}
      volume={volume}
      setVolume={setVolume}
    >
      {screen === 'home' && (
        <Home onStartGame={handleStartGame} setScreen={setScreen} />
      )}
      {screen === 'play' && gameConfig && (
        <GameArena
          config={gameConfig}
          onGameEnd={handleGameEnd}
          onExit={() => setScreen('home')}
        />
      )}
      {screen === 'results' && runResults && (
        <Results
          runResults={runResults}
          saveResponse={saveResponse}
          onReplay={handleReplay}
          setScreen={setScreen}
        />
      )}
      {screen === 'profile' && (
        <Profile />
      )}
      {screen === 'leaderboard' && (
        <Leaderboard />
      )}
    </Layout>
  );
}

export default function App() {
  return (
    <GameProvider>
      <GameApp />
    </GameProvider>
  );
}
