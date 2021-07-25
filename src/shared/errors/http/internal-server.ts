export class InternalServerError extends Error {
  constructor() {
    super('Internal sever error');
    this.name = 'InternalServerError';
  }
}
