/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Task validator for business rules
 */
export class TaskValidator {
  /**
   * Validate task creation data
   * @param data - Task creation data
   * @returns Validation result
   */
  static validateCreate(data: any): ValidationResult {
    const errors: string[] = [];

    // Title validation
    if (data.title === undefined || data.title === null) {
      errors.push('Title is required');
    } else if (typeof data.title !== 'string') {
      errors.push('Title must be a string');
    } else if (data.title.trim().length === 0) {
      errors.push('Title cannot be empty');
    } else if (data.title.length > 255) {
      errors.push('Title is too long (maximum 255 characters)');
    }

    // Description validation
    if (data.description !== undefined && data.description !== null) {
      if (typeof data.description !== 'string') {
        errors.push('Description must be a string');
      } else if (data.description.length > 5000) {
        errors.push('Description is too long (maximum 5000 characters)');
      }
    }

    // Priority validation
    if (data.priority !== undefined && data.priority !== null) {
      if (!['low', 'medium', 'high'].includes(data.priority)) {
        errors.push('Priority must be one of: low, medium, high');
      }
    }

    // Due date validation
    if (data.due_date !== undefined && data.due_date !== null) {
      const dueDate = new Date(data.due_date);
      if (isNaN(dueDate.getTime())) {
        errors.push('Due date must be a valid date');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate task update data
   * @param data - Task update data
   * @returns Validation result
   */
  static validateUpdate(data: any): ValidationResult {
    const errors: string[] = [];

    // Title validation (optional for update)
    if (data.title !== undefined) {
      if (typeof data.title !== 'string') {
        errors.push('Title must be a string');
      } else if (data.title.trim().length === 0) {
        errors.push('Title cannot be empty');
      } else if (data.title.length > 255) {
        errors.push('Title is too long (maximum 255 characters)');
      }
    }

    // Description validation
    if (data.description !== undefined && data.description !== null) {
      if (typeof data.description !== 'string') {
        errors.push('Description must be a string');
      } else if (data.description.length > 5000) {
        errors.push('Description is too long (maximum 5000 characters)');
      }
    }

    // Status validation
    if (data.status !== undefined) {
      if (!['pending', 'completed'].includes(data.status)) {
        errors.push('Status must be one of: pending, completed');
      }
    }

    // Priority validation
    if (data.priority !== undefined && data.priority !== null) {
      if (!['low', 'medium', 'high'].includes(data.priority)) {
        errors.push('Priority must be one of: low, medium, high');
      }
    }

    // Due date validation
    if (data.due_date !== undefined && data.due_date !== null) {
      const dueDate = new Date(data.due_date);
      if (isNaN(dueDate.getTime())) {
        errors.push('Due date must be a valid date');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
