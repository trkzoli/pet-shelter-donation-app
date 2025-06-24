// src/adoptions/dto/adoption-response.dto.ts
import { Expose, Transform, Type } from 'class-transformer';
import { AdoptionStatus } from '../entities/adoption-request.entity';

export class UserBasicInfoDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  email: string;

  @Expose()
  phone: string;

  @Expose()
  @Transform(({ value }) => parseFloat(value))
  totalDonatedToPet: number;
}

export class PetBasicInfoDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  breed: string;

  @Expose()
  age: string;

  @Expose()
  gender: string;

  @Expose()
  type: string;

  @Expose()
  mainImage: string;

  @Expose()
  @Transform(({ value }) => parseFloat(value))
  adoptionFee: number;
}

export class AdoptionRequestResponseDto {
  @Expose()
  id: string;

  @Expose()
  userId: string;

  @Expose()
  petId: string;

  @Expose()
  shelterId: string;

  @Expose()
  status: AdoptionStatus;

  @Expose()
  message?: string;

  @Expose()
  pawPointsUsedForReduction: number;

  @Expose()
  @Transform(({ value }) => parseFloat(value))
  feeReduction: number;

  @Expose()
  emailSentAt?: Date;

  @Expose()
  approvedAt?: Date;

  @Expose()
  deniedAt?: Date;

  @Expose()
  cancelledAt?: Date;

  @Expose()
  statusReason?: string;

  @Expose()
  adoptionProofImage?: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  expiresAt: Date;

  @Expose()
  @Transform(({ obj }) => obj.canBeCancelled)
  canBeCancelled: boolean;

  @Expose()
  @Transform(({ obj }) => obj.isExpired)
  isExpired: boolean;

  // Nested pet information for user requests
  @Expose()
  @Type(() => PetBasicInfoDto)
  pet?: PetBasicInfoDto;

  // Nested user information for shelter requests
  @Expose()
  @Type(() => UserBasicInfoDto)
  user?: UserBasicInfoDto;
}

export class EligiblePetDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  breed: string;

  @Expose()
  age: string;

  @Expose()
  gender: string;

  @Expose()
  type: string;

  @Expose()
  mainImage: string;

  @Expose()
  @Transform(({ value }) => parseFloat(value))
  adoptionFee: number;

  @Expose()
  @Transform(({ value }) => parseFloat(value))
  totalDonated: number;

  @Expose()
  firstDonationDate: Date;

  @Expose()
  lastDonationDate: Date;

  @Expose()
  donationCount: number;

  @Expose()
  @Transform(({ obj, value }) => {
    // Calculate potential fee reduction (only points above required 5 count)
    const bonusPoints = Math.max(0, obj.pawPointsAvailable - 5);
    const maxReduction = Math.min(bonusPoints * 5, obj.adoptionFee);
    return Math.max(0, obj.adoptionFee - maxReduction);
  })
  minimumFeeAfterReduction: number;
}

export class AdoptionRequestEmailDataDto {
  @Expose()
  requesterName: string;

  @Expose()
  requesterEmail: string;

  @Expose()
  requesterPhone: string;

  @Expose()
  petName: string;

  @Expose()
  petBreed: string;

  @Expose()
  message?: string;

  @Expose()
  @Transform(({ value }) => parseFloat(value))
  totalDonatedToPet: number;

  @Expose()
  pawPointsUsedForReduction: number;

  @Expose()
  @Transform(({ value }) => parseFloat(value))
  feeReduction: number;

  @Expose()
  @Transform(({ value }) => parseFloat(value))
  finalAdoptionFee: number;

  // User profile details
  @Expose()
  housingType: string;

  @Expose()
  ownershipStatus: string;

  @Expose()
  hasYard?: boolean;

  @Expose()
  isFenced?: boolean;

  @Expose()
  currentPets: string;

  @Expose()
  experienceLevel: string;

  @Expose()
  occupation: string;

  @Expose()
  workSchedule: string;

  @Expose()
  whyAdopt: string;

  @Expose()
  street: string;

  @Expose()
  city: string;

  @Expose()
  state: string;

  @Expose()
  zip: string;

  @Expose()
  country: string;
}
