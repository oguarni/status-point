import { UserValidator } from './UserValidator';

describe('UserValidator', () => {
  describe('validateRegister', () => {
    it('should validate successfully with valid data', () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const result = UserValidator.validateRegister(data);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail when name is missing', () => {
      const data = {
        email: 'john@example.com',
        password: 'password123',
      };

      const result = UserValidator.validateRegister(data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Name is required');
    });

    it('should fail when email is missing', () => {
      const data = {
        name: 'John Doe',
        password: 'password123',
      };

      const result = UserValidator.validateRegister(data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Email is required');
    });

    it('should fail when email format is invalid', () => {
      const data = {
        name: 'John Doe',
        email: 'invalid-email',
        password: 'password123',
      };

      const result = UserValidator.validateRegister(data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Email format is invalid');
    });

    it('should fail when password is too short', () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        password: '12345',
      };

      const result = UserValidator.validateRegister(data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 6 characters long');
    });

    it('should fail when password is missing', () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
      };

      const result = UserValidator.validateRegister(data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password is required');
    });
  });

  describe('validateLogin', () => {
    it('should validate successfully with valid data', () => {
      const data = {
        email: 'john@example.com',
        password: 'password123',
      };

      const result = UserValidator.validateLogin(data);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail when email is missing', () => {
      const data = {
        password: 'password123',
      };

      const result = UserValidator.validateLogin(data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Email is required');
    });

    it('should fail when password is missing', () => {
      const data = {
        email: 'john@example.com',
      };

      const result = UserValidator.validateLogin(data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password is required');
    });

    it('should fail when email format is invalid', () => {
      const data = {
        email: 'invalid-email',
        password: 'password123',
      };

      const result = UserValidator.validateLogin(data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Email format is invalid');
    });
  });
});
