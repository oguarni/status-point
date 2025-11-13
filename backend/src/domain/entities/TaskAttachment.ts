export class TaskAttachment {
  constructor(
    public readonly id: number,
    public readonly taskId: number,
    public readonly userId: number,
    public readonly filename: string,
    public readonly filepath: string,
    public readonly filesize: number,
    public readonly mimetype: string,
    public readonly createdAt: Date
  ) {}

  /**
   * Check if attachment was uploaded by a specific user
   * @param userId - User ID to check
   * @returns true if user uploaded the attachment
   */
  isUploadedBy(userId: number): boolean {
    return this.userId === userId;
  }

  /**
   * Get file extension
   * @returns file extension
   */
  getFileExtension(): string {
    return this.filename.split('.').pop() || '';
  }

  /**
   * Check if file is an image
   * @returns true if mimetype is image
   */
  isImage(): boolean {
    return this.mimetype.startsWith('image/');
  }
}
