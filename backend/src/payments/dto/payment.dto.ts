// src/payments/dto/payment.dto.ts
import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsUUID,
  Min,
  Max,
  IsNotEmpty,
  ValidateIf,
  IsPositive,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for creating payment intent
 */
export class CreatePaymentIntentDto {
  @ApiProperty({
    description: 'Payment amount in cents',
    example: 1099,
  })
  @IsNumber()
  @IsPositive({ message: 'Amount must be positive' })
  amount: number;

  @ApiProperty({
    description: 'Currency code',
    example: 'usd',
  })
  @IsString()
  @IsNotEmpty({ message: 'Currency is required' })
  currency: string = 'usd';

  @ApiProperty({
    description: 'Type of payment - pet or campaign',
    example: 'pet',
  })
  @IsString()
  @IsNotEmpty({ message: 'Type is required' })
  type: 'pet' | 'campaign';

  @ApiPropertyOptional({
    description: 'Pet ID if payment is for a pet',
    example: 'uuid-here',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Pet ID must be a valid UUID' })
  petId?: string;

  @ApiPropertyOptional({
    description: 'Campaign ID if payment is for a campaign',
    example: 'uuid-here',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Campaign ID must be a valid UUID' })
  campaignId?: string;

  @ApiProperty({
    description: 'Payment method - only card supported',
    example: 'card',
  })
  @IsString()
  @IsNotEmpty({ message: 'Payment method is required' })
  paymentMethod: string = 'card';
}

/**
 * DTO for confirming payment
 */
export class ConfirmPaymentDto {
  @ApiProperty({
    description: 'Stripe payment intent ID',
    example: 'pi_1234567890',
  })
  @IsString()
  @IsNotEmpty({ message: 'Payment intent ID is required' })
  paymentIntentId: string;

  @ApiPropertyOptional({
    description: 'Payment method ID for saving cards',
    example: 'pm_1234567890',
  })
  @IsOptional()
  @IsString()
  paymentMethodId?: string;
}

/**
 * DTO for processing refunds
 */
export class RefundPaymentDto {
  @ApiProperty({
    description: 'Donation ID to refund',
    example: 'uuid-string',
  })
  @IsUUID(4, { message: 'Donation ID must be a valid UUID' })
  donationId: string;

  @ApiPropertyOptional({
    description: 'Refund amount (partial refund if less than original)',
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1, { message: 'Minimum donation amount is $1' })
  @Transform(({ value }) => parseFloat(value))
  amount?: number;

  @ApiProperty({
    description: 'Reason for refund',
    example: 'Pet passed away',
  })
  @IsString()
  @IsNotEmpty({ message: 'Refund reason is required' })
  reason: string;
}

/**
 * DTO for webhook payload
 */
export class WebhookEventDto {
  @ApiProperty({
    description: 'Stripe event ID',
    example: 'evt_1234567890',
  })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: 'Stripe event type',
    example: 'payment_intent.succeeded',
  })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({
    description: 'Event data object',
  })
  data: {
    object: any;
  };
}

/**
 * Response DTOs
 */
export class PaymentIntentResponseDto {
  @ApiProperty({
    description: 'Stripe client secret for frontend',
    example: 'pi_1234567890_secret_abcdef',
  })
  clientSecret: string;

  @ApiProperty({
    description: 'Payment intent ID',
    example: 'pi_1234567890',
  })
  paymentIntentId: string;

  @ApiProperty({
    description: 'Donation amount',
    example: 25,
  })
  amount: number;

  @ApiProperty({
    description: 'Platform fee amount',
    example: 2.5,
  })
  platformFee: number;

  @ApiProperty({
    description: 'Amount going to shelter',
    example: 22.5,
  })
  shelterAmount: number;

  @ApiProperty({
    description: 'PawPoints to be earned',
    example: 1,
  })
  pawPointsToEarn: number;

  @ApiPropertyOptional({
    description: 'Stripe publishable key for frontend',
    example: 'pk_test_1234567890',
  })
  publishableKey?: string;
}

export class PaymentSuccessDto {
  @ApiProperty({
    description: 'Donation ID',
    example: 'uuid-string',
  })
  donationId: string;

  @ApiProperty({
    description: 'Transaction ID',
    example: 'pi_1234567890',
  })
  transactionId: string;

  @ApiProperty({
    description: 'Payment amount',
    example: 25,
  })
  amount: number;

  @ApiProperty({
    description: 'PawPoints earned',
    example: 1,
  })
  pawPointsEarned: number;

  @ApiProperty({
    description: 'Donation target name',
    example: 'Buddy the Dog',
  })
  targetName: string;

  @ApiProperty({
    description: 'Shelter name',
    example: 'Happy Paws Shelter',
  })
  shelterName: string;
}

export class RefundResponseDto {
  @ApiProperty({
    description: 'Refund ID',
    example: 're_1234567890',
  })
  refundId: string;

  @ApiProperty({
    description: 'Refunded amount',
    example: 25,
  })
  amount: number;

  @ApiProperty({
    description: 'Refund status',
    example: 'succeeded',
  })
  status: string;

  @ApiProperty({
    description: 'Expected availability date',
    example: '2024-06-25',
  })
  expectedAvailability: string;
}