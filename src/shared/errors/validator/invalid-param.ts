export class InvalidParamError extends Error {
  constructor(param: string) {
    super(`The param: ${param} is invalid`);
    this.name = 'InvalidParamError';
  }
}
