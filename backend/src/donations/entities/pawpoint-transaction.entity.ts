import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import {
  IsNumber,
  IsEnum,
  IsString,
  IsOptional,
} from 'class-validator';
import { User } from '../../users/entities/user.entity';
import { Donation } from './donation.entity';
import { Pet } from '../../pets/entities/pet.entity';

export enum TransactionType {
  DONATION = 'donation',
  ADOPTION_BONUS = 'adoption_bonus',
  COMPASSION_BONUS = 'compassion_bonus',
  ERROR_BONUS = 'error_bonus',
  SPENT = 'spent',
  REFUND = 'refund',
  BONUS = 'bonus',
  OTHER = 'other',
}

@Entity('pawpoint_transactions')
@Index(['userId', 'createdAt'])
@Index(['type'])
export class PawPointTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn()
  user: User;

  @Column()
  userId: string;

  @Column({ type: 'int' })
  @IsNumber()
  points: number;

  @Column({ type: 'enum', enum: TransactionType })
  @IsEnum(TransactionType)
  type: TransactionType;

  @ManyToOne(() => Donation, { nullable: true })
  @JoinColumn()
  relatedDonation?: Donation;

  @Column({ nullable: true })
  relatedDonationId?: string;

  @ManyToOne(() => Pet, { nullable: true })
  @JoinColumn()
  relatedPet?: Pet;

  @Column({ nullable: true })
  relatedPetId?: string;

  @Column({ type: 'text' })
  @IsString()
  description: string;

  @Column({ type: 'int' })
  @IsNumber()
  balanceAfter: number;

  @CreateDateColumn()
  createdAt: Date;

  static createDonationTransaction(
    userId: string,
    points: number,
    donationId: string,
    balanceAfter: number
  ): PawPointTransaction {
    const transaction = new PawPointTransaction();
    transaction.userId = userId;
    transaction.points = points;
    transaction.type = TransactionType.DONATION;
    transaction.relatedDonationId = donationId;
    transaction.description = `Earned ${points} PawPoints from donation`;
    transaction.balanceAfter = balanceAfter;
    return transaction;
  }

  static createAdoptionBonusTransaction(
    userId: string,
    petId: string,
    petName: string,
    balanceAfter: number
  ): PawPointTransaction {
    const transaction = new PawPointTransaction();
    transaction.userId = userId;
    transaction.points = 1;
    transaction.type = TransactionType.ADOPTION_BONUS;
    transaction.relatedPetId = petId;
    transaction.description = `Bonus PawPoint: ${petName} was adopted!`;
    transaction.balanceAfter = balanceAfter;
    return transaction;
  }

  static createCompassionBonusTransaction(
    userId: string,
    petId: string,
    petName: string,
    balanceAfter: number
  ): PawPointTransaction {
    const transaction = new PawPointTransaction();
    transaction.userId = userId;
    transaction.points = 1;
    transaction.type = TransactionType.COMPASSION_BONUS;
    transaction.relatedPetId = petId;
    transaction.description = `Compassion PawPoint: ${petName} passed away`;
    transaction.balanceAfter = balanceAfter;
    return transaction;
  }

  static createErrorBonusTransaction(
    userId: string,
    petId: string,
    reason: string,
    balanceAfter: number
  ): PawPointTransaction {
    const transaction = new PawPointTransaction();
    transaction.userId = userId;
    transaction.points = 1;
    transaction.type = TransactionType.ERROR_BONUS;
    transaction.relatedPetId = petId;
    transaction.description = `Bonus PawPoint: ${reason}`;
    transaction.balanceAfter = balanceAfter;
    return transaction;
  }

  static createSpentTransaction(
    userId: string,
    points: number,
    reason: string,
    balanceAfter: number
  ): PawPointTransaction {
    const transaction = new PawPointTransaction();
    transaction.userId = userId;
    transaction.points = -Math.abs(points); 
    transaction.type = TransactionType.SPENT;
    transaction.description = reason;
    transaction.balanceAfter = balanceAfter;
    return transaction;
  }
}