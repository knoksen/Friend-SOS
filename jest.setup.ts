import '@testing-library/jest-dom';
import { jest } from '@jest/globals';

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

// Mock the Geolocation API
const mockGeolocation = {
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn()
};

Object.defineProperty(navigator, 'geolocation', {
  value: mockGeolocation,
  configurable: true
});

// Mock the Web Speech API
const mockSpeechRecognition = {
  start: jest.fn(),
  stop: jest.fn(),
  abort: jest.fn(),
  addEventListener: jest.fn()
};

window.SpeechRecognition = jest.fn(() => mockSpeechRecognition) as unknown as typeof SpeechRecognition;
window.webkitSpeechRecognition = jest.fn(() => mockSpeechRecognition) as unknown as typeof SpeechRecognition;

// Mock localStorage
const mockLocalStorage = {
  length: 0,
  key: jest.fn(),
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  configurable: true
});
