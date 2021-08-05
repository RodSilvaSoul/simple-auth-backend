export class UserNotFoundError extends Error {
  code: number;
  constructor() {
    super('User not found');
    this.name = 'UserNotFoundError';
    this.code = 404;
  }
}
