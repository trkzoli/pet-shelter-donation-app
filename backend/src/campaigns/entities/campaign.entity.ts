// src/campaigns/entities/campaign.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
  Check,
  BeforeInsert,
} from 'typeorm';
import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { Shelter } from '../../shelters/entities/shelter.entity';
import { Donation } from '../../donations/entities/donation.entity';

export enum CampaignPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum CampaignStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('campaigns')
@Index(['shelterId', 'status'])
@Index(['priority', 'createdAt'])
@Check(`"goalAmount" > 0`)
@Check(`"duration" >= 1 AND "duration" <= 4`)
export class Campaign {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Shelter relation
  @ManyToOne(() => Shelter)
  @JoinColumn()
  shelter: Shelter;

  @Column()
  shelterId: string;

  // Campaign details
  @Column()
  @IsString()
  @MaxLength(200)
  title: string;

  @Column({ type: 'text' })
  @IsString()
  @MaxLength(5000)
  description: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  image?: string;

  // Priority and duration
  @Column({ type: 'enum', enum: CampaignPriority })
  @IsEnum(CampaignPriority)
  priority: CampaignPriority;

  @Column({ type: 'int' })
  @IsNumber()
  @Min(1)
  @Max(4)
  duration: number; // Duration in weeks (1-4)

  // Financial details
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @IsNumber()
  @Min(100)
  @Max(50000)
  goalAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  @IsNumber()
  @Min(0)
  currentAmount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  @IsNumber()
  @Min(10)
  @Max(20)
  platformFeePercentage: number; // Calculated based on priority and duration

  // Status
  @Column({ type: 'enum', enum: CampaignStatus, default: CampaignStatus.ACTIVE })
  @IsEnum(CampaignStatus)
  status: CampaignStatus;

  // Timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp' })
  endsAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  // Relations
  @OneToMany(() => Donation, donation => donation.campaignId)
  donations: Donation[];

  // Virtual fields
  get progress(): number {
    if (this.goalAmount === 0) return 0;
    return Math.round((this.currentAmount / this.goalAmount) * 100);
  }

  get isActive(): boolean {
    return this.status === CampaignStatus.ACTIVE && new Date() < this.endsAt;
  }

  get daysLeft(): number {
    if (!this.isActive) return 0;
    const now = new Date();
    const timeLeft = this.endsAt.getTime() - now.getTime();
    return Math.max(0, Math.ceil(timeLeft / (1000 * 60 * 60 * 24)));
  }

  get amountRemaining(): number {
    return Math.max(0, this.goalAmount - this.currentAmount);
  }

  // Hooks
  @BeforeInsert()
  calculatePlatformFee(): void {
    // Base fee: 10%
    let fee = 10;

    // Priority surcharge
    const priorityFees = {
      [CampaignPriority.LOW]: 0.5,
      [CampaignPriority.MEDIUM]: 1,
      [CampaignPriority.HIGH]: 1.5,
      [CampaignPriority.CRITICAL]: 2,
    };

    // Duration surcharge
    const durationFees = { 1: 0.5, 2: 1, 3: 1.5, 4: 2 };

    fee += priorityFees[this.priority];
    fee += durationFees[this.duration];

    this.platformFeePercentage = fee;
  }

  @BeforeInsert()
  setEndDate(): void {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + (this.duration * 7)); // Duration in weeks
    this.endsAt = endDate;
  }

  // Business methods
  addDonation(amount: number): void {
    this.currentAmount += amount;
    
    if (this.currentAmount >= this.goalAmount) {
      this.status = CampaignStatus.COMPLETED;
      this.completedAt = new Date();
    }
  }

  canReceiveDonations(): boolean {
    return this.isActive && this.currentAmount < this.goalAmount;
  }

  cancel(): void {
    if (this.status !== CampaignStatus.ACTIVE) {
      throw new Error('Only active campaigns can be cancelled');
    }
    this.status = CampaignStatus.CANCELLED;
  }

  complete(): void {
    if (this.status !== CampaignStatus.ACTIVE) {
      throw new Error('Only active campaigns can be completed');
    }
    this.status = CampaignStatus.COMPLETED;
    this.completedAt = new Date();
  }

  // Helper methods for display
  getPriorityColor(): string {
    const colors = {
      [CampaignPriority.LOW]: '#51CF66', // Green
      [CampaignPriority.MEDIUM]: '#FFD43B', // Yellow
      [CampaignPriority.HIGH]: '#FF922B', // Orange
      [CampaignPriority.CRITICAL]: '#FF6B6B', // Red
    };
    return colors[this.priority];
  }

  getPriorityLabel(): string {
    const labels = {
      [CampaignPriority.LOW]: 'Low Priority',
      [CampaignPriority.MEDIUM]: 'Medium Priority',
      [CampaignPriority.HIGH]: 'High Priority',
      [CampaignPriority.CRITICAL]: 'Critical Need',
    };
    return labels[this.priority];
  }

  // Factory method
  static create(
    shelterId: string,
    title: string,
    description: string,
    goalAmount: number,
    priority: CampaignPriority,
    duration: number,
    image?: string
  ): Campaign {
    const campaign = new Campaign();
    campaign.shelterId = shelterId;
    campaign.title = title;
    campaign.description = description;
    campaign.goalAmount = goalAmount;
    campaign.priority = priority;
    campaign.duration = duration;
    campaign.image = image;
    return campaign;
  }
}