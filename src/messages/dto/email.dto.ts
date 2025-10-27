import { Address } from 'nodemailer/lib/mailer';

export class emailDto {
  sender?: Address;
  recipients: string;
  subject: string;
  html: string;
  text?: string;
}
