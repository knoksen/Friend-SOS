const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

type SoundEffect = {
  frequency: number;
  type: OscillatorType;
  duration: number;
  gain: number;
};

const SOUND_EFFECTS = {
  CLICK: {
    frequency: 800,
    type: 'sine' as OscillatorType,
    duration: 50,
    gain: 0.1,
  },
  SUCCESS: {
    frequency: 1200,
    type: 'sine' as OscillatorType,
    duration: 100,
    gain: 0.1,
  },
  ERROR: {
    frequency: 400,
    type: 'square' as OscillatorType,
    duration: 200,
    gain: 0.1,
  },
  WARNING: {
    frequency: 600,
    type: 'triangle' as OscillatorType,
    duration: 150,
    gain: 0.1,
  },
};

export const playUISound = (effect: keyof typeof SOUND_EFFECTS) => {
  if (!audioContext) return;

  const soundEffect = SOUND_EFFECTS[effect];
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.type = soundEffect.type;
  oscillator.frequency.setValueAtTime(soundEffect.frequency, audioContext.currentTime);

  gainNode.gain.setValueAtTime(soundEffect.gain, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + soundEffect.duration / 1000);

  oscillator.start();
  oscillator.stop(audioContext.currentTime + soundEffect.duration / 1000);
};

export const resumeAudioContext = () => {
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
};
