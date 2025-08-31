import { jest } from '@jest/globals';
import { playSound } from '../soundService';

describe('soundService', () => {
  let mockAudioContext: any;
  let mockOscillator: any;
  let mockGainNode: any;

  beforeEach(() => {
    // Mock Audio Context and related classes
    mockOscillator = {
      connect: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
      frequency: {
        setValueAtTime: jest.fn(),
        linearRampToValueAtTime: jest.fn()
      },
      type: 'sine'
    };

    mockGainNode = {
      connect: jest.fn(),
      gain: {
        setValueAtTime: jest.fn(),
        exponentialRampToValueAtTime: jest.fn()
      }
    };

    mockAudioContext = {
      createOscillator: jest.fn(() => mockOscillator),
      createGain: jest.fn(() => mockGainNode),
      currentTime: 0,
      destination: {}
    };

    // Mock the Web Audio API
    window.AudioContext = jest.fn(() => mockAudioContext);
    (window as any).webkitAudioContext = jest.fn(() => mockAudioContext);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('playSound', () => {
    it('should create oscillator and gain nodes for default sound', () => {
      playSound('default', 0.5);

      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
      expect(mockAudioContext.createGain).toHaveBeenCalled();
      expect(mockOscillator.connect).toHaveBeenCalledWith(mockGainNode);
      expect(mockGainNode.connect).toHaveBeenCalledWith(mockAudioContext.destination);
    });

    it('should trigger vibration for vibration sound type', () => {
      const mockVibrate = jest.fn(() => true);
      navigator.vibrate = mockVibrate as any;

      playSound('vibration', 1);

      expect(mockVibrate).toHaveBeenCalledWith([500, 100, 500]);
    });

    it('should use default beep for unknown sound names', () => {
      playSound('unknown', 0.5);

      expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(880, 0);
      expect(mockOscillator.start).toHaveBeenCalledWith(0);
      expect(mockOscillator.stop).toHaveBeenCalledWith(0.5);
    });

    it('should play siren with frequency modulation', () => {
      playSound('siren', 0.5);

      expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(800, 0);
      expect(mockOscillator.frequency.linearRampToValueAtTime).toHaveBeenCalledWith(1200, 0.5);
      expect(mockOscillator.start).toHaveBeenCalledWith(0);
      expect(mockOscillator.stop).toHaveBeenCalledWith(1);
    });
  });
});
