// src/notifications/config/mail.config.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

export interface MailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

@Injectable()
export class MailConfigService {
  private readonly logger = new Logger(MailConfigService.name);
  private transporter: Transporter;

  constructor(private readonly configService: ConfigService) {
    this.initializeTransporter();
  }

  /**
   * Initialize NodeMailer transporter with Gmail SMTP
   */
  private initializeTransporter(): void {
    const host = this.configService.get<string>('MAIL_HOST', 'smtp.gmail.com');
    const port = this.configService.get<number>('MAIL_PORT', 587);
    const secure = this.configService.get<boolean>('MAIL_SECURE', false);
    const user = this.configService.get<string>('MAIL_USER');
    const pass = this.configService.get<string>('MAIL_PASSWORD');
    const fromName = this.configService.get<string>('MAIL_FROM_NAME', 'Pawner');
    const fromEmail = this.configService.get<string>('MAIL_FROM_EMAIL') || user || '';

    if (!user || !pass) {
      throw new Error(
        'Mail configuration missing. Please set MAIL_USER and MAIL_PASSWORD environment variables.'
      );
    }

    // Create transporter with Gmail configuration
    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure, // false for TLS (port 587), true for SSL (port 465)
      auth: {
        user,
        pass, // Use App Password for Gmail, not regular password
      },
      // Gmail specific settings
      service: host === 'smtp.gmail.com' ? 'gmail' : undefined,
      tls: {
        // Don't fail on invalid certs (for development)
        rejectUnauthorized: this.configService.get<string>('NODE_ENV') === 'production',
      },
    });

    this.logger.log(`Mail transporter initialized with ${host}:${port}`);
    this.logger.log(`From: ${fromName} <${fromEmail}>`);

    // Verify connection on startup
    this.verifyConnection();
  }

  /**
   * Verify email connection
   */
  private async verifyConnection(): Promise<void> {
    try {
      await this.transporter.verify();
      this.logger.log(' Mail server connection verified successfully');
    } catch (error) {
      this.logger.error(' Mail server connection failed:', error.message);
      
      // Provide helpful error messages for common issues
      if (error.message.includes('Invalid login')) {
        this.logger.error('Hint: For Gmail, use App Password instead of regular password');
        this.logger.error('Enable 2FA and generate App Password at: https://myaccount.google.com/apppasswords');
      }
      
      if (error.message.includes('self signed certificate')) {
        this.logger.error('Hint: Set NODE_ENV=development to allow self-signed certificates');
      }
    }
  }

  /**
   * Get transporter instance
   */
  getTransporter(): Transporter {
    return this.transporter;
  }

  /**
   * Get default sender information
   */
  getDefaultSender(): { name: string; email: string } {
    const fromName = this.configService.get<string>('MAIL_FROM_NAME') || 'Project Eden';
    const fromEmail =
      this.configService.get<string>('MAIL_FROM_EMAIL') ||
      this.configService.get<string>('MAIL_USER') ||
      '';
    return {
      name: fromName,
      email: fromEmail,
    };
  }

  /**
   * Get frontend base URL for links in emails
   */
  getFrontendUrl(): string {
    return this.configService.get<string>('FRONTEND_URL', 'http://localhost:3001');
  }

  /**
   * Get backend base URL for API links
   */
  getBackendUrl(): string {
    return this.configService.get<string>('BACKEND_URL', 'http://localhost:3000');
  }

  /**
   * Check if mail service is properly configured
   */
  isConfigured(): boolean {
    const user = this.configService.get<string>('MAIL_USER');
    const pass = this.configService.get<string>('MAIL_PASSWORD');
    return !!(user && pass);
  }

  /**
   * Get mail configuration for health checks
   */
  getConfig(): Partial<MailConfig> {
    return {
      host: this.configService.get<string>('MAIL_HOST', 'smtp.gmail.com'),
      port: this.configService.get<number>('MAIL_PORT', 587),
      secure: this.configService.get<boolean>('MAIL_SECURE', false),
      // Don't expose credentials
    };
  }
}