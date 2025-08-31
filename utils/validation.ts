// A simple regex for email validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// A lenient regex for phone numbers: allows digits, (), -, +, and spaces.
// Requires at least 7 digits to be considered a potential phone number.
const PHONE_REGEX = /^(?=.*\d)[\d\s()+-]{7,}$/;


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
