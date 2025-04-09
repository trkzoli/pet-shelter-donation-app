import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Donation } from '../../donations/entities/donation.entity';
import { Token } from '../../tokens/entities/token.entity';


@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column()
  name: string;

  @Column({ default: false })
  isShelter: boolean;

  @Column({ nullable: true })
  profileImage: string;

  @Column({ default: 0, type: 'decimal', precision: 10, scale: 4 })
  tokenBalance: number;

  @OneToMany(() => Donation, donation => donation.user)
  donations: Donation[];

  @OneToMany(() => Token, token => token.user)
  tokens: Token[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}