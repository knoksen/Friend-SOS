import { describe, it, expect } from 'vitest';
import { 
  isValidContact, 
  validateLocation, 
  validatePhoneNumber, 
  validateSettings,
  getContactType,
  formatPhoneNumberForURL
} from '../../utils/validation';

describe('isValidContact', () => {
  it('validates email addresses correctly', () => {
    // Valid emails
    expect(isValidContact('test@example.com')).toBe(true);
    expect(isValidContact('user.name+tag@example.co.uk')).toBe(true);
    expect(isValidContact('user@subdomain.example.com')).toBe(true);
    
    // Invalid emails
    expect(isValidContact('not.an.email')).toBe(false);
    expect(isValidContact('@example.com')).toBe(false);
    expect(isValidContact('test@')).toBe(false);
    expect(isValidContact('test@.com')).toBe(false);
  });

  it('validates phone numbers correctly', () => {
    // Valid phone numbers
    expect(isValidContact('+1234567890')).toBe(true);
    expect(isValidContact('123-456-7890')).toBe(true);
    expect(isValidContact('(123) 456-7890')).toBe(true);
    expect(isValidContact('1234567890')).toBe(true);
    
    // Invalid phone numbers
    expect(isValidContact('123')).toBe(false);
    expect(isValidContact('abc-def-ghij')).toBe(false);
    expect(isValidContact('++1234567890')).toBe(false);
  });

  it('handles edge cases correctly', () => {
    expect(isValidContact('')).toBe(false);
    expect(isValidContact(' ')).toBe(false);
    expect(isValidContact('null')).toBe(false);
    expect(isValidContact('undefined')).toBe(false);
  });
});

describe('validateLocation', () => {
  it('validates valid location objects', () => {
    expect(validateLocation({ latitude: 0, longitude: 0 })).toBe(true);
    expect(validateLocation({ latitude: 90, longitude: 180 })).toBe(true);
    expect(validateLocation({ latitude: -90, longitude: -180 })).toBe(true);
    expect(validateLocation({ 
      latitude: 45.5, 
      longitude: -122.6, 
      accuracy: 10, 
      timestamp: Date.now() 
    })).toBe(true);
  });

  it('invalidates locations with out-of-range coordinates', () => {
    expect(validateLocation({ latitude: 91, longitude: 0 })).toBe(false);
    expect(validateLocation({ latitude: -91, longitude: 0 })).toBe(false);
    expect(validateLocation({ latitude: 0, longitude: 181 })).toBe(false);
    expect(validateLocation({ latitude: 0, longitude: -181 })).toBe(false);
  });

  it('invalidates locations with invalid coordinate types', () => {
    expect(validateLocation({ latitude: '50' as any, longitude: 0 })).toBe(false);
    expect(validateLocation({ latitude: 0, longitude: '100' as any })).toBe(false);
    expect(validateLocation({ latitude: NaN, longitude: 0 })).toBe(false);
    expect(validateLocation({ latitude: 0, longitude: NaN })).toBe(false);
  });

  it('handles invalid inputs', () => {
    expect(validateLocation(null as any)).toBe(false);
    expect(validateLocation(undefined as any)).toBe(false);
    expect(validateLocation({} as any)).toBe(false);
  });
});

describe('validateSettings', () => {
  it('validates complete valid settings objects', () => {
    expect(validateSettings({
      enableSound: true,
      soundType: 'alert',
      contacts: ['test@example.com', '+1234567890'],
      messageTemplate: 'Help! {location}',
      checkInInterval: 30
    })).toBe(true);
  });

  it('validates partial valid settings objects', () => {
    expect(validateSettings({ enableSound: true })).toBe(true);
    expect(validateSettings({ soundType: 'alert' })).toBe(true);
    expect(validateSettings({ contacts: ['test@example.com'] })).toBe(true);
  });

  it('invalidates settings with wrong types', () => {
    expect(validateSettings({ enableSound: 'true' as any })).toBe(false);
    expect(validateSettings({ soundType: true as any })).toBe(false);
    expect(validateSettings({ contacts: 'test@example.com' as any })).toBe(false);
    expect(validateSettings({ messageTemplate: '' })).toBe(false);
    expect(validateSettings({ checkInInterval: -1 })).toBe(false);
  });

  it('handles invalid inputs', () => {
    expect(validateSettings(null as any)).toBe(false);
    expect(validateSettings(undefined as any)).toBe(false);
    expect(validateSettings({
      contacts: ['test@example.com', null]
    } as any)).toBe(false);
  });
});

describe('getContactType', () => {
  it('identifies email addresses correctly', () => {
    expect(getContactType('test@example.com')).toBe('email');
    expect(getContactType('user.name+tag@example.co.uk')).toBe('email');
    expect(getContactType('user@subdomain.example.com')).toBe('email');
  });

  it('identifies phone numbers correctly', () => {
    expect(getContactType('+1234567890')).toBe('phone');
    expect(getContactType('123-456-7890')).toBe('phone');
    expect(getContactType('(123) 456-7890')).toBe('phone');
  });

  it('returns unknown for invalid contacts', () => {
    expect(getContactType('')).toBe('unknown');
    expect(getContactType('not-valid')).toBe('unknown');
    expect(getContactType('@invalid.com')).toBe('unknown');
    expect(getContactType('123')).toBe('unknown');
  });
});

describe('formatPhoneNumberForURL', () => {
  it('formats phone numbers correctly', () => {
    expect(formatPhoneNumberForURL('+1-234-567-8900')).toBe('+12345678900');
    expect(formatPhoneNumberForURL('(123) 456-7890')).toBe('1234567890');
    expect(formatPhoneNumberForURL('123.456.7890')).toBe('1234567890');
    expect(formatPhoneNumberForURL('123 456 7890')).toBe('1234567890');
  });

  it('preserves leading plus signs', () => {
    expect(formatPhoneNumberForURL('+12345678900')).toBe('+12345678900');
    expect(formatPhoneNumberForURL('+1 (234) 567-8900')).toBe('+12345678900');
  });

  it('handles edge cases', () => {
    expect(formatPhoneNumberForURL('')).toBe('');
    expect(formatPhoneNumberForURL('abc123def')).toBe('123');
    expect(formatPhoneNumberForURL('++1234567890')).toBe('+1234567890');
  });
});
