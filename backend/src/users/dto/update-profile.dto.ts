
import {
  IsString,
  IsOptional,
  Matches,
  MinLength,
  MaxLength,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Name cannot exceed 100 characters' })
  name?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+?[\d\s-()]+$/, { message: 'Invalid phone number format' })
  phone?: string;

  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Street address must be at least 2 characters long' })
  @MaxLength(200, { message: 'Street address cannot exceed 200 characters' })
  street?: string;

  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'City must be at least 2 characters long' })
  @MaxLength(100, { message: 'City cannot exceed 100 characters' })
  city?: string;

  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'State/Province must be at least 2 characters long' })
  @MaxLength(100, { message: 'State/Province cannot exceed 100 characters' })
  state?: string;

  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'ZIP/Postal code must be at least 3 characters long' })
  @MaxLength(20, { message: 'ZIP/Postal code cannot exceed 20 characters' })
  zip?: string;

  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Country must be at least 2 characters long' })
  @MaxLength(100, { message: 'Country cannot exceed 100 characters' })
  country?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Housing type cannot exceed 100 characters' })
  housingType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Ownership status cannot exceed 100 characters' })
  ownershipStatus?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Yard status cannot exceed 100 characters' })
  hasYard?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Fence status cannot exceed 100 characters' })
  isFenced?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Current pets description cannot exceed 500 characters' })
  currentPets?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Previous pets description cannot exceed 500 characters' })
  previousPets?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Experience level cannot exceed 100 characters' })
  experienceLevel?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Occupation cannot exceed 200 characters' })
  occupation?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Work schedule cannot exceed 500 characters' })
  workSchedule?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Adoption reason cannot exceed 1000 characters' })
  whyAdopt?: string;

  @IsOptional()
  @IsString()
  housingOwnership?: string;

  @IsOptional()
  @IsString()
  petExperience?: string;
}
