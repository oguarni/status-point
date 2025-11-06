export class User {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  /**
   * Check if the email is valid
   * @returns true if the email format is valid
   */
  hasValidEmail(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.email);
  }

  /**
   * Get the user's display name
   * @returns the user's name
   */
  getDisplayName(): string {
    return this.name;
  }

  /**
   * Get a safe representation of the user (without password)
   * @returns object with safe user data
   */
  toSafeObject(): { id: number; name: string; email: string } {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
    };
  }
}
