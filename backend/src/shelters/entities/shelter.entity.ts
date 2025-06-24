import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
  Index,
} from 'typeorm';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
  Max,
  IsUrl,
  IsJSON,
  Matches,
} from 'class-validator';
import { User } from '../../users/entities/user.entity';
import { Pet } from '../../pets/entities/pet.entity';
import { Campaign } from '../../campaigns/entities/campaign.entity';
import { AdoptionRequest } from '../../adoptions/entities/adoption-request.entity';

export enum PetSpecialization {
  DOGS = 'dogs',
  CATS = 'cats',
  BOTH = 'both',
}

export enum VerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

interface OperatingHours {
  monday?: { open: string; close: string };
  tuesday?: { open: string; close: string };
  wednesday?: { open: string; close: string };
  thursday?: { open: string; close: string };
  friday?: { open: string; close: string };
  saturday?: { open: string; close: string };
  sunday?: { open: string; close: string };
}

@Entity('shelters')
@Index(['licenseNumber'], { unique: true })
export class Shelter {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // One-to-one relation with User
  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @Column()
  userId: string;

  // Shelter information
  @Column()
  @IsString()
  @Min(2)
  shelterName: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Column({ type: 'enum', enum: PetSpecialization, default: PetSpecialization.BOTH })
  @IsEnum(PetSpecialization)
  petSpecialization: PetSpecialization;

  @Column({ unique: true })
  @IsString()
  @Matches(/^[A-Z0-9-]+$/, { message: 'Invalid license number format' })
  licenseNumber: string;

  @Column({ type: 'int' })
  @IsNumber()
  @Min(1900)
  yearEstablished: number;

  // Contact information
  @Column()
  @IsString()
  contactPerson: string;

  @Column()
  @IsString()
  contactTitle: string;

  // Operating hours stored as JSON
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsJSON()
  operatingHours?: OperatingHours;

  // Optional fields
  @Column({ nullable: true })
  @IsOptional()
  @IsUrl()
  website?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsUrl()
  facebook?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsUrl()
  instagram?: string;

  // Verification
  @Column({ type: 'varchar', default: 'pending' })
  verificationStatus: string;

  @Column({ type: 'timestamp', nullable: true })
  verificationSubmittedAt?: Date;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  verificationPhoto?: string;

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt?: Date;

  // Statistics
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  @IsNumber()
  @Min(0)
  totalDonationsReceived: number;

  @Column({ default: 0 })
  @IsNumber()
  @Min(0)
  adoptionsCompleted: number;

  @Column({ default: 0 })
  @IsNumber()
  @Min(0)
  currentPublishedPets: number;

  // Profile completion for shelters
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  @IsNumber()
  @Min(0)
  @Max(100)
  profileCompleteness: number;

  // Timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations (to be defined in other entities)
  @OneToMany(() => Pet, pet => pet.shelter)
  pets: Pet[];

  @OneToMany(() => Campaign, campaign => campaign.shelter)
  campaigns: Campaign[];

  @OneToMany(() => AdoptionRequest, request => request.shelter)
  adoptionRequests: AdoptionRequest[];

  // Helper methods
  canPublishPets(): boolean {
    return (
      this.verificationStatus === 'verified' &&
      this.profileCompleteness >= 100 &&
      this.currentPublishedPets < 10
    );
  }

  hasActiveCampaign(): boolean {
    // This would check if there's an active campaign
    // Implementation would be in the service layer
    return false;
  }

  incrementPublishedPets(): void {
    if (this.currentPublishedPets >= 10) {
      throw new Error('Maximum number of published pets (10) reached');
    }
    this.currentPublishedPets++;
  }

  decrementPublishedPets(): void {
    if (this.currentPublishedPets > 0) {
      this.currentPublishedPets--;
    }
  }
}
