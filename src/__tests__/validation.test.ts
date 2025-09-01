import { describe, it, expect } from 'vitest';
import { isValidContact } from '../utils/validation';

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
