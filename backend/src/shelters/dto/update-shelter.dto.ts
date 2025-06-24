
import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
  IsUrl,
  Matches,
  MinLength,
  MaxLength,
  IsObject,
  ValidateNested,
  ValidateIf,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { PetSpecialization } from '../entities/shelter.entity';

class OperatingHoursDto {
  @IsOptional()
  @IsObject()
  monday?: { open: string; close: string };

  @IsOptional()
  @IsObject()
  tuesday?: { open: string; close: string };

  @IsOptional()
  @IsObject()
  wednesday?: { open: string; close: string };

  @IsOptional()
  @IsObject()
  thursday?: { open: string; close: string };

  @IsOptional()
  @IsObject()
  friday?: { open: string; close: string };

  @IsOptional()
  @IsObject()
  saturday?: { open: string; close: string };

  @IsOptional()
  @IsObject()
  sunday?: { open: string; close: string };
}

export class UpdateShelterDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Shelter name must be at least 2 characters long' })
  @MaxLength(200, { message: 'Shelter name cannot exceed 200 characters' })
  shelterName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Description cannot exceed 2000 characters' })
  description?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const lowerValue = value.toLowerCase();
      if (lowerValue === 'dogs') return PetSpecialization.DOGS;
      if (lowerValue === 'cats') return PetSpecialization.CATS;
      if (lowerValue === 'both') return PetSpecialization.BOTH;
    }
    return value;
  })
  @IsEnum(PetSpecialization, { message: 'Pet specialization must be dogs, cats, or both' })
  petSpecialization?: PetSpecialization;

  @IsOptional()
  @IsString()
  @Matches(/^[A-Z0-9-]+$/, { message: 'Invalid license number format' })
  licenseNumber?: string;

  @IsOptional()
  @IsNumber()
  @Min(1900, { message: 'Year established must be 1900 or later' })
  yearEstablished?: number;

  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Contact person name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Contact person name cannot exceed 100 characters' })
  contactPerson?: string;

  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Contact title must be at least 2 characters long' })
  @MaxLength(100, { message: 'Contact title cannot exceed 100 characters' })
  contactTitle?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return { general: value };
    }
    return value;
  })
  operatingHours?: any;

  @IsOptional()
  @ValidateIf((o) => o.website && o.website.trim() !== '')
  @IsUrl({}, { message: 'Invalid website URL format' })
  website?: string;

  @IsOptional()
  @ValidateIf((o) => o.facebook && o.facebook.trim() !== '')
  @IsUrl({}, { message: 'Invalid Facebook URL format' })
  facebook?: string;

  @IsOptional()
  @ValidateIf((o) => o.instagram && o.instagram.trim() !== '')
  @IsUrl({}, { message: 'Invalid Instagram URL format' })
  instagram?: string;
}
