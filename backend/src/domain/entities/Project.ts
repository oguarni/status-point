export class Project {
  constructor(
    public readonly id: number,
    public readonly gestorId: number,
    public readonly title: string,
    public readonly description: string | null,
    public readonly deadline: Date,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  /**
   * Check if the project is managed by a specific user
   * @param userId - User ID to check
   * @returns true if the user is the project gestor
   */
  isManagedBy(userId: number): boolean {
    return this.gestorId === userId;
  }

  /**
   * Check if the project deadline has passed
   * @returns true if the deadline is in the past
   */
  isOverdue(): boolean {
    return this.deadline < new Date();
  }

  /**
   * Get days remaining until deadline
   * @returns number of days (negative if overdue)
   */
  getDaysRemaining(): number {
    const now = new Date();
    const diff = this.deadline.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * Check if project is urgent (deadline within 7 days)
   * @returns true if deadline is within 7 days
   */
  isUrgent(): boolean {
    const daysRemaining = this.getDaysRemaining();
    return daysRemaining >= 0 && daysRemaining <= 7;
  }
}
