
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { PetType, PetGender, PetStatus, MonthlyGoals, DonationDistribution } from '../entities/pet.entity';

export class ShelterInfoDto {
  @Expose()
  id: string;

  @Expose()
  shelterName: string;

  @Expose()
  @Transform(({ obj }) => obj.user?.phone)
  phone: string;

  @Expose()
  @Transform(({ obj }) => obj.user?.email)
  email: string;

  @Expose()
  @Transform(({ obj }) => {
    const user = obj.user;
    if (!user) return '';
    return `${user.city || ''}, ${user.state || ''}, ${user.country || ''}`.replace(/^,|,$/g, '').trim();
  })
  location: string;

  @Expose()
  verificationStatus: string;

  @Expose()
  adoptionsCompleted: number;

  @Expose()
  @Transform(({ obj }) => !!obj.user?.email)
  hasContact: boolean;
}

export class PetListDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  breed: string;

  @Expose()
  age: string;

  @Expose()
  gender: PetGender;

  @Expose()
  type: PetType;

  @Expose()
  adoptionFee: number;

  @Expose()
  mainImage: string;

  @Expose()
  status: PetStatus;

  @Expose()
  description?: string;

  @Expose()
  story?: string;

  @Expose()
  vaccinated: boolean;

  @Expose()
  dewormed: boolean;

  @Expose()
  spayedNeutered: boolean;

  @Expose()
  microchipNumber?: string;

  @Expose()
  vetRecords?: string;

  @Expose()
  additionalImages: string[];

  @Expose()
  monthlyGoals: MonthlyGoals;

  @Expose()
  @Transform(({ obj }) => {
    const goals = obj.monthlyGoals;
    if (!goals) return 0;
    return (goals.vaccination || 0) + (goals.food || 0) + (goals.medical || 0) + (goals.other || 0);
  })
  totalMonthlyGoal: number;

  @Expose()
  @Transform(({ obj }) => {
    const total = obj.monthlyGoals?.vaccination + obj.monthlyGoals?.food + obj.monthlyGoals?.medical + obj.monthlyGoals?.other || 0;
    if (total === 0) return 0;
    return Math.round((obj.currentMonthDonations / total) * 100);
  })
  monthlyGoalProgress: number;

  @Expose()
  currentMonthDonations: number;

  @Expose()
  totalDonationsReceived: number;

  @Expose()
  @Type(() => ShelterInfoDto)
  shelter: ShelterInfoDto;

  @Expose()
  publishedAt?: Date;

  @Expose()
  createdAt: Date;

  @Expose()
  @Transform(({ obj }) => {
    const twentyFourHours = 24 * 60 * 60 * 1000;
    return Date.now() - new Date(obj.createdAt).getTime() < twentyFourHours;
  })
  isEditable: boolean;
}

export class PetDetailDto extends PetListDto {
  @Expose()
  currentMonthDistribution: DonationDistribution;

  @Expose()
  goalsLastReset?: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  @Transform(({ obj }) => {
    const goals = obj.monthlyGoals;
    if (!goals) return { vaccination: { goal: 0, current: 0, percentage: 0 }, food: { goal: 0, current: 0, percentage: 0 }, medical: { goal: 0, current: 0, percentage: 0 }, other: { goal: 0, current: 0, percentage: 0 } };
    return {
      vaccination: {
        goal: goals.vaccination,
        current: obj.currentMonthDistribution.vaccination,
        percentage: goals.vaccination > 0 ? Math.round((obj.currentMonthDistribution.vaccination / goals.vaccination) * 100) : 0,
      },
      food: {
        goal: goals.food,
        current: obj.currentMonthDistribution.food,
        percentage: goals.food > 0 ? Math.round((obj.currentMonthDistribution.food / goals.food) * 100) : 0,
      },
      medical: {
        goal: goals.medical,
        current: obj.currentMonthDistribution.medical,
        percentage: goals.medical > 0 ? Math.round((obj.currentMonthDistribution.medical / goals.medical) * 100) : 0,
      },
      other: {
        goal: goals.other,
        current: obj.currentMonthDistribution.other,
        percentage: goals.other > 0 ? Math.round((obj.currentMonthDistribution.other / goals.other) * 100) : 0,
      },
    };
  })
  careProgress: {
    vaccination: { goal: number; current: number; percentage: number };
    food: { goal: number; current: number; percentage: number };
    medical: { goal: number; current: number; percentage: number };
    other: { goal: number; current: number; percentage: number };
  };

