// src/adoptions/dto/adoption-request.dto.ts
import { IsUUID, IsOptional, IsString, IsNumber, Min, Max, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateAdoptionRequestDto {
  @IsUUID()
  petId: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  message?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Transform(({ value }) => parseInt(value))
  pawPointsToUse?: number = 0;
}

export class UpdateAdoptionStatusDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  statusReason?: string;

  @IsOptional()
  @IsString()
  adoptionProofImage?: string;
}

export class CancelAdoptionRequestDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
