/**
 * Password validation utilities for Cognito-compatible password requirements
 * 
 * AWS Cognito default password policy requires:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter  
 * - At least one number
 * - At least one special character
 * - No spaces allowed
 */

export const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: 8,
  UPPERCASE_REGEX: /[A-Z]/,
  LOWERCASE_REGEX: /[a-z]/,
  NUMBER_REGEX: /\d/,
  SPECIAL_CHAR_REGEX: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
  NO_SPACES_REGEX: /^\S*$/,
};

export const PASSWORD_REQUIREMENTS_TEXT = 
  'Must contain: 8+ characters, uppercase, lowercase, number, and special character. No spaces.';

export const PASSWORD_ERROR_MESSAGE = 
  'Password must contain: 8+ characters, uppercase letter, lowercase letter, number, and special character. No spaces allowed.';

/**
 * Validates if a password meets Cognito requirements
 */
export function validatePassword(password: string): boolean {
  if (!password) return false;
  
  return (
    password.length >= PASSWORD_REQUIREMENTS.MIN_LENGTH &&
    PASSWORD_REQUIREMENTS.UPPERCASE_REGEX.test(password) &&
    PASSWORD_REQUIREMENTS.LOWERCASE_REGEX.test(password) &&
    PASSWORD_REQUIREMENTS.NUMBER_REGEX.test(password) &&
    PASSWORD_REQUIREMENTS.SPECIAL_CHAR_REGEX.test(password) &&
    PASSWORD_REQUIREMENTS.NO_SPACES_REGEX.test(password)
  );
}

/**
 * Gets detailed validation results for real-time feedback
 */
export function getPasswordValidationDetails(password: string) {
  const details = {
    minLength: password.length >= PASSWORD_REQUIREMENTS.MIN_LENGTH,
    hasUppercase: PASSWORD_REQUIREMENTS.UPPERCASE_REGEX.test(password),
    hasLowercase: PASSWORD_REQUIREMENTS.LOWERCASE_REGEX.test(password),
    hasNumber: PASSWORD_REQUIREMENTS.NUMBER_REGEX.test(password),
    hasSpecialChar: PASSWORD_REQUIREMENTS.SPECIAL_CHAR_REGEX.test(password),
    noSpaces: PASSWORD_REQUIREMENTS.NO_SPACES_REGEX.test(password),
  };
  
  return {
    ...details,
    isValid: Object.values(details).every(Boolean),
  };
}

/**
 * Gets user-friendly validation messages
 */
export function getPasswordValidationMessages(password: string) {
  const details = getPasswordValidationDetails(password);
  
  const messages = [];
  if (!details.minLength) {
    messages.push(`At least ${PASSWORD_REQUIREMENTS.MIN_LENGTH} characters`);
  }
  if (!details.hasUppercase) {
    messages.push('One uppercase letter');
  }
  if (!details.hasLowercase) {
    messages.push('One lowercase letter');
  }
  if (!details.hasNumber) {
    messages.push('One number');
  }
  if (!details.hasSpecialChar) {
    messages.push('One special character');
  }
  if (!details.noSpaces) {
    messages.push('No spaces allowed');
  }
  
  return messages;
}
