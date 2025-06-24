// src/success-stories/success-stories.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { SuccessStory, SuccessStoryType } from './entities/success-story.entity';
import { Pet } from '../pets/entities/pet.entity';
import { User } from '../users/entities/user.entity';
import { Shelter } from '../shelters/entities/shelter.entity';
import { Donation } from '../donations/entities/donation.entity';
import { PawPointTransaction, TransactionType } from '../donations/entities/pawpoint-transaction.entity';
import { AdoptionRequest } from '../adoptions/entities/adoption-request.entity';
import {
  CreateSuccessStoryDto,
  CreateAdoptionSuccessStoryDto,
  CreateDeceasedStoryDto,
  CreateErrorStoryDto,
  SuccessStoryResponseDto,
  UserSuccessStoryDto,
  SuccessStoryFiltersDto,
  NotificationStatusDto,
} from './dto/success-story.dto';

@Injectable()
export class SuccessStoriesService {
  private readonly logger = new Logger(SuccessStoriesService.name);

  constructor(
    @InjectRepository(SuccessStory)
    private readonly successStoryRepository: Repository<SuccessStory>,
    @InjectRepository(Pet)
    private readonly petRepository: Repository<Pet>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Shelter)
    private readonly shelterRepository: Repository<Shelter>,
    @InjectRepository(Donation)
    private readonly donationRepository: Repository<Donation>,
    @InjectRepository(PawPointTransaction)
    private readonly pawPointTransactionRepository: Repository<PawPointTransaction>,
    @InjectRepository(AdoptionRequest)
    private readonly adoptionRequestRepository: Repository<AdoptionRequest>,
  ) {}

  // ==================== CREATE SUCCESS STORIES ====================

  /**
   * Create a general success story
   */
  async createSuccessStory(
    shelterId: string,
    createDto: CreateSuccessStoryDto
  ): Promise<SuccessStoryResponseDto> {
    // Verify pet belongs to shelter
    const pet = await this.petRepository.findOne({
      where: { id: createDto.petId },
      relations: ['shelter'],
    });

    if (!pet) {
      throw new NotFoundException(`Pet ${createDto.petId} not found`);
    }

    if (pet.shelter.id !== shelterId) {
      throw new ForbiddenException('You can only create success stories for your own pets');
    }

    // Get all users who donated to this pet
    const donations = await this.donationRepository.find({
      where: { petId: createDto.petId },
      select: ['userId'],
    });

    const affectedUserIds = [...new Set(donations.map(d => d.userId))];

    // Create success story
    const successStory = this.successStoryRepository.create({
      petId: createDto.petId,
      type: createDto.type,
      affectedUserIds,
      adopterId: createDto.adopterId,
      adoptionRequestId: createDto.adoptionRequestId,
      errorReason: createDto.errorReason,
    });

    const savedStory = await this.successStoryRepository.save(successStory);

    // Award PawPoints to affected users
    await this.awardPawPoints(savedStory);

    this.logger.log(`Success story created for pet ${createDto.petId} (${createDto.type})`);
    return this.mapToResponseDto(savedStory);
  }

  /**
   * Create adoption success story
   */
  async createAdoptionSuccessStory(
    shelterId: string,
    createDto: CreateAdoptionSuccessStoryDto
  ): Promise<SuccessStoryResponseDto> {
    const storyDto: CreateSuccessStoryDto = {
      petId: createDto.petId,
      type: createDto.isInternal ? SuccessStoryType.ADOPTED_INTERNAL : SuccessStoryType.ADOPTED_EXTERNAL,
      adopterId: createDto.adopterId,
      adoptionRequestId: createDto.adoptionRequestId,
    };

    return this.createSuccessStory(shelterId, storyDto);
  }

  /**
   * Create deceased pet story
   */
  async createDeceasedStory(
    shelterId: string,
    createDto: CreateDeceasedStoryDto
  ): Promise<SuccessStoryResponseDto> {
    const storyDto: CreateSuccessStoryDto = {
      petId: createDto.petId,
      type: SuccessStoryType.DECEASED,
    };

    return this.createSuccessStory(shelterId, storyDto);
  }

  /**
   * Create error story (with refunds)
   */
  async createErrorStory(
    shelterId: string,
    createDto: CreateErrorStoryDto
  ): Promise<SuccessStoryResponseDto> {
    const storyDto: CreateSuccessStoryDto = {
      petId: createDto.petId,
      type: SuccessStoryType.ERROR,
      errorReason: createDto.errorReason,
    };

    const result = await this.createSuccessStory(shelterId, storyDto);

    // TODO: In Phase 12, integrate with payments to process refunds
    this.logger.log(`Error story created for pet ${createDto.petId} - refunds may be needed`);

    return result;
  }

  // ==================== GET SUCCESS STORIES ====================

  /**
   * Get all success stories (admin/public view)
   */
  async getSuccessStories(filters: SuccessStoryFiltersDto): Promise<{
    stories: SuccessStoryResponseDto[];
    total: number;
    hasMore: boolean;
  }> {
    const query = this.successStoryRepository.createQueryBuilder('story')
      .leftJoinAndSelect('story.pet', 'pet')
      .leftJoinAndSelect('story.adopter', 'adopter')
      .leftJoinAndSelect('pet.shelter', 'shelter')
      .orderBy('story.createdAt', 'DESC');

    // Apply filters
    if (filters.type) {
      query.andWhere('story.type = :type', { type: filters.type });
    }

    if (filters.petId) {
      query.andWhere('story.petId = :petId', { petId: filters.petId });
    }

    if (filters.shelterId) {
      query.andWhere('pet.shelterId = :shelterId', { shelterId: filters.shelterId });
    }

    // Pagination
    const total = await query.getCount();
    const stories = await query
      .skip(filters.offset || 0)
      .take(filters.limit || 20)
      .getMany();

    const mappedStories = await Promise.all(
      stories.map(story => this.mapToResponseDto(story))
    );

    return {
      stories: mappedStories,
      total,
      hasMore: (filters.offset || 0) + (filters.limit || 20) < total,
    };
  }

  /**
   * Get success stories for a specific user (their supported pets)
   */
  async getUserSuccessStories(userId: string, filters: SuccessStoryFiltersDto): Promise<{
    stories: UserSuccessStoryDto[];
    total: number;
    hasMore: boolean;
  }> {
    const query = this.successStoryRepository.createQueryBuilder('story')
      .leftJoinAndSelect('story.pet', 'pet')
      .leftJoinAndSelect('story.adopter', 'adopter')
      .leftJoinAndSelect('pet.shelter', 'shelter')
      .where('story.affectedUserIds @> :userId', { userId: JSON.stringify([userId]) })
      .orderBy('story.createdAt', 'DESC');

    // Apply filters
    if (filters.type) {
      query.andWhere('story.type = :type', { type: filters.type });
    }

    if (filters.petId) {
      query.andWhere('story.petId = :petId', { petId: filters.petId });
    }

    // Pagination
    const total = await query.getCount();
    const stories = await query
      .skip(filters.offset || 0)
      .take(filters.limit || 20)
      .getMany();

    const mappedStories = await Promise.all(
      stories.map(story => this.mapToUserStoryDto(story, userId))
    );

    return {
      stories: mappedStories,
      total,
      hasMore: (filters.offset || 0) + (filters.limit || 20) < total,
    };
  }

  /**
   * Get single success story details
   */
  async getSuccessStory(storyId: string): Promise<SuccessStoryResponseDto> {
    const story = await this.successStoryRepository.findOne({
      where: { id: storyId },
      relations: ['pet', 'pet.shelter', 'adopter'],
    });

    if (!story) {
      throw new NotFoundException(`Success story ${storyId} not found`);
    }

    return this.mapToResponseDto(story);
  }

  /**
   * Get success stories for a shelter
   */
  async getShelterSuccessStories(
    shelterId: string,
    filters: SuccessStoryFiltersDto
  ): Promise<{
    stories: SuccessStoryResponseDto[];
    total: number;
    hasMore: boolean;
  }> {
    const filtersWithShelter = { ...filters, shelterId };
    return this.getSuccessStories(filtersWithShelter);
  }

  // ==================== NOTIFICATION MANAGEMENT ====================

  /**
   * Get notification status for a success story
   */
  async getNotificationStatus(storyId: string): Promise<NotificationStatusDto> {
    const story = await this.successStoryRepository.findOne({
      where: { id: storyId },
    });

    if (!story) {
      throw new NotFoundException(`Success story ${storyId} not found`);
    }

    const totalUsers = story.affectedUserIds.length;
    const notificationsSent = Object.values(story.notificationsSent).filter(Boolean).length;
    const notificationsPending = totalUsers - notificationsSent;

    return {
      id: story.id,
      totalUsers,
      notificationsSent,
      notificationsPending,
      errors: [], // Could track specific errors in future
    };
  }

  /**
   * Mark notification as sent for a user
   */
  async markNotificationSent(storyId: string, userId: string): Promise<void> {
    const story = await this.successStoryRepository.findOne({
      where: { id: storyId },
    });

    if (!story) {
      throw new NotFoundException(`Success story ${storyId} not found`);
    }

    story.markNotificationSent(userId);
    await this.successStoryRepository.save(story);

    this.logger.log(`Notification marked as sent for user ${userId} on story ${storyId}`);
  }

  /**
   * Get users who still need notifications
   */
  async getPendingNotifications(storyId: string): Promise<User[]> {
    const story = await this.successStoryRepository.findOne({
      where: { id: storyId },
    });

    if (!story) {
      throw new NotFoundException(`Success story ${storyId} not found`);
    }

    const pendingUserIds = story.affectedUserIds.filter(
      userId => !story.notificationsSent[userId]
    );

    if (pendingUserIds.length === 0) {
      return [];
    }

    return this.userRepository.find({
      where: { id: In(pendingUserIds) },
      select: ['id', 'email', 'name'],
    });
  }

  // ==================== STATISTICS ====================

  /**
   * Get success story statistics
   */
  async getSuccessStoryStats(shelterId?: string): Promise<{
    totalStories: number;
    adoptions: number;
    deceased: number;
    errors: number;
    totalUsersNotified: number;
    recentStories: SuccessStoryResponseDto[];
  }> {
    const query = this.successStoryRepository.createQueryBuilder('story')
      .leftJoinAndSelect('story.pet', 'pet');

    if (shelterId) {
      query.andWhere('pet.shelterId = :shelterId', { shelterId });
    }

    const stories = await query.getMany();

    const totalStories = stories.length;
    const adoptions = stories.filter(s => 
      s.type === SuccessStoryType.ADOPTED_INTERNAL || s.type === SuccessStoryType.ADOPTED_EXTERNAL
    ).length;
    const deceased = stories.filter(s => s.type === SuccessStoryType.DECEASED).length;
    const errors = stories.filter(s => s.type === SuccessStoryType.ERROR).length;

    const totalUsersNotified = stories.reduce((sum, story) => 
      sum + Object.values(story.notificationsSent).filter(Boolean).length, 0
    );

    const recentStoriesQuery = query.clone()
      .orderBy('story.createdAt', 'DESC')
      .limit(5);

    const recentStories = await recentStoriesQuery.getMany();
    const mappedRecentStories = await Promise.all(
      recentStories.map(story => this.mapToResponseDto(story))
    );

    return {
      totalStories,
      adoptions,
      deceased,
      errors,
      totalUsersNotified,
      recentStories: mappedRecentStories,
    };
  }

  // ==================== PRIVATE METHODS ====================

  /**
   * Award PawPoints to users affected by success story
   */
  private async awardPawPoints(story: SuccessStory): Promise<void> {
    const bonusPoints = story.getBonusPoints();
    
    if (bonusPoints === 0) {
      return;
    }

    const users = await this.userRepository.find({
      where: { id: In(story.affectedUserIds) },
    });

    for (const user of users) {
      // Special case: for internal adoptions, don't give bonus to the adopter
      if (story.type === SuccessStoryType.ADOPTED_INTERNAL && user.id === story.adopterId) {
        continue;
      }

      // Update user's PawPoints
      user.pawPoints += bonusPoints;
      await this.userRepository.save(user);

      // Create transaction record
      const transaction = this.pawPointTransactionRepository.create({
        userId: user.id,
        points: bonusPoints,
        type: this.getTransactionType(story.type),
        relatedPetId: story.petId,
        description: this.getTransactionDescription(story.type, story.pet?.name || 'pet'),
      });

      await this.pawPointTransactionRepository.save(transaction);
    }

    this.logger.log(`Awarded ${bonusPoints} PawPoints to ${users.length} users for story ${story.id}`);
  }

  /**
   * Get transaction type for PawPoint award
   */
  private getTransactionType(storyType: SuccessStoryType): TransactionType {
    switch (storyType) {
      case SuccessStoryType.ADOPTED_INTERNAL:
      case SuccessStoryType.ADOPTED_EXTERNAL:
        return TransactionType.ADOPTION_BONUS;
      case SuccessStoryType.DECEASED:
        return TransactionType.COMPASSION_BONUS;
      case SuccessStoryType.ERROR:
        return TransactionType.ERROR_BONUS;
      default:
        return TransactionType.OTHER;
    }
  }

  /**
   * Get transaction description
   */
  private getTransactionDescription(storyType: SuccessStoryType, petName: string): string {
    switch (storyType) {
      case SuccessStoryType.ADOPTED_INTERNAL:
      case SuccessStoryType.ADOPTED_EXTERNAL:
        return `Adoption bonus for ${petName}`;
      case SuccessStoryType.DECEASED:
        return `Compassion bonus for ${petName}`;
      case SuccessStoryType.ERROR:
        return `Error bonus for ${petName}`;
      default:
        return `Bonus for ${petName}`;
    }
  }

  /**
   * Map success story to response DTO
   */
  private async mapToResponseDto(story: SuccessStory): Promise<SuccessStoryResponseDto> {
    // Ensure pet and shelter data is loaded
     if (!story.pet) {
      const reloaded = await this.successStoryRepository.findOne({
        where: { id: story.id },
        relations: ['pet', 'pet.shelter', 'adopter'],
      });
      if (!reloaded) throw new NotFoundException(`Success story ${story.id} not found`);
      story = reloaded;
    }

    const notificationsSent = Object.values(story.notificationsSent).filter(Boolean).length;
    const notificationsPending = story.affectedUserIds.length - notificationsSent;

    return {
      id: story.id,
      pet: {
        id: story.pet.id,
        name: story.pet.name,
        breed: story.pet.breed,
        age: story.pet.age,
        mainImage: story.pet.mainImage,
      },
      type: story.type,
      affectedUsersCount: story.affectedUserIds.length,
      adopter: story.adopter ? {
        id: story.adopter.id,
        name: story.adopter.name,
        city: story.adopter.city || 'Unknown',
      } : undefined,
      errorReason: story.errorReason,
      title: story.getStoryTitle(),
      message: story.getStoryMessage(story.pet.name, story.pet.shelter?.shelterName || 'the shelter'),
      bonusPoints: story.getBonusPoints(),
      createdAt: story.createdAt,
      notificationStatus: {
        sent: notificationsSent,
        pending: notificationsPending,
        total: story.affectedUserIds.length,
      },
    };
  }

  /**
   * Map success story to user-specific DTO
   */
  private async mapToUserStoryDto(story: SuccessStory, userId: string): Promise<UserSuccessStoryDto> {
    // Get user's donation amount for this pet
    const userDonations = await this.donationRepository.find({
      where: { userId, petId: story.petId },
    });

    const userDonationAmount = userDonations.reduce((sum, donation) => sum + donation.amount, 0);
    const wasNotified = story.notificationsSent[userId] || false;

    return {
      id: story.id,
      pet: {
        id: story.pet.id,
        name: story.pet.name,
        breed: story.pet.breed,
        age: story.pet.age,
        mainImage: story.pet.mainImage,
      },
      type: story.type,
      title: story.getStoryTitle(),
      message: this.getPersonalizedMessage(story, userId),
      pawPointsEarned: story.type === SuccessStoryType.ADOPTED_INTERNAL && userId === story.adopterId 
        ? 0 // Adopter doesn't get bonus points
        : story.getBonusPoints(),
      wasNotified,
      userDonationAmount,
      createdAt: story.createdAt,
    };
  }

  /**
   * Get personalized message for user
   */
  private getPersonalizedMessage(story: SuccessStory, userId: string): string {
    const petName = story.pet.name;
    const isAdopter = story.type === SuccessStoryType.ADOPTED_INTERNAL && userId === story.adopterId;

    if (isAdopter) {
      return `Congratulations on adopting ${petName}! Thank you for giving them a loving home.`;
    }

    return story.getStoryMessage(petName, story.pet.shelter?.shelterName || 'the shelter');
  }
}
