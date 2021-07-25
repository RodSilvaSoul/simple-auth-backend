import { IMailProvider } from '../IMail-provider';

export class EmailProviderInMemory implements IMailProvider {
  emails = [];

  async sendMail(
    to: string,
    subject: string,
    variables: any,
    path: string,
  ): Promise<void> {
    this.emails.push({
      to, subject, variables, path,
    });
  }
}
