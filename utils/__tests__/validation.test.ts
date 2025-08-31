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
        '+12345678901',
        '+1 2345678901',
        '234-567-8901',
        '(234) 567-8901',
        '234.567.8901',
        '234 567 8901',
        '2345678901'
      ].map(num => num.trim());

      validNumbers.forEach(number => {
        expect(validatePhoneNumber(number)).toBe(true);
      });
    });

    it('should reject invalid phone numbers', () => {
      const invalidNumbers = [
        '123', // Too short
        'abc-def-ghij', // Contains letters
        '+1234567890123456', // Too long
        '12-34-56', // Incomplete
        '123.ABC.7890', // Contains letters
        '++1234567890', // Double plus
        ' ', // Empty/whitespace
        '(123)4567890' // Missing space after parentheses
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
        enableSound: true,
        soundType: 123 as any, // Should be string
        contacts: ['invalid-contact'], // Invalid contact format
        messageTemplate: '', // Empty string
        checkInInterval: -1 // Negative number
      };

      expect(validateSettings(invalidSettings)).toBe(false);
    });
  });
});
