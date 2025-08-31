import { jest } from '@jest/globals';
import { validateLocation, validatePhoneNumber, validateSettings } from '../validation';

describe('validation', () => {
  describe('validateLocation', () => {
    it('should validate a valid location object', () => {
      const location = {
        latitude: 40.7128,
        longitude: -74.0060,
        accuracy: 10,
        timestamp: new Date().getTime()
      };

      expect(validateLocation(location)).toBe(true);
    });

    it('should reject an invalid location object', () => {
      const invalidLocation = {
        latitude: 91, // Invalid latitude (> 90)
        longitude: -74.0060,
        accuracy: 10,
        timestamp: new Date().getTime()
      };

      expect(validateLocation(invalidLocation)).toBe(false);
    });
  });

  describe('validatePhoneNumber', () => {
    it('should validate valid phone numbers', () => {
      const validNumbers = [
        '+1234567890',
        '123-456-7890',
        '(123) 456-7890'
      ];

      validNumbers.forEach(number => {
        expect(validatePhoneNumber(number)).toBe(true);
      });
    });

    it('should reject invalid phone numbers', () => {
      const invalidNumbers = [
        '123', // Too short
        'abc-def-ghij', // Contains letters
        '+1234567890123456' // Too long
      ];

      invalidNumbers.forEach(number => {
        expect(validatePhoneNumber(number)).toBe(false);
      });
    });
  });

  describe('validateSettings', () => {
    it('should validate valid settings object', () => {
      const settings = {
        enableSound: true,
        soundType: 'alert',
        contacts: ['+1234567890'],
        messageTemplate: 'emergency',
        checkInInterval: 30
      };

      expect(validateSettings(settings)).toBe(true);
    });

    it('should reject invalid settings object', () => {
      const invalidSettings = {
        enableSound: 'yes', // Should be boolean
        soundType: 123, // Should be string
        contacts: 'contact', // Should be array
        messageTemplate: '', // Empty string
        checkInInterval: -1 // Negative number
      };

      expect(validateSettings(invalidSettings)).toBe(false);
    });
  });
});
