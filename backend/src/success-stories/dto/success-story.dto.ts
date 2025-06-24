
import { IsEnum, IsOptional, IsString, IsUUID, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SuccessStoryType } from '../entities/success-story.entity';
import { Type } from 'class-transformer'; 


export class PetInfoDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  breed: string;

  @ApiProperty()
  age: string;

  @ApiProperty()
  mainImage: string;
}

export class AdopterInfoDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  city: string;
}

export class NotificationStatusSummaryDto {
  @ApiProperty()
  sent: number;

  @ApiProperty()
  pending: number;

  @ApiProperty()
  total: number;
}

export class CreateSuccessStoryDto {
  @ApiProperty({
    description: 'Pet ID for the success story',
    example: 'uuid-pet-id'
  })
  @IsUUID()
  petId: string;

  @ApiProperty({
    description: 'Type of success story',
    enum: SuccessStoryType,
    example: SuccessStoryType.ADOPTED_EXTERNAL
  })
  @IsEnum(SuccessStoryType)
  type: SuccessStoryType;

  @ApiProperty({
    description: 'Adopter user ID (for internal adoptions)',
    required: false,
    example: 'uuid-user-id'
  })
  @IsOptional()
  @IsUUID()
  adopterId?: string;

  @ApiProperty({
    description: 'Adoption request ID (for internal adoptions)',
    required: false,
    example: 'uuid-adoption-request-id'
  })
  @IsOptional()
  @IsUUID()
  adoptionRequestId?: string;

  @ApiProperty({
    description: 'Error reason (for error type stories)',
    required: false,
    example: 'Pet listing was created by mistake'
  })
  @IsOptional()
  @IsString()
  errorReason?: string;
}

export class CreateAdoptionSuccessStoryDto {
  @ApiProperty({
    description: 'Pet ID',
    example: 'uuid-pet-id'
  })
  @IsUUID()
  petId: string;

  @ApiProperty({
    description: 'Whether adoption was internal (through app) or external',
    example: true
  })
  isInternal: boolean;

  @ApiProperty({
    description: 'Adopter user ID (for internal adoptions)',
    required: false,
    example: 'uuid-user-id'
  })
  @IsOptional()
  @IsUUID()
  adopterId?: string;

  @ApiProperty({
    description: 'Adoption request ID (for internal adoptions)',
    required: false,
    example: 'uuid-adoption-request-id'
  })
  @IsOptional()
  @IsUUID()
  adoptionRequestId?: string;
}

export class CreateDeceasedStoryDto {
  @ApiProperty({
    description: 'Pet ID',
    example: 'uuid-pet-id'
  })
  @IsUUID()
  petId: string;
}

export class CreateErrorStoryDto {
  @ApiProperty({
    description: 'Pet ID',
    example: 'uuid-pet-id'
  })
  @IsUUID()
  petId: string;

  @ApiProperty({
    description: 'Reason for the error',
    example: 'Pet was listed by mistake and has been removed'
  })
  @IsString()
  errorReason: string;
}

export class SuccessStoryResponseDto {
  @ApiProperty({ description: 'Success story ID', example: 'uuid-story-id' })
  id: string;

  @ApiProperty({ description: 'Pet information', type: () => PetInfoDto })
  @Type(() => PetInfoDto)
  pet: PetInfoDto;

  @ApiProperty({ description: 'Story type', enum: SuccessStoryType })
  type: SuccessStoryType;

  @ApiProperty({ description: 'Number of users affected by this story', example: 15 })
  affectedUsersCount: number;

  @ApiProperty({ description: 'Adopter information (for adopted pets)', type: () => AdopterInfoDto, required: false })
  @Type(() => AdopterInfoDto)
  adopter?: AdopterInfoDto;

  @ApiProperty({ description: 'Error reason (for error stories)', required: false, example: 'Pet listing was created by mistake' })
  errorReason?: string;

  @ApiProperty({ description: 'Story title', example: 'Adoption Success!' })
  title: string;

  @ApiProperty({ description: 'Story message', example: 'Great news! Buddy has found their forever home through Pawner.' })
  message: string;

  @ApiProperty({ description: 'PawPoints bonus given for this story', example: 1 })
  bonusPoints: number;

  @ApiProperty({ description: 'When the story was created', example: '2024-01-15T10:30:00Z' })
  createdAt: Date;

  @ApiProperty({ description: 'Notification status summary', type: () => NotificationStatusSummaryDto })
  @Type(() => NotificationStatusSummaryDto)
  notificationStatus: NotificationStatusSummaryDto;
}

export class UserSuccessStoryDto {
  @ApiProperty({ description: 'Success story ID', example: 'uuid-story-id' })
  id: string;

  @ApiProperty({ description: 'Pet information', type: () => PetInfoDto })
  @Type(() => PetInfoDto)
  pet: PetInfoDto;

  @ApiProperty({ description: 'Story type', enum: SuccessStoryType })
  type: SuccessStoryType;

  @ApiProperty({ description: 'Story title', example: 'Adoption Success!' })
  title: string;

  @ApiProperty({ description: 'Personalized message for this user', example: 'Thank you for helping Buddy find their forever home!' })
  message: string;

  @ApiProperty({ description: 'PawPoints earned from this story', example: 1 })
  pawPointsEarned: number;

  @ApiProperty({ description: 'Whether user was notified', example: true })
  wasNotified: boolean;

  @ApiProperty({ description: "User's total donation to this pet", example: 75.50 })
  userDonationAmount: number;

  @ApiProperty({ description: 'When the story was created', example: '2024-01-15T10:30:00Z' })
  createdAt: Date;
}


export class SuccessStoryFiltersDto {
  @ApiProperty({
    description: 'Filter by story type',
    enum: SuccessStoryType,
    required: false
  })
  @IsOptional()
  @IsEnum(SuccessStoryType)
  type?: SuccessStoryType;

  @ApiProperty({
    description: 'Filter by pet ID',
    required: false,
    example: 'uuid-pet-id'
  })
  @IsOptional()
  @IsUUID()
  petId?: string;

  @ApiProperty({
    description: 'Filter by shelter ID',
    required: false,
    example: 'uuid-shelter-id'
  })
  @IsOptional()
  @IsUUID()
  shelterId?: string;

  @ApiProperty({
    description: 'Number of results per page',
    required: false,
    default: 20,
    example: 20
  })
  @IsOptional()
  limit?: number = 20;

  @ApiProperty({
    description: 'Page offset',
    required: false,
    default: 0,
    example: 0
  })
  @IsOptional()
  offset?: number = 0;
}

export class BulkNotificationDto {
  @ApiProperty({
    description: 'Success story IDs to send notifications for',
    type: [String],
    example: ['uuid-story-1', 'uuid-story-2']
  })
  @IsArray()
  @IsUUID(undefined, { each: true })
  storyIds: string[];
}

export class NotificationStatusDto {
  @ApiProperty({
    description: 'Success story ID',
    example: 'uuid-story-id'
  })
  id: string;

  @ApiProperty({
    description: 'Total users to notify',
    example: 15
  })
  totalUsers: number;

  @ApiProperty({
    description: 'Notifications sent successfully',
    example: 14
  })
  notificationsSent: number;

  @ApiProperty({
    description: 'Notifications pending',
    example: 1
  })
  notificationsPending: number;

  @ApiProperty({
    description: 'Any errors during notification sending',
    type: [String],
    example: []
  })
  errors: string[];
}