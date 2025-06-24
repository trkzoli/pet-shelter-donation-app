
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { plainToClass } from 'class-transformer';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { Donation, DonationType, DonationStatus, DonationDistribution } from './entities/donation.entity';
import { PawPointTransaction, TransactionType } from './entities/pawpoint-transaction.entity';
import { User } from '../users/entities/user.entity';
import { Pet, PetStatus } from '../pets/entities/pet.entity';
import { Campaign, CampaignStatus } from '../campaigns/entities/campaign.entity';
import { SuccessStory } from '../success-stories/entities/success-story.entity';
import { CampaignsService } from '../campaigns/campaigns.service';
import { CreateDonationDto, ConfirmDonationDto, RefundDonationDto } from './dto/create-donation.dto';
import {
  DonationResponseDto,
  SupportedPetDto,
  DonationStatsDto,
  PaymentIntentDto,
} from './dto/donation-response.dto';

@Injectable()
export class DonationsService {
  private stripe: Stripe;

  constructor(
    @InjectRepository(Donation)
    private readonly donationRepository: Repository<Donation>,
    @InjectRepository(PawPointTransaction)
    private readonly pawPointTransactionRepository: Repository<PawPointTransaction>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Pet)
    private readonly petRepository: Repository<Pet>,
    @InjectRepository(Campaign)
    private readonly campaignRepository: Repository<Campaign>,
    @Inject(forwardRef(() => CampaignsService))
    private readonly campaignsService: CampaignsService,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is required');
    }
    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-05-28.basil',
    });
  }

 
  async createPaymentIntent(
    userId: string,
    createDonationDto: CreateDonationDto,
  ): Promise<PaymentIntentDto> {
    const { amount, type, petId, campaignId } = createDonationDto;

    
    if (amount < 1) {
      throw new BadRequestException('Minimum donation amount is $1');
    }
    if (amount > 10000) {
      throw new BadRequestException('Maximum donation amount is $10,000');
    }

    
    let platformFeePercentage: number;
    let targetEntity: Pet | Campaign;
    let shelterAmount: number;

    if (type === DonationType.PET) {
      const pet = await this.petRepository.findOne({
        where: { id: petId, status: PetStatus.PUBLISHED },
        relations: ['shelter', 'shelter.user'],
      });

      if (!pet) {
        throw new NotFoundException('Pet not found or not available for donations');
      }

      targetEntity = pet;
      platformFeePercentage = 10; 
    } else if (type === DonationType.CAMPAIGN) {
      const campaign = await this.campaignRepository.findOne({
        where: { id: campaignId, status: CampaignStatus.ACTIVE },
        relations: ['shelter', 'shelter.user'],
      });

      if (!campaign) {
        throw new NotFoundException('Campaign not found or not active');
      }

      if (new Date() > campaign.endsAt) {
        throw new BadRequestException('Campaign has ended');
      }

      targetEntity = campaign;
      platformFeePercentage = campaign.platformFeePercentage;
    } else {
      throw new BadRequestException('Invalid donation type');
    }

    
    const platformFee = (amount * platformFeePercentage) / 100;
    shelterAmount = amount - platformFee;
    const pawPointsToEarn = this.calculatePawPoints(amount);

    try {
      
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), 
        currency: 'usd',
        metadata: {
          userId,
          type,
          targetId: petId || campaignId || null,
          platformFee: platformFee.toString(),
          pawPointsToEarn: pawPointsToEarn.toString(),
        },
      });

      
      const donation = new Donation();
      donation.userId = userId;
      donation.petId = type === DonationType.PET ? petId : undefined;
      donation.campaignId = type === DonationType.CAMPAIGN ? campaignId : undefined;
      donation.amount = amount;
      donation.type = type;
      donation.paymentIntentId = paymentIntent.id;
      donation.status = DonationStatus.PENDING;
      donation.pawPointsEarned = pawPointsToEarn;
      donation.platformFee = platformFee;
      donation.platformFeePercentage = platformFeePercentage;

      await this.donationRepository.save(donation);

      return plainToClass(PaymentIntentDto, {
        clientSecret: paymentIntent.client_secret,
        donationId: donation.id,
        amount,
        platformFee,
        shelterAmount,
        pawPointsToEarn,
      });
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw new InternalServerErrorException('Failed to create payment intent');
    }
  }

  
  async confirmDonation(
    userId: string,
    confirmDto: ConfirmDonationDto,
  ): Promise<DonationResponseDto> {
    const { paymentIntentId } = confirmDto;

    return await this.dataSource.transaction(async manager => {
      
      const donation = await manager.findOne(Donation, {
        where: {
          paymentIntentId,
          userId,
          status: DonationStatus.PENDING,
        },
        relations: ['user', 'pet', 'pet.shelter'],
      });

      if (!donation) {
        throw new NotFoundException('Donation not found or already processed');
      }


      await manager.query(
        'SELECT id FROM donations WHERE id = $1 FOR UPDATE',
        [donation.id]
      );

      try {
        
        const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status !== 'succeeded') {
          throw new BadRequestException('Payment not completed');
        }

        
        donation.status = DonationStatus.COMPLETED;

        
        if (donation.type === DonationType.PET && donation.pet) {
          
          await this.processPetDonation(manager, donation);
        } else if (donation.type === DonationType.CAMPAIGN && donation.campaignId) {
          
          await this.campaignsService.processCampaignDonation(
            donation.campaignId,
            donation.amount,
          );
        }

        
        await this.addPawPoints(
          manager,
          userId,
          donation.pawPointsEarned,
          TransactionType.DONATION,
          `Donation to ${donation.type}`,
          donation.id,
        );

        
        const savedDonation = await manager.save(Donation, donation);

        
        return this.toDonationResponseDto(savedDonation);
      } catch (error) {
        console.error('Error confirming donation:', error);
        throw new InternalServerErrorException('Failed to confirm donation');
      }
    });
  }

  
  private async processPetDonation(
    manager: any,
    donation: Donation,
  ): Promise<void> {
    const pet = donation.pet;

    if (!pet) {
      throw new NotFoundException('Pet not found for donation');
    }
    
    if (pet.goalsLastReset) {
      const daysSinceReset = Math.floor(
        (Date.now() - pet.goalsLastReset.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysSinceReset >= 31) {
        
        pet.currentMonthDonations = 0;
        pet.goalsLastReset = new Date();
        await manager.save(Pet, pet);
      }
    }

    
    if (pet.monthlyGoals) {
      const totalGoals = Object.values(pet.monthlyGoals).reduce(
        (sum: number, goal: number) => sum + goal,
        0,
      );

      if (totalGoals > 0) {
        const distribution: DonationDistribution = {
          vaccination: (donation.amount * pet.monthlyGoals.vaccination) / totalGoals,
          food: (donation.amount * pet.monthlyGoals.food) / totalGoals,
          medical: (donation.amount * pet.monthlyGoals.medical) / totalGoals,
          other: (donation.amount * pet.monthlyGoals.other) / totalGoals,
        };

        donation.distribution = distribution;

        
        if (!pet.currentMonthDistribution) {
          pet.currentMonthDistribution = { vaccination: 0, food: 0, medical: 0, other: 0 };
        }

        pet.currentMonthDistribution.vaccination = (parseFloat(pet.currentMonthDistribution.vaccination?.toString() || '0')) + distribution.vaccination;
        pet.currentMonthDistribution.food = (parseFloat(pet.currentMonthDistribution.food?.toString() || '0')) + distribution.food;
        pet.currentMonthDistribution.medical = (parseFloat(pet.currentMonthDistribution.medical?.toString() || '0')) + distribution.medical;
        pet.currentMonthDistribution.other = (parseFloat(pet.currentMonthDistribution.other?.toString() || '0')) + distribution.other;
      }
    }


    const newTotalDonationsReceived = (parseFloat(pet.totalDonationsReceived?.toString() || '0')) + donation.amount;
    const newCurrentMonthDonations = (parseFloat(pet.currentMonthDonations?.toString() || '0')) + donation.amount;

    
    await manager.update(Pet, { id: pet.id }, {
      totalDonationsReceived: newTotalDonationsReceived,
      currentMonthDonations: newCurrentMonthDonations,
      currentMonthDistribution: pet.currentMonthDistribution,
    });
  }

  
  private calculatePawPoints(amount: number): number {
    return Math.floor(amount / 25);
  }

  
  private async addPawPoints(
    manager: any,
    userId: string,
    points: number,
    type: TransactionType,
    description: string,
    relatedDonationId?: string,
    relatedPetId?: string,
  ): Promise<void> {
    if (points <= 0) return;

    
    await manager.increment(User, { id: userId }, 'pawPoints', points);

    
    const user = await manager.findOne(User, {
      where: { id: userId },
      select: ['pawPoints'],
    });

    
    const transaction = manager.create(PawPointTransaction, {
      userId,
      points,
      type,
      description,
      relatedDonationId,
      relatedPetId,
      balanceAfter: user.pawPoints,
    });

    await manager.save(PawPointTransaction, transaction);
  }

  
  private toDonationResponseDto(donation: Donation): DonationResponseDto {
    return plainToClass(DonationResponseDto, donation, {
      excludeExtraneousValues: true,
    });
  }

  
  async getDonationHistory(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{
    donations: DonationResponseDto[];
    total: number;
    pages: number;
  }> {
    const [donations, total] = await this.donationRepository.findAndCount({
      where: { userId, status: DonationStatus.COMPLETED },
      relations: ['pet', 'pet.shelter'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const donationDtos = donations.map(donation => this.toDonationResponseDto(donation));

    return {
      donations: donationDtos,
      total,
      pages: Math.ceil(total / limit),
    };
  }

  
  async getSupportedPets(userId: string): Promise<SupportedPetDto[]> {
    
    const donations = await this.donationRepository.find({
      where: {
        userId,
        type: DonationType.PET,
        status: DonationStatus.COMPLETED,
      },
      relations: ['pet', 'pet.shelter', 'pet.shelter.user'],
      order: { createdAt: 'DESC' },
    });

    
    const petMap = new Map();
    
    donations.forEach(donation => {
      if (!donation.pet) return;
      
      const petId = donation.pet.id;
      if (!petMap.has(petId)) {
        petMap.set(petId, {
          pet: donation.pet,
          totalDonated: 0,
          donationCount: 0,
          firstDonationDate: donation.createdAt,
          lastDonationDate: donation.createdAt,
        });
      }
      
      const petData = petMap.get(petId);
      petData.totalDonated += donation.amount;
      petData.donationCount += 1;
      if (donation.createdAt < petData.firstDonationDate) {
        petData.firstDonationDate = donation.createdAt;
      }
      if (donation.createdAt > petData.lastDonationDate) {
        petData.lastDonationDate = donation.createdAt;
      }
    });

    
    const activePets = Array.from(petMap.values()).filter(petData => 
      petData.pet.status !== 'adopted'
    );


    return activePets.map(petData => ({
      id: petData.pet.id,
      name: petData.pet.name,
      breed: petData.pet.breed || 'Unknown',
      age: petData.pet.age || 0,
      gender: petData.pet.gender || 'Unknown',
      type: petData.pet.type || 'Dog',
      mainImage: petData.pet.mainImage || '',
      status: petData.pet.status || 'Available',
      adoptionFee: petData.pet.adoptionFee || 0,
      monthlyGoals: {
        vaccination: petData.pet.monthlyGoals?.vaccination || 0,
        food: petData.pet.monthlyGoals?.food || 0,
        medical: petData.pet.monthlyGoals?.medical || 0,
        other: petData.pet.monthlyGoals?.other || 0,
        total: (petData.pet.monthlyGoals?.vaccination || 0) + 
               (petData.pet.monthlyGoals?.food || 0) + 
               (petData.pet.monthlyGoals?.medical || 0) + 
               (petData.pet.monthlyGoals?.other || 0),
      },
      currentMonthProgress: {
        vaccination: (() => {
          
          if ((petData.pet.currentMonthDistribution?.vaccination || 0) === 0 && petData.pet.totalDonationsReceived > 0) {
            const totalGoals = (petData.pet.monthlyGoals?.vaccination || 0) + 
                              (petData.pet.monthlyGoals?.food || 0) + 
                              (petData.pet.monthlyGoals?.medical || 0) + 
                              (petData.pet.monthlyGoals?.other || 0);
            if (totalGoals > 0) {
              
              const shelterAmount = petData.pet.totalDonationsReceived * 0.9;
              return (shelterAmount * (petData.pet.monthlyGoals?.vaccination || 0)) / totalGoals;
            }
          }
          return petData.pet.currentMonthDistribution?.vaccination || 0;
        })(),
        food: (() => {
          if ((petData.pet.currentMonthDistribution?.food || 0) === 0 && petData.pet.totalDonationsReceived > 0) {
            const totalGoals = (petData.pet.monthlyGoals?.vaccination || 0) + 
                              (petData.pet.monthlyGoals?.food || 0) + 
                              (petData.pet.monthlyGoals?.medical || 0) + 
                              (petData.pet.monthlyGoals?.other || 0);
            if (totalGoals > 0) {
              
              const shelterAmount = petData.pet.totalDonationsReceived * 0.9;
              return (shelterAmount * (petData.pet.monthlyGoals?.food || 0)) / totalGoals;
            }
          }
          return petData.pet.currentMonthDistribution?.food || 0;
        })(),
        medical: (() => {
          if ((petData.pet.currentMonthDistribution?.medical || 0) === 0 && petData.pet.totalDonationsReceived > 0) {
            const totalGoals = (petData.pet.monthlyGoals?.vaccination || 0) + 
                              (petData.pet.monthlyGoals?.food || 0) + 
                              (petData.pet.monthlyGoals?.medical || 0) + 
                              (petData.pet.monthlyGoals?.other || 0);
            if (totalGoals > 0) {
              
              const shelterAmount = petData.pet.totalDonationsReceived * 0.9;
              return (shelterAmount * (petData.pet.monthlyGoals?.medical || 0)) / totalGoals;
            }
          }
          return petData.pet.currentMonthDistribution?.medical || 0;
        })(),
        other: (() => {
          if ((petData.pet.currentMonthDistribution?.other || 0) === 0 && petData.pet.totalDonationsReceived > 0) {
            const totalGoals = (petData.pet.monthlyGoals?.vaccination || 0) + 
                              (petData.pet.monthlyGoals?.food || 0) + 
                              (petData.pet.monthlyGoals?.medical || 0) + 
                              (petData.pet.monthlyGoals?.other || 0);
            if (totalGoals > 0) {
              
              const shelterAmount = petData.pet.totalDonationsReceived * 0.9;
              return (shelterAmount * (petData.pet.monthlyGoals?.other || 0)) / totalGoals;
            }
          }
          return petData.pet.currentMonthDistribution?.other || 0;
        })(),
        total: petData.pet.currentMonthDonations || petData.pet.totalDonationsReceived * 0.9 || 0,
        percentage: petData.pet.monthlyGoalProgress || 0,
      },
      shelter: {
        id: petData.pet.shelter?.id || '',
        shelterName: petData.pet.shelter?.shelterName || 'Unknown Shelter',
        city: petData.pet.shelter?.user?.city || '',
        state: petData.pet.shelter?.user?.state || '',
        country: petData.pet.shelter?.user?.country || '',
        location: petData.pet.shelter?.user ? 
          `${petData.pet.shelter.user.city || ''}, ${petData.pet.shelter.user.state || ''}, ${petData.pet.shelter.user.country || ''}`.replace(/^,\s*|,\s*$/g, '').replace(/,\s*,/g, ',').trim() : 
          'Location not available',
        contact: petData.pet.shelter?.user?.phone || 'Contact not available',
        email: petData.pet.shelter?.user?.email || 'Email not available',
      },
      donationSummary: {
        totalDonated: petData.totalDonated,
        donationCount: petData.donationCount,
        firstDonationDate: petData.firstDonationDate,
        lastDonationDate: petData.lastDonationDate,
        pawPointsEarned: Math.floor(petData.totalDonated / 10), // Assuming 1 point per $10
      },
      canRequestAdoption: petData.donationCount > 0,
      
      description: petData.pet.description || `${petData.pet.name} is a wonderful ${petData.pet.gender?.toLowerCase() || 'pet'} looking for a loving home.`,
      story: petData.pet.story || `${petData.pet.name} has been supported by generous donors like you and is making great progress!`,
      additionalImages: petData.pet.additionalImages || [],
      vaccinated: petData.pet.vaccinated || false,
      dewormed: petData.pet.dewormed || false,
      spayedNeutered: petData.pet.spayedNeutered || false,
    }));
  }

  
  async getUserSuccessStories(userId: string): Promise<any[]> {
    
    const donations = await this.donationRepository.find({
      where: {
        userId,
        type: DonationType.PET,
        status: DonationStatus.COMPLETED,
      },
      relations: ['pet', 'pet.shelter', 'pet.shelter.user'],
    });

    
    const petMap = new Map();
    
    donations.forEach(donation => {
      if (!donation.pet || donation.pet.status !== 'adopted') return;
      
      const petId = donation.pet.id;
      if (!petMap.has(petId)) {
        petMap.set(petId, {
          pet: donation.pet,
          totalDonated: 0,
          donationCount: 0,
          firstDonationDate: donation.createdAt,
          lastDonationDate: donation.createdAt,
        });
      }
      
      const petData = petMap.get(petId);
      petData.totalDonated += Number(donation.amount);
      petData.donationCount += 1;
      if (donation.createdAt < petData.firstDonationDate) {
        petData.firstDonationDate = donation.createdAt;
      }
      if (donation.createdAt > petData.lastDonationDate) {
        petData.lastDonationDate = donation.createdAt;
      }
    });

    
    const petIds = Array.from(petMap.keys());
    
    const successStories = await this.dataSource.manager.find(SuccessStory, {
      where: { petId: In(petIds) },
      select: ['petId', 'adopterId', 'type'],
    });

    const successStoryMap = new Map();
    successStories.forEach(story => {
      successStoryMap.set(story.petId, story);
    });

    
    return Array.from(petMap.values()).map(petData => {
      const successStory = successStoryMap.get(petData.pet.id);
      const isAdopter = successStory?.adopterId === userId;
      

      let message: string;
      let pawPointsEarned: number;
      let storyType: string;

      if (isAdopter) {
        message = `Congratulations! You saved ${petData.pet.name}'s life by adopting them. Thank you for giving them a loving forever home!`;
        pawPointsEarned = 0; 
        storyType = 'adopter_success';
      } else {
        message = `Great news! ${petData.pet.name} has found their forever home! Your support of $${Number(petData.totalDonated).toFixed(2)} helped make this possible.`;
        pawPointsEarned = 1; 
        storyType = 'supporter_success';
      }

      return {
        id: `success-${petData.pet.id}`,
        type: storyType,
        originalPetId: petData.pet.id,
        petName: petData.pet.name,
        petImage: petData.pet.mainImage ? { uri: petData.pet.mainImage } : null,
        adoptionDate: petData.pet.updatedAt || new Date().toISOString(),
        shelterName: petData.pet.shelter?.shelterName || 'Unknown Shelter',
        userContribution: Number(petData.totalDonated),
        pawPointsEarned,
        message,
        canDismiss: true,
      };
    });
  }

  
  async getDonationStats(userId: string): Promise<DonationStatsDto> {
    const stats = await this.donationRepository
      .createQueryBuilder('donation')
      .select([
        'COUNT(*) as totalDonations',
        'SUM(donation.amount) as totalAmount',
        'AVG(donation.amount) as averageDonation',
        'SUM(donation.pawPointsEarned) as totalPawPointsEarned',
        'COUNT(DISTINCT CASE WHEN donation.type = :petType THEN donation.petId END) as uniquePetsSupported',
        'COUNT(DISTINCT CASE WHEN donation.type = :campaignType THEN donation.campaignId END) as uniqueCampaignsSupported',
      ])
      .where('donation.userId = :userId', { userId })
      .andWhere('donation.status = :status', { status: DonationStatus.COMPLETED })
      .setParameters({
        petType: DonationType.PET,
        campaignType: DonationType.CAMPAIGN,
      })
      .getRawOne();

    return plainToClass(DonationStatsDto, {
      totalDonations: parseInt(stats.totalDonations) || 0,
      totalAmount: parseFloat(stats.totalAmount) || 0,
      averageDonation: parseFloat(stats.averageDonation) || 0,
      totalPawPointsEarned: parseInt(stats.totalPawPointsEarned) || 0,
      uniquePetsSupported: parseInt(stats.uniquePetsSupported) || 0,
      uniqueCampaignsSupported: parseInt(stats.uniqueCampaignsSupported) || 0,
    });
  }

  
  async getDonationById(userId: string, donationId: string): Promise<DonationResponseDto> {
    const donation = await this.donationRepository.findOne({
      where: { id: donationId, userId },
      relations: ['pet', 'pet.shelter'],
    });

    if (!donation) {
      throw new NotFoundException('Donation not found');
    }

    return this.toDonationResponseDto(donation);
  }

  
  async getUserPetDonations(userId: string, petId: string): Promise<DonationResponseDto[]> {
    const donations = await this.donationRepository.find({
      where: { 
        userId, 
        petId,
        status: DonationStatus.COMPLETED 
      },
      relations: ['pet', 'pet.shelter'],
      order: { createdAt: 'DESC' },
    });

    return donations.map(donation => this.toDonationResponseDto(donation));
  }

  
  async getPawPointsSummary(userId: string): Promise<{
    totalEarned: number;
    currentBalance: number;
    earnedThisMonth: number;
    transactionCount: number;
  }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['pawPoints'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const stats = await this.pawPointTransactionRepository
      .createQueryBuilder('transaction')
      .select([
        'SUM(CASE WHEN transaction.points > 0 THEN transaction.points ELSE 0 END) as totalEarned',
        'COUNT(*) as transactionCount',
        'SUM(CASE WHEN transaction.points > 0 AND transaction.createdAt >= :thirtyDaysAgo THEN transaction.points ELSE 0 END) as earnedThisMonth',
      ])
      .where('transaction.userId = :userId', { userId })
      .setParameters({ thirtyDaysAgo })
      .getRawOne();

    return {
      totalEarned: parseInt(stats.totalEarned) || 0,
      currentBalance: user.pawPoints,
      earnedThisMonth: parseInt(stats.earnedThisMonth) || 0,
      transactionCount: parseInt(stats.transactionCount) || 0,
    };
  }

  
  async refundDonation(
    donationId: string,
    refundDto: RefundDonationDto,
  ): Promise<void> {
    await this.dataSource.transaction(async manager => {
      const donation = await manager.findOne(Donation, {
        where: { id: donationId, status: DonationStatus.COMPLETED },
        relations: ['user', 'pet'],
      });

      if (!donation) {
        throw new NotFoundException('Donation not found or cannot be refunded');
      }

      await manager.query(
        'SELECT id FROM donations WHERE id = $1 FOR UPDATE',
        [donation.id]
      );

      try {
        await this.stripe.refunds.create({
          payment_intent: donation.paymentIntentId,
          reason: 'requested_by_customer',
        });

        donation.status = DonationStatus.REFUNDED;
        donation.refundReason = refundDto.reason;
        donation.refundedAt = new Date();

        const user = donation.user;
        if (user.pawPoints >= donation.pawPointsEarned) {
          await manager.decrement(User, { id: user.id }, 'pawPoints', donation.pawPointsEarned);

          
          const updatedUser = await manager.findOne(User, {
            where: { id: user.id },
            select: ['pawPoints'],
          });

          if (!updatedUser) {
            throw new NotFoundException('User not found after balance update');
          }

          
          const transaction = manager.create(PawPointTransaction, {
            userId: user.id,
            points: -donation.pawPointsEarned,
            type: TransactionType.REFUND,
            description: `Refund for donation - ${refundDto.reason}`,
            relatedDonationId: donation.id,
            balanceAfter: updatedUser.pawPoints,
          });

          await manager.save(PawPointTransaction, transaction);
        }

        
        await this.addPawPoints(
          manager,
          user.id,
          1,
          TransactionType.ERROR_BONUS,
          'Bonus point for donation refund inconvenience',
          donation.id,
        );

        
        if (donation.pet) {
          const pet = donation.pet;
          pet.totalDonationsReceived = Math.max(0, pet.totalDonationsReceived - donation.amount);
          pet.currentMonthDonations = Math.max(0, pet.currentMonthDonations - donation.amount);
          await manager.save(Pet, pet);
        }

        
        await manager.save(Donation, donation);
      } catch (error) {
        console.error('Error processing refund:', error);
        throw new InternalServerErrorException('Failed to process refund');
      }
    });
  }
}
