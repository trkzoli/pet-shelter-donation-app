import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
  OneToOne,
  OneToMany,
  Index,
  Check,
} from 'typeorm';
import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsNumber,
  Min,
  Max,
  Matches,
} from 'class-validator';
import { Exclude } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import { Shelter } from '../../shelters/entities/shelter.entity';
import { Donation } from '../../donations/entities/donation.entity';
import { PawPointTransaction } from '../../donations/entities/pawpoint-transaction.entity';
import { AdoptionRequest } from '../../adoptions/entities/adoption-request.entity';

export enum UserRole {
  DONOR = 'donor',
  SHELTER = 'shelter',
}

export enum HousingType {
  HOUSE = 'house',
  APARTMENT = 'apartment',
  CONDO = 'condo',
}

export enum OwnershipStatus {
  OWN = 'own',
  RENT = 'rent',
  FAMILY = 'family',
}

export enum YardStatus {
  YES = 'yes',
  NO = 'no',
  SHARED = 'shared',
}

export enum FenceStatus {
  YES = 'yes',
  NO = 'no',
  PARTIALLY = 'partially',
}

export enum ExperienceLevel {
  FIRST_TIME = 'first_time',
  SOME_EXPERIENCE = 'some_experience',
  EXPERIENCED = 'experienced',
  VERY_EXPERIENCED = 'very_experienced',
}

@Entity('users')
@Index(['email'], { unique: true })
@Check(`"pawPoints" >= 0`)
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @IsEmail()
  email: string;

  @Column()
  @Exclude()
  @MinLength(6)
  password: string;

  @Column()
  @IsString()
  @MinLength(2)
  name: string;

  @Column({ nullable: true })
  @IsOptional()
  @Matches(/^\+?[\d\s-()]+$/, { message: 'Invalid phone number format' })
  phone?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  street?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  city?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  state?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  zip?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  country?: string;

  // Housing information (for donors) - changed to allow any text
  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  housingType?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  ownershipStatus?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  hasYard?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  isFenced?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  housingOwnership?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  currentPets?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  previousPets?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  experienceLevel?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  petExperience?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  occupation?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  workSchedule?: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  whyAdopt?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  profileImage?: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  @IsNumber()
  @Min(0)
  @Max(100)
  profileCompleteness: number;

    
  @Column({ default: 0 })
  @IsNumber()
  @Min(0)
  pawPoints: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  @IsNumber()
  @Min(0)
  totalDonated: number;

  @Column({ default: false })
  @IsBoolean()
  emailVerified: boolean;

  @Column({ nullable: true, length: 4 })
  @Exclude()
  verificationCode?: string;

  @Column({ type: 'timestamp', nullable: true })
  verificationCodeExpiry?: Date;

  @Column({ nullable: true })
  @Exclude()
  resetToken?: string;

  @Column({ type: 'timestamp', nullable: true })
  resetTokenExpiry?: Date;

  @Column({ type: 'enum', enum: UserRole })
  @IsEnum(UserRole)
  role: UserRole;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;


  @OneToOne(() => Shelter, shelter => shelter.user)
  shelter?: Shelter;

  @OneToMany(() => Donation, donation => donation.user)
  donations: Donation[];

  @OneToMany(() => PawPointTransaction, transaction => transaction.user)
  pawPointTransactions: PawPointTransaction[];

  @OneToMany(() => AdoptionRequest, request => request.user)
  adoptionRequests: AdoptionRequest[];

  
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && !this.password.startsWith('$2b$')) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  @BeforeInsert()
  @BeforeUpdate()
  calculateProfileCompletion() {
    const requiredFields = [
      'name',
      'phone',
      'street',
      'city',
      'state',
      'zip',
      'country',
      'housingType',
      'ownershipStatus',
      'currentPets',
      'experienceLevel',
      'occupation',
      'workSchedule',
      'whyAdopt',
    ];

    
    if (this.role === UserRole.DONOR) {
      const filledFields = requiredFields.filter(field => {
        const value = this[field as keyof User];
        return value !== null && value !== undefined && value !== '';
      });
      this.profileCompleteness = Math.round((filledFields.length / requiredFields.length) * 100);
      
      
      console.log('🔍 BACKEND Profile Completion:', {
        requiredFields: requiredFields.length,
        filledFields: filledFields.length,
        percentage: this.profileCompleteness,
        filledFieldNames: filledFields
      });
    } else {
      
      this.profileCompleteness = 0;
    }
  }

  
  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  generateVerificationCode(): void {
    this.verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
    this.verificationCodeExpiry = new Date(Date.now() + 15 * 60 * 1000);
  }

  generateResetToken(): string {
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    this.resetToken = token;
    this.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
    return token;
  }

  isVerificationCodeValid(code: string): boolean {
    return !!(
      this.verificationCode === code &&
      this.verificationCodeExpiry &&
      this.verificationCodeExpiry > new Date()
    );
  }

  isResetTokenValid(token: string): boolean {
    return !!(
      this.resetToken === token &&
      this.resetTokenExpiry &&
      this.resetTokenExpiry > new Date()
    );
  }
}