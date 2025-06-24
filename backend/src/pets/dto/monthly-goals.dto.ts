// src/pets/dto/monthly-goals.dto.ts
import {
  IsNumber,
  IsOptional,
  Min,
  Max,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type, Transform, Expose } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MonthlyGoalsDto {
  @ApiProperty({
    description: 'Monthly goal for vaccination and deworming expenses',
    minimum: 0,
    maximum: 10000,
    example: 250,
  })
  @IsNumber({}, { message: 'Vaccination goal must be a valid number' })
  @Min(0, { message: 'Vaccination goal cannot be negative' })
  @Max(10000, { message: 'Vaccination goal cannot exceed $10,000' })
  @Transform(({ value }) => parseFloat(value))
  vaccination: number;

  @ApiProperty({
    description: 'Monthly goal for food and nutrition expenses',
    minimum: 0,
    maximum: 10000,
    example: 400,
  })
  @IsNumber({}, { message: 'Food goal must be a valid number' })
  @Min(0, { message: 'Food goal cannot be negative' })
  @Max(10000, { message: 'Food goal cannot exceed $10,000' })
  @Transform(({ value }) => parseFloat(value))
  food: number;

  @ApiProperty({
    description: 'Monthly goal for medical care expenses',
    minimum: 0,
    maximum: 10000,
    example: 300,
  })
  @IsNumber({}, { message: 'Medical goal must be a valid number' })
  @Min(0, { message: 'Medical goal cannot be negative' })
  @Max(10000, { message: 'Medical goal cannot exceed $10,000' })
  @Transform(({ value }) => parseFloat(value))
  medical: number;

  @ApiProperty({
    description: 'Monthly goal for other expenses (toys, bedding, etc.)',
    minimum: 0,
    maximum: 10000,
    example: 150,
  })
  @IsNumber({}, { message: 'Other expenses goal must be a valid number' })
  @Min(0, { message: 'Other expenses goal cannot be negative' })
  @Max(10000, { message: 'Other expenses goal cannot exceed $10,000' })
  @Transform(({ value }) => parseFloat(value))
  other: number;

  // Virtual field for total goal
  @Expose()
  get totalGoal(): number {
    return this.vaccination + this.food + this.medical + this.other;
  }

  // Validation method
  isValid(): boolean {
    return this.totalGoal > 0 && this.totalGoal <= 10000;
  }

  // Get goal breakdown as percentages
  getPercentageBreakdown(): {
    vaccination: number;
    food: number;
    medical: number;
    other: number;
  } {
    const total = this.totalGoal;
    if (total === 0) {
      return { vaccination: 0, food: 0, medical: 0, other: 0 };
    }

    return {
      vaccination: Math.round((this.vaccination / total) * 100),
      food: Math.round((this.food / total) * 100),
      medical: Math.round((this.medical / total) * 100),
      other: Math.round((this.other / total) * 100),
    };
  }
}

// DTO for setting monthly goals
export class SetMonthlyGoalsDto {
  @ApiProperty({
    description: 'Monthly care goals for the pet',
    type: MonthlyGoalsDto,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => MonthlyGoalsDto)
  monthlyGoals: MonthlyGoalsDto;
}

// DTO for monthly goals response with progress
export class MonthlyGoalsResponseDto extends MonthlyGoalsDto {
  @ApiPropertyOptional({
    description: 'Current donations received for vaccination category',
    example: 150.75,
  })
  @Expose()
  @IsOptional()
  @IsNumber()
  vaccinationCurrent?: number;

  @ApiPropertyOptional({
    description: 'Current donations received for food category', 
    example: 280.50,
  })
  @Expose()
  @IsOptional()
  @IsNumber()
  foodCurrent?: number;

  @ApiPropertyOptional({
    description: 'Current donations received for medical category',
    example: 125.25,
  })
  @Expose()
  @IsOptional()
  @IsNumber()
  medicalCurrent?: number;

  @ApiPropertyOptional({
    description: 'Current donations received for other expenses category',
    example: 75.00,
  })
  @Expose()
  @IsOptional()
  @IsNumber()
  otherCurrent?: number;

