// Mock environment variables before importing the service
process.env.API_KEY = 'test-api-key';

import { jest } from '@jest/globals';
import { generateAlert } from '../geminiService';

jest.mock('@google/genai', () => {
  return {
    Type: {
      OBJECT: 'object',
      STRING: 'string'
    },
    GoogleGenAI: jest.fn().mockImplementation(() => ({
      models: {
        generateContent: jest.fn().mockResolvedValue({
          text: JSON.stringify({
            title: 'URGENT: SOS from John Doe',
            body: 'Help! I need assistance. - From: John Doe, To: Emergency Contact'
          })
        })
      }
    }))
  };
});

describe('geminiService', () => {
  describe('generateAlert', () => {
    it('should generate an alert message using Gemini', async () => {
      const alertMessage = await generateAlert(
        'John Doe',
        'Help! I need assistance.',
        'Emergency Contact',
        { temperature: 0.7 }
      );

      expect(alertMessage).toBeTruthy();
      expect(alertMessage.title).toBe('URGENT: SOS from John Doe');
      expect(alertMessage.body).toContain('John Doe');
      expect(alertMessage.body).toContain('Help! I need assistance.');
      expect(alertMessage.body).toContain('Emergency Contact');
    });

    it('should handle errors gracefully', async () => {
      // Get access to the mocked module
      const { GoogleGenAI } = require('@google/genai');
      const mockInstance = GoogleGenAI.mock.results[0].value;

      // Make this specific call throw an error
      mockInstance.models.generateContent.mockRejectedValueOnce(new Error('API Error'));

      await expect(
        generateAlert(
          'John Doe',
          'Help!',
          'Emergency Contact',
          { temperature: 0.7 }
        )
      ).rejects.toThrow('Failed to generate alert from AI service');
    });
  });
});
