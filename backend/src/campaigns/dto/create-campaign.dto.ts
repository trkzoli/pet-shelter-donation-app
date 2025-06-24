// src/campaigns/dto/create-campaign.dto.ts
import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  Min,
  Max,
  MinLength,
  MaxLength,
  IsUrl,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { CampaignPriority } from '../entities/campaign.entity';

export class CreateCampaignDto {
  @IsString()
  @MinLength(5, { message: 'Title must be at least 5 characters long' })
  @MaxLength(200, { message: 'Title cannot exceed 200 characters' })
  @Transform(({ value }) => value?.trim())
  title: string;

  @IsString()
  @MinLength(20, { message: 'Description must be at least 20 characters long' })
  @MaxLength(2000, { message: 'Description cannot exceed 2000 characters' })
  @Transform(({ value }) => value?.trim())
  description: string;

  @IsOptional()
  @IsUrl({}, { message: 'Image must be a valid URL' })
  image?: string;

  @IsEnum(CampaignPriority, {
    message: 'Priority must be one of: low, medium, high, critical',
  })
  priority: CampaignPriority;

  @IsNumber({}, { message: 'Duration must be a number' })
  @Min(1, { message: 'Duration must be at least 1 week' })
  @Max(4, { message: 'Duration cannot exceed 4 weeks' })
  @Transform(({ value }) => parseInt(value))
  duration: number;

  @IsNumber({}, { message: 'Goal amount must be a number' })
  @Min(50, { message: 'Goal amount must be at least $50' })
  @Max(50000, { message: 'Goal amount cannot exceed $50,000' })
  @Transform(({ value }) => parseFloat(value))
  goalAmount: number;
}

export class UpdateCampaignDto {
  @IsOptional()
  @IsString()
  @MinLength(5, { message: 'Title must be at least 5 characters long' })
  @MaxLength(200, { message: 'Title cannot exceed 200 characters' })
  @Transform(({ value }) => value?.trim())
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(20, { message: 'Description must be at least 20 characters long' })
  @MaxLength(2000, { message: 'Description cannot exceed 2000 characters' })
  @Transform(({ value }) => value?.trim())
  description?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Image must be a valid URL' })
  image?: string;
}

export class CompleteCampaignDto {
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Completion message cannot exceed 500 characters' })
  @Transform(({ value }) => value?.trim())
  completionMessage?: string;
}