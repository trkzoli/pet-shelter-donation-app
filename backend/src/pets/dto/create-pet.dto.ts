import {
  IsString,
  IsNumber,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsObject,
  IsArray,
  ValidateNested,
  Min,
  Max,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { PetType, PetGender } from '../entities/pet.entity';
import { MonthlyGoalsDto } from './monthly-goals.dto';

export class CreatePetDto {
  @IsString()
  @MinLength(1, { message: 'Pet name is required' })
  @MaxLength(100, { message: 'Pet name cannot exceed 100 characters' })
  name: string;

  @IsString()
  @MinLength(1, { message: 'Breed is required' })
  @MaxLength(100, { message: 'Breed cannot exceed 100 characters' })
  breed: string;

  @IsString()
  @MinLength(1, { message: 'Age is required' })
  age: string;

  @IsEnum(PetGender, { message: 'Gender must be male or female' })
  gender: PetGender;

  @IsEnum(PetType, { message: 'Pet type must be dog or cat' })
  type: PetType;

  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true';
    }
    return Boolean(value);
  })
  vaccinated: boolean;

  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true';
    }
    return Boolean(value);
  })
  dewormed: boolean;

  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true';
    }
    return Boolean(value);
  })
  spayedNeutered: boolean;

  @IsNumber()
  @Min(0, { message: 'Adoption fee cannot be negative' })
  @Max(10000, { message: 'Adoption fee cannot exceed $10,000' })
  @Transform(({ value }) => parseFloat(value))
  adoptionFee: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Description cannot exceed 2000 characters' })
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000, { message: 'Story cannot exceed 5000 characters' })
  story?: string;

  @IsString({ message: 'Main image is required' })
  mainImage: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  additionalImages?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Microchip number cannot exceed 50 characters' })
  microchipNumber?: string;

  @IsOptional()
  @IsString()
  vetRecords?: string;

  @IsObject()
  @ValidateNested()
  @Type(() => MonthlyGoalsDto)
  monthlyGoals: MonthlyGoalsDto;
}

export class RemovePetDto {
  @IsEnum(['deceased', 'other'], {
    message: 'Reason must be either "deceased" or "other"',
  })
  reason: 'deceased' | 'other';

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Explanation cannot exceed 500 characters' })
  explanation?: string;
}

export class ConfirmAdoptionDto {
  @IsOptional()
  @IsString()
  adoptionProofImage?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Notes cannot exceed 1000 characters' })
  notes?: string;
}