  @ApiPropertyOptional({
    description: 'Date when goals were last reset',
    example: '2024-01-15T00:00:00Z',
  })
  @Expose()
  @IsOptional()
  goalsLastReset?: Date;

  // Calculate progress for each category
  @Expose()
  get progressBreakdown(): {
    vaccination: { goal: number; current: number; percentage: number; remaining: number };
    food: { goal: number; current: number; percentage: number; remaining: number };
    medical: { goal: number; current: number; percentage: number; remaining: number };
    other: { goal: number; current: number; percentage: number; remaining: number };
  } {
    return {
      vaccination: {
        goal: this.vaccination,
        current: this.vaccinationCurrent || 0,
        percentage: this.vaccination > 0 ? Math.round(((this.vaccinationCurrent || 0) / this.vaccination) * 100) : 0,
        remaining: Math.max(0, this.vaccination - (this.vaccinationCurrent || 0)),
      },
      food: {
        goal: this.food,
        current: this.foodCurrent || 0,
        percentage: this.food > 0 ? Math.round(((this.foodCurrent || 0) / this.food) * 100) : 0,
        remaining: Math.max(0, this.food - (this.foodCurrent || 0)),
      },
      medical: {
        goal: this.medical,
        current: this.medicalCurrent || 0,
        percentage: this.medical > 0 ? Math.round(((this.medicalCurrent || 0) / this.medical) * 100) : 0,
        remaining: Math.max(0, this.medical - (this.medicalCurrent || 0)),
      },
      other: {
        goal: this.other,
        current: this.otherCurrent || 0,
        percentage: this.other > 0 ? Math.round(((this.otherCurrent || 0) / this.other) * 100) : 0,
        remaining: Math.max(0, this.other - (this.otherCurrent || 0)),
      },
    };
  }

  // Overall progress
  @Expose()
  get overallProgress(): number {
    const totalGoal = this.totalGoal;
    const totalCurrent = (this.vaccinationCurrent || 0) + (this.foodCurrent || 0) + 
                        (this.medicalCurrent || 0) + (this.otherCurrent || 0);
    if (totalGoal === 0) return 0;
    return Math.round((totalCurrent / totalGoal) * 100);
  }

  // Days until reset
  @Expose()
  get daysUntilReset(): number {
    if (!this.goalsLastReset) return 31;
    const resetDate = new Date(this.goalsLastReset);
    const nextReset = new Date(resetDate);
    nextReset.setDate(nextReset.getDate() + 31);
    const now = new Date();
    const daysLeft = Math.ceil((nextReset.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, daysLeft);
  }
}

// DTO for updating monthly goals (partial update)
export class UpdateMonthlyGoalsDto {
  @ApiPropertyOptional({
    description: 'Updated monthly goal for vaccination and deworming expenses',
    minimum: 0,
    maximum: 10000,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Vaccination goal must be a valid number' })
  @Min(0, { message: 'Vaccination goal cannot be negative' })
  @Max(10000, { message: 'Vaccination goal cannot exceed $10,000' })
  @Transform(({ value }) => parseFloat(value))
  vaccination?: number;

  @ApiPropertyOptional({
    description: 'Updated monthly goal for food and nutrition expenses',
    minimum: 0,
    maximum: 10000,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Food goal must be a valid number' })
  @Min(0, { message: 'Food goal cannot be negative' })
  @Max(10000, { message: 'Food goal cannot exceed $10,000' })
  @Transform(({ value }) => parseFloat(value))
  food?: number;

  @ApiPropertyOptional({
    description: 'Updated monthly goal for medical care expenses',
    minimum: 0,
    maximum: 10000,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Medical goal must be a valid number' })
  @Min(0, { message: 'Medical goal cannot be negative' })
  @Max(10000, { message: 'Medical goal cannot exceed $10,000' })
  @Transform(({ value }) => parseFloat(value))
  medical?: number;

  @ApiPropertyOptional({
    description: 'Updated monthly goal for other expenses',
    minimum: 0,
    maximum: 10000,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Other expenses goal must be a valid number' })
  @Min(0, { message: 'Other expenses goal cannot be negative' })
  @Max(10000, { message: 'Other expenses goal cannot exceed $10,000' })
  @Transform(({ value }) => parseFloat(value))
  other?: number;
}
