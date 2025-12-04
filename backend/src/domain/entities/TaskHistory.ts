export class TaskHistory {
  constructor(
    public readonly id: number,
    public readonly taskId: number,
    public readonly userId: number,
    public readonly previousStatus: 'todo' | 'in_progress' | 'completed' | 'blocked' | null,
    public readonly newStatus: 'todo' | 'in_progress' | 'completed' | 'blocked',
    public readonly createdAt: Date
  ) {}

  /**
   * Check if this was a completion action
   * @returns true if task was marked as completed
   */
  isCompletion(): boolean {
    return this.newStatus === 'completed' && this.previousStatus !== 'completed';
  }

  /**
   * Check if this was a reopening action
   * @returns true if completed task was reopened
   */
  isReopening(): boolean {
    return this.previousStatus === 'completed' && (this.newStatus === 'todo' || this.newStatus === 'in_progress');
  }

  /**
   * Check if task was blocked
   * @returns true if task was marked as blocked
   */
  isBlocking(): boolean {
    return this.newStatus === 'blocked' && this.previousStatus !== 'blocked';
  }

  /**
   * Check if task was unblocked
   * @returns true if blocked task was unblocked
   */
  isUnblocking(): boolean {
    return this.previousStatus === 'blocked' && this.newStatus !== 'blocked';
  }
}
