// src/adoptions/adoptions.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { plainToClass } from 'class-transformer';
import { ConfigService } from '@nestjs/config';
import { AdoptionRequest, AdoptionStatus } from './entities/adoption-request.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { Pet, PetStatus } from '../pets/entities/pet.entity';
import { Shelter } from '../shelters/entities/shelter.entity';
import { Donation, DonationStatus } from '../donations/entities/donation.entity';
import { PawPointTransaction, TransactionType } from '../donations/entities/pawpoint-transaction.entity';
import { SuccessStory, SuccessStoryType } from '../success-stories/entities/success-story.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { SuccessStoriesService } from '../success-stories/success-stories.service';
import {
  CreateAdoptionRequestDto,
  UpdateAdoptionStatusDto,
  CancelAdoptionRequestDto,
} from './dto/adoption-request.dto';
import {
  AdoptionRequestResponseDto,
  EligiblePetDto,
  AdoptionRequestEmailDataDto,
} from './dto/adoption-response.dto';

@Injectable()
export class AdoptionsService {
  constructor(
    @InjectRepository(AdoptionRequest)
    private readonly adoptionRequestRepository: Repository<AdoptionRequest>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Pet)
    private readonly petRepository: Repository<Pet>,
    @InjectRepository(Shelter)
    private readonly shelterRepository: Repository<Shelter>,
    @InjectRepository(Donation)
    private readonly donationRepository: Repository<Donation>,
    @InjectRepository(PawPointTransaction)
    private readonly pawPointTransactionRepository: Repository<PawPointTransaction>,
    @InjectRepository(SuccessStory)
    private readonly successStoryRepository: Repository<SuccessStory>,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
    private readonly notificationService: NotificationsService, // Assuming you have a notification service for sending emails
    private readonly successStoriesService: SuccessStoriesService,
  ) {}

  /**
   * Check adoption eligibility for a user
   */
  async checkAdoptionEligibility(userId: string) {
    // Force fresh data retrieval with no caching
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== UserRole.DONOR) {
      throw new ForbiddenException('Only donor users can adopt pets');
    }

    const reasons: string[] = [];
    let isEligible = true;

    // Check profile completion (100% required)
    const profileCompleteness = this.calculateProfileCompletion(user);
    
    if (profileCompleteness < 100) {
      isEligible = false;
      reasons.push(`Profile must be 100% complete (currently ${profileCompleteness}%)`);
    }

    // Check PawPoints (minimum 5 required AND must be spent)
    if (user.pawPoints < 5) {
      isEligible = false;
      reasons.push(`Minimum 5 PawPoints required and must be spent on adoption fee reduction (you have ${user.pawPoints})`);
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

    // Check cooldown periods
    const cooldownCheck = await this.checkCooldownPeriods(userId);
    if (!cooldownCheck.canRequest) {
      isEligible = false;
      if (cooldownCheck.reason) reasons.push(cooldownCheck.reason);
    }

    return {
      isEligible,
      reasons,
      pawPoints: user.pawPoints,
      profileCompleteness,
      activeRequest: activeRequest ? activeRequest.id : null,
    };
  }

  /**
   * Get pets that user is eligible to adopt (has donated to)
   */
  async getEligiblePets(userId: string): Promise<EligiblePetDto[]> {
    // TEMPORARY: Skip eligibility check since frontend already validated
    // First check if user is eligible for adoption
    // const eligibility = await this.checkAdoptionEligibility(userId);
    // if (!eligibility.isEligible) {
    //   throw new BadRequestException(
    //     `You are not eligible for adoption: ${eligibility.reasons.join(', ')}`
    //   );
    // }

    // Get pets user has donated to that are still published
    const donatedPets = await this.donationRepository
      .createQueryBuilder('donation')
      .leftJoinAndSelect('donation.pet', 'pet')
      .leftJoinAndSelect('pet.shelter', 'shelter')
      .where('donation.userId = :userId', { userId })
      .andWhere('donation.status = :status', { status: DonationStatus.COMPLETED })
      .andWhere('pet.status = :petStatus', { petStatus: PetStatus.PUBLISHED })
      .andWhere('donation.petId IS NOT NULL')
      .getMany();

    // Group donations by pet and calculate totals
    const petStatsMap = new Map();

    for (const donation of donatedPets) {
      if (!donation.pet) continue;
      const petId = donation.pet.id;  
      if (petStatsMap.has(petId)) {
        const existing = petStatsMap.get(petId);
        existing.totalDonated += donation.amount;
        existing.donationCount += 1;
        existing.lastDonation = new Date(Math.max(
          existing.lastDonation.getTime(),
          donation.createdAt.getTime()
        ));
      } else {
        petStatsMap.set(petId, {
          pet: donation.pet,
          totalDonated: donation.amount,
          donationCount: 1,
          firstDonation: donation.createdAt,
          lastDonation: donation.createdAt,
        });
      }
    }

    // Check which pets have pending requests
    const petIds = Array.from(petStatsMap.keys());
    const pendingRequests = await this.adoptionRequestRepository.find({
      where: {
        petId: In(petIds),
        status: AdoptionStatus.PENDING,
      },
    });

    const petsWithPendingRequests = new Set(pendingRequests.map(req => req.petId));

    // Get user for PawPoints info
    const user = await this.userRepository.findOne({ where: { id: userId } });

    // Convert to DTOs, excluding pets with pending requests
    const eligiblePets: EligiblePetDto[] = [];

    petStatsMap.forEach((stats, petId) => {
      if (!petsWithPendingRequests.has(petId)) {
        const petDto = plainToClass(EligiblePetDto, {
          ...stats.pet,
          totalDonated: stats.totalDonated,
          firstDonationDate: stats.firstDonation,
          lastDonationDate: stats.lastDonation,
          donationCount: stats.donationCount,
          pawPointsAvailable: user?.pawPoints ?? 0
        }, { excludeExtraneousValues: true });

        eligiblePets.push(petDto);
      }
    });

    // Sort by last donation date (most recent first)
    return eligiblePets.sort((a, b) => 
      new Date(b.lastDonationDate).getTime() - new Date(a.lastDonationDate).getTime()
    );
  }

  /**
   * Create adoption request
   */
  async createAdoptionRequest(
    userId: string,
    createDto: CreateAdoptionRequestDto,
  ): Promise<AdoptionRequestResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check eligibility
      const eligibility = await this.checkAdoptionEligibility(userId);
      if (!eligibility.isEligible) {
        throw new BadRequestException(
          `Not eligible for adoption: ${eligibility.reasons.join(', ')}`
        );
      }

      // Verify user has donated to this pet
      const userDonation = await queryRunner.manager.findOne(Donation, {
        where: {
          userId,
          petId: createDto.petId,
          status: DonationStatus.COMPLETED,
        },
      });

      if (!userDonation) {
        throw new BadRequestException(
          'You can only request adoption for pets you have donated to'
        );
      }

      // Get pet with shelter info
      const pet = await queryRunner.manager.findOne(Pet, {
        where: { id: createDto.petId, status: PetStatus.PUBLISHED },
        relations: ['shelter', 'shelter.user'],
      });

      if (!pet) {
        throw new NotFoundException('Pet not found or not available for adoption');
      }

      // Check if pet already has pending request
      const existingRequest = await queryRunner.manager.findOne(AdoptionRequest, {
        where: {
          petId: createDto.petId,
          status: AdoptionStatus.PENDING,
        },
      });

      if (existingRequest) {
        throw new ConflictException('This pet already has a pending adoption request');
      }

      // Get user and validate PawPoints
      const user = await queryRunner.manager.findOne(User, { 
        where: { id: userId } 
      });
      
      const pawPointsToUse = createDto.pawPointsToUse || 0;
      if (!user) {
        throw new NotFoundException('User not found');
      }
      
      // Enforce minimum 5 PawPoints requirement for adoption requests
      if (pawPointsToUse < 5) {
        throw new BadRequestException(
          `You must spend at least 5 PawPoints on adoption fee reduction. You tried to spend ${pawPointsToUse}.`
        );
      }
      
      if (pawPointsToUse > user.pawPoints) {
        throw new BadRequestException(
          `Insufficient PawPoints. You have ${user.pawPoints}, trying to use ${pawPointsToUse}`
        );
      }

      // Create adoption request
      const adoptionRequest = AdoptionRequest.create(
        userId,
        createDto.petId,
        pet.shelterId,
        pawPointsToUse,
        createDto.message,
      );

      // Deduct PawPoints if using any
      if (pawPointsToUse > 0) {
        user.pawPoints -= pawPointsToUse;

        // Create PawPoint transaction
        const pawPointTransaction = PawPointTransaction.createSpentTransaction(
          userId,
          pawPointsToUse,
          `Used for adoption request: ${pet.name}`,
          user.pawPoints,
        );

        await queryRunner.manager.save(User, user);
        await queryRunner.manager.save(PawPointTransaction, pawPointTransaction);
      }

      // Save adoption request
      const savedRequest = await queryRunner.manager.save(AdoptionRequest, adoptionRequest);

      // Mark email as sent (will be sent by notification service)
      savedRequest.emailSentAt = new Date();
      await queryRunner.manager.save(AdoptionRequest, savedRequest);

      await queryRunner.commitTransaction();

      // TODO: Send email notification to shelter (Phase 11)
      // await this.notificationService.sendAdoptionRequestEmail(savedRequest.id);

      return plainToClass(AdoptionRequestResponseDto, savedRequest, {
        excludeExtraneousValues: true,
      });

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Get user's adoption requests
   */
  async getUserRequests(userId: string): Promise<AdoptionRequestResponseDto[]> {
    const requests = await this.adoptionRequestRepository.find({
      where: { userId },
      relations: ['pet', 'shelter'],
      order: { createdAt: 'DESC' },
    });

    return requests.map(request =>
      plainToClass(AdoptionRequestResponseDto, request, {
        excludeExtraneousValues: true,
      }),
    );
  }

  /**
   * Get shelter's adoption requests
   */
  async getShelterRequests(shelterUserId: string): Promise<AdoptionRequestResponseDto[]> {
    // First get shelter by user ID
    const shelter = await this.shelterRepository.findOne({
      where: { userId: shelterUserId },
    });

    if (!shelter) {
      throw new NotFoundException('Shelter not found for this user');
    }

    const requests = await this.adoptionRequestRepository.find({
      where: { shelterId: shelter.id },
      relations: ['pet', 'user'],
      order: { createdAt: 'DESC' },
    });

    // Include donation history for each request
    const requestsWithDonations = await Promise.all(
      requests.map(async (request) => {
        const totalDonatedResult = await this.donationRepository
          .createQueryBuilder('donation')
          .select('SUM(donation.amount)', 'total')
          .where('donation.userId = :userId', { userId: request.userId })
          .andWhere('donation.petId = :petId', { petId: request.petId })
          .andWhere('donation.status = :status', { status: DonationStatus.COMPLETED })
          .getRawOne();

        const requestDto = plainToClass(AdoptionRequestResponseDto, request, {
          excludeExtraneousValues: true,
        });

        // Add total donated to user info
        if (requestDto.user) {
          (requestDto.user as any).totalDonatedToPet = parseFloat(totalDonatedResult?.total || '0');
        }

        return requestDto;
      }),
    );

    return requestsWithDonations;
  }

  /**
   * Get adoption request by ID
   */
  async getRequestById(requestId: string, userId: string): Promise<AdoptionRequestResponseDto> {
    const request = await this.adoptionRequestRepository.findOne({
      where: { id: requestId },
      relations: ['pet', 'user', 'shelter'],
    });

    if (!request) {
      throw new NotFoundException('Adoption request not found');
    }

    // Check if user has permission to view this request
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const isRequester = request.userId === userId;

    if (!user) {
      throw new NotFoundException('User not found');
    }
    const isShelterOwner = user.role === UserRole.SHELTER && request.shelter.userId === userId;

    if (!isRequester && !isShelterOwner) {
      throw new ForbiddenException('Not authorized to view this adoption request');
    }

    return plainToClass(AdoptionRequestResponseDto, request, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Cancel adoption request (user only, 24-hour window)
   */
  async cancelRequest(
    requestId: string,
    userId: string,
    cancelDto: CancelAdoptionRequestDto,
  ): Promise<AdoptionRequestResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const request = await queryRunner.manager.findOne(AdoptionRequest, {
        where: { id: requestId, userId },
        relations: ['pet'],
      });

      if (!request) {
        throw new NotFoundException('Adoption request not found');
      }

      if (!request.canBeCancelled) {
        throw new BadRequestException(
          'Cannot cancel this request. 24-hour cancellation window has passed.'
        );
      }

      // Cancel the request
      request.cancel();
      if (cancelDto.reason) {
        request.statusReason = cancelDto.reason;
      }

      // Refund PawPoints if any were used
      if (request.pawPointsUsedForReduction > 0) {
        const user = await queryRunner.manager.findOne(User, { 
          where: { id: userId } 
        });
        if (!user) {
          throw new NotFoundException('User not found');
        }
        user.pawPoints += request.pawPointsUsedForReduction;

        const pawPointTransaction = PawPointTransaction.createSpentTransaction(
          userId,
          -request.pawPointsUsedForReduction, // Negative to show refund
          `Refund from cancelled adoption request: ${request.pet.name}`,
          user.pawPoints,
        );

        await queryRunner.manager.save(User, user);
        await queryRunner.manager.save(PawPointTransaction, pawPointTransaction);
      }

      const savedRequest = await queryRunner.manager.save(AdoptionRequest, request);
      await queryRunner.commitTransaction();

      return plainToClass(AdoptionRequestResponseDto, savedRequest, {
        excludeExtraneousValues: true,
      });

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Approve adoption request (shelter only)
   */
  async approveRequest(
    requestId: string,
    shelterUserId: string,
    updateDto: UpdateAdoptionStatusDto,
  ): Promise<AdoptionRequestResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const request = await queryRunner.manager.findOne(AdoptionRequest, {
        where: { id: requestId },
        relations: ['pet', 'user', 'shelter'],
      });

      if (!request) {
        throw new NotFoundException('Adoption request not found');
      }

      // Check if the user owns the shelter for this request
      if (request.shelter.userId !== shelterUserId) {
        throw new ForbiddenException('Not authorized to approve this request');
      }

      // Approve the request
      request.approve(updateDto.adoptionProofImage);
      if (updateDto.statusReason) {
        request.statusReason = updateDto.statusReason;
      }

      // Update pet status to adopted
      const pet = request.pet;
      pet.status = PetStatus.ADOPTED;

      // Update shelter statistics
      const shelter = request.shelter;
      shelter.adoptionsCompleted++;
      shelter.currentPublishedPets = Math.max(0, shelter.currentPublishedPets - 1);

      // Create success story for internal adoption
      const affectedDonorIds = await this.getAffectedDonorIds(pet.id, request.userId);
      
      const successStory = new SuccessStory();
      successStory.petId = pet.id;
      successStory.type = SuccessStoryType.ADOPTED_INTERNAL;
      successStory.affectedUserIds = affectedDonorIds;
      successStory.adopterId = request.userId;
      successStory.adoptionRequestId = request.id;

      // Save all changes
      await queryRunner.manager.save(Pet, pet);
      await queryRunner.manager.save(Shelter, shelter);
      await queryRunner.manager.save(AdoptionRequest, request);
      await queryRunner.manager.save(SuccessStory, successStory);

      // Award bonus PawPoints to other donors (not the adopter)
      await this.awardAdoptionBonusPoints(queryRunner, pet, request.userId);

      await queryRunner.commitTransaction();

      return plainToClass(AdoptionRequestResponseDto, request, {
        excludeExtraneousValues: true,
      });

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Deny adoption request (shelter only)
   */
  async denyRequest(
    requestId: string,
    shelterUserId: string,
    updateDto: UpdateAdoptionStatusDto,
  ): Promise<AdoptionRequestResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const request = await queryRunner.manager.findOne(AdoptionRequest, {
        where: { id: requestId },
        relations: ['pet', 'shelter'],
      });

      if (!request) {
        throw new NotFoundException('Adoption request not found');
      }

      // Check if the user owns the shelter for this request
      if (request.shelter.userId !== shelterUserId) {
        throw new ForbiddenException('Not authorized to deny this request');
      }

      // Deny the request
      request.deny(updateDto.statusReason);

      // Refund PawPoints if any were used
      if (request.pawPointsUsedForReduction > 0) {
        const user = await queryRunner.manager.findOne(User, {
          where: { id: request.userId },
        });

        if (!user) {
          throw new NotFoundException('User not found');
        }
        user.pawPoints += request.pawPointsUsedForReduction;

        const pawPointTransaction = PawPointTransaction.createSpentTransaction(
          request.userId,
          -request.pawPointsUsedForReduction,
          `Refund from denied adoption request: ${request.pet.name}`,
          user.pawPoints,
        );

        await queryRunner.manager.save(User, user);
        await queryRunner.manager.save(PawPointTransaction, pawPointTransaction);
      }

      const savedRequest = await queryRunner.manager.save(AdoptionRequest, request);
      await queryRunner.commitTransaction();

      return plainToClass(AdoptionRequestResponseDto, savedRequest, {
        excludeExtraneousValues: true,
      });

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Upload adoption proof image
   */
  async uploadAdoptionProof(
    requestId: string,
    userId: string,
    imageUrl: string,
  ): Promise<AdoptionRequestResponseDto> {
    const request = await this.adoptionRequestRepository.findOne({
      where: { id: requestId },
      relations: ['shelter'],
    });

    if (!request) {
      throw new NotFoundException('Adoption request not found');
    }

    // Check if user is the shelter owner
    if (request.shelter.userId !== userId) {
      throw new ForbiddenException('Not authorized to upload proof for this request');
    }

    if (request.status !== AdoptionStatus.APPROVED) {
      throw new BadRequestException('Can only upload proof for approved requests');
    }

    request.adoptionProofImage = imageUrl;
    const savedRequest = await this.adoptionRequestRepository.save(request);

    return plainToClass(AdoptionRequestResponseDto, savedRequest, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Get adoption request email data for notification service
   */
  async getAdoptionRequestEmailData(requestId: string): Promise<AdoptionRequestEmailDataDto> {
    const request = await this.adoptionRequestRepository.findOne({
      where: { id: requestId },
      relations: ['user', 'pet', 'shelter'],
    });

    if (!request) {
      throw new NotFoundException('Adoption request not found');
    }

    // Get total donated to this pet by this user
    const totalDonatedResult = await this.donationRepository
      .createQueryBuilder('donation')
      .select('SUM(donation.amount)', 'total')
      .where('donation.userId = :userId', { userId: request.userId })
      .andWhere('donation.petId = :petId', { petId: request.petId })
      .andWhere('donation.status = :status', { status: DonationStatus.COMPLETED })
      .getRawOne();

    const finalAdoptionFee = Math.max(0, request.pet.adoptionFee - request.feeReduction);

    return plainToClass(AdoptionRequestEmailDataDto, {
      requesterName: request.user.name,
      requesterEmail: request.user.email,
      requesterPhone: request.user.phone,
      petName: request.pet.name,
      petBreed: request.pet.breed,
      message: request.message,
      totalDonatedToPet: parseFloat(totalDonatedResult?.total || '0'),
      pawPointsUsedForReduction: request.pawPointsUsedForReduction,
      feeReduction: request.feeReduction,
      finalAdoptionFee: finalAdoptionFee,
      // User profile details
      housingType: request.user.housingType,
      ownershipStatus: request.user.ownershipStatus,
      hasYard: request.user.hasYard,
      isFenced: request.user.isFenced,
      currentPets: request.user.currentPets,
      experienceLevel: request.user.experienceLevel,
      occupation: request.user.occupation,
      workSchedule: request.user.workSchedule,
      whyAdopt: request.user.whyAdopt,
      street: request.user.street,
      city: request.user.city,
      state: request.user.state,
      zip: request.user.zip,
      country: request.user.country,
    }, { excludeExtraneousValues: true });
  }

  // ==================== PRIVATE HELPER METHODS ====================

  /**
   * Calculate user profile completion percentage
   */
  private calculateProfileCompletion(user: User): number {
    // Required fields excluding yard and fence (optional)
    const requiredFields = [
      'name', 'phone', 'street', 'city', 'state', 'zip', 'country',
      'housingType', 'ownershipStatus', 'currentPets', 'experienceLevel',
      'occupation', 'workSchedule', 'whyAdopt'
    ];

    const completedFields = requiredFields.filter(field => {
      const value = user[field];
      return value !== null && value !== undefined && value !== '';
    });

    return Math.round((completedFields.length / requiredFields.length) * 100);
  }

  /**
   * Check cooldown periods for adoption requests
   */
  private async checkCooldownPeriods(userId: string): Promise<{
    canRequest: boolean;
    reason?: string;
  }> {
    const now = new Date();

    // Check for cancelled request in last 3 days
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const recentCancellation = await this.adoptionRequestRepository.findOne({
      where: {
        userId,
        status: AdoptionStatus.CANCELLED,
      },
      order: { cancelledAt: 'DESC' },
    });

    if (recentCancellation && recentCancellation.cancelledAt && recentCancellation.cancelledAt > threeDaysAgo) {
      const remainingHours = Math.ceil(
        (recentCancellation.cancelledAt.getTime() + 3 * 24 * 60 * 60 * 1000 - now.getTime()) / 
        (60 * 60 * 1000)
      );
      return {
        canRequest: false,
        reason: `3-day cooldown active after cancellation. ${remainingHours} hours remaining.`,
      };
    }

    // Check for denied/approved request in last week
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentRequest = await this.adoptionRequestRepository.findOne({
      where: {
        userId,
      },
      order: { updatedAt: 'DESC' },
    });

    if (recentRequest && (recentRequest.status === AdoptionStatus.DENIED || recentRequest.status === AdoptionStatus.APPROVED)) {
      const relevantDate = recentRequest.deniedAt || recentRequest.approvedAt;
      if (relevantDate && relevantDate > oneWeekAgo) {
        const remainingHours = Math.ceil(
          (relevantDate.getTime() + 7 * 24 * 60 * 60 * 1000 - now.getTime()) / 
          (60 * 60 * 1000)
        );
        return {
          canRequest: false,
          reason: `1-week cooldown active after previous request. ${remainingHours} hours remaining.`,
        };
      }
    }

    return { canRequest: true };
  }

  /**
   * Get affected donor IDs for success story notifications
   */
  private async getAffectedDonorIds(petId: string, excludeUserId?: string): Promise<string[]> {
    const query = this.donationRepository
      .createQueryBuilder('donation')
      .select('DISTINCT donation.userId', 'userId')
      .where('donation.petId = :petId', { petId })
      .andWhere('donation.status = :status', { status: DonationStatus.COMPLETED });

    if (excludeUserId) {
      query.andWhere('donation.userId != :excludeUserId', { excludeUserId });
    }

    const results = await query.getRawMany();
    const donorIds = results.map(result => result.userId);
    return donorIds;
  }

  /**
   * Award bonus PawPoints to donors when pet is adopted
   */
  private async awardAdoptionBonusPoints(
    queryRunner: any,
    pet: Pet,
    excludeUserId: string,
  ): Promise<void> {
    // Get all donors except the adopter
    const affectedDonorIds = await this.getAffectedDonorIds(pet.id, excludeUserId);
    
    console.log(`ADOPTION BONUS: Starting bonus for pet ${pet.name} (${pet.id}), excluding adopter ${excludeUserId}`);
    console.log(`ADOPTION BONUS: Found ${affectedDonorIds.length} affected donors:`, affectedDonorIds);

    for (const donorId of affectedDonorIds) {
      const user = await queryRunner.manager.findOne(User, { 
        where: { id: donorId } 
      });
      
      if (user) {
        const oldPawPoints = user.pawPoints;
        user.pawPoints += 1;

        const pawPointTransaction = PawPointTransaction.createAdoptionBonusTransaction(
          donorId,
          pet.id,
          pet.name,
          user.pawPoints,
        );

        await queryRunner.manager.save(User, user);
        await queryRunner.manager.save(PawPointTransaction, pawPointTransaction);
        
        console.log(`ADOPTION BONUS: Awarded +1 PawPoint to user ${donorId} (${oldPawPoints} → ${user.pawPoints})`);
      } else {
        console.log(`ADOPTION BONUS: User ${donorId} not found, skipping`);
      }
    }
    
    console.log(`ADOPTION BONUS: Completed bonus awards for pet ${pet.name}`);
  }
}
