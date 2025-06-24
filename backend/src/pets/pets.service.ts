// src/pets/pets.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, Between, MoreThan, Not, In } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Pet, PetStatus, MonthlyGoals, DonationDistribution } from './entities/pet.entity';
import { Shelter } from '../shelters/entities/shelter.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { SuccessStory, SuccessStoryType } from '../success-stories/entities/success-story.entity';
import { Donation } from '../donations/entities/donation.entity';
import { AdoptionRequest } from '../adoptions/entities/adoption-request.entity';
import { CreatePetDto, RemovePetDto, ConfirmAdoptionDto } from './dto/create-pet.dto';
import { SetMonthlyGoalsDto } from './dto/monthly-goals.dto';
import { UpdatePetDto, UpdatePetPhotosDto, PetFiltersDto } from './dto/update-pet.dto';
import { PetListResponseDto, PetDetailDto, ShelterPetDto } from './dto/pet-response.dto';
import { plainToClass } from 'class-transformer';
import { UploadsService, UploadType } from '../uploads/uploads.service';

@Injectable()
export class PetsService {
  constructor(
    @InjectRepository(Pet)
    private readonly petRepository: Repository<Pet>,
    @InjectRepository(Shelter)
    private readonly shelterRepository: Repository<Shelter>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(SuccessStory)
    private readonly successStoryRepository: Repository<SuccessStory>,
    @InjectRepository(Donation)
    private readonly donationRepository: Repository<Donation>,
    @InjectRepository(AdoptionRequest)
    private readonly adoptionRequestRepository: Repository<AdoptionRequest>,
    private readonly uploadsService: UploadsService,
  ) {}

  /**
   * Create a new pet (draft status)
   */
  async createPet(userId: string, createPetDto: CreatePetDto): Promise<Pet> {
    // Get shelter for this user
    const shelter = await this.shelterRepository.findOne({
      where: { userId },
      relations: ['user'],
    });

    if (!shelter) {
      throw new NotFoundException('Shelter not found');
    }

    // Check if shelter can publish pets
    if (!(await this.canShelterPublishPets(shelter))) {
      throw new ForbiddenException(
        'Shelter must be verified and have 100% complete profile to create pets'
      );
    }

    // Check pet limit (max 10 published pets)
    if (shelter.currentPublishedPets >= 10) {
      throw new ConflictException('Maximum of 10 published pets allowed');
    }

    // Validate monthly goals
    this.validateMonthlyGoals(createPetDto.monthlyGoals);

    // Create pet in draft status
    const pet = this.petRepository.create({
      ...createPetDto,
      shelterId: shelter.id,
      status: PetStatus.DRAFT,
      additionalImages: createPetDto.additionalImages || [],
      currentMonthDistribution: {
        vaccination: 0,
        food: 0,
        medical: 0,
        other: 0,
      },
      goalsLastReset: new Date(),
    });

    return this.petRepository.save(pet);
  }

  /**
   * Get all pets with filters and pagination
   */
  async getPets(filters: PetFiltersDto): Promise<PetListResponseDto> {
    const queryBuilder = this.petRepository
      .createQueryBuilder('pet')
      .leftJoinAndSelect('pet.shelter', 'shelter')
      .leftJoinAndSelect('shelter.user', 'user')
      .where('pet.status = :status', { status: PetStatus.PUBLISHED });

    // Apply filters
    if (filters.type) {
      queryBuilder.andWhere('pet.type = :type', { type: filters.type });
    }

    if (filters.gender) {
      queryBuilder.andWhere('pet.gender = :gender', { gender: filters.gender });
    }

    if (filters.breed) {
      queryBuilder.andWhere('pet.breed ILIKE :breed', { breed: `%${filters.breed}%` });
    }

    if (filters.maxAdoptionFee !== undefined) {
      queryBuilder.andWhere('pet.adoptionFee <= :maxFee', { maxFee: filters.maxAdoptionFee });
    }

    if (filters.search) {
      queryBuilder.andWhere(
        '(pet.name ILIKE :search OR pet.breed ILIKE :search OR pet.description ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'oldest':
        queryBuilder.orderBy('pet.publishedAt', 'ASC');
        break;
      case 'fee_low':
        queryBuilder.orderBy('pet.adoptionFee', 'ASC');
        break;
      case 'fee_high':
        queryBuilder.orderBy('pet.adoptionFee', 'DESC');
        break;
      case 'name':
        queryBuilder.orderBy('pet.name', 'ASC');
        break;
      default: // newest
        queryBuilder.orderBy('pet.publishedAt', 'DESC');
    }

    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit);

    const [pets, total] = await queryBuilder.getManyAndCount();

    console.log(`HOME PAGE PETS: Found ${pets.length} published pets (total: ${total})`);
    pets.forEach(pet => {
      console.log(`Pet ${pet.id}: name="${pet.name}", status="${pet.status}", shelter="${pet.shelter?.shelterName}"`);
    });

    const petDtos = plainToClass(PetListResponseDto, {
        pets: pets,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      }, { excludeExtraneousValues: true });

    return petDtos;
  }

