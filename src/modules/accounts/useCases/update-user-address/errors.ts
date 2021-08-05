/* eslint-disable max-classes-per-file */
export class ErrorOnUpdated extends Error {
  constructor() {
    super('Error on update');
    this.name = 'ErrorOnUpdated';
  }
}

export class UserMustHaveAddressError extends Error {
  constructor() {
    super('A user must already have an address to update then.');
  }
}
