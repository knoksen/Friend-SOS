// A simple regex for email validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// A flexible regex for phone numbers: allows digits, (), -, +, and spaces.
// Handles formats like: +1234567890, 123-456-7890, (123) 456-7890
const PHONE_REGEX = /^(?:\+?1[-\s]*)?(?:\([2-9]\d{2}\)|\d{3})[-.\s]*[2-9]\d{2}[-.\s]*\d{4}$/;

/**
 * Validates a location object.
 * @param {Object} location The location object to validate.
 * @returns {boolean} True if the location is valid, false otherwise.
 */
export const validateLocation = (location: {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}): boolean => {
  if (!location) return false;
  
  const { latitude, longitude } = location;
  
  // Check if coordinates are within valid ranges
  if (typeof latitude !== 'number' || latitude < -90 || latitude > 90) {
    return false;
  }
  
  if (typeof longitude !== 'number' || longitude < -180 || longitude > 180) {
    return false;
  }
  
  return true;
};

/**
 * Validates a phone number.
 * @param {string} phoneNumber The phone number to validate.
 * @returns {boolean} True if the phone number is valid, false otherwise.
 */
export const validatePhoneNumber = (phoneNumber: string): boolean => {
  if (!phoneNumber) return false;
  return PHONE_REGEX.test(phoneNumber);
};

/**
 * Validates a settings object.
 * @param {Object} settings The settings object to validate.
 * @returns {boolean} True if the settings are valid, false otherwise.
 */
export const validateSettings = (settings: {
  enableSound?: boolean;
  soundType?: string;
  contacts?: string[];
  messageTemplate?: string;
  checkInInterval?: number;
}): boolean => {
  if (!settings) return false;
  
  const { enableSound, soundType, contacts, messageTemplate, checkInInterval } = settings;
  
  // Check boolean type
  if (enableSound !== undefined && typeof enableSound !== 'boolean') {
    return false;
  }
  
  // Check string type
  if (soundType !== undefined && typeof soundType !== 'string') {
    return false;
  }
  
  // Check array type and contents
  if (contacts !== undefined) {
    if (!Array.isArray(contacts)) return false;
    if (!contacts.every(contact => typeof contact === 'string')) return false;
  }
  
  // Check non-empty string
  if (messageTemplate !== undefined) {
    if (typeof messageTemplate !== 'string' || !messageTemplate.trim()) {
      return false;
    }
  }
  
  // Check positive number
  if (checkInInterval !== undefined) {
    if (typeof checkInInterval !== 'number' || checkInInterval < 0) {
      return false;
    }
  }
  
  return true;
};

/**
 * Checks if a given string is a valid contact (either email or phone number).
 * @param {string} contact The contact string to validate.
 * @returns {boolean} True if the contact is valid, false otherwise.
 */
export const isValidContact = (contact: string): boolean => {
  const trimmedContact = contact.trim();
  if (!trimmedContact) return false;
  return EMAIL_REGEX.test(trimmedContact) || PHONE_REGEX.test(trimmedContact);
};

export type ContactType = 'phone' | 'email' | 'unknown';

/**
 * Determines the type of a contact string.
 * @param {string} contact The contact string to classify.
 * @returns {ContactType} The classified type ('phone', 'email', or 'unknown').
 */
export const getContactType = (contact: string): ContactType => {
  const trimmedContact = contact.trim();
  if (EMAIL_REGEX.test(trimmedContact)) return 'email';
  if (PHONE_REGEX.test(trimmedContact)) return 'phone';
  return 'unknown';
};

/**
 * Formats a phone number for use in URL schemes like 'tel:' or 'sms:'.
 * Removes all non-digit characters except for a leading '+'.
 * @param {string} phone The phone number string to format.
 * @returns {string} The formatted phone number.
 */
export const formatPhoneNumberForURL = (phone: string): string => {
  return phone.replace(/[^+\d]/g, '');
};
