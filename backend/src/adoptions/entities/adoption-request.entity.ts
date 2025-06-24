import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
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
  Min,
  Max,
} from 'class-validator';
import { User } from '../../users/entities/user.entity';
import { Pet } from '../../pets/entities/pet.entity';
import { Shelter } from '../../shelters/entities/shelter.entity';

export enum AdoptionStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  DENIED = 'denied',
  CANCELLED = 'cancelled',
}

@Entity('adoption_requests')
@Index(['userId', 'status'])
@Index(['petId', 'status'])
@Index(['shelterId', 'status'])
@Index(['createdAt'])
@Check(`"pawPointsUsedForReduction" >= 0`)
@Check(`"feeReduction" >= 0`)
export class AdoptionRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // User relation
  @ManyToOne(() => User)
  @JoinColumn()
  user: User;

  @Column()
  userId: string;

  // Pet relation
  @ManyToOne(() => Pet)
  @JoinColumn()
  pet: Pet;

  @Column()
  petId: string;

  // Shelter relation
  @ManyToOne(() => Shelter)
  @JoinColumn()
  shelter: Shelter;

  @Column()
  shelterId: string;

  // Request details
  @Column({ type: 'enum', enum: AdoptionStatus, default: AdoptionStatus.PENDING })
  @IsEnum(AdoptionStatus)
  status: AdoptionStatus;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  @Max(1000)
  message?: string;

  // PawPoints usage
  @Column({ default: 0 })
  @IsNumber()
  @Min(0)
  pawPointsUsedForReduction: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  @IsNumber()
  @Min(0)
  feeReduction: number;

  // Email tracking
  @Column({ type: 'timestamp', nullable: true })
  emailSentAt?: Date;

  // Status tracking
  @Column({ type: 'timestamp', nullable: true })
  approvedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  deniedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  cancelledAt?: Date;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  statusReason?: string;

  // Proof of adoption
  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  adoptionProofImage?: string;

  // Timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Expiry (7 days from creation)
  @Column({ type: 'timestamp' })
  expiresAt: Date;

  // Helper methods
  get isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  get canBeCancelled(): boolean {
    const twentyFourHours = 24 * 60 * 60 * 1000;
    return (
      this.status === AdoptionStatus.PENDING &&
      Date.now() - this.createdAt.getTime() < twentyFourHours
    );
  }

  get finalAdoptionFee(): number {
    // This would need the pet's adoption fee
    // Implemented in service layer
    return 0;
  }

  // Status change methods
  approve(proofImage?: string): void {
    if (this.status !== AdoptionStatus.PENDING) {
      throw new Error('Only pending requests can be approved');
    }
    if (this.isExpired) {
      throw new Error('This adoption request has expired');
    }
    this.status = AdoptionStatus.APPROVED;
    this.approvedAt = new Date();
    if (proofImage) {
      this.adoptionProofImage = proofImage;
    }
  }

  deny(reason?: string): void {
    if (this.status !== AdoptionStatus.PENDING) {
      throw new Error('Only pending requests can be denied');
    }
    this.status = AdoptionStatus.DENIED;
    this.deniedAt = new Date();
    this.statusReason = reason;
  }

  cancel(): void {
    if (!this.canBeCancelled) {
      throw new Error('This request cannot be cancelled (24-hour window has passed)');
    }
    this.status = AdoptionStatus.CANCELLED;
    this.cancelledAt = new Date();
  }

  calculateFeeReduction(): void {
    // Only PawPoints above the required 5 count for fee reduction
    // First 5 PawPoints are the "entry fee" with no reduction benefit
    const bonusPoints = Math.max(0, this.pawPointsUsedForReduction - 5);
    this.feeReduction = bonusPoints * 5;
  }

  // Factory method
  static create(
    userId: string,
    petId: string,
    shelterId: string,
    pawPointsToUse: number = 0,
    message?: string
  ): AdoptionRequest {
    const request = new AdoptionRequest();
    request.userId = userId;
    request.petId = petId;
    request.shelterId = shelterId;
    request.pawPointsUsedForReduction = pawPointsToUse;
    request.message = message;
    request.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    request.calculateFeeReduction();
    return request;
  }
}
