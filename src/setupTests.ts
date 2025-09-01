import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock the geolocation API
const mockGeolocation = {
  getCurrentPosition: vi.fn(),
  watchPosition: vi.fn(),
  clearWatch: vi.fn(),
};

Object.defineProperty(global.navigator, 'geolocation', {
  value: mockGeolocation,
  writable: true,
});

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
  removeItem: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

// Mock service worker
Object.defineProperty(window, 'serviceWorker', {
  value: {
    register: vi.fn().mockResolvedValue({ scope: 'http://localhost:3000/' }),
    ready: Promise.resolve({ active: { postMessage: vi.fn() } }),
  },
});

// Mock Web Speech API
const mockSpeechRecognition = {
  start: vi.fn(),
  stop: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
};

Object.defineProperty(window, 'SpeechRecognition', {
  value: vi.fn().mockImplementation(() => mockSpeechRecognition),
  writable: true,
});

Object.defineProperty(window, 'webkitSpeechRecognition', {
  value: vi.fn().mockImplementation(() => mockSpeechRecognition),
  writable: true,
});

// Mock Web Audio API
window.AudioContext = vi.fn().mockImplementation(() => ({
  createOscillator: vi.fn().mockReturnValue({
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  }),
  createGain: vi.fn().mockReturnValue({
    connect: vi.fn(),
    gain: { value: 0 },
  }),
}));
