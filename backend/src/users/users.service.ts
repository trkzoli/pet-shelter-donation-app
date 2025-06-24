// src/users/users.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';
import { User, UserRole } from './entities/user.entity';
import { PawPointTransaction } from '../donations/entities/pawpoint-transaction.entity';
import { Donation } from '../donations/entities/donation.entity';
import {
  AdoptionRequest,
  AdoptionStatus,
} from '../adoptions/entities/adoption-request.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UploadsService, UploadType } from '../uploads/uploads.service';
import {
  ProfileResponseDto,
  PawPointsResponseDto,
  PawPointTransactionResponseDto,
  AdoptionEligibilityResponseDto,
} from './dto/profile-response.dto';


export type SupportedPet = {
  id: string;
  name: string;
  breed: string;
  age: number;
  gender: string;
  type: string;
  mainImage: string;
  status: string;
  shelterName: string;
  totalDonated: string;
};

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(PawPointTransaction)
    private readonly pawPointTransactionRepository: Repository<PawPointTransaction>,
    @InjectRepository(Donation)
    private readonly donationRepository: Repository<Donation>,
    @InjectRepository(AdoptionRequest)
    private readonly adoptionRequestRepository: Repository<AdoptionRequest>,
    private readonly uploadsService: UploadsService,
  ) {}

  /**
   * Get user profile by ID
   */
  async getProfile(userId: string): Promise<ProfileResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return plainToClass(ProfileResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<ProfileResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateProfileDto.email) user.email = updateProfileDto.email;
    if (updateProfileDto.name) user.name = updateProfileDto.name;
    if (updateProfileDto.phone) user.phone = updateProfileDto.phone;
    if (updateProfileDto.street) user.street = updateProfileDto.street;
    if (updateProfileDto.city) user.city = updateProfileDto.city;
    if (updateProfileDto.state) user.state = updateProfileDto.state;
    if (updateProfileDto.zip) user.zip = updateProfileDto.zip;
    if (updateProfileDto.country) user.country = updateProfileDto.country;
    if (updateProfileDto.occupation) user.occupation = updateProfileDto.occupation;
    if (updateProfileDto.workSchedule) user.workSchedule = updateProfileDto.workSchedule;
    if (updateProfileDto.housingType) user.housingType = updateProfileDto.housingType;
    if (updateProfileDto.housingOwnership) user.housingOwnership = updateProfileDto.housingOwnership;
    if (typeof updateProfileDto.hasYard === 'boolean') user.hasYard = updateProfileDto.hasYard;
    if (typeof updateProfileDto.isFenced === 'boolean') user.isFenced = updateProfileDto.isFenced;
    if (updateProfileDto.currentPets) user.currentPets = updateProfileDto.currentPets;
    if (updateProfileDto.petExperience) user.petExperience = updateProfileDto.petExperience;

    const updatedUser = await this.userRepository.save(user);

    return plainToClass(ProfileResponseDto, updatedUser, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Calculate profile completion percentage
   */
  calculateProfileCompletion(user: User): number {
    if (user.role === UserRole.SHELTER) {
      return 0;
    }

    const requiredFields = ['email', 'name', 'phone', 'street', 'city', 'state', 'zip', 'country'];
    const optionalFields = ['occupation', 'workSchedule', 'housingType', 'housingOwnership', 'currentPets', 'petExperience'];
    
    const filledRequired = requiredFields.filter((field) => {
      const value = user[field];
      return value !== null && value !== undefined && value !== '';
    });

    const filledOptional = optionalFields.filter((field) => {
      const value = user[field];
      return value !== null && value !== undefined && value !== '';
    });

    const totalFields = requiredFields.length + optionalFields.length;
    const filledFields = filledRequired.length + filledOptional.length;

    return Math.round((filledFields / totalFields) * 100);
  }

  /**
   * Force recalculate profile completion (debug/fix method)
   */
  async forceRecalculateProfile(userId: string): Promise<ProfileResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Force recalculation
    user.calculateProfileCompletion();
    const updatedUser = await this.userRepository.save(user);

    return plainToClass(ProfileResponseDto, updatedUser, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Get PawPoints balance and summary
   */
  async getPawPointsBalance(userId: string): Promise<PawPointsResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== UserRole.DONOR) {
      throw new ForbiddenException('Only donor users have PawPoints');
    }

    // Get transaction summaries
    const earnedResult = await this.pawPointTransactionRepository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.points)', 'total')
      .where('transaction.userId = :userId', { userId })
      .andWhere('transaction.points > 0')
      .getRawOne() as { total: string | null };

    const spentResult = await this.pawPointTransactionRepository
      .createQueryBuilder('transaction')
      .select('SUM(ABS(transaction.points))', 'total')
      .where('transaction.userId = :userId', { userId })
      .andWhere('transaction.points < 0')
      .getRawOne() as { total: string | null };

    const totalEarned = parseFloat(earnedResult?.total || '0');
    const totalSpent = parseFloat(spentResult?.total || '0');

    return {
      balance: user.pawPoints,
      totalEarned,
      totalSpent,
      totalDonated: user.totalDonated,
    };
  }

  /**
   * Get PawPoints transaction history
   */
  async getPawPointsHistory(
    userId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<PawPointTransactionResponseDto[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== UserRole.DONOR) {
      throw new ForbiddenException('Only donor users have PawPoints');
    }

    const transactions = await this.pawPointTransactionRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return transactions.map((transaction) =>
      plainToClass(PawPointTransactionResponseDto, transaction, {
        excludeExtraneousValues: true,
      }),
    );
  }

  /**
   * Check adoption eligibility
   */
  async checkAdoptionEligibility(userId: string): Promise<AdoptionEligibilityResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== UserRole.DONOR) {
      throw new ForbiddenException('Only donor users can adopt pets');
    }

    const minimumRequirements = {
      profileCompletion: 100,
      minimumPawPoints: 5,
    };

    const reasons: string[] = [];
    let isEligible = true;

    // Check profile completion
    const profileCompleteness = this.calculateProfileCompletion(user);
    if (profileCompleteness < minimumRequirements.profileCompletion) {
      isEligible = false;
      reasons.push(
        `Profile must be 100% complete (currently ${profileCompleteness}%)`,
      );
    }

    // Check PawPoints
    if (user.pawPoints < minimumRequirements.minimumPawPoints) {
      isEligible = false;
      reasons.push(
        `Minimum ${minimumRequirements.minimumPawPoints} PawPoints required (you have ${user.pawPoints})`,
      );
    }

    // Check for active adoption requests
    const activeRequest = await this.adoptionRequestRepository.findOne({
      where: {
        userId,
        status: AdoptionStatus.PENDING,
      },
    });

    if (activeRequest) {
      isEligible = false;
      reasons.push('You already have an active adoption request');
    }

    if (isEligible) {
      reasons.push('You are eligible to request pet adoptions!');
    }

    return {
      isEligible,
      reasons,
      profileCompleteness,
      pawPoints: user.pawPoints,
      minimumRequirements,
    };
  }

  /**
   * Update user's profile image
   */
  async updateProfileImage(userId: string, file: Express.Multer.File): Promise<ProfileResponseDto> {
    // 1. Upload to Cloudinary
    const result = await this.uploadsService.uploadSingleImage(
      file,
      UploadType.PROFILE_IMAGE,
      userId,
    );
    // 2. Save URL to user profile
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.profileImage = result.secureUrl;
    const updatedUser = await this.userRepository.save(user);

    // Return DTO as before!
    return plainToClass(ProfileResponseDto, updatedUser, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Update user's profile image via base64 data
   */
  async uploadProfileImageBase64(
    userId: string,
    base64Data: string,
    mimeType: string,
    filename: string,
  ): Promise<ProfileResponseDto> {
    // 1. Upload to Cloudinary using base64 method
    const result = await this.uploadsService.uploadBase64Image(
      base64Data,
      UploadType.PROFILE_IMAGE,
      filename,
      mimeType,
      userId,
    );

    // 2. Save URL to user profile
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.profileImage = result.secureUrl;
    const updatedUser = await this.userRepository.save(user);

    // Return DTO
    return plainToClass(ProfileResponseDto, updatedUser, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Get supported pets for a donor
   */
  async getSupportedPets(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== UserRole.DONOR) {
      throw new ForbiddenException('Only donors can have supported pets');
    }

    // Get pets that user has donated to
    const donations: SupportedPet[] = await this.donationRepository
      .createQueryBuilder('donation')
      .innerJoinAndSelect('donation.pet', 'pet')
      .innerJoinAndSelect('pet.shelter', 'shelter')
      .where('donation.userId = :userId', { userId })
      .andWhere('donation.type = :type', { type: 'pet' })
      .groupBy('pet.id, shelter.id')
      .select([
        'pet.id',
        'pet.name',
        'pet.breed',
        'pet.age',
        'pet.gender',
        'pet.type',
        'pet.mainImage',
        'pet.status',
        'shelter.shelterName',
        'SUM(donation.amount) as totalDonated',
      ])
      .getRawMany();

    return donations;
  }

  /**
   * Check if user exists and is active
   */
  async validateUser(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.emailVerified) {
      throw new ForbiddenException('Email not verified');
    }

    return user;
  }


}
