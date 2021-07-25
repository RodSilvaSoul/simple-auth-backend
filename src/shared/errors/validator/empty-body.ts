export class EmptyBodyError extends Error {
  constructor() {
    super('The body requesition is empty');
    this.name = 'EmptyBodyError';
  }
}
