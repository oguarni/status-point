export type UserRole = 'admin' | 'gestor' | 'colaborador';

export class User {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly role: UserRole,
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
   * Check if user has admin role
   * @returns true if user is admin
   */
  isAdmin(): boolean {
    return this.role === 'admin';
  }

  /**
   * Check if user has gestor role
   * @returns true if user is gestor
   */
  isGestor(): boolean {
    return this.role === 'gestor';
  }

  /**
   * Check if user has colaborador role
   * @returns true if user is colaborador
   */
  isColaborador(): boolean {
    return this.role === 'colaborador';
  }

  /**
   * Check if user has permission to manage users
   * @returns true if user is admin
   */
  canManageUsers(): boolean {
    return this.isAdmin();
  }

  /**
   * Check if user has permission to create projects
   * @returns true if user is admin or gestor
   */
  canCreateProjects(): boolean {
    return this.isAdmin() || this.isGestor();
  }

  /**
   * Check if user has permission to manage projects
   * @returns true if user is admin or gestor
   */
  canManageProjects(): boolean {
    return this.isAdmin() || this.isGestor();
  }

  /**
   * Get a safe representation of the user (without password)
   * @returns object with safe user data
   */
  toSafeObject(): { id: number; name: string; email: string; role: UserRole } {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      role: this.role,
    };
  }
}
