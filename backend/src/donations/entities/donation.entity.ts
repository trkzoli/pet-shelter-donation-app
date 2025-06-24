import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Check,
} from 'typeorm';
import {
  IsNumber,
  IsEnum,
  IsString,
  IsOptional,
  IsJSON,
  Min,
} from 'class-validator';
import { User } from '../../users/entities/user.entity';
import { Pet } from '../../pets/entities/pet.entity';
import { Campaign } from '../../campaigns/entities/campaign.entity';

export enum DonationType {
  PET = 'pet',
  CAMPAIGN = 'campaign',
}

export enum DonationStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  REFUNDED = 'refunded',
  FAILED = 'failed',
}

export interface DonationDistribution {
  vaccination: number;
  food: number;
  medical: number;
  other: number;
}

@Entity('donations')
@Index(['userId', 'createdAt'])
@Index(['petId', 'status'])
@Index(['campaignId', 'status'])
@Check(`"amount" > 0`)
export class Donation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // User relation
  @ManyToOne(() => User)
  @JoinColumn()
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Pet, { nullable: true })
  @JoinColumn()
  pet?: Pet;

  @Column({ nullable: true })
  petId?: string;

  @ManyToOne(() => Campaign, { nullable: true })
  @JoinColumn()
  campaign?: Campaign;

  @Column({ nullable: true })
  campaignId?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @IsNumber()
  @Min(1)
  amount: number;

  @Column({ default: 0 })
  @IsNumber()
  @Min(0)
  pawPointsEarned: number;

  @Column({ type: 'enum', enum: DonationType })
  @IsEnum(DonationType)
  type: DonationType;

  @Column()
  @IsString()
  paymentIntentId: string;

  @Column({ type: 'enum', enum: DonationStatus, default: DonationStatus.PENDING })
  @IsEnum(DonationStatus)
  status: DonationStatus;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsJSON()
  distribution?: DonationDistribution;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  @IsNumber()
  @Min(0)
  platformFee: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 10 })
  @IsNumber()
  @Min(0)
  platformFeePercentage: number;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  refundReason?: string;

  @Column({ type: 'timestamp', nullable: true })
  refundedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  stripeChargeId?: string;

  calculatePawPoints(): number {
    return Math.floor(this.amount / 25);
  }

  calculatePlatformFee(): void {
    if (this.type === DonationType.PET) {
      this.platformFeePercentage = 10;
      this.platformFee = this.amount * 0.1;
    } else {
        
    }
  }

  getShelterAmount(): number {
    return this.amount - this.platformFee;
  }

  markAsCompleted(): void {
    if (this.status !== DonationStatus.PENDING) {
      throw new Error('Only pending donations can be marked as completed');
    }
    this.status = DonationStatus.COMPLETED;
    this.pawPointsEarned = this.calculatePawPoints();
  }

  refund(reason: string): void {
    if (this.status !== DonationStatus.COMPLETED) {
      throw new Error('Only completed donations can be refunded');
    }
    this.status = DonationStatus.REFUNDED;
    this.refundReason = reason;
    this.refundedAt = new Date();
  }
}