  /**
   * Get pet by ID with details
   */
  async getPetById(id: string): Promise<PetDetailDto> {
    const pet = await this.petRepository.findOne({
      where: { id },
      relations: ['shelter', 'shelter.user'],
    });

    if (!pet) {
      throw new NotFoundException('Pet not found');
    }

    console.log(`🔍 INDIVIDUAL PET SERVICE: Raw pet entity for ${id}:`, {
      id: pet.id,
      name: pet.name,
      breed: pet.breed,
      age: pet.age,
      description: pet.description,
      story: pet.story,
      monthlyGoals: pet.monthlyGoals,
      currentMonthDistribution: pet.currentMonthDistribution,
      totalDonationsReceived: pet.totalDonationsReceived,
      additionalImages: pet.additionalImages,
      vaccinated: pet.vaccinated,
      spayedNeutered: pet.spayedNeutered,
      microchipNumber: pet.microchipNumber
    });

    const dto = plainToClass(PetDetailDto, pet, { excludeExtraneousValues: true });
    
    console.log(`🔍 INDIVIDUAL PET SERVICE: Transformed DTO for ${id}:`, JSON.stringify(dto, null, 2));
    
    return dto;
  }

  /**
   * Get pets for a specific shelter
   */
  async getShelterPets(userId: string): Promise<ShelterPetDto[]> {
    const shelter = await this.shelterRepository.findOne({
      where: { userId },
    });

    if (!shelter) {
      throw new NotFoundException('Shelter not found');
    }

    const pets = await this.petRepository.find({
      where: { 
        shelterId: shelter.id,
        status: In([PetStatus.DRAFT, PetStatus.PUBLISHED]) // Only show draft and published pets
      },
      relations: ['adoptionRequests'],
      order: { createdAt: 'DESC' },
    });

    console.log(`🔍 SHELTER PETS DEBUG: Found ${pets.length} pets for shelter ${shelter.id} (excluding removed)`);
    pets.forEach(pet => {
      console.log(`📋 Pet ${pet.id}: name="${pet.name}", status="${pet.status}", monthlyGoals=${JSON.stringify(pet.monthlyGoals)}, mainImage="${pet.mainImage}", additionalImages=${JSON.stringify(pet.additionalImages)}`);
    });

    const petDtos = plainToClass(ShelterPetDto, pets, { excludeExtraneousValues: false });
    
    console.log(`📤 SHELTER PETS DTO: Returning ${petDtos.length} pet DTOs`);
    petDtos.forEach(dto => {
      console.log(`📋 DTO ${dto.id}: name="${dto.name}", breed="${dto.breed}", age="${dto.age}", description="${dto.description}", story="${dto.story}"`);
      console.log(`📋 DTO ${dto.id}: monthlyGoals=${JSON.stringify(dto.monthlyGoals)}, totalMonthlyGoal=${dto.totalMonthlyGoal}`);
      console.log(`📋 DTO ${dto.id}: mainImage="${dto.mainImage}", additionalImages=${JSON.stringify(dto.additionalImages)}`);
      console.log(`📋 DTO ${dto.id}: vaccinated=${dto.vaccinated}, dewormed=${dto.dewormed}, spayedNeutered=${dto.spayedNeutered}`);
    });

    return petDtos;
  }

