export class TaskComment {
  constructor(
    public readonly id: number,
    public readonly taskId: number,
    public readonly userId: number,
    public readonly content: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  /**
   * Check if comment is authored by a specific user
   * @param userId - User ID to check
   * @returns true if user authored the comment
   */
  isAuthoredBy(userId: number): boolean {
    return this.userId === userId;
  }
}
