import { Injectable } from '@nestjs/common';
import * as brevo from '@getbrevo/brevo';

import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class EmailService {
  private apiInstance: brevo.TransactionalEmailsApi;

  constructor() {
    this.apiInstance = new brevo.TransactionalEmailsApi();
    this.apiInstance.setApiKey(
      brevo.TransactionalEmailsApiApiKeys.apiKey,
      process.env.BREVO_API_KEY as string,
    );
  }

  async sendOtpEmail(email: string, otp: string): Promise<void> {
    try {
      const sendSmtpEmail: brevo.SendSmtpEmail = {
        templateId: 6,
        sender: { name: 'OurDev Team', email: 'ourdevhub@gmail.com' },
        to: [{ email }],
        replyTo: { email: 'ourdevhub@gmail.com', name: 'Support' },
        params: { OTP: otp },
      };

      await this.apiInstance.sendTransacEmail(sendSmtpEmail);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error sending OTP email:', error.message);
      } else {
        console.error('An unknown error occurred while sending OTP.');
      }
    }
  }
}
