// src/auth/dto/resend-verification.dto.ts
import { IsEmail } from 'class-validator';

export class ResendVerificationDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;
}