import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { Donation } from '../../donations/entities/donation.entity';
import { Shelter } from '../../shelters/entities/shelter.entity';


@Entity('pets')
export class Pet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  breed: string;

  @Column()
  gender: string;

  @Column({ nullable: true })
  age: string;

  @Column({ nullable: true })
  story: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'text', array: true, default: '{}' })
  images: string[];

  @Column({ default: 0 })
  monthlyDonationGoal: number;

  @Column({ default: 0 })
  totalDonations: number;

  @Column({ default: 0 })
  vaccinationCost: number;

  @Column({ default: 0 })
  deparasitizationCost: number;

  @Column({ default: 0 })
  otherMedicalCost: number;

  @ManyToOne(() => Shelter, shelter => shelter.pets)
  shelter: Shelter;

  @OneToMany(() => Donation, donation => donation.pet)
  donations: Donation[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}