  /**
   * Update pet (check 24-hour rule)
   */
  async updatePet(userId: string, petId: string, updatePetDto: UpdatePetDto): Promise<Pet> {
    const pet = await this.findPetForShelter(userId, petId);

    // Check 24-hour edit window
    if (!pet.isEditable) {
      // After 24 hours, only allow photo updates
      const photosOnlyDto: UpdatePetPhotosDto = {
        mainImage: updatePetDto.mainImage,
        additionalImages: updatePetDto.additionalImages,
      };

      // Check if trying to update non-photo fields
      const nonPhotoFields = Object.keys(updatePetDto).filter(
        key => !['mainImage', 'additionalImages'].includes(key)
      );

      if (nonPhotoFields.length > 0) {
        throw new ForbiddenException(
          'After 24 hours, you can only update pet photos. Other information cannot be changed.'
        );
      }

      Object.assign(pet, photosOnlyDto);
    } else {
      // Within 24 hours - allow all updates
      Object.assign(pet, updatePetDto);
    }

    return this.petRepository.save(pet);
  }

  /**
   * Set monthly goals for a pet
   */
  async setMonthlyGoals(userId: string, petId: string, setGoalsDto: SetMonthlyGoalsDto): Promise<Pet> {
    const pet = await this.findPetForShelter(userId, petId);

    // Validate monthly goals
    this.validateMonthlyGoals(setGoalsDto.monthlyGoals);

    // Update goals and reset date
    pet.monthlyGoals = setGoalsDto.monthlyGoals;
    pet.goalsLastReset = new Date();
    pet.currentMonthDonations = 0;
    pet.currentMonthDistribution = {
      vaccination: 0,
      food: 0,
      medical: 0,
      other: 0,
    };

    return this.petRepository.save(pet);
  }

  /**
   * Publish a pet (check shelter eligibility)
   */
  async publishPet(userId: string, petId: string): Promise<Pet> {
    const pet = await this.findPetForShelter(userId, petId);

    if (pet.status !== PetStatus.DRAFT) {
      throw new BadRequestException('Only draft pets can be published');
    }

    // Get shelter to check eligibility
    const shelter = await this.shelterRepository.findOne({
      where: { userId },
      relations: ['user'],
    });
    if (!shelter) throw new NotFoundException('Shelter not found');

    if (!(await this.canShelterPublishPets(shelter))) {
      throw new ForbiddenException(
        'Shelter must be verified and have 100% complete profile to publish pets'
      );
    }

    // Check pet limit
    if (shelter.currentPublishedPets >= 10) {
      throw new ConflictException('Maximum of 10 published pets allowed');
    }

    // Validate pet has all required fields for publishing
    if (!pet.mainImage) {
      throw new BadRequestException('Main image is required to publish pet');
    }

    if (pet.totalMonthlyGoal <= 0) {
      throw new BadRequestException('Monthly goals must be set before publishing');
    }

    // Update pet status and increment shelter count
    pet.status = PetStatus.PUBLISHED;
    pet.publishedAt = new Date();

    shelter.currentPublishedPets++;

    await Promise.all([
      this.petRepository.save(pet),
      this.shelterRepository.save(shelter),
    ]);

    return pet;
  }

