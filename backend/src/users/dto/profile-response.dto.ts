// src/users/dto/profile-response.dto.ts
import { Exclude, Expose, Transform } from 'class-transformer';
import {
  UserRole,
  HousingType,
  OwnershipStatus,
  YardStatus,
  FenceStatus,
  ExperienceLevel,
} from '../entities/user.entity';

export class ProfileResponseDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  name: string;

  @Expose()
  phone?: string;

  @Expose()
  street?: string;

  @Expose()
  city?: string;

  @Expose()
  state?: string;

  @Expose()
  zip?: string;

  @Expose()
  country?: string;

  @Expose()
  housingType?: HousingType;

  @Expose()
  ownershipStatus?: OwnershipStatus;

  @Expose()
  hasYard?: YardStatus;

  @Expose()
  isFenced?: FenceStatus;

  @Expose()
  currentPets?: string;

  @Expose()
  previousPets?: string;

  @Expose()
  experienceLevel?: ExperienceLevel;

  @Expose()
  occupation?: string;

  @Expose()
  workSchedule?: string;

  @Expose()
  whyAdopt?: string;

  @Expose()
  @Transform(({ value }) => Math.round(value * 100) / 100)
  profileCompleteness: number;

  @Expose()
  pawPoints: number;

  @Expose()
  @Transform(({ value }) => parseFloat(value))
  totalDonated: number;

  @Expose()
  emailVerified: boolean;

  @Expose()
  role: UserRole;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  profileImage?: string;

  // Exclude sensitive fields
  @Exclude()
  password: string;

  @Exclude()
  verificationCode?: string;

  @Exclude()
  verificationCodeExpiry?: Date;

  @Exclude()
  resetToken?: string;

  @Exclude()
  resetTokenExpiry?: Date;
}

export class PawPointsResponseDto {
  @Expose()
  balance: number;

  @Expose()
  @Transform(({ value }) => parseFloat(value))
  totalEarned: number;

  @Expose()
  @Transform(({ value }) => parseFloat(value))
  totalSpent: number;

  @Expose()
  @Transform(({ value }) => parseFloat(value))
  totalDonated: number;
}

export class PawPointTransactionResponseDto {
  @Expose()
  id: string;

  @Expose()
  points: number;

  @Expose()
  type: string;

  @Expose()
  description: string;

  @Expose()
  relatedDonationId?: string;

  @Expose()
  relatedPetId?: string;

  @Expose()
  createdAt: Date;
}

export class AdoptionEligibilityResponseDto {
  @Expose()
  isEligible: boolean;

  @Expose()
  reasons: string[];

  @Expose()
  profileCompleteness: number;

  @Expose()
  pawPoints: number;

  @Expose()
  minimumRequirements: {
    profileCompletion: number;
    minimumPawPoints: number;
  };
}
