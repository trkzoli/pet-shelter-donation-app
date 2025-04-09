import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('tokens')
export class Token {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 10, scale: 4 })
  amount: number;

  @Column()
  type: string; // 'purchase', 'donation', 'refund'

  @Column({ nullable: true })
  transactionHash: string;

  @ManyToOne(() => User, user => user.tokens)
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}