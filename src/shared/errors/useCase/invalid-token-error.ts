export class InvalidTokenError extends Error {
  constructor() {
    super('Invalid token');
    this.message = 'InvalidTokenError';
  }
}