  /**
   * Remove pet with reason
   */
  async removePet(userId: string, petId: string, removeDto: RemovePetDto): Promise<{ message: string }> {
    const pet = await this.findPetForShelter(userId, petId);

    if (pet.status === PetStatus.REMOVED) {
      throw new BadRequestException('Pet is already removed');
    }

    const wasPublished = pet.status === PetStatus.PUBLISHED;

    // Get shelter to update count
    const shelter = await this.shelterRepository.findOne({
      where: { userId },
    });

    // Get affected donors for success story
    const donations = await this.donationRepository.find({
      where: { petId: pet.id },
      select: ['userId'],
    });
    if (!shelter) throw new NotFoundException('Shelter not found');
    const affectedUserIds = [...new Set(donations.map(d => d.userId))];

    // Update pet status
    const oldStatus = pet.status;
    pet.status = PetStatus.REMOVED;
    console.log(`🗑️ REMOVING PET: ${pet.id} - changing status from ${oldStatus} to ${PetStatus.REMOVED}`);

    // Decrease published pets count if it was published
    if (wasPublished) {
      shelter.currentPublishedPets = Math.max(0, shelter.currentPublishedPets - 1);
      console.log(`📉 UPDATING SHELTER COUNT: ${shelter.shelterName} - published pets: ${shelter.currentPublishedPets + 1} -> ${shelter.currentPublishedPets}`);
    }

    // Create success story for donors
    const successStory = this.successStoryRepository.create({
      petId: pet.id,
      type: removeDto.reason === 'deceased' ? SuccessStoryType.DECEASED : SuccessStoryType.ERROR,
      affectedUserIds,
      errorReason: removeDto.reason === 'other' ? removeDto.explanation : undefined,
    });

    await Promise.all([
      this.petRepository.save(pet),
      this.shelterRepository.save(shelter),
      this.successStoryRepository.save(successStory),
    ]);

    // TODO: Trigger PawPoints bonus for donors (implemented in donations module)
    // TODO: Handle potential refunds for "other" reason

    return {
      message: `Pet removed successfully. ${
        removeDto.reason === 'deceased' 
          ? 'Donors will receive compassion bonus points.' 
          : 'This may trigger refunds for recent donors.'
      }`,
    };
  }

  /**
   * Confirm adoption
   */
  async confirmAdoption(userId: string, petId: string, confirmDto: ConfirmAdoptionDto): Promise<Pet> {
    const pet = await this.findPetForShelter(userId, petId);

    if (pet.status !== PetStatus.PUBLISHED) {
      throw new BadRequestException('Only published pets can be adopted');
    }

    // Get shelter to update counts
    const shelter = await this.shelterRepository.findOne({
      where: { userId },
    });
    if (!shelter) throw new NotFoundException('Shelter not found');
    // Get affected donors for success story
    const donations = await this.donationRepository.find({
      where: { petId: pet.id },
      select: ['userId'],
    });
    
    const affectedUserIds = [...new Set(donations.map(d => d.userId))];

    // Update pet status
    pet.status = PetStatus.ADOPTED;
    shelter.currentPublishedPets = Math.max(0, shelter.currentPublishedPets - 1);
    shelter.adoptionsCompleted++;

    // Create success story
    const successStory = this.successStoryRepository.create({
      petId: pet.id,
      type: SuccessStoryType.ADOPTED_EXTERNAL, // Assume external unless specified
      affectedUserIds,
    });

    await Promise.all([
      this.petRepository.save(pet),
      this.shelterRepository.save(shelter),
      this.successStoryRepository.save(successStory),
    ]);

    // TODO: Trigger PawPoints bonus for donors (implemented in donations module)

    return pet;
  }

  /**
   * Upload pet images
   */
  async uploadMainImage(
    userId: string,
    petId: string,
    file: Express.Multer.File
  ): Promise<{ imageUrl: string }> {
    if (!file) throw new BadRequestException('No image file provided');

    // Validate file type and size here if needed
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only JPEG and PNG images are allowed');
    }

    const uploadResult = await this.uploadsService.uploadSingleImage(
      file, UploadType.PET_IMAGE, userId, petId
    );
    await this.uploadPetImages(userId, petId, uploadResult.secureUrl);

