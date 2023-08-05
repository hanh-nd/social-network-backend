import { ConfigKey } from './../../config/config-key';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Transporter, createTransport } from 'nodemailer';

@Injectable()
export class NodeMailerService {
    declare transporter: Transporter;

    constructor(private configService: ConfigService) {
        this.transporter = createTransport({
            service: 'gmail',
            auth: {
                user: this.configService.get<string>(ConfigKey.SEND_VERIFY_EMAIL_ADDRESS),
                pass: this.configService.get<string>(ConfigKey.SEND_VERIFY_EMAIL_PASSWORD),
            },
        });
    }

    async sendActivationEmail(to: string, token: string) {
        try {
            const text = `Your confirmation token: ${token}`;
            const mailOptions = {
                from: this.configService.get<string>(ConfigKey.SEND_VERIFY_EMAIL_ADDRESS),
                subject: 'Verify your account',
                to,
                text,
            };
            await this.transporter.sendMail(mailOptions);
        } catch (error) {
            console.error('got error when sending email', error);
            throw error;
        }
    }
}
