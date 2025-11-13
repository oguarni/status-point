interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * ProjectValidator class - Business Rule Validation
 */
export class ProjectValidator {
  /**
   * Validate project creation data
   * @param data - Project creation data
   * @returns Validation result
   */
  static validateCreate(data: any): ValidationResult {
    const errors: string[] = [];

    // Title validation
    if (!data.title) {
      errors.push('Title is required');
    } else if (data.title.trim().length === 0) {
      errors.push('Title cannot be empty');
    } else if (data.title.length > 255) {
      errors.push('Title is too long (maximum 255 characters)');
    }

    // Description validation
    if (data.description && data.description.length > 5000) {
      errors.push('Description is too long (maximum 5000 characters)');
    }

    // Deadline validation
    if (!data.deadline) {
      errors.push('Deadline is required');
    } else {
      const deadline = new Date(data.deadline);
      if (isNaN(deadline.getTime())) {
        errors.push('Deadline must be a valid date');
      } else {
        const now = new Date();
        if (deadline < now) {
          errors.push('Deadline cannot be in the past');
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate project update data
   * @param data - Project update data
   * @returns Validation result
   */
  static validateUpdate(data: any): ValidationResult {
    const errors: string[] = [];

    // Title validation (optional for update)
    if (data.title !== undefined) {
      if (data.title.trim().length === 0) {
        errors.push('Title cannot be empty');
      } else if (data.title.length > 255) {
        errors.push('Title is too long (maximum 255 characters)');
      }
    }

    // Description validation
    if (data.description !== undefined && data.description && data.description.length > 5000) {
      errors.push('Description is too long (maximum 5000 characters)');
    }

    // Deadline validation (optional for update)
    if (data.deadline !== undefined) {
      const deadline = new Date(data.deadline);
      if (isNaN(deadline.getTime())) {
        errors.push('Deadline must be a valid date');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
