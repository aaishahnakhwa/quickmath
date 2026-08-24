let audioCtx: AudioContext | null = null;
let globalVolume = 0.3; // Default low/comfortable volume. Values: 0 (mute), 0.3 (low), 1.0 (high)

const getAudioContext = (): AudioContext => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

export const setGlobalVolume = (vol: number) => {
  globalVolume = vol;
};

export const getGlobalVolume = (): number => {
  return globalVolume;
};

// Play a short mechanical click (plastic keycap style)
export const playClick = () => {
  if (globalVolume <= 0) return;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(12, ctx.currentTime + 0.05);
    
    gain.gain.setValueAtTime(0.22 * globalVolume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch (e) {
    console.warn("Audio Context Click error:", e);
  }
};

// Play retro 8-bit ascending coin sound on success
export const playSuccess = () => {
  if (globalVolume <= 0) return;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'square';
    
    const t = ctx.currentTime;
    osc.frequency.setValueAtTime(523.25, t); // C5
    osc.frequency.setValueAtTime(659.25, t + 0.06); // E5
    osc.frequency.setValueAtTime(880.00, t + 0.12); // A5
    
    gain.gain.setValueAtTime(0.14 * globalVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(t + 0.3);
  } catch (e) {
    console.warn("Audio Success sound error:", e);
  }
};

// Play low frequency saw sound on mistake/error
export const playError = () => {
  if (globalVolume <= 0) return;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(55, ctx.currentTime + 0.35);
    
    gain.gain.setValueAtTime(0.18 * globalVolume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {
    console.warn("Audio Error sound error:", e);
  }
};

// Play speed demon charging sound (frequency sweep upwards)
export const playSpeedDemon = () => {
  if (globalVolume <= 0) return;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sawtooth';
    const t = ctx.currentTime;
    osc.frequency.setValueAtTime(280, t);
    osc.frequency.exponentialRampToValueAtTime(1300, t + 0.45);
    
    gain.gain.setValueAtTime(0.12 * globalVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.45);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(t + 0.45);
  } catch (e) {
    console.warn("Audio Speed Demon sound error:", e);
  }
};

// Play level-up sequence
export const playLevelUp = () => {
  if (globalVolume <= 0) return;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'square';
    const t = ctx.currentTime;
    osc.frequency.setValueAtTime(261.63, t); // C4
    osc.frequency.setValueAtTime(329.63, t + 0.08); // E4
    osc.frequency.setValueAtTime(392.00, t + 0.16); // G4
    osc.frequency.setValueAtTime(523.25, t + 0.24); // C5
    osc.frequency.setValueAtTime(659.25, t + 0.32); // E5
    osc.frequency.setValueAtTime(1046.50, t + 0.40); // C6
    
    gain.gain.setValueAtTime(0.14 * globalVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.7);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(t + 0.7);
  } catch (e) {
    console.warn("Audio LevelUp sound error:", e);
  }
};
