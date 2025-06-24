// src/users/users.controller.ts
import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  DefaultValuePipe,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/user.decorator';
import { UserRole } from './entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import {
  ProfileResponseDto,
  PawPointsResponseDto,
  PawPointTransactionResponseDto,
  AdoptionEligibilityResponseDto,
} from './dto/profile-response.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Get current user's profile
   */
  @Get('profile')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.DONOR)
  async getProfile(@GetUser('id') userId: string): Promise<ProfileResponseDto> {
    return this.usersService.getProfile(userId);
  }

  /**
   * Update user profile
   */
  @Put('profile')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.DONOR, UserRole.SHELTER)
  async updateProfile(
    @GetUser('id') userId: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<ProfileResponseDto> {
    return this.usersService.updateProfile(userId, updateProfileDto);
  }

  /**
   * Get PawPoints balance and summary
   */
  @Get('pawpoints')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.DONOR)
  async getPawPoints(@GetUser('id') userId: string): Promise<PawPointsResponseDto> {
    return this.usersService.getPawPointsBalance(userId);
  }

  /**
   * Get PawPoints transaction history
   */
  @Get('pawpoints/history')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.DONOR)
  async getPawPointsHistory(
    @GetUser('id') userId: string,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ): Promise<PawPointTransactionResponseDto[]> {
    // Validate limits
    if (limit > 100) {
      throw new BadRequestException('Maximum limit is 100 records');
    }
    if (limit < 1) {
      throw new BadRequestException('Minimum limit is 1 record');
    }
    if (offset < 0) {
      throw new BadRequestException('Offset cannot be negative');
    }

    return this.usersService.getPawPointsHistory(userId, limit, offset);
  }

  /**
   * Check adoption eligibility
   */
  @Get('adoption-eligibility')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.DONOR)
  async checkAdoptionEligibility(
    @GetUser('id') userId: string,
  ): Promise<AdoptionEligibilityResponseDto> {
    return this.usersService.checkAdoptionEligibility(userId);
  }

  /**
   * Upload profile image
   */
  @Post('profile-image')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('image'))
  @Roles(UserRole.DONOR, UserRole.SHELTER)
  async uploadProfileImage(
    @GetUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ message: string; imageUrl: string }> {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    // Validate file type
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only JPEG and PNG images are allowed');
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException('Image size cannot exceed 5MB');
    }

    // TODO: Upload to Cloudinary
    // For now, we'll simulate with a mock URL
    const updatedProfile = await this.usersService.updateProfileImage(
      userId,
      file,
    );

    return {
      message: 'Profile image uploaded successfully',
      imageUrl: updatedProfile.profileImage ?? '', // Use '' if undefined, or throw if you prefer
    };
  }

  /**
   * Upload profile image via base64 (React Native compatible)
   */
  @Post('profile-image-base64')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.DONOR, UserRole.SHELTER)
  async uploadProfileImageBase64(
    @GetUser('id') userId: string,
    @Body() body: { image: string; mimeType: string; filename: string },
  ): Promise<{ message: string; imageUrl: string }> {
    if (!body.image) {
      throw new BadRequestException('No image data provided');
    }

    // Use the new UploadsService base64 method
    const uploadResult = await this.usersService.uploadProfileImageBase64(
      userId,
      body.image,
      body.mimeType,
      body.filename,
    );

    return {
      message: 'Profile image uploaded successfully',
      imageUrl: uploadResult.profileImage ?? '',
    };
  }

  /**
   * Get supported pets (pets user has donated to)
   */
  @Get('supported-pets')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.DONOR)
  async getSupportedPets(@GetUser('id') userId: string) {
    return this.usersService.getSupportedPets(userId);
  }

  /**
   * Force recalculate profile completion (debug/fix endpoint)
   */
  @Post('recalculate-profile')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.DONOR)
  async recalculateProfile(
    @GetUser('id') userId: string,
  ): Promise<ProfileResponseDto> {
    return await this.usersService.forceRecalculateProfile(userId);
  }


}
