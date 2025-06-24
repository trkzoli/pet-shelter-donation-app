
import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SheltersService } from './shelters.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole } from '../users/entities/user.entity';
import { UpdateShelterDto } from './dto/update-shelter.dto';
import {
  ShelterResponseDto,
  ShelterStatsResponseDto,
  VerificationSubmissionDto,
} from './dto/shelter-response.dto';

@Controller('shelters')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SheltersController {
  constructor(private readonly sheltersService: SheltersService) {}


  @Get('profile')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.SHELTER)
  async getProfile(@GetUser('id') userId: string): Promise<ShelterResponseDto> {
    return this.sheltersService.getProfile(userId);
  }


  @Put('profile')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.SHELTER)
  async updateProfile(
    @GetUser('id') userId: string,
    @Body() updateShelterDto: UpdateShelterDto,
  ): Promise<ShelterResponseDto> {
    return this.sheltersService.updateProfile(userId, updateShelterDto);
  }


  @Get('stats')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.SHELTER)
  async getStats(@GetUser('id') userId: string): Promise<ShelterStatsResponseDto> {
    return this.sheltersService.getStats(userId);
  }


  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.SHELTER)
  @UseInterceptors(FileInterceptor('verification_document'))
  async submitVerification(
    @GetUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<VerificationSubmissionDto> {
    if (!file) {
      throw new BadRequestException('Verification document is required');
    }


    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/pdf',
    ];
    
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only JPEG, PNG, and PDF files are allowed');
    }


    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('File size cannot exceed 10MB');
    }



    return this.sheltersService.submitVerification(userId, file);
  }


  @Get('can-publish-pets')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.SHELTER)
  async canPublishPets(@GetUser('id') userId: string): Promise<{ canPublish: boolean; reason?: string }> {
    const canPublish = await this.sheltersService.canPublishPets(userId);
    if (!canPublish) {
      return {
        canPublish: false,
        reason:
          'Shelter must be verified and have 100% complete profile to publish pets',
      };
    }


    const hasReachedLimit =
      await this.sheltersService.hasReachedPetLimit(userId);
    if (hasReachedLimit) {
      return {
        canPublish: false,
        reason:
          'Maximum of 10 published pets allowed. Remove or adopt out some pets first.',
      };
    }

    return { canPublish: true };
  }


  @Get('can-create-campaigns')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.SHELTER)
  async canCreateCampaigns(@GetUser('id') userId: string): Promise<{ canCreate: boolean; reason?: string }> {
    const canCreate = await this.sheltersService.canCreateCampaigns(userId);
    
    if (!canCreate) {
      return {
        canCreate: false,
        reason: 'Shelter must be verified to create fundraising campaigns',
      };
    }

    return { canCreate: true };
  }


  @Public()
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getShelterById(@Param('id') shelterId: string): Promise<ShelterResponseDto> {
    return this.sheltersService.getShelterById(shelterId);
  }


  @Post('manual-verify')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.SHELTER)
  async manualVerify(@GetUser('id') userId: string): Promise<{ message: string }> {
    const shelter = await this.sheltersService.getProfile(userId);
    
    if (shelter.verificationStatus === 'verified') {
      return { message: 'Shelter is already verified' };
    }


    await this.sheltersService.manualVerify(userId);
    
    return { message: 'Shelter has been manually verified for testing' };
  }


  @Get('verification/status')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.SHELTER)
  async getVerificationStatus(@GetUser('id') userId: string): Promise<{
    status: string;
    canSubmit: boolean;
    profileCompleteness: number;
    message: string;
  }> {
    const shelter = await this.sheltersService.getProfile(userId);
    
    const canSubmit = shelter.profileCompleteness >= 80 && 
                     shelter.verificationStatus !== 'verified';

    let message = '';
    switch (shelter.verificationStatus) {
      case 'pending':
        message = 'Verification is under review. This may take 3-5 business days.';
        break;
      case 'verified':
        message = 'Your shelter is verified! You can now publish pets and create campaigns.';
        break;
      case 'rejected':
        message = 'Verification was rejected. Please contact support for details.';
        break;
      default:
        message = canSubmit 
          ? 'You can now submit your verification documents.' 
          : `Complete your profile (currently ${shelter.profileCompleteness}%) to submit verification.`;
    }

    return {
      status: shelter.verificationStatus,
      canSubmit,
      profileCompleteness: shelter.profileCompleteness,
      message,
    };
  }
}
