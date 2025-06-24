
import { Expose, Transform, Type } from 'class-transformer';
import {
  PetSpecialization,
  VerificationStatus,
} from '../entities/shelter.entity';

export class UserInfoDto {
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
  profileImage?: string;
}

export class ShelterResponseDto {
  @Expose()
  id: string;

  @Expose()
  userId: string;

  @Expose()
  shelterName: string;

  @Expose()
  description?: string;

  @Expose()
  petSpecialization: PetSpecialization;

  @Expose()
  licenseNumber: string;

  @Expose()
  yearEstablished: number;

  @Expose()
  contactPerson: string;

  @Expose()
  contactTitle: string;

  @Expose()
  operatingHours?: any;

  @Expose()
  website?: string;

  @Expose()
  facebook?: string;

  @Expose()
  instagram?: string;

  @Expose()
  verificationStatus: VerificationStatus;

  @Expose()
  verificationPhoto?: string;

  @Expose()
  verifiedAt?: Date;

  @Expose()
  @Transform(({ value }) => parseFloat(value))
  totalDonationsReceived: number;

  @Expose()
  adoptionsCompleted: number;

  @Expose()
  currentPublishedPets: number;

  @Expose()
  profileCompleteness: number;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  @Type(() => UserInfoDto)
  user?: UserInfoDto;
}

export class ShelterStatsResponseDto {
  @Expose()
  totalPets: number;

  @Expose()
  publishedPets: number;

  @Expose()
  adoptedPets: number;

  @Expose()
  @Transform(({ value }) => parseFloat(value))
  totalDonationsReceived: number;

  @Expose()
  activeCampaigns: number;

  @Expose()
  pendingAdoptionRequests: number;

  @Expose()
  @Transform(({ value }) => parseFloat(value))
  thisMonthDonations: number;

  @Expose()
  monthlyGoalsProgress: {
    totalGoals: number;
    achieved: number;
    percentage: number;
  };
}

export class VerificationSubmissionDto {
  @Expose()
  message: string;

  @Expose()
  status: string;

  @Expose()
  submittedAt: Date;
}
