// src/auth/dto/verify-email.dto.ts
import { IsEmail, IsString, Length } from 'class-validator';

export class VerifyEmailDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString()
  @Length(4, 4, { message: 'Verification code must be exactly 4 digits' })
  code: string;
}