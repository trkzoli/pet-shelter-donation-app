// src/payments/config/stripe.config.ts
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

    // Initialize Stripe with configuration
    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-05-28.basil',
      typescript: true,
      // Use test mode for development
      maxNetworkRetries: 3,
      timeout: 20000, // 20 seconds
      telemetry: nodeEnv === 'production',
    });

    // Log initialization (without exposing keys)
    console.log(`Stripe initialized in ${nodeEnv} mode`);
  }

  /**
   * Get Stripe instance
   */
  getStripe(): Stripe {
    return this.stripe;
  }

  /**
   * Get Stripe publishable key for frontend
   */
  getPublishableKey(): string {
    const publishableKey = this.configService.get<string>('STRIPE_PUBLISHABLE_KEY');
    if (!publishableKey) {
      throw new Error('STRIPE_PUBLISHABLE_KEY environment variable is required');
    }
    return publishableKey;
  }

  /**
   * Get webhook endpoint secret
   */
  getWebhookSecret(): string {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET environment variable is required');
    }
    return webhookSecret;
  }

  /**
   * Check if we're in test mode
   */
  isTestMode(): boolean {
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');
    return nodeEnv !== 'production';
  }

  /**
   * Get application fee percentage for platform
   */
  getApplicationFee(): number {
    return this.configService.get<number>('PLATFORM_FEE_PERCENTAGE', 10);
  }
}
