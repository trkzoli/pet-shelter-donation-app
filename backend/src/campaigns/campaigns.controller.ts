
import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  ParseIntPipe,
  ParseEnumPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/user.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CampaignsService } from './campaigns.service';
import { CampaignPriority, CampaignStatus } from './entities/campaign.entity';
import { CreateCampaignDto, UpdateCampaignDto, CompleteCampaignDto } from './dto/create-campaign.dto';
import {
  CampaignResponseDto,
  CampaignListResponseDto,
  CampaignStatsDto,
  ShelterCampaignSummaryDto,
} from './dto/campaign-response.dto';
import { Public } from '../auth/decorators/public.decorator';

@Controller('campaigns')
@UseGuards(JwtAuthGuard)
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  
  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.SHELTER)
  @HttpCode(HttpStatus.CREATED)
  async createCampaign(
    @GetUser('id') userId: string,
    @Body() createCampaignDto: CreateCampaignDto,
  ): Promise<CampaignResponseDto> {
    return this.campaignsService.createCampaign(userId, createCampaignDto);
}

  
  @Get()
  @Public()
  async getActiveCampaigns(
    @Query('page') pageParam?: string,
    @Query('limit') limitParam?: string,
    @Query('priority', new ParseEnumPipe(CampaignPriority, { optional: true }))
    priority?: CampaignPriority,
  ): Promise<CampaignListResponseDto> {
    
    const page = pageParam ? parseInt(pageParam, 10) : 1;
    const limit = limitParam ? parseInt(limitParam, 10) : 20;
    
  
    const validPage = Math.max(1, isNaN(page) ? 1 : page);
    const validLimit = Math.min(Math.max(1, isNaN(limit) ? 20 : limit), 50);

    return this.campaignsService.getActiveCampaigns(validPage, validLimit, priority);
  }

  
  @Get(':id')
  async getCampaignById(
    @Param('id', ParseUUIDPipe) campaignId: string,
  ): Promise<CampaignResponseDto> {
    return this.campaignsService.getCampaignById(campaignId);
  }

  
  @Get(':id/stats')
  async getCampaignStats(
    @Param('id', ParseUUIDPipe) campaignId: string,
  ): Promise<CampaignStatsDto> {
    return this.campaignsService.getCampaignStats(campaignId);
  }

  
  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SHELTER)
  @HttpCode(HttpStatus.OK)
  async updateCampaign(
    @GetUser('id') userId: string,
    @Param('id', ParseUUIDPipe) campaignId: string,
    @Body() updateCampaignDto: UpdateCampaignDto,
  ): Promise<CampaignResponseDto> {
    return this.campaignsService.updateCampaign(userId, campaignId, updateCampaignDto);
  }

  
  @Put(':id/complete')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SHELTER)
  @HttpCode(HttpStatus.OK)
  async completeCampaign(
    @GetUser('id') userId: string,
    @Param('id', ParseUUIDPipe) campaignId: string,
    @Body() completeDto: CompleteCampaignDto,
  ): Promise<CampaignResponseDto> {
    return this.campaignsService.completeCampaign(userId, campaignId, completeDto);
  }

  
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SHELTER)
  @HttpCode(HttpStatus.OK)
  async cancelCampaign(
    @GetUser('id') userId: string,
    @Param('id', ParseUUIDPipe) campaignId: string,
  ): Promise<CampaignResponseDto> {
    return this.campaignsService.cancelCampaign(userId, campaignId);
  }

  
  @Get('shelter/my-campaigns')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SHELTER)
  async getMyCampaigns(
    @GetUser('id') userId: string,
    @Query('page') pageParam?: string,
    @Query('limit') limitParam?: string,
    @Query('status', new ParseEnumPipe(CampaignStatus, { optional: true }))
    status?: CampaignStatus,
  ): Promise<CampaignListResponseDto> {
    console.log('🔍 CAMPAIGNS CONTROLLER DEBUG - getMyCampaigns called');
    console.log('🔍 CAMPAIGNS CONTROLLER DEBUG - userId:', userId);
    console.log('🔍 CAMPAIGNS CONTROLLER DEBUG - pageParam:', pageParam, 'limitParam:', limitParam, 'status:', status);
    
    
    const page = pageParam ? parseInt(pageParam, 10) : 1;
    const limit = limitParam ? parseInt(limitParam, 10) : 10;
    
  
    const validPage = Math.max(1, isNaN(page) ? 1 : page);
    const validLimit = Math.min(Math.max(1, isNaN(limit) ? 10 : limit), 50);
    
    console.log('🔍 CAMPAIGNS CONTROLLER DEBUG - validPage:', validPage, 'validLimit:', validLimit);

    const result = await this.campaignsService.getShelterCampaigns(userId, validPage, validLimit, status);
    console.log('🔍 CAMPAIGNS CONTROLLER DEBUG - result:', {
      total: result.total,
      campaignsCount: result.campaigns?.length,
      currentPage: result.currentPage
    });
    
    return result;
  }

  
  @Get('shelter/:shelterId')
  async getShelterCampaigns(
    @Param('shelterId', ParseUUIDPipe) shelterId: string,
    @Query('page') pageParam?: string,
    @Query('limit') limitParam?: string,
    @Query('status', new ParseEnumPipe(CampaignStatus, { optional: true }))
    status?: CampaignStatus,
  ): Promise<CampaignListResponseDto> {
    
    const page = pageParam ? parseInt(pageParam, 10) : 1;
    const limit = limitParam ? parseInt(limitParam, 10) : 10;
    
    
    const validPage = Math.max(1, isNaN(page) ? 1 : page);
    const validLimit = Math.min(Math.max(1, isNaN(limit) ? 10 : limit), 50);

    return this.campaignsService.getCampaignsByShelter(shelterId, validPage, validLimit, status);
  }

  
  @Get('shelter/summary')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SHELTER)
  async getShelterCampaignSummary(
    @GetUser('id') userId: string,
  ): Promise<ShelterCampaignSummaryDto> {
    return this.campaignsService.getShelterCampaignSummary(userId);
  }

  
  @Get('featured')
  async getFeaturedCampaigns(
    @Query('limit') limitParam?: string,
  ): Promise<CampaignResponseDto[]> {
    
    const limit = limitParam ? parseInt(limitParam, 10) : 6;
    const validLimit = Math.min(Math.max(1, isNaN(limit) ? 6 : limit), 20);
    
    
    const result = await this.campaignsService.getActiveCampaigns(
      1,
      validLimit,
      CampaignPriority.CRITICAL,
    );
    
    return result.campaigns;
  }

  
  @Get('by-priority/:priority')
  async getCampaignsByPriority(
    @Param('priority', new ParseEnumPipe(CampaignPriority)) priority: CampaignPriority,
    @Query('limit') limitParam?: string,
  ): Promise<CampaignResponseDto[]> {
    
    const limit = limitParam ? parseInt(limitParam, 10) : 4;
    const validLimit = Math.min(Math.max(1, isNaN(limit) ? 4 : limit), 20);
    
    const result = await this.campaignsService.getActiveCampaigns(
      1,
      validLimit,
      priority,
    );
    
    return result.campaigns;
  }
}
