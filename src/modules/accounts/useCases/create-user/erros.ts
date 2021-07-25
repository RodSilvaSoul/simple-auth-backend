export class EmailAlredyUseError extends Error {
  constructor(email: string) {
    super(`This email : ${email} is already in use`);
  }
}
