// src/donations/dto/create-donation.dto.ts
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsEnum,
  IsUUID,
  Min,
  ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { DonationType } from '../entities/donation.entity';

export class CreateDonationDto {
  @IsNumber()
  @Min(1, { message: 'Donation amount must be at least $1' })
  @Transform(({ value }) => parseFloat(value))
  @IsNotEmpty({ message: 'Amount is required' })
  amount: number;

  @IsEnum(DonationType, { message: 'Type must be either "pet" or "campaign"' })
  @IsNotEmpty({ message: 'Donation type is required' })
  type: DonationType;

  @ValidateIf(o => o.type === DonationType.PET)
  @IsUUID('4', { message: 'Invalid pet ID format' })
  @IsNotEmpty({ message: 'Pet ID is required for pet donations' })
  petId?: string;

  @ValidateIf(o => o.type === DonationType.CAMPAIGN)
  @IsUUID('4', { message: 'Invalid campaign ID format' })
  @IsNotEmpty({ message: 'Campaign ID is required for campaign donations' })
  campaignId?: string;

  // Internal fields set by controller
  userId?: string;
  paymentIntentId?: string;
}

export class ConfirmDonationDto {
  @IsNotEmpty({ message: 'Payment intent ID is required' })
  paymentIntentId: string;
}

export class RefundDonationDto {
  @IsNotEmpty({ message: 'Refund reason is required' })
  reason: string;
}