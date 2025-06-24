
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeConfigService {
  private stripe: Stripe;

  constructor(private readonly configService: ConfigService) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');

    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is required');
    }

    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-05-28.basil',
      typescript: true,
      maxNetworkRetries: 3,
      timeout: 20000, 
      telemetry: nodeEnv === 'production',
    });

    console.log(`Stripe initialized in ${nodeEnv} mode`);
  }

  getStripe(): Stripe {
    return this.stripe;
  }

  getPublishableKey(): string {
    const publishableKey = this.configService.get<string>('STRIPE_PUBLISHABLE_KEY');
    if (!publishableKey) {
      throw new Error('STRIPE_PUBLISHABLE_KEY environment variable is required');
    }
    return publishableKey;
  }

  getWebhookSecret(): string {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET environment variable is required');
    }
    return webhookSecret;
  }

  
  isTestMode(): boolean {
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');
    return nodeEnv !== 'production';
  }

  
  getApplicationFee(): number {
    return this.configService.get<number>('PLATFORM_FEE_PERCENTAGE', 10);
  }
}
