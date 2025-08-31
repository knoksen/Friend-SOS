// Use a global AudioContext to avoid issues with creating it multiple times.
// It will be initialized on the first user interaction (playing a sound).
let audioContext: AudioContext | null = null;

const initializeAudioContext = () => {
    if (!audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
};

const playBeep = (volume: number) => {
    if (!audioContext) return;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A4 note
    gainNode.gain.setValueAtTime(0.5 * volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
};

const playSiren = (volume: number) => {
    if (!audioContext) return;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.linearRampToValueAtTime(1200, audioContext.currentTime + 0.5);
    oscillator.frequency.linearRampToValueAtTime(800, audioContext.currentTime + 1);

    gainNode.gain.setValueAtTime(0.3 * volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 1);
};

const playChime = (volume: number) => {
    if (!audioContext) return;
    const playNote = (frequency: number, startTime: number) => {
        const oscillator = audioContext!.createOscillator();
        const gainNode = audioContext!.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext!.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, startTime);
        gainNode.gain.setValueAtTime(0.4 * volume, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + 1);

        oscillator.start(startTime);
        oscillator.stop(startTime + 1);
    };

    playNote(1046.50, audioContext.currentTime); // C6
    playNote(1396.91, audioContext.currentTime + 0.2); // F6
};

const playVibration = () => {
    if ('vibrate' in navigator) {
        navigator.vibrate([500, 100, 500]);
    } else {
        console.warn('Vibration API not supported on this device.');
    }
};


export const playSound = (soundName: string, volume: number) => {
    initializeAudioContext();
    
    // Vibration is not affected by volume, so we handle it separately
    if (soundName === 'vibration') {
        playVibration();
        return;
    }

    switch(soundName) {
        case 'default':
            playBeep(volume);
            break;
        case 'siren':
            playSiren(volume);
            break;
        case 'chime':
            playChime(volume);
            break;
        default:
            console.warn(`Unknown sound name: ${soundName}`);
            playBeep(volume);
    }
};