  @Expose()
  @Transform(({ obj }) => {
    if (!obj.goalsLastReset) return 31;
    const resetDate = new Date(obj.goalsLastReset);
    const nextReset = new Date(resetDate);
    nextReset.setDate(nextReset.getDate() + 31);
    const now = new Date();
    const daysLeft = Math.ceil((nextReset.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, daysLeft);
  })
  daysUntilGoalsReset: number;

  declare status: PetStatus;
}

export class ShelterPetDto extends PetDetailDto {
  @Expose()
  @Transform(({ obj }) => {
    const twentyFourHours = 24 * 60 * 60 * 1000;
    return Date.now() - new Date(obj.createdAt).getTime() < twentyFourHours;
  })
  canEdit: boolean;

  @Expose()
  @Transform(({ obj }) => {
    return obj.status === 'draft' && 
           obj.mainImage && 
           (obj.monthlyGoals?.vaccination + obj.monthlyGoals?.food + obj.monthlyGoals?.medical + obj.monthlyGoals?.other) > 0;
  })
  canPublish: boolean;

  @Expose()
  @Transform(({ obj }) => obj.adoptionRequests?.length || 0)
  adoptionRequestsCount: number;
}

export class PetListResponseDto {
  @Expose()
  @Type(() => PetListDto)
  pets: PetListDto[];

  @Expose()
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}


export class MonthlyGoalsSummaryDto {
  @Expose()
  @Transform(({ obj }) => {
    const goals = obj.monthlyGoals || {};
    const distribution = obj.currentMonthDistribution || {};
    return {
      vaccination: {
        goal: goals.vaccination || 0,
        current: distribution.vaccination || 0,
        remaining: Math.max(0, (goals.vaccination || 0) - (distribution.vaccination || 0)),
      },
      food: {
        goal: goals.food || 0,
        current: distribution.food || 0,
        remaining: Math.max(0, (goals.food || 0) - (distribution.food || 0)),
      },
      medical: {
        goal: goals.medical || 0,
        current: distribution.medical || 0,
        remaining: Math.max(0, (goals.medical || 0) - (distribution.medical || 0)),
      },
      other: {
        goal: goals.other || 0,
        current: distribution.other || 0,
        remaining: Math.max(0, (goals.other || 0) - (distribution.other || 0)),
      },
    };
  })
  goalBreakdown: {
    vaccination: { goal: number; current: number; remaining: number };
    food: { goal: number; current: number; remaining: number };
    medical: { goal: number; current: number; remaining: number };
    other: { goal: number; current: number; remaining: number };
  };

  @Expose()
  @Transform(({ obj }) => {
    const goals = obj.monthlyGoals || {};
    return (goals.vaccination || 0) + (goals.food || 0) + (goals.medical || 0) + (goals.other || 0);
  })
  totalGoal: number;

  @Expose()
  currentMonthDonations: number;

  @Expose()
  @Transform(({ obj }) => {
    const totalGoal = (obj.monthlyGoals?.vaccination || 0) + (obj.monthlyGoals?.food || 0) + 
                     (obj.monthlyGoals?.medical || 0) + (obj.monthlyGoals?.other || 0);
    if (totalGoal === 0) return 0;
    return Math.round((obj.currentMonthDonations / totalGoal) * 100);
  })
  overallProgress: number;

  @Expose()
  @Transform(({ obj }) => {
    if (!obj.goalsLastReset) return 31;
    const resetDate = new Date(obj.goalsLastReset);
    const nextReset = new Date(resetDate);
    nextReset.setDate(nextReset.getDate() + 31);
    const now = new Date();
    const daysLeft = Math.ceil((nextReset.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, daysLeft);
  })
  daysLeft: number;
}
