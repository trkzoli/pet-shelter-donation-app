import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Pet } from '../../pets/entities/pet.entity';

@Entity('donations')
export class Donation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ nullable: true })
  message: string;

  @Column({ default: false })
  isAnonymous: boolean;

  @Column({ nullable: true })
  transactionHash: string;

  @ManyToOne(() => User, user => user.donations)
  user: User;

  @ManyToOne(() => Pet, pet => pet.donations)
  pet: Pet;

  @CreateDateColumn()
  createdAt: Date;
}