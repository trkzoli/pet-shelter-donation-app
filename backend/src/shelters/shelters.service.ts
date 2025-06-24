// src/shelters/shelters.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';
import { Shelter } from './entities/shelter.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { Pet } from '../pets/entities/pet.entity';
import { Campaign } from '../campaigns/entities/campaign.entity';
import { Donation } from '../donations/entities/donation.entity';
import { AdoptionRequest } from '../adoptions/entities/adoption-request.entity';
import { UpdateShelterDto } from './dto/update-shelter.dto';
import { PetStatus } from '../pets/entities/pet.entity';
import { CampaignStatus } from '../campaigns/entities/campaign.entity';
import { AdoptionStatus } from '../adoptions/entities/adoption-request.entity';
import { UploadsService, UploadType } from '../uploads/uploads.service';
import {
  ShelterResponseDto,
  ShelterStatsResponseDto,
  VerificationSubmissionDto,
} from './dto/shelter-response.dto';

@Injectable()
export class SheltersService {
  constructor(
    @InjectRepository(Shelter)
    private readonly shelterRepository: Repository<Shelter>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Pet)
    private readonly petRepository: Repository<Pet>,
    @InjectRepository(Campaign)
    private readonly campaignRepository: Repository<Campaign>,
    @InjectRepository(Donation)
    private readonly donationRepository: Repository<Donation>,
    @InjectRepository(AdoptionRequest)
    private readonly adoptionRequestRepository: Repository<AdoptionRequest>,
    private readonly uploadsService: UploadsService,
  ) {}

  /**
   * Get shelter profile by user ID
   */
  async getProfile(userId: string): Promise<ShelterResponseDto> {
    const shelter = await this.shelterRepository.findOne({
      where: { userId },
      relations: ['user'],
    });

    if (!shelter) {
      throw new NotFoundException('Shelter profile not found');
    }

    // Calculate profile completeness
    const profileCompleteness = this.calculateProfileCompletion(shelter);
    shelter.profileCompleteness = profileCompleteness;

    // Calculate total donations from both pets and campaigns
    const totalDonations = await this.calculateTotalDonationsReceived(shelter.id);
    shelter.totalDonationsReceived = totalDonations;

    const result = plainToClass(ShelterResponseDto, shelter, {
      excludeExtraneousValues: true,
    });

    return result;
  }

  /**
   * Calculate total donations received from both pets and campaigns
   */
  private async calculateTotalDonationsReceived(shelterId: string): Promise<number> {
    // Get all completed donations for pets from this shelter
    const petDonations = await this.donationRepository
      .createQueryBuilder('donation')
      .innerJoin('donation.pet', 'pet')
      .where('pet.shelterId = :shelterId', { shelterId })
      .andWhere('donation.status = :status', { status: 'completed' })
      .getMany();

    // Get all completed donations for campaigns from this shelter
    const campaignDonations = await this.donationRepository
      .createQueryBuilder('donation')
      .innerJoin('donation.campaign', 'campaign')
      .where('campaign.shelterId = :shelterId', { shelterId })
      .andWhere('donation.status = :status', { status: 'completed' })
      .getMany();

    // Calculate shelter amounts (after platform fees) for each donation
    let petShelterTotal = 0;
    for (const donation of petDonations) {
      petShelterTotal += donation.getShelterAmount();
    }

    let campaignShelterTotal = 0;
    for (const donation of campaignDonations) {
      campaignShelterTotal += donation.getShelterAmount();
    }

    console.log(`SHELTER DONATIONS: Shelter ${shelterId} - Pet donations (after fees): $${petShelterTotal.toFixed(2)}, Campaign donations (after fees): $${campaignShelterTotal.toFixed(2)}, Total: $${(petShelterTotal + campaignShelterTotal).toFixed(2)}`);

    return petShelterTotal + campaignShelterTotal;
  }

  /**
   * Update shelter profile
   */
  async updateProfile(
    userId: string,
    updateShelterDto: UpdateShelterDto,
  ): Promise<ShelterResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user || user.role !== UserRole.SHELTER) {
      throw new ForbiddenException('Only shelter users can update shelter profile');
    }

    const shelter = await this.shelterRepository.findOne({
      where: { userId },
      relations: ['user'],
    });

    if (!shelter) {
      throw new NotFoundException('Shelter profile not found');
    }

    // Update shelter fields
    Object.assign(shelter, updateShelterDto);

    // Calculate profile completion
    const updatedProfileCompleteness = this.calculateProfileCompletion(shelter);
    shelter.profileCompleteness = updatedProfileCompleteness;

    // For MVP: Auto-verify when profile is 100% complete
    if (updatedProfileCompleteness >= 100 && shelter.verificationStatus !== 'verified') {
      shelter.verificationStatus = 'verified';
      shelter.verifiedAt = new Date();
      console.log(`AUTO-VERIFIED: Shelter ${shelter.id} auto-verified upon 100% completion`);
    }

    // Save the updated shelter
    const updatedShelter = await this.shelterRepository.save(shelter);

    return plainToClass(ShelterResponseDto, updatedShelter, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Calculate shelter profile completion percentage
   */
  calculateProfileCompletion(shelter: Shelter): number {
    // Required shelter fields (6 total) - must match frontend
    const requiredShelterFields = [
      'shelterName',
      'description',
      'petSpecialization',
      'licenseNumber',
      'yearEstablished',
      'contactPerson',
    ];

    // Required user fields (8 total) - email, phone, and 5 address fields
    const requiredUserFields = ['email', 'phone', 'street', 'city', 'state', 'zip', 'country'];
    
    const filledShelterFields = requiredShelterFields.filter((field) => {
      const value = shelter[field];
      return value !== null && value !== undefined && value !== '';
    });

    let filledUserFields = 0;
    if (shelter.user) {
      filledUserFields = requiredUserFields.filter((field) => {
        const value = shelter.user[field];
        return value !== null && value !== undefined && value !== '';
      }).length;
    }

    const totalRequired = requiredShelterFields.length + requiredUserFields.length; // 6 + 8 = 14
    const totalFilled = filledShelterFields.length + filledUserFields;

    return Math.round((totalFilled / totalRequired) * 100);
  }

  /**
   * Submit verification documents
   */
  async submitVerification(
    userId: string,
    file: Express.Multer.File,
  ): Promise<VerificationSubmissionDto> {
    const shelter = await this.shelterRepository.findOne({
      where: { userId },
    });

    if (!shelter) {
      throw new NotFoundException('Shelter profile not found');
    }

    if (shelter.verificationStatus === 'verified') {
      throw new BadRequestException('Shelter is already verified');
    }

    // Check if profile is complete enough for verification
    const profileCompleteness = this.calculateProfileCompletion(shelter);
    if (profileCompleteness < 80) {
      throw new BadRequestException(
        'Profile must be at least 80% complete before verification submission',
      );
    }

    // Upload to Cloudinary
    const uploadResult = await this.uploadsService.uploadSingleImage(
      file,
      UploadType.VERIFICATION_DOCUMENT,
      userId
    );
    shelter.verificationPhoto = uploadResult.secureUrl;
    
    // For MVP: Auto-verify immediately upon submission
    shelter.verificationStatus = 'verified';
    shelter.verifiedAt = new Date();
    shelter.verificationSubmittedAt = new Date();

    await this.shelterRepository.save(shelter);

    return {
      message: 'Profile completed and shelter verified successfully! You can now publish pets.',
      status: 'verified',
      submittedAt: shelter.verificationSubmittedAt,
    };
  }

  /**
   * Check if shelter can publish pets
   */
  async canPublishPets(userId: string): Promise<boolean> {
    const shelter = await this.shelterRepository.findOne({
      where: { userId },
      relations: ['user'],
    });

    if (!shelter) {
      console.log(`CAN PUBLISH PETS: No shelter found for user ${userId}`);
      return false;
    }

    // Must be verified and have 100% profile completion
    const profileCompleteness = this.calculateProfileCompletion(shelter);
    
    console.log(`CAN PUBLISH PETS: Shelter ${shelter.id} - Status: ${shelter.verificationStatus}, Completion: ${profileCompleteness}%`);
    
    // Auto-verify if profile is 100% complete but not yet verified (fallback for existing shelters)
    if (profileCompleteness >= 100 && shelter.verificationStatus !== 'verified') {
      console.log(`AUTO-VERIFYING: Shelter ${shelter.id} has 100% completion but not verified yet`);
      shelter.verificationStatus = 'verified';
      shelter.verifiedAt = new Date();
      await this.shelterRepository.save(shelter);
      console.log(`AUTO-VERIFIED: Shelter ${shelter.id} auto-verified in canPublishPets check`);
    }
    
    const canPublish = (
      shelter.verificationStatus === 'verified' &&
      profileCompleteness >= 100
    );
    
    console.log(`${canPublish ? 'SUCCESS' : 'FAILED'} CAN PUBLISH PETS: Result = ${canPublish}`);
    
    return canPublish;
  }

  /**
   * Check if shelter can create campaigns
   */
  async canCreateCampaigns(userId: string): Promise<boolean> {
    const shelter = await this.shelterRepository.findOne({
      where: { userId },
    });

    if (!shelter) {
      return false;
    }

    // Must be verified
    return shelter.verificationStatus === 'verified';
  }

  /**
   * Get shelter statistics
   */
  async getStats(userId: string): Promise<ShelterStatsResponseDto> {
    const shelter = await this.shelterRepository.findOne({
      where: { userId },
    });

    if (!shelter) {
      throw new NotFoundException('Shelter profile not found');
    }

    // Get pet statistics
    const totalPets = await this.petRepository.count({
      where: { shelterId: shelter.id },
    });

    const publishedPets = await this.petRepository.count({
      where: { shelterId: shelter.id, status: PetStatus.PUBLISHED },
    });
    const adoptedPets = await this.petRepository.count({
      where: { shelterId: shelter.id, status: PetStatus.ADOPTED },
    });
    const activeCampaigns = await this.campaignRepository.count({
      where: { shelterId: shelter.id, status: CampaignStatus.ACTIVE },
    });
    const pendingAdoptionRequests = await this.adoptionRequestRepository.count({
      where: { shelterId: shelter.id, status: AdoptionStatus.PENDING },
    });

    // Get this month's donations
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const thisMonthDonationsResult = await this.donationRepository
      .createQueryBuilder('donation')
      .innerJoin('donation.pet', 'pet')
      .where('pet.shelterId = :shelterId', { shelterId: shelter.id })
      .andWhere('donation.createdAt >= :startOfMonth', { startOfMonth })
      .andWhere('donation.status = :status', { status: 'completed' })
      .select('SUM(donation.amount)', 'total')
      .getRawOne();

    const thisMonthDonations = parseFloat(thisMonthDonationsResult?.total || '0');

    // Calculate monthly goals progress (simplified)
    const monthlyGoalsProgress = {
      totalGoals: publishedPets * 4, // Assuming 4 goal categories per pet
      achieved: Math.floor(thisMonthDonations / 100), // Simplified achievement calculation
      percentage: publishedPets > 0 ? Math.min((thisMonthDonations / (publishedPets * 500)) * 100, 100) : 0,
    };

    return {
      totalPets,
      publishedPets,
      adoptedPets,
      totalDonationsReceived: shelter.totalDonationsReceived,
      activeCampaigns,
      pendingAdoptionRequests,
      thisMonthDonations,
      monthlyGoalsProgress,
    };
  }

  /**
   * Update current published pets count
   */
  async updatePublishedPetsCount(shelterId: string): Promise<void> {
    const publishedPetsCount = await this.petRepository.count({
      where: { shelterId, status: PetStatus.PUBLISHED },
    });

    await this.shelterRepository.update(shelterId, {
      currentPublishedPets: publishedPetsCount,
    });
  }

  /**
   * Check if shelter has reached pet limit
   */
  async hasReachedPetLimit(userId: string): Promise<boolean> {
    const shelter = await this.shelterRepository.findOne({
      where: { userId },
    });

    if (!shelter) {
      return true; // If no shelter found, consider limit reached
    }

    const publishedPetsCount = await this.petRepository.count({
      where: { shelterId: shelter.id, status: PetStatus.PUBLISHED },
    });

    return publishedPetsCount >= 10; // Maximum 10 published pets
  }

  /**
   * Validate shelter exists and user has access
   */
  async validateShelterAccess(userId: string): Promise<Shelter> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user || user.role !== UserRole.SHELTER) {
      throw new ForbiddenException('Only shelter users can access this resource');
    }

    const shelter = await this.shelterRepository.findOne({
      where: { userId },
      relations: ['user'],
    });

    if (!shelter) {
      throw new NotFoundException('Shelter profile not found');
    }

    return shelter;
  }

  /**
   * Get shelter by ID (public information)
   */
  async getShelterById(shelterId: string): Promise<ShelterResponseDto> {
    const shelter = await this.shelterRepository.findOne({
      where: { id: shelterId },
      relations: ['user'],
    });

    if (!shelter) {
      throw new NotFoundException('Shelter not found');
    }

    // Only return public information
    const publicShelter = plainToClass(ShelterResponseDto, shelter, {
      excludeExtraneousValues: true,
    });

    // Remove sensitive user information for public view
    if (publicShelter.user) {
      (publicShelter.user as any).email = undefined;
    }

    return publicShelter;
  }

  /**
   * Manual verification (temporary for testing)
   */
  async manualVerify(userId: string): Promise<void> {
    const shelter = await this.shelterRepository.findOne({
      where: { userId },
      relations: ['user'],
    });

    if (!shelter) {
      throw new NotFoundException('Shelter profile not found');
    }

    // Force verification and 100% completion for testing
    shelter.verificationStatus = 'verified';
    shelter.verifiedAt = new Date();
    shelter.profileCompleteness = 100; // Force 100% completion

    await this.shelterRepository.save(shelter);
    
    console.log(`✅ MANUAL VERIFICATION: Shelter ${shelter.id} verified and set to 100% completion`);
  }

  private async isVerified(shelterId: string): Promise<boolean> {
    const shelter = await this.shelterRepository.findOne({
      where: { id: shelterId },
    });
    return shelter?.verificationStatus === 'verified' || false;
  }
}
