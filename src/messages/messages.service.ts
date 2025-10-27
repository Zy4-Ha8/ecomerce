import { createTransport, Transporter } from 'nodemailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { emailDto } from './dto/email.dto';
import { MailOptions } from 'nodemailer/lib/json-transport';
import { Resend } from 'resend';
@Injectable()
export class MessagesService {
  private resend: Resend;

  constructor(private configService: ConfigService) {
    this.resend = new Resend(configService.get<string>('RESEND_API_KEY'));
  }

  async sendEmail(dto: emailDto) {
    const { sender, recipients, subject, html, text } = dto;

    try {
      const result = await this.resend.emails.send({
        from: 'onboarding@resend.dev',
        to: 'haiderumbra@gmail.com',
        subject: subject,
        html: html,
      });
      if (result.error) {
        console.error('❌ Resend Error:', result.error);
        return { success: false, error: result.error };
      }
      console.log('✅ Email sent! Message ID:', result.data?.id);
      return { success: true, messageId: result.data?.id };
    } catch (err) {
      console.log(err);
      return null;
    }
  }
}
