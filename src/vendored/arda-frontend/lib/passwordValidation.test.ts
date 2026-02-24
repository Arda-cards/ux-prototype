import { describe, it, expect } from '@jest/globals';
import {
  validatePassword,
  getPasswordValidationDetails,
  getPasswordValidationMessages,
  PASSWORD_REQUIREMENTS_TEXT,
  PASSWORD_ERROR_MESSAGE,
} from '@frontend/lib/passwordValidation';

describe('passwordValidation', () => {
  describe('validatePassword', () => {
    it('returns false for empty string', () => {
      expect(validatePassword('')).toBe(false);
    });

    it('returns false for null/undefined coerced input', () => {
      // The function parameter is typed as string but we test falsy coercion path
      expect(validatePassword(null as unknown as string)).toBe(false);
      expect(validatePassword(undefined as unknown as string)).toBe(false);
    });

    it('returns false for password shorter than 8 chars meeting all other rules', () => {
      // "Ab1!xyz" is 7 chars, has upper, lower, number, special char, no spaces
      expect(validatePassword('Ab1!xyz')).toBe(false);
    });

    it('returns false when no uppercase letter present', () => {
      // 8+ chars, lower, number, special, no spaces — missing uppercase
      expect(validatePassword('abcdefg1!')).toBe(false);
    });

    it('returns false when no lowercase letter present', () => {
      // 8+ chars, upper, number, special, no spaces — missing lowercase
      expect(validatePassword('ABCDEFG1!')).toBe(false);
    });

    it('returns false when no number present', () => {
      // 8+ chars, upper, lower, special, no spaces — missing number
      expect(validatePassword('Abcdefgh!')).toBe(false);
    });

    it('returns false when no special character present', () => {
      // 8+ chars, upper, lower, number, no spaces — missing special char
      expect(validatePassword('Abcdefg1')).toBe(false);
    });

    it('returns false when password contains spaces', () => {
      // Has space — otherwise meets all other rules
      expect(validatePassword('Ab cde1!x')).toBe(false);
    });

    it('returns true for valid password meeting all rules', () => {
      expect(validatePassword('Abcdef1!')).toBe(true);
    });

    it('returns true for exactly 8 chars meeting all rules (boundary)', () => {
      // Exactly 8 characters: uppercase, lowercase, number, special char, no spaces
      expect(validatePassword('Abcde1!x')).toBe(true);
    });

    it('returns true for long password (100+ chars) meeting all rules', () => {
      const longPassword = 'Abcdef1!' + 'a'.repeat(92); // 100 chars total
      expect(validatePassword(longPassword)).toBe(true);
    });
  });

  describe('getPasswordValidationDetails', () => {
    it('returns all fields false for empty string', () => {
      const details = getPasswordValidationDetails('');
      expect(details.minLength).toBe(false);
      expect(details.hasUppercase).toBe(false);
      expect(details.hasLowercase).toBe(false);
      expect(details.hasNumber).toBe(false);
      expect(details.hasSpecialChar).toBe(false);
      // noSpaces is true for empty string (regex ^\S*$ matches empty)
      expect(details.isValid).toBe(false);
    });

    it('returns correct breakdown when only uppercase is missing', () => {
      // "abcdefg1!" — 9 chars, lower, number, special, no spaces — no uppercase
      const details = getPasswordValidationDetails('abcdefg1!');
      expect(details.minLength).toBe(true);
      expect(details.hasUppercase).toBe(false);
      expect(details.hasLowercase).toBe(true);
      expect(details.hasNumber).toBe(true);
      expect(details.hasSpecialChar).toBe(true);
      expect(details.noSpaces).toBe(true);
      expect(details.isValid).toBe(false);
    });

    it('returns isValid true only when all checks pass', () => {
      const details = getPasswordValidationDetails('Abcdef1!');
      expect(details.minLength).toBe(true);
      expect(details.hasUppercase).toBe(true);
      expect(details.hasLowercase).toBe(true);
      expect(details.hasNumber).toBe(true);
      expect(details.hasSpecialChar).toBe(true);
      expect(details.noSpaces).toBe(true);
      expect(details.isValid).toBe(true);
    });

    it('returns isValid false when minLength rule fails', () => {
      const details = getPasswordValidationDetails('Ab1!xyz'); // 7 chars
      expect(details.minLength).toBe(false);
      expect(details.isValid).toBe(false);
    });

    it('returns isValid false when hasUppercase rule fails', () => {
      const details = getPasswordValidationDetails('abcdefg1!');
      expect(details.hasUppercase).toBe(false);
      expect(details.isValid).toBe(false);
    });

    it('returns isValid false when hasLowercase rule fails', () => {
      const details = getPasswordValidationDetails('ABCDEFG1!');
      expect(details.hasLowercase).toBe(false);
      expect(details.isValid).toBe(false);
    });

    it('returns isValid false when hasNumber rule fails', () => {
      const details = getPasswordValidationDetails('Abcdefgh!');
      expect(details.hasNumber).toBe(false);
      expect(details.isValid).toBe(false);
    });

    it('returns isValid false when hasSpecialChar rule fails', () => {
      const details = getPasswordValidationDetails('Abcdefg1');
      expect(details.hasSpecialChar).toBe(false);
      expect(details.isValid).toBe(false);
    });

    it('returns noSpaces false when password has a space', () => {
      const details = getPasswordValidationDetails('Ab cde1!x');
      expect(details.noSpaces).toBe(false);
      expect(details.isValid).toBe(false);
    });
  });

  describe('getPasswordValidationMessages', () => {
    it('returns messages for all failing rules for empty string (5 messages, noSpaces passes)', () => {
      const messages = getPasswordValidationMessages('');
      // noSpaces is true for empty string (^\S*$ matches zero non-space chars),
      // so only the other 5 rules fail and produce messages.
      expect(messages).toContain('At least 8 characters');
      expect(messages).toContain('One uppercase letter');
      expect(messages).toContain('One lowercase letter');
      expect(messages).toContain('One number');
      expect(messages).toContain('One special character');
      expect(messages).toHaveLength(5);
    });

    it('returns empty array for valid password', () => {
      const messages = getPasswordValidationMessages('Abcdef1!');
      expect(messages).toHaveLength(0);
      expect(messages).toEqual([]);
    });

    it('returns only "One uppercase letter" message when only uppercase is missing', () => {
      // "abcdefg1!" — 9 chars, lower, number, special, no spaces — no uppercase
      const messages = getPasswordValidationMessages('abcdefg1!');
      expect(messages).toEqual(['One uppercase letter']);
    });

    it('returns "No spaces allowed" message when password has space but otherwise valid', () => {
      // "Ab cde1!x" — has space but all other rules met
      const messages = getPasswordValidationMessages('Ab cde1!x');
      expect(messages).toContain('No spaces allowed');
    });

    it('returns multiple messages when multiple rules fail', () => {
      // "abc" — too short, no uppercase, no number, no special char, no spaces (noSpaces ok)
      const messages = getPasswordValidationMessages('abc');
      expect(messages).toContain('At least 8 characters');
      expect(messages).toContain('One uppercase letter');
      expect(messages).toContain('One number');
      expect(messages).toContain('One special character');
      expect(messages.length).toBeGreaterThan(1);
    });
  });

  describe('constants', () => {
    it('PASSWORD_REQUIREMENTS_TEXT is a non-empty string', () => {
      expect(typeof PASSWORD_REQUIREMENTS_TEXT).toBe('string');
      expect(PASSWORD_REQUIREMENTS_TEXT.length).toBeGreaterThan(0);
    });

    it('PASSWORD_ERROR_MESSAGE is a non-empty string', () => {
      expect(typeof PASSWORD_ERROR_MESSAGE).toBe('string');
      expect(PASSWORD_ERROR_MESSAGE.length).toBeGreaterThan(0);
    });
  });
});
