
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { plainToClass } from 'class-transformer';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Campaign, CampaignStatus, CampaignPriority } from './entities/campaign.entity';
import { Shelter, VerificationStatus } from '../shelters/entities/shelter.entity';
import { Donation, DonationType } from '../donations/entities/donation.entity';
import { User } from '../users/entities/user.entity';
import { CreateCampaignDto, UpdateCampaignDto, CompleteCampaignDto } from './dto/create-campaign.dto';
import {
  CampaignResponseDto,
  CampaignListResponseDto,
  CampaignStatsDto,
  ShelterCampaignSummaryDto,
} from './dto/campaign-response.dto';

@Injectable()
export class CampaignsService {
  constructor(
    @InjectRepository(Campaign)
    private readonly campaignRepository: Repository<Campaign>,
    @InjectRepository(Shelter)
    private readonly shelterRepository: Repository<Shelter>,
    @InjectRepository(Donation)
    private readonly donationRepository: Repository<Donation>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  
  async createCampaign(
    userId: string,
    createCampaignDto: CreateCampaignDto,
  ): Promise<CampaignResponseDto> {
    
    const shelter = await this.shelterRepository.findOne({
      where: { userId },
      relations: ['user'],
    });

    if (!shelter) {
      throw new NotFoundException('Shelter profile not found');
    }

    
    if (shelter.verificationStatus !== 'verified') {
      throw new ForbiddenException(
        'Only verified shelters can create campaigns'
      );
    }

    
    const activeCampaign = await this.campaignRepository.findOne({
      where: {
        shelterId: shelter.id,
        status: CampaignStatus.ACTIVE,
      },
    });

    if (activeCampaign) {
      throw new ConflictException('Shelter can only have one active campaign at a time');
    }

    
    const campaign = Campaign.create(
      shelter.id,
      createCampaignDto.title,
      createCampaignDto.description,
      createCampaignDto.goalAmount,
      createCampaignDto.priority,
      createCampaignDto.duration,
      createCampaignDto.image,
    );

    
    const savedCampaign = await this.campaignRepository.save(campaign);

    
    return this.toCampaignResponseDto(savedCampaign, shelter);
  }

  
  async getActiveCampaigns(
    page: number = 1,
    limit: number = 20,
    priority?: CampaignPriority,
  ): Promise<CampaignListResponseDto> {
    const queryBuilder = this.campaignRepository
      .createQueryBuilder('campaign')
      .leftJoinAndSelect('campaign.shelter', 'shelter')
      .leftJoinAndSelect('shelter.user', 'user')
      .where('campaign.status = :status', { status: CampaignStatus.ACTIVE })
      .andWhere('campaign.endsAt > :now', { now: new Date() });

    
    if (priority) {
      queryBuilder.andWhere('campaign.priority = :priority', { priority });
    }

    
    queryBuilder
      .addSelect(`
        CASE campaign.priority 
          WHEN '${CampaignPriority.CRITICAL}' THEN 1
          WHEN '${CampaignPriority.HIGH}' THEN 2
          WHEN '${CampaignPriority.MEDIUM}' THEN 3
          WHEN '${CampaignPriority.LOW}' THEN 4
        END
      `, 'priority_order')
      .orderBy('priority_order', 'ASC')
      .addOrderBy('campaign.createdAt', 'DESC');

        
    const total = await queryBuilder.getCount();

    
    const campaigns = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    
    const campaignDtos = campaigns.map(campaign =>
      this.toCampaignResponseDto(campaign, campaign.shelter)
    );

    const pages = Math.ceil(total / limit);

    return plainToClass(CampaignListResponseDto, {
      campaigns: campaignDtos,
      total,
      pages,
      currentPage: page,
      hasNext: page < pages,
      hasPrev: page > 1,
    });
  }

  
  async getCampaignById(campaignId: string): Promise<CampaignResponseDto> {
    const campaign = await this.campaignRepository.findOne({
      where: { id: campaignId },
      relations: ['shelter', 'shelter.user'],
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    return this.toCampaignResponseDto(campaign, campaign.shelter);
  }

  
  async getCampaignsByShelter(
    shelterId: string,
    page: number = 1,
    limit: number = 10,
    status?: CampaignStatus,
  ): Promise<CampaignListResponseDto> {
    
    const shelter = await this.shelterRepository.findOne({
      where: { id: shelterId },
      relations: ['user'],
    });

    if (!shelter) {
      throw new NotFoundException('Shelter not found');
    }

    const queryBuilder = this.campaignRepository
      .createQueryBuilder('campaign')
      .leftJoinAndSelect('campaign.shelter', 'shelter')
      .leftJoinAndSelect('shelter.user', 'user')
      .where('campaign.shelterId = :shelterId', { shelterId });

    
    if (status) {
      queryBuilder.andWhere('campaign.status = :status', { status });
    }

    
    queryBuilder.orderBy('campaign.createdAt', 'DESC');

    
    const total = await queryBuilder.getCount();

    
    const campaigns = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    
    const campaignDtos = campaigns.map(campaign =>
      this.toCampaignResponseDto(campaign, campaign.shelter)
    );

    const pages = Math.ceil(total / limit);

    return plainToClass(CampaignListResponseDto, {
      campaigns: campaignDtos,
      total,
      pages,
      currentPage: page,
      hasNext: page < pages,
      hasPrev: page > 1,
    });
  }

  
  async getShelterCampaigns(
    userId: string,
    page: number = 1,
    limit: number = 10,
    status?: CampaignStatus,
  ): Promise<CampaignListResponseDto> {
    const shelter = await this.shelterRepository.findOne({
      where: { userId },
    });

    if (!shelter) {
      throw new NotFoundException('Shelter profile not found');
    }

    const queryBuilder = this.campaignRepository
      .createQueryBuilder('campaign')
      .leftJoinAndSelect('campaign.shelter', 'shelter')
      .leftJoinAndSelect('shelter.user', 'user')
      .where('campaign.shelterId = :shelterId', { shelterId: shelter.id });

    
    if (status) {
      queryBuilder.andWhere('campaign.status = :status', { status });
    }

    
    queryBuilder.orderBy('campaign.createdAt', 'DESC');

    
    const total = await queryBuilder.getCount();

    
    const campaigns = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    console.log('CAMPAIGNS SERVICE DEBUG - campaigns retrieved:', campaigns.length);
    console.log('CAMPAIGNS SERVICE DEBUG - campaign titles:', campaigns.map(c => c.title));

    
    const campaignDtos = campaigns.map(campaign =>
      this.toCampaignResponseDto(campaign, campaign.shelter)
    );

    console.log('CAMPAIGNS SERVICE DEBUG - DTOs created:', campaignDtos.length);

    const pages = Math.ceil(total / limit);

    const result = plainToClass(CampaignListResponseDto, {
      campaigns: campaignDtos,
      total,
      pages,
      currentPage: page,
      hasNext: page < pages,
      hasPrev: page > 1,
    });

    console.log('CAMPAIGNS SERVICE DEBUG - final result structure:', {
      campaignsCount: result.campaigns.length,
      total: result.total,
      pages: result.pages,
      currentPage: result.currentPage
    });

    return result;
  }

  
  async updateCampaign(
    userId: string,
    campaignId: string,
    updateDto: UpdateCampaignDto,
  ): Promise<CampaignResponseDto> {
    
    const campaign = await this.campaignRepository.findOne({
      where: { id: campaignId },
      relations: ['shelter', 'shelter.user'],
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    
    if (campaign.shelter.userId !== userId) {
      throw new ForbiddenException('You can only update your own campaigns');
    }

    
    if (campaign.currentAmount > 0) {
      throw new BadRequestException('Cannot update campaign that has received donations');
    }

    
    if (campaign.status !== CampaignStatus.ACTIVE) {
      throw new BadRequestException('Cannot update completed or cancelled campaigns');
    }

    
    if (updateDto.title !== undefined) {
      campaign.title = updateDto.title;
    }
    if (updateDto.description !== undefined) {
      campaign.description = updateDto.description;
    }
    if (updateDto.image !== undefined) {
      campaign.image = updateDto.image;
    }

    
    const updatedCampaign = await this.campaignRepository.save(campaign);

    return this.toCampaignResponseDto(updatedCampaign, campaign.shelter);
  }

  
  async completeCampaign(
    userId: string,
    campaignId: string,
    completeDto?: CompleteCampaignDto,
  ): Promise<CampaignResponseDto> {
    return await this.dataSource.transaction(async manager => {
      
      const campaign = await manager.findOne(Campaign, {
        where: { id: campaignId },
        relations: ['shelter', 'shelter.user'],
      });

      if (!campaign) {
        throw new NotFoundException('Campaign not found');
      }


      if (campaign.shelter.userId !== userId) {
        throw new ForbiddenException('You can only complete your own campaigns');
      }

      
      if (campaign.status !== CampaignStatus.ACTIVE) {
        throw new BadRequestException('Campaign is not active');
      }

      
      campaign.complete();

      
      const completedCampaign = await manager.save(Campaign, campaign);

      return this.toCampaignResponseDto(completedCampaign, campaign.shelter);
    });
  }

  
  async cancelCampaign(
    userId: string,
    campaignId: string,
  ): Promise<CampaignResponseDto> {
    return await this.dataSource.transaction(async manager => {
      
      const campaign = await manager.findOne(Campaign, {
        where: { id: campaignId },
        relations: ['shelter', 'shelter.user'],
      });

      if (!campaign) {
        throw new NotFoundException('Campaign not found');
      }

      
      if (campaign.shelter.userId !== userId) {
        throw new ForbiddenException('You can only cancel your own campaigns');
      }

      
      if (campaign.currentAmount > 0) {
        throw new BadRequestException('Cannot cancel campaign that has received donations');
      }

      
      if (campaign.status !== CampaignStatus.ACTIVE) {
        throw new BadRequestException('Campaign is not active');
      }

      
      campaign.cancel();

      
      const cancelledCampaign = await manager.save(Campaign, campaign);

      return this.toCampaignResponseDto(cancelledCampaign, campaign.shelter);
    });
  }

  
  async getCampaignStats(campaignId: string): Promise<CampaignStatsDto> {
    const campaign = await this.campaignRepository.findOne({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    const stats = await this.donationRepository
      .createQueryBuilder('donation')
      .select([
        'COUNT(*) as total_donations',
        'SUM(donation.amount) as total_amount',
        'AVG(donation.amount) as average_donation',
        'COUNT(DISTINCT donation.userId) as donor_count',
        'SUM(donation.platformFee) as platform_fees_collected',
        'SUM(donation.amount - donation.platformFee) as amount_to_shelter',
      ])
      .where('donation.campaignId = :campaignId', { campaignId })
      .andWhere('donation.status = :status', { status: 'completed' })
      .getRawOne();

    return plainToClass(CampaignStatsDto, {
      totalDonations: parseInt(stats.total_donations) || 0,
      totalAmount: parseFloat(stats.total_amount) || 0,
      averageDonation: parseFloat(stats.average_donation) || 0,
      donorCount: parseInt(stats.donor_count) || 0,
      platformFeesCollected: parseFloat(stats.platform_fees_collected) || 0,
      amountToShelter: parseFloat(stats.amount_to_shelter) || 0,
    });
  }

  
  async getShelterCampaignSummary(userId: string): Promise<ShelterCampaignSummaryDto> {
    
    const shelter = await this.shelterRepository.findOne({
      where: { userId },
    });

    if (!shelter) {
      throw new NotFoundException('Shelter profile not found');
    }


    const activeCampaign = await this.campaignRepository.findOne({
      where: {
        shelterId: shelter.id,
        status: CampaignStatus.ACTIVE,
      },
      relations: ['shelter', 'shelter.user'],
    });

    
    const totalCampaigns = await this.campaignRepository.count({
      where: { shelterId: shelter.id },
    });

    const completedCampaigns = await this.campaignRepository.count({
      where: {
        shelterId: shelter.id,
        status: CampaignStatus.COMPLETED,
      },
    });

    
    const totalRaisedResult = await this.campaignRepository
      .createQueryBuilder('campaign')
      .select('SUM(campaign.currentAmount)', 'total')
      .where('campaign.shelterId = :shelterId', { shelterId: shelter.id })
      .getRawOne();

    
    const recentCampaigns = await this.campaignRepository.find({
      where: { shelterId: shelter.id },
      relations: ['shelter', 'shelter.user'],
      order: { createdAt: 'DESC' },
      take: 5,
    });

    
    const canCreateCampaign = 
      shelter.verificationStatus === 'verified' && 
      !activeCampaign;

    return plainToClass(ShelterCampaignSummaryDto, {
      activeCampaignId: activeCampaign?.id,
      hasActiveCampaign: !!activeCampaign,
      canCreateCampaign,
      totalCampaignsCreated: totalCampaigns,
      totalCampaignsCompleted: completedCampaigns,
      totalRaised: parseFloat(totalRaisedResult?.total) || 0,
      recentCampaigns: recentCampaigns.map(campaign =>
        this.toCampaignResponseDto(campaign, campaign.shelter)
      ),
    });
  }

  
  async processCampaignDonation(
    campaignId: string,
    amount: number,
  ): Promise<void> {
    await this.dataSource.transaction(async manager => {
      
      const campaign = await manager.findOne(Campaign, {
        where: { id: campaignId },
      });

      if (!campaign) {
        throw new NotFoundException('Campaign not found');
      }

      if (!campaign.isActive) {
        throw new BadRequestException('Campaign is not active');
      }

      
      await manager.query(
        'SELECT id FROM campaigns WHERE id = $1 FOR UPDATE',
        [campaign.id]
      );

      
      campaign.addDonation(amount);

      
      await manager.save(Campaign, campaign);
    });
  }

  
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async autoCompleteCampaigns(): Promise<void> {
    const goalReachedCampaigns = await this.campaignRepository
      .createQueryBuilder('campaign')
      .where('campaign.status = :status', { status: CampaignStatus.ACTIVE })
      .andWhere('campaign.currentAmount >= campaign.goalAmount')
      .getMany();

    for (const campaign of goalReachedCampaigns) {
      try {
        campaign.complete();
        await this.campaignRepository.save(campaign);
      } catch (error) {
        console.error(`Failed to auto-complete campaign ${campaign.id}:`, error);
      }
    }
  }

  
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async autoExpireCampaigns(): Promise<void> {
    const expiredCampaigns = await this.campaignRepository
      .createQueryBuilder('campaign')
      .where('campaign.status = :status', { status: CampaignStatus.ACTIVE })
      .andWhere('campaign.endsAt < :now', { now: new Date() })
      .getMany();

    for (const campaign of expiredCampaigns) {
      try {
        campaign.complete();
        await this.campaignRepository.save(campaign);
      } catch (error) {
        console.error(`Failed to auto-expire campaign ${campaign.id}:`, error);
      }
    }
  }


  private toCampaignResponseDto(
    campaign: Campaign,
    shelter?: Shelter,
  ): CampaignResponseDto {
    const dto = plainToClass(CampaignResponseDto, campaign, {
      excludeExtraneousValues: true,
    });

    if (shelter) {
      dto.shelterName = shelter.shelterName;
      dto.shelterImage = shelter.user?.profileImage;
    }

    return dto;
  }
}
