
import { Expose, Transform, Type } from 'class-transformer';
import { CampaignPriority, CampaignStatus } from '../entities/campaign.entity';

export class CampaignResponseDto {
  @Expose()
  id: string;

  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  image?: string;

  @Expose()
  priority: CampaignPriority;

  @Expose()
  duration: number;

  @Expose()
  @Transform(({ value }) => parseFloat(value))
  goalAmount: number;

  @Expose()
  @Transform(({ value }) => parseFloat(value))
  currentAmount: number;

  @Expose()
  @Transform(({ value }) => parseFloat(value))
  platformFeePercentage: number;

  @Expose()
  status: CampaignStatus;

  @Expose()
  @Type(() => Date)
  createdAt: Date;

  @Expose()
  @Type(() => Date)
  endsAt: Date;

  @Expose()
  @Type(() => Date)
  completedAt?: Date;


  @Expose()
  @Transform(({ obj }) => {
    if (obj.goalAmount === 0) return 0;
    return Math.round((obj.currentAmount / obj.goalAmount) * 100);
  })
  progress: number;

  @Expose()
  @Transform(({ obj }) => {
    const now = new Date();
    const end = new Date(obj.endsAt);
    const diff = end.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  })
  daysRemaining: number;

  @Expose()
  @Transform(({ obj }) => {
    return obj.status === CampaignStatus.ACTIVE && new Date() <= new Date(obj.endsAt);
  })
  isActive: boolean;


  @Expose()
  shelterName?: string;

  @Expose()
  shelterImage?: string;

  @Expose()
  shelterId: string;
}

export class CampaignListResponseDto {
  @Expose()
  @Type(() => CampaignResponseDto)
  campaigns: CampaignResponseDto[];

  @Expose()
  total: number;

  @Expose()
  pages: number;

  @Expose()
  currentPage: number;

  @Expose()
  hasNext: boolean;

  @Expose()
  hasPrev: boolean;
}

export class CampaignStatsDto {
  @Expose()
  totalDonations: number;

  @Expose()
  @Transform(({ value }) => parseFloat(value))
  totalAmount: number;

  @Expose()
  @Transform(({ value }) => parseFloat(value))
  averageDonation: number;

  @Expose()
  donorCount: number;

  @Expose()
  @Transform(({ value }) => parseFloat(value))
  platformFeesCollected: number;

  @Expose()
  @Transform(({ value }) => parseFloat(value))
  amountToShelter: number;
}

export class ShelterCampaignSummaryDto {
  @Expose()
  activeCampaignId?: string;

  @Expose()
  hasActiveCampaign: boolean;

  @Expose()
  canCreateCampaign: boolean;

  @Expose()
  totalCampaignsCreated: number;

  @Expose()
  totalCampaignsCompleted: number;

  @Expose()
  @Transform(({ value }) => parseFloat(value))
  totalRaised: number;

  @Expose()
  @Type(() => CampaignResponseDto)
  recentCampaigns?: CampaignResponseDto[];
}

export class CampaignDonationDto {
  @Expose()
  id: string;

  @Expose()
  @Transform(({ value }) => parseFloat(value))
  amount: number;

  @Expose()
  donorName: string;

  @Expose()
  isAnonymous: boolean;

  @Expose()
  @Type(() => Date)
  createdAt: Date;

  @Expose()
  message?: string;
}