    return { imageUrl: uploadResult.secureUrl };
  }

  // Upload additional images
  async uploadAdditionalImages(
    userId: string,
    petId: string,
    files: Express.Multer.File[]
  ): Promise<{ imageUrls: string[] }> {
    if (!files || files.length === 0)
      throw new BadRequestException('No image files provided');
    if (files.length > 10)
      throw new BadRequestException('Maximum 10 additional images allowed');

    const imageUrls: string[] = [];
    for (const file of files) {
      // Validate file type and size here if needed

      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException('Only JPEG and PNG images are allowed');
      }

      const uploadResult = await this.uploadsService.uploadSingleImage(
        file, UploadType.PET_IMAGE, userId, petId
      );
      imageUrls.push(uploadResult.secureUrl);
    }
    await this.uploadPetImages(userId, petId, undefined, imageUrls);

    return { imageUrls };
  }

  /**
   * Upload vet record document
   */
  async uploadVetRecord(userId: string, petId: string, file: Express.Multer.File): Promise<{ documentUrl: string }> {
    const pet = await this.findPetForShelter(userId, petId);

    // Upload to Cloudinary
    const result = await this.uploadsService.uploadSingleImage(file, UploadType.VET_RECORDS, userId, petId);

    // Update pet record
    pet.vetRecords = result.secureUrl;
    await this.petRepository.save(pet);

    return { documentUrl: result.secureUrl };
  }

  /**
   * Upload main pet image using base64
   */
  async uploadMainImageBase64(userId: string, petId: string, base64Image: string): Promise<{ imageUrl: string }> {
    const pet = await this.findPetForShelter(userId, petId);

    // Upload to Cloudinary using base64
    const result = await this.uploadsService.uploadBase64Image(
      base64Image, 
      UploadType.PET_IMAGE, 
      `pet-main-${Date.now()}.jpg`, 
      'image/jpeg', 
      userId, 
      petId
    );

    // Update pet record
    pet.mainImage = result.secureUrl;
    await this.petRepository.save(pet);

    return { imageUrl: result.secureUrl };
  }

  /**
   * Upload additional pet images using base64
   */
  async uploadAdditionalImagesBase64(userId: string, petId: string, base64Images: string[]): Promise<{ imageUrls: string[] }> {
    const pet = await this.findPetForShelter(userId, petId);

    // Upload all images to Cloudinary
    const uploadPromises = base64Images.map((base64Image, index) => 
      this.uploadsService.uploadBase64Image(
        base64Image, 
        UploadType.PET_IMAGE, 
        `pet-additional-${index}-${Date.now()}.jpg`, 
        'image/jpeg', 
        userId, 
        petId
      )
    );
    
    const results = await Promise.all(uploadPromises);
    const newImageUrls = results.map(result => result.secureUrl);

    // Append new images to existing additional images (don't replace)
    const existingImages = pet.additionalImages || [];
    pet.additionalImages = [...existingImages, ...newImageUrls];
    await this.petRepository.save(pet);

    return { imageUrls: newImageUrls };
  }

  /**
   * Calculate donation distribution for monthly goals
   */
  calculateDonationDistribution(amount: number, monthlyGoals: MonthlyGoals): DonationDistribution {
    const totalGoal = monthlyGoals.vaccination + monthlyGoals.food + monthlyGoals.medical + monthlyGoals.other;
    
    if (totalGoal === 0) {
      return { vaccination: 0, food: 0, medical: 0, other: 0 };
    }

    return {
      vaccination: (amount * monthlyGoals.vaccination) / totalGoal,
      food: (amount * monthlyGoals.food) / totalGoal,
      medical: (amount * monthlyGoals.medical) / totalGoal,
      other: (amount * monthlyGoals.other) / totalGoal,
    };
  }

  /**
   * Reset monthly goals for all pets (cron job - runs every day at midnight)
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async resetMonthlyGoals(): Promise<void> {
    const thirtyOneDaysAgo = new Date();
    thirtyOneDaysAgo.setDate(thirtyOneDaysAgo.getDate() - 31);

    const petsToReset = await this.petRepository.find({
      where: {
        goalsLastReset: Between(new Date('1900-01-01'), thirtyOneDaysAgo),
        status: PetStatus.PUBLISHED,
      },
    });

    for (const pet of petsToReset) {
      pet.goalsLastReset = new Date();
      pet.currentMonthDonations = 0;
      pet.currentMonthDistribution = {
        vaccination: 0,
        food: 0,
        medical: 0,
        other: 0,
      };
    }

    if (petsToReset.length > 0) {
      await this.petRepository.save(petsToReset);
      console.log(`Reset monthly goals for ${petsToReset.length} pets`);
    }
  }

  /**
   * Private helper methods
   */
  private async findPetForShelter(userId: string, petId: string): Promise<Pet> {
    const shelter = await this.shelterRepository.findOne({
      where: { userId },
    });

    if (!shelter) {
      throw new NotFoundException('Shelter not found');
    }

    const pet = await this.petRepository.findOne({
      where: { id: petId, shelterId: shelter.id },
    });

    if (!pet) {
      throw new NotFoundException('Pet not found or you do not have permission to access it');
    }

    return pet;
  }

  private async canShelterPublishPets(shelter: Shelter): Promise<boolean> {
    // Load shelter with user relation for proper profile completion calculation
    const shelterWithUser = await this.shelterRepository.findOne({
      where: { id: shelter.id },
      relations: ['user'],
    });
    
    if (!shelterWithUser) {
      return false;
    }

    // Calculate profile completion using the same logic as SheltersService
    const profileCompleteness = this.calculateShelterProfileCompletion(shelterWithUser);
    
    console.log(`🔍 PET CREATION: Shelter ${shelterWithUser.id} verification status: ${shelterWithUser.verificationStatus}, completion: ${profileCompleteness}%`);
    
    // Auto-verify if profile is 100% complete but not yet verified (MVP behavior)
    if (profileCompleteness >= 100 && shelterWithUser.verificationStatus !== 'verified') {
      console.log(`🔄 AUTO-VERIFYING: Shelter ${shelterWithUser.id} has 100% completion but not verified yet`);
      shelterWithUser.verificationStatus = 'verified';
      shelterWithUser.verifiedAt = new Date();
      await this.shelterRepository.save(shelterWithUser);
      console.log(`🎉 AUTO-VERIFIED: Shelter ${shelterWithUser.id} auto-verified for pet creation`);
    }

    // Simplified check for testing - if manually verified, allow pet creation
    if (shelterWithUser.verificationStatus === 'verified') {
      console.log(`PET CREATION: Shelter ${shelterWithUser.id} is verified, allowing pet creation`);
      return true;
    }

    console.log(`PET CREATION: Shelter ${shelterWithUser.id} verification status: ${shelterWithUser.verificationStatus}, completion: ${profileCompleteness}%`);
    
    return (
      shelterWithUser.verificationStatus === 'verified' &&
      profileCompleteness >= 100
    );
  }

  /**
   * Calculate shelter profile completion percentage (same logic as SheltersService)
   */
  private calculateShelterProfileCompletion(shelter: Shelter): number {
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

  private validateMonthlyGoals(goals: MonthlyGoals): void {
    const total = goals.vaccination + goals.food + goals.medical + goals.other;
    
    if (total <= 0) {
      throw new BadRequestException('Monthly goals total must be greater than 0');
    }

    if (total > 10000) {
      throw new BadRequestException('Monthly goals total cannot exceed $10,000');
    }

    // Each category must be non-negative
    if (goals.vaccination < 0 || goals.food < 0 || goals.medical < 0 || goals.other < 0) {
      throw new BadRequestException('Monthly goal categories cannot be negative');
    }
  }

  /**
   * Helper to update pet images
   */
  private async uploadPetImages(
    userId: string,
    petId: string,
    mainImageUrl?: string,
    additionalImageUrls?: string[],
  ): Promise<void> {
    const pet = await this.findPetForShelter(userId, petId);
    if (mainImageUrl) {
      pet.mainImage = mainImageUrl;
    }
    if (additionalImageUrls && additionalImageUrls.length > 0) {
      pet.additionalImages = additionalImageUrls;
    }
    await this.petRepository.save(pet);
  }
}
