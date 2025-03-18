import { Injectable } from '@nestjs/common';
import path from 'path';
import { MailData } from './interfaces/mail-data.interface';
import { MailerService } from './mailer/mailer.service';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  private createMailContext(title: string, url: string, texts: string[]) {
    return {
      title,
      url,
      actionTitle: title,
      app_name: process.env.APP_NAME,
      ...texts.reduce((acc, text, index) => {
        acc[`text${index + 1}`] = text;
        return acc;
      }, {}),
    };
  }

  async userSignUp(mailData: MailData<{ hash: string }>): Promise<void> {
    const emailConfirmTitle = 'Email Confirmation';
    const texts = [
      'Thank you for registering with us.',
      'Please confirm your email address by clicking the link below:',
      'If you did not create an account, no further action is required.',
    ];

    const url = new URL(`${process.env.APP_FRONTEND_DOMAIN}/confirm-email`);
    url.searchParams.set('hash', mailData.data.hash);

    await this.mailerService.sendMail({
      to: mailData.to,
      subject: emailConfirmTitle,
      text: `${url.toString()} ${emailConfirmTitle}`,
      templatePath: path.join(
        process.cwd(),
        'src',
        'mail',
        'mail-templates',
        'activation.hbs',
      ),
      context: this.createMailContext(emailConfirmTitle, url.toString(), texts),
    });
  }

  async forgotPassword(
    mailData: MailData<{ hash: string; tokenExpires: number }>,
  ): Promise<void> {
    const resetPasswordTitle = 'Password Reset Request';
    const texts = [
      'You have requested to reset your password.',
      'Please click the link below to reset your password:',
      'If you did not request a password reset, no further action is required.',
      'The link will expire in 24 hours for security reasons.',
    ];

    const url = new URL(`${process.env.APP_FRONTEND_DOMAIN}/password-change`);
    url.searchParams.set('hash', mailData.data.hash);
    url.searchParams.set('expires', mailData.data.tokenExpires.toString());

    await this.mailerService.sendMail({
      to: mailData.to,
      subject: resetPasswordTitle,
      text: `${url.toString()} ${resetPasswordTitle}`,
      templatePath: path.join(
        process.cwd(),
        'src',
        'mail',
        'mail-templates',
        'reset-password.hbs',
      ),
      context: this.createMailContext(
        resetPasswordTitle,
        url.toString(),
        texts,
      ),
    });
  }

  async confirmNewEmail(mailData: MailData<{ hash: string }>): Promise<void> {
    const emailConfirmTitle = 'Confirm Your New Email Address';
    const texts = [
      'You have requested to change your email address.',
      'Please confirm your new email address by clicking the link below:',
      'If you did not request this change, no further action is required.',
    ];

    const url = new URL(`${process.env.APP_FRONTEND_DOMAIN}/confirm-new-email`);
    url.searchParams.set('hash', mailData.data.hash);

    await this.mailerService.sendMail({
      to: mailData.to,
      subject: emailConfirmTitle,
      text: `${url.toString()} ${emailConfirmTitle}`,
      templatePath: path.join(
        process.cwd(),
        'src',
        'mail',
        'mail-templates',
        'confirm-new-email.hbs',
      ),
      context: this.createMailContext(emailConfirmTitle, url.toString(), texts),
    });
  }
}
