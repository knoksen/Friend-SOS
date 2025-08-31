import { jest } from '@jest/globals';
import { generateAlert } from '../geminiService';

// Mock the @google/genai module
jest.mock('@google/genai', () => ({
  GenerativeModel: jest.fn(() => ({
    generateContent: jest.fn(() => ({
      response: {
        text: jest.fn(() => 'Mocked alert message')
      }
    }))
  }))
}));

describe('geminiService', () => {
  describe('generateAlert', () => {
    it('should generate an alert message using Gemini', async () => {
      const location = {
        latitude: 40.7128,
        longitude: -74.0060,
        accuracy: 10,
        timestamp: new Date().getTime()
      };

      const alertMessage = await generateAlert({
        location,
        template: 'emergency',
        contacts: ['John Doe'],
        customMessage: 'Test emergency'
      });

      expect(alertMessage).toBeTruthy();
      expect(typeof alertMessage).toBe('string');
    });

    it('should handle errors gracefully', async () => {
      // Mock the GenerativeModel to throw an error
      jest.mock('@google/genai', () => ({
        GenerativeModel: jest.fn(() => ({
          generateContent: jest.fn(() => {
            throw new Error('API Error');
          })
        }))
      }));

      const location = {
        latitude: 40.7128,
        longitude: -74.0060,
        accuracy: 10,
        timestamp: new Date().getTime()
      };

      await expect(
        generateAlert({
          location,
          template: 'emergency',
          contacts: ['John Doe'],
          customMessage: 'Test emergency'
        })
      ).rejects.toThrow('API Error');
    });
  });
});
