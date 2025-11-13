export class Task {
  constructor(
    public readonly id: number,
    public readonly userId: number,
    public readonly projectId: number | null,
    public readonly title: string,
    public readonly description: string | null,
    public readonly status: 'pending' | 'completed',
    public readonly priority: 'low' | 'medium' | 'high' | null,
    public readonly dueDate: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  /**
   * Check if the task is owned by a specific user
   * @param userId - User ID to check ownership
   * @returns true if the task belongs to the user
   */
  isOwnedBy(userId: number): boolean {
    return this.userId === userId;
  }

  /**
   * Check if the task belongs to a specific project
   * @param projectId - Project ID to check
   * @returns true if the task belongs to the project
   */
  belongsToProject(projectId: number): boolean {
    return this.projectId === projectId;
  }

  /**
   * Check if the task is standalone (not assigned to any project)
   * @returns true if the task has no project
   */
  isStandalone(): boolean {
    return this.projectId === null;
  }

  /**
   * Check if the task is completed
   * @returns true if the task status is completed
   */
  isCompleted(): boolean {
    return this.status === 'completed';
  }

  /**
   * Check if the task is overdue
   * @returns true if the task has a due date and it's in the past
   */
  isOverdue(): boolean {
    if (!this.dueDate) {
      return false;
    }
    return this.dueDate < new Date() && !this.isCompleted();
  }

  /**
   * Get the priority level as a number for sorting
   * @returns numeric priority (3=high, 2=medium, 1=low, 0=no priority)
   */
  getPriorityValue(): number {
    switch (this.priority) {
      case 'high':
        return 3;
      case 'medium':
        return 2;
      case 'low':
        return 1;
      default:
        return 0;
    }
  }
}
