// src/donations/dto/donation-response.dto.ts
import { Expose, Transform, Type } from 'class-transformer';
import { DonationType, DonationStatus } from '../entities/donation.entity';

export class DonationResponseDto {
  @Expose()
  id: string;

  @Expose()
  amount: number;

  @Expose()
  pawPointsEarned: number;

  @Expose()
  type: DonationType;

  @Expose()
  status: DonationStatus;

  @Expose()
  platformFee: number;

  @Expose()
  platformFeePercentage: number;

  @Expose()
  distribution?: {
    vaccination: number;
    food: number;
    medical: number;
    other: number;
  };

  @Expose()
  createdAt: Date;

  @Expose()
  petId?: string;

  @Expose()
  campaignId?: string;

  @Expose()
  @Transform(({ obj }) => obj.pet ? {
    id: obj.pet.id,
    name: obj.pet.name,
    breed: obj.pet.breed,
    mainImage: obj.pet.mainImage,
  } : undefined)
  pet?: {
    id: string;
    name: string;
    breed: string;
    mainImage: string;
  };

  @Expose()
  @Transform(({ obj }) => obj.campaign ? {
    id: obj.campaign.id,
    title: obj.campaign.title,
    image: obj.campaign.image,
  } : undefined)
  campaign?: {
    id: string;
    title: string;
    image: string;
  };
}

export class SupportedPetDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  breed: string;

  @Expose()
  age: number;

  @Expose()
  gender: string;

  @Expose()
  type: string;

  @Expose()
  mainImage: string;

  @Expose()
  status: string;

  @Expose()
  adoptionFee: number;

  @Expose()
  description: string;

  @Expose()
  story: string;

  @Expose()
  additionalImages: string[];

  @Expose()
  vaccinated: boolean;

  @Expose()
  dewormed: boolean;

  @Expose()
  spayedNeutered: boolean;

  @Expose()
  monthlyGoals: {
    vaccination: number;
    food: number;
    medical: number;
    other: number;
    total: number;
  };

  @Expose()
  currentMonthProgress: {
    vaccination: number;
    food: number;
    medical: number;
    other: number;
    total: number;
    percentage: number;
  };

  @Expose()
  @Transform(({ obj }) => obj.shelter ? {
    id: obj.shelter.id,
    shelterName: obj.shelter.shelterName,
    city: obj.shelter.user?.city,
    state: obj.shelter.user?.state,
  } : undefined)
  shelter: {
    id: string;
    shelterName: string;
    city: string;
    state: string;
  };

  @Expose()
  donationSummary: {
    totalDonated: number;
    donationCount: number;
    firstDonationDate: Date;
    lastDonationDate: Date;
    pawPointsEarned: number;
  };

  @Expose()
  @Transform(({ obj, value }) => {
    // Check if user has donated to this pet (required for adoption)
    return obj.donationSummary?.donationCount > 0;
  })
  canRequestAdoption: boolean;
}

export class DonationStatsDto {
  @Expose()
  totalDonated: number;

  @Expose()
  donationCount: number;

  @Expose()
  pawPointsEarned: number;

  @Expose()
  supportedPetsCount: number;

  @Expose()
  supportedCampaignsCount: number;

  @Expose()
  monthlyStats: {
    thisMonth: number;
    lastMonth: number;
    change: number;
    changePercentage: number;
  };

  @Expose()
  donationsByType: {
    pet: {
      amount: number;
      count: number;
    };
    campaign: {
      amount: number;
      count: number;
    };
  };
}

export class PaymentIntentDto {
  @Expose()
  clientSecret: string;

  @Expose()
  donationId: string;

  @Expose()
  amount: number;

  @Expose()
  platformFee: number;

  @Expose()
  shelterAmount: number;

  @Expose()
  pawPointsToEarn: number;
}
