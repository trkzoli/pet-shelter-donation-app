import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
  Index,
} from 'typeorm';
import {
  IsString,
  IsEnum,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsArray,
  IsJSON,
  MinLength,
  MaxLength,
  ArrayMaxSize,
  Min,
} from 'class-validator';
import { Shelter } from '../../shelters/entities/shelter.entity';
import { Donation } from '../../donations/entities/donation.entity';
import { AdoptionRequest } from '../../adoptions/entities/adoption-request.entity';
import { SuccessStory } from '../../success-stories/entities/success-story.entity';

export enum PetType {
  DOG = 'dog',
  CAT = 'cat',
}

export enum PetGender {
  MALE = 'male',
  FEMALE = 'female',
}

export enum PetStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ADOPTED = 'adopted',
  REMOVED = 'removed',
}

export interface MonthlyGoals {
  vaccination: number;
  food: number;
  medical: number;
  other: number;
}

export interface DonationDistribution {
  vaccination: number;
  food: number;
  medical: number;
  other: number;
}

@Entity('pets')
@Index(['shelterId', 'status'])
@Index(['createdAt'])
export class Pet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Shelter)
  @JoinColumn()
  shelter: Shelter;

  @Column()
  shelterId: string;

  @Column()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @Column()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  breed: string;

  @Column()
  @IsString()
  age: string;

  @Column({ type: 'enum', enum: PetGender })
  @IsEnum(PetGender)
  gender: PetGender;

  @Column({ type: 'enum', enum: PetType })
  @IsEnum(PetType)
  type: PetType;

  @Column({ default: false })
  @IsBoolean()
  vaccinated: boolean;

  @Column({ default: false })
  @IsBoolean()
  dewormed: boolean;

  @Column({ default: false })
  @IsBoolean()
  spayedNeutered: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  @IsNumber()
  @Min(0)
  adoptionFee: number;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  story?: string;

  @Column()
  @IsString()
  mainImage: string;

  @Column({ type: 'jsonb', default: [] })
  @IsArray()
  @ArrayMaxSize(10)
  additionalImages: string[];

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  microchipNumber?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  vetRecords?: string;

  @Column({ type: 'jsonb', default: { vaccination: 0, food: 0, medical: 0, other: 0 } })
  @IsJSON()
  monthlyGoals: MonthlyGoals;

  @Column({ type: 'timestamp', nullable: true })
  goalsLastReset?: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  @IsNumber()
  @Min(0)
  totalDonationsReceived: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  @IsNumber()
  @Min(0)
  currentMonthDonations: number;

  @Column({ type: 'jsonb', default: { vaccination: 0, food: 0, medical: 0, other: 0 } })
  @IsJSON()
  currentMonthDistribution: DonationDistribution;

  @Column({ type: 'enum', enum: PetStatus, default: PetStatus.DRAFT })
  @IsEnum(PetStatus)
  status: PetStatus;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Donation, (donation) => donation.pet)
  donations: Donation[];

  @OneToMany(() => AdoptionRequest, (request) => request.pet)
  adoptionRequests: AdoptionRequest[];

  @OneToMany(() => SuccessStory, (story) => story.pet)
  successStories: SuccessStory[];

  get isEditable(): boolean {
    const twentyFourHours = 24 * 60 * 60 * 1000;
    return Date.now() - this.createdAt.getTime() < twentyFourHours;
  }

  get totalMonthlyGoal(): number {
    return (
      this.monthlyGoals.vaccination +
      this.monthlyGoals.food +
      this.monthlyGoals.medical +
      this.monthlyGoals.other
    );
  }

  get monthlyGoalProgress(): number {
    if (this.totalMonthlyGoal === 0) return 0;
    return Math.round((this.currentMonthDonations / this.totalMonthlyGoal) * 100);
  }

  @BeforeInsert()
  @BeforeUpdate()
  validateImages() {
    // Only validate main image when pet is being published or when image fields are being modified
    // Don't validate during donation processing updates
    if (this.status === PetStatus.PUBLISHED && !this.mainImage) {
      throw new Error('Main image is required to publish pet');
    }
    
    // Ensure additionalImages is an array
    if (!this.additionalImages) {
      this.additionalImages = [];
    }
    
    if (this.additionalImages.length > 10) {
      throw new Error('Maximum 10 additional images allowed');
    }
  }

  @BeforeUpdate()
  checkEditability() {}

 
  canBeEdited(): boolean {
    return this.isEditable;
  }

  publish(): void {
    if (this.status !== PetStatus.DRAFT) {
      throw new Error('Only draft pets can be published');
    }
    this.status = PetStatus.PUBLISHED;
    this.publishedAt = new Date();
  }

  markAsAdopted(): void {
    if (this.status !== PetStatus.PUBLISHED) {
      throw new Error('Only published pets can be marked as adopted');
    }
    this.status = PetStatus.ADOPTED;
  }

  remove(_reason: 'deceased' | 'other'): void {
    if (this.status !== PetStatus.PUBLISHED) {
      throw new Error('Only published pets can be removed');
    }
    this.status = PetStatus.REMOVED;
  }

  resetMonthlyGoals(): void {
    this.currentMonthDonations = 0;
    this.currentMonthDistribution = { vaccination: 0, food: 0, medical: 0, other: 0 };
    this.goalsLastReset = new Date();
  }

  shouldResetGoals(): boolean {
    if (!this.goalsLastReset) return true;
    const daysSinceReset = Math.floor(
      (Date.now() - this.goalsLastReset.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSinceReset >= 31;
  }

  distributeDonation(amount: number): DonationDistribution {
    const total = this.totalMonthlyGoal;
    if (total === 0) {

      const quarter = amount / 4;
      return {
        vaccination: quarter,
        food: quarter,
        medical: quarter,
        other: quarter,
      };
    }

    return {
      vaccination: (amount * this.monthlyGoals.vaccination) / total,
      food: (amount * this.monthlyGoals.food) / total,
      medical: (amount * this.monthlyGoals.medical) / total,
      other: (amount * this.monthlyGoals.other) / total,
    };
  }
}
