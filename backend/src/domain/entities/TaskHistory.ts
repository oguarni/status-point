export class TaskHistory {
  constructor(
    public readonly id: number,
    public readonly taskId: number,
    public readonly userId: number,
    public readonly previousStatus: 'pending' | 'completed' | null,
    public readonly newStatus: 'pending' | 'completed',
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
    return this.previousStatus === 'completed' && this.newStatus === 'pending';
  }
}
