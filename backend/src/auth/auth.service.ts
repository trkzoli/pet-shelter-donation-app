// src/auth/auth.service.ts
import {
  Injectable,
  Logger,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User, UserRole } from '../users/entities/user.entity';
import { Shelter, PetSpecialization } from '../shelters/entities/shelter.entity';
import { RegisterDonorDto, RegisterShelterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { AuthResponse, MessageResponse } from './responses/auth.response';
import { JwtPayload } from './strategies/jwt.strategy';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Shelter)
    private readonly shelterRepository: Repository<Shelter>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly notificationService: NotificationsService,
  ) {}

  async registerDonor(
    registerDonorDto: RegisterDonorDto,
  ): Promise<MessageResponse> {
    const { email, password, name } = registerDonorDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Create new donor user
    const user = this.userRepository.create({
      email: email.toLowerCase().trim(),
      password,
      name: name.trim(),
      role: UserRole.DONOR,
    });

    // Generate verification code
    user.generateVerificationCode();

    await this.userRepository.save(user);

    // Send verification email using NotificationService
    await this.notificationService.sendVerificationEmail(
      user.email,
      user.name || '',
      user.verificationCode || ''
    );

    return {
      message:
        'Registration successful! Please check your email for verification code.',
    };
  }

  async registerShelter(
    registerShelterDto: RegisterShelterDto,
  ): Promise<MessageResponse> {
    const { email, password, name, phone } = registerShelterDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Create new shelter user
    const user = this.userRepository.create({
      email: email.toLowerCase().trim(),
      password,
      name: name.trim(),
      phone: phone.trim(),
      role: UserRole.SHELTER,
    });

    // Generate verification code
    user.generateVerificationCode();

    await this.userRepository.save(user);

    // Create shelter profile with minimal/default values
    const shelter = new Shelter();
    shelter.shelterName = name.trim();
    shelter.description = '';
    shelter.petSpecialization = PetSpecialization.BOTH;
    shelter.licenseNumber = `TEMP-${Date.now()}`;
    shelter.yearEstablished = 2000;
    shelter.contactPerson = 'To be completed';
    shelter.contactTitle = 'To be completed';
    shelter.operatingHours = {};
    shelter.website = undefined;
    shelter.facebook = undefined;
    shelter.instagram = undefined;
    shelter.verificationStatus = 'pending';
    shelter.totalDonationsReceived = 0;
    shelter.adoptionsCompleted = 0;
    shelter.currentPublishedPets = 0;
    shelter.profileCompleteness = 0;
    shelter.userId = user.id;
    shelter.user = user;

    await this.shelterRepository.save(shelter);

    // Send verification email using NotificationService
    await this.notificationService.sendVerificationEmail(
      user.email,
      user.name || '',
      user.verificationCode || ''
    );

    return {
      message:
        'Shelter registration successful! Please check your email for verification code.',
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { email, password } = loginDto;

    // Find user with shelter relation
    const user = await this.userRepository.findOne({
      where: { email: email.toLowerCase().trim() },
      relations: ['shelter'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check if email is verified
    if (!user.emailVerified) {
      throw new UnauthorizedException(
        'Please verify your email before logging in',
      );
    }

    // Generate JWT token
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        emailVerified: user.emailVerified,
        profileCompleteness: user.profileCompleteness,
        pawPoints: user.role === UserRole.DONOR ? user.pawPoints : undefined,
      },
      accessToken,
      message: 'Login successful',
    };
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto): Promise<AuthResponse> {
    const { email, code } = verifyEmailDto;

    const user = await this.userRepository.findOne({
      where: { email: email.toLowerCase().trim() },
      relations: ['shelter'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    if (!user.isVerificationCodeValid(code)) {
      throw new BadRequestException('Invalid or expired verification code');
    }

    // Verify email
    user.emailVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpiry = undefined;

    await this.userRepository.save(user);

    // Generate JWT token and return full auth response like login
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        emailVerified: user.emailVerified,
        profileCompleteness: user.profileCompleteness,
        pawPoints: user.role === UserRole.DONOR ? user.pawPoints : undefined,
      },
      accessToken,
      message: 'Email verified successfully! Welcome to Pawner!',
    };
  }

  async resendVerificationCode(
    resendDto: ResendVerificationDto,
  ): Promise<MessageResponse> {
    const { email } = resendDto;

    const user = await this.userRepository.findOne({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    // Generate new verification code
    user.generateVerificationCode();
    await this.userRepository.save(user);

    // Send verification email using NotificationService
    await this.notificationService.sendVerificationEmail(
      user.email,
      user.name || '',
      user.verificationCode || ''
    );

    return { message: 'New verification code sent to your email' };
  }

  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<MessageResponse> {
    const { email } = forgotPasswordDto;

    const user = await this.userRepository.findOne({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      // Don't reveal if email exists for security
      return {
        message:
          'If an account with this email exists, password reset instructions have been sent.',
      };
    }

    // Send password reset notification email
    try {
      await this.notificationService.sendPasswordResetNotification(
        user.email, 
        user.name || 'User'
      );
      this.logger.log(`Password reset notification sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${email}:`, error);
      // Still return success message for security (don't reveal if email exists)
    }

    return {
      message:
        'If an account with this email exists, password reset instructions have been sent.',
    };
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<MessageResponse> {
    const { token, newPassword } = resetPasswordDto;

    const user = await this.userRepository.findOne({
      where: { resetToken: token },
    });

    if (!user || !user.isResetTokenValid(token)) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Update password
    user.password = newPassword; // Will be hashed by BeforeInsert/BeforeUpdate hook
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    await this.userRepository.save(user);

    return { message: 'Password reset successfully! You can now log in with your new password.' };
  }

  async getCurrentUser(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['shelter'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      emailVerified: user.emailVerified,
      profileCompleteness: user.profileCompleteness,
      pawPoints: user.role === UserRole.DONOR ? user.pawPoints : undefined,
      totalDonated: user.role === UserRole.DONOR ? user.totalDonated : undefined,
      shelter: user.shelter ? {
        id: user.shelter.id,
        shelterName: user.shelter.shelterName,
        verificationStatus: user.shelter.verificationStatus,
        currentPublishedPets: user.shelter.currentPublishedPets,
      } : undefined,
      createdAt: user.createdAt,
    };
  }
}