import { Injectable } from '@nestjs/common';
import path from 'path';
import { MailData } from './interfaces/mail-data.interface';
import { MailerService } from './mailer/mailer.service';
import * as process from 'node:process';

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

  async userSignUp(
    mailData: MailData<{ hash: string; name: string }>,
  ): Promise<void> {
    const emailConfirmTitle = 'Confirm Your Email Address';
    const texts = [
      `Dear ${mailData.data.name},`,
      `Thank you for registering with ${process.env.APP_NAME}. To complete your registration and activate your account, please confirm your email address by clicking the link below`,
      'If you did not create an account with us, please disregard this email.',
      `If you have any questions or need further assistance, feel free to reach out to our support team at ${process.env.MAIL_COMPANY_SUPPORT}.`,
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
        'templates',
        'mail-templates',
        'activation.hbs',
      ),
      context: this.createMailContext(emailConfirmTitle, url.toString(), texts),
    });
  }

  async forgotPassword(
    mailData: MailData<{ hash: string; name: string; tokenExpires: number }>,
  ): Promise<void> {
    const resetPasswordTitle = 'Password Reset Request';
    const texts = [
      `Dear ${mailData.data.name},`,
      `We received a request to reset the password for your account at ${process.env.APP_NAME}. If you made this request, please click the link below to reset your password`,
      'If you did not request a password reset, please ignore this email, and your password will remain unchanged.',
      `If you need further assistance, feel free to contact our support team at ${process.env.MAIL_COMPANY_SUPPORT}.`,
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
        'templates',
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

  async confirmNewEmail(
    mailData: MailData<{ hash: string; name: string }>,
  ): Promise<void> {
    const emailConfirmTitle = 'Confirm Your New Email Address';
    const texts = [
      `Dear ${mailData.data.name},`,
      `We received a request to change the email address associated with your account at ${process.env.APP_NAME}. To confirm this change, please click the link below`,
      'If you did not request this change, please ignore this email, and your email address will remain unchanged.',
      `If you need any assistance or have any questions, please contact our support team at ${process.env.MAIL_COMPANY_SUPPORT}.`,
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
        'templates',
        'mail-templates',
        'confirm-new-email.hbs',
      ),
      context: this.createMailContext(emailConfirmTitle, url.toString(), texts),
    });
  }
}
