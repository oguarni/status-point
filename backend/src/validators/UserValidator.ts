/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * User validator for business rules
 */
export class UserValidator {
  /**
   * Validate user registration data
   * @param data - User registration data
   * @returns Validation result
   */
  static validateRegister(data: any): ValidationResult {
    const errors: string[] = [];

    // Name validation
    if (!data.name) {
      errors.push('Name is required');
    } else if (typeof data.name !== 'string') {
      errors.push('Name must be a string');
    } else if (data.name.trim().length === 0) {
      errors.push('Name cannot be empty');
    } else if (data.name.length > 255) {
      errors.push('Name is too long (maximum 255 characters)');
    }

    // Email validation
    if (!data.email) {
      errors.push('Email is required');
    } else if (typeof data.email !== 'string') {
      errors.push('Email must be a string');
    } else if (!this.isValidEmail(data.email)) {
      errors.push('Email format is invalid');
    }

    // Password validation
    if (!data.password) {
      errors.push('Password is required');
    } else if (typeof data.password !== 'string') {
      errors.push('Password must be a string');
    } else if (data.password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    } else if (data.password.length > 100) {
      errors.push('Password is too long (maximum 100 characters)');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate user login data
   * @param data - User login data
   * @returns Validation result
   */
  static validateLogin(data: any): ValidationResult {
    const errors: string[] = [];

    // Email validation
    if (!data.email) {
      errors.push('Email is required');
    } else if (typeof data.email !== 'string') {
      errors.push('Email must be a string');
    } else if (!this.isValidEmail(data.email)) {
      errors.push('Email format is invalid');
    }

    // Password validation
    if (!data.password) {
      errors.push('Password is required');
    } else if (typeof data.password !== 'string') {
      errors.push('Password must be a string');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check if email format is valid
   * @param email - Email to validate
   * @returns true if valid, false otherwise
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
