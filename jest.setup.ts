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

// Mock fetch API
const mockFetch = jest.fn().mockImplementation((url: string | URL | Request) => {
  if (url.toString().includes('geocoding')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        road: 'Test Street',
        city: 'Test City',
        country: 'Test Country',
        postcode: '12345'
      }),
      text: () => Promise.resolve(''),
      status: 200,
      statusText: 'OK',
      headers: new Headers()
    } as Response);
  }
  
  if (url.toString().includes('emergency')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve([
        {
          name: 'Test Hospital',
          type: 'hospital',
          distance: 1000,
          coordinates: [0, 0]
        }
      ]),
      text: () => Promise.resolve(''),
      status: 200,
      statusText: 'OK',
      headers: new Headers()
    } as Response);
  }

  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    status: 200,
    statusText: 'OK',
    headers: new Headers()
  } as Response);
});

(global as any).fetch = mockFetch;
