import { TaskValidator } from './TaskValidator';

describe('TaskValidator', () => {
  describe('validateCreate', () => {
    it('should validate successfully with valid data', () => {
      const data = {
        title: 'Test Task',
        description: 'Test description',
        priority: 'high' as const,
      };

      const result = TaskValidator.validateCreate(data);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail when title is missing', () => {
      const data = {
        description: 'Test description',
      };

      const result = TaskValidator.validateCreate(data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Title is required');
    });

    it('should fail when title is empty string', () => {
      const data = {
        title: '',
      };

      const result = TaskValidator.validateCreate(data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Title cannot be empty');
    });

    it('should fail when title is too long', () => {
      const data = {
        title: 'a'.repeat(256),
      };

      const result = TaskValidator.validateCreate(data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Title is too long (maximum 255 characters)');
    });

    it('should fail when priority is invalid', () => {
      const data = {
        title: 'Test Task',
        priority: 'urgent',
      };

      const result = TaskValidator.validateCreate(data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Priority must be one of: low, medium, high');
    });

    it('should fail when due_date is invalid', () => {
      const data = {
        title: 'Test Task',
        due_date: 'not-a-date',
      };

      const result = TaskValidator.validateCreate(data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Due date must be a valid date');
    });

    it('should accept valid priority values', () => {
      const priorities = ['low', 'medium', 'high'];

      priorities.forEach((priority) => {
        const data = {
          title: 'Test Task',
          priority,
        };

        const result = TaskValidator.validateCreate(data);
        expect(result.isValid).toBe(true);
      });
    });
  });

  describe('validateUpdate', () => {
    it('should validate successfully with valid data', () => {
      const data = {
        title: 'Updated Task',
        status: 'completed' as const,
      };

      const result = TaskValidator.validateUpdate(data);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail when status is invalid', () => {
      const data = {
        title: 'Test Task',
        status: 'in-progress',
      };

      const result = TaskValidator.validateUpdate(data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Status must be one of: pending, completed');
    });

    it('should allow partial updates', () => {
      const data = {
        description: 'New description',
      };

      const result = TaskValidator.validateUpdate(data);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});
