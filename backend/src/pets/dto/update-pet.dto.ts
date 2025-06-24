
import {
  IsString,
  IsNumber,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsArray,
  Min,
  Max,
  MinLength,
  MaxLength,
  ArrayMaxSize,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { PetType, PetGender } from '../entities/pet.entity';

export class UpdatePetDto {
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Pet name is required' })
  @MaxLength(100, { message: 'Pet name cannot exceed 100 characters' })
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Breed is required' })
  @MaxLength(100, { message: 'Breed cannot exceed 100 characters' })
  breed?: string;

  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Age is required' })
  age?: string;

  @IsOptional()
  @IsEnum(PetGender, { message: 'Gender must be male or female' })
  gender?: PetGender;

  @IsOptional()
  @IsEnum(PetType, { message: 'Pet type must be dog or cat' })
  type?: PetType;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true';
    }
    return Boolean(value);
  })
  vaccinated?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true';
    }
    return Boolean(value);
  })
  dewormed?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true';
    }
    return Boolean(value);
  })
  spayedNeutered?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Adoption fee cannot be negative' })
  @Max(10000, { message: 'Adoption fee cannot exceed $10,000' })
  @Transform(({ value }) => parseFloat(value))
  adoptionFee?: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Description cannot exceed 2000 characters' })
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000, { message: 'Story cannot exceed 5000 characters' })
  story?: string;

  @IsOptional()
  @IsString()
  mainImage?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10, { message: 'Cannot have more than 10 additional images' })
  @IsString({ each: true })
  additionalImages?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Microchip number cannot exceed 50 characters' })
  microchipNumber?: string;

  @IsOptional()
  @IsString()
  vetRecords?: string;
}

export class UpdatePetPhotosDto {
  @IsOptional()
  @IsString()
  mainImage?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10, { message: 'Cannot have more than 10 additional images' })
  @IsString({ each: true })
  additionalImages?: string[];
}

export class PetFiltersDto {
  @IsOptional()
  @IsEnum(PetType)
  type?: PetType;

  @IsOptional()
  @IsEnum(PetGender)
  gender?: PetGender;

  @IsOptional()
  @IsString()
  breed?: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  @Min(0)
  @Max(10000)
  maxAdoptionFee?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  @Min(1)
  @Max(50)
  limit?: number = 20;

  @IsOptional()
  @IsEnum(['newest', 'oldest', 'fee_low', 'fee_high', 'name'])
  sortBy?: 'newest' | 'oldest' | 'fee_low' | 'fee_high' | 'name' = 'newest';
}
