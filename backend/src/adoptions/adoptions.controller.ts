// src/adoptions/adoptions.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
  BadRequestException,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { AdoptionsService } from './adoptions.service';
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

@Controller('adoptions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdoptionsController {
  constructor(private readonly adoptionsService: AdoptionsService) {}

  // ==================== ADOPTION ELIGIBILITY ====================

  /**
   * Check if user is eligible for adoption
   * GET /adoptions/eligibility
   * 
   * Returns eligibility status with detailed reasons
   * Available to: DONOR users only
   */
  @Get('eligibility')
  @Roles(UserRole.DONOR)
  @HttpCode(HttpStatus.OK)
  async checkEligibility(@Request() req) {
    return this.adoptionsService.checkAdoptionEligibility(req.user.id);
  }

  /**
   * Get pets user is eligible to adopt (has donated to)
   * GET /adoptions/eligible-pets
   * 
   * Returns list of pets user has donated to and can request adoption for
   * Excludes pets with pending requests from any user
   * Available to: DONOR users only
   */
  @Get('eligible-pets')
  @Roles(UserRole.DONOR)
  @HttpCode(HttpStatus.OK)
  async getEligiblePets(@Request() req): Promise<EligiblePetDto[]> {
    return this.adoptionsService.getEligiblePets(req.user.id);
  }

  // ==================== ADOPTION REQUESTS MANAGEMENT ====================

  /**
   * Create adoption request
   * POST /adoptions/request
   * 
   * Creates new adoption request for eligible pet
   * Deducts PawPoints if specified, sends email to shelter
   * Available to: DONOR users only
   */
  @Post('request')
  @Roles(UserRole.DONOR)
  @HttpCode(HttpStatus.CREATED)
  async createRequest(
    @Request() req,
    @Body() createDto: CreateAdoptionRequestDto,
  ): Promise<AdoptionRequestResponseDto> {
    return this.adoptionsService.createAdoptionRequest(req.user.id, createDto);
  }

  /**
   * Get user's adoption requests
   * GET /adoptions/my-requests
   * 
   * Returns all adoption requests made by the authenticated user
   * Ordered by creation date (newest first)
   * Available to: DONOR users only
   */
  @Get('my-requests')
  @Roles(UserRole.DONOR)
  @HttpCode(HttpStatus.OK)
  async getUserRequests(@Request() req): Promise<AdoptionRequestResponseDto[]> {
    return this.adoptionsService.getUserRequests(req.user.id);
  }

  /**
   * Get shelter's adoption requests
   * GET /adoptions/shelter-requests
   * 
   * Returns all adoption requests for pets belonging to the authenticated shelter
   * Includes user details and donation history for each request
   * Available to: SHELTER users only
   */
  @Get('shelter-requests')
  @Roles(UserRole.SHELTER)
  @HttpCode(HttpStatus.OK)
  async getShelterRequests(@Request() req): Promise<AdoptionRequestResponseDto[]> {
    return this.adoptionsService.getShelterRequests(req.user.id);
  }

  /**
   * Get adoption request by ID
   * GET /adoptions/:id
   * 
   * Returns detailed information about a specific adoption request
   * Available to: Request owner (DONOR) or shelter owner (SHELTER)
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getRequestById(
    @Param('id', ParseUUIDPipe) requestId: string,
    @Request() req,
  ): Promise<AdoptionRequestResponseDto> {
    return this.adoptionsService.getRequestById(requestId, req.user.id);
  }

  // ==================== REQUEST STATUS MANAGEMENT ====================

  /**
   * Cancel adoption request (donor only, 24-hour window)
   * PUT /adoptions/:id/cancel
   * 
   * Cancels pending adoption request within 24-hour window
   * Refunds any PawPoints used, triggers 3-day cooldown
   * Available to: Request owner (DONOR) only
   */
  @Put(':id/cancel')
  @Roles(UserRole.DONOR)
  @HttpCode(HttpStatus.OK)
  async cancelRequest(
    @Param('id', ParseUUIDPipe) requestId: string,
    @Request() req,
    @Body() cancelDto: CancelAdoptionRequestDto,
  ): Promise<AdoptionRequestResponseDto> {
    return this.adoptionsService.cancelRequest(requestId, req.user.id, cancelDto);
  }

  /**
   * Approve adoption request (shelter only)
   * PUT /adoptions/:id/approve
   * 
   * Approves pending adoption request, marks pet as adopted
   * Creates success story, awards bonus PawPoints to other donors
   * Available to: Pet's shelter owner (SHELTER) only
   */
  @Put(':id/approve')
  @Roles(UserRole.SHELTER)
  @HttpCode(HttpStatus.OK)
  async approveRequest(
    @Param('id', ParseUUIDPipe) requestId: string,
    @Request() req,
    @Body() updateDto: UpdateAdoptionStatusDto,
  ): Promise<AdoptionRequestResponseDto> {
    return this.adoptionsService.approveRequest(requestId, req.user.id, updateDto);
  }

  /**
   * Deny adoption request (shelter only)
   * PUT /adoptions/:id/deny
   * 
   * Denies pending adoption request with optional reason
   * Refunds any PawPoints used, triggers 1-week cooldown
   * Available to: Pet's shelter owner (SHELTER) only
   */
  @Put(':id/deny')
  @Roles(UserRole.SHELTER)
  @HttpCode(HttpStatus.OK)
  async denyRequest(
    @Param('id', ParseUUIDPipe) requestId: string,
    @Request() req,
    @Body() updateDto: UpdateAdoptionStatusDto,
  ): Promise<AdoptionRequestResponseDto> {
    return this.adoptionsService.denyRequest(requestId, req.user.id, updateDto);
  }

  // ==================== ADOPTION PROOF & DOCUMENTATION ====================

  /**
   * Upload adoption proof image (shelter only)
   * POST /adoptions/:id/proof
   * 
   * Uploads proof of adoption image for approved requests
   * Note: In Phase 10 (File Uploads), this will integrate with Cloudinary
   * Currently accepts image URL in request body
   * Available to: Pet's shelter owner (SHELTER) only
   */
  @Post(':id/proof')
  @Roles(UserRole.SHELTER)
  @HttpCode(HttpStatus.OK)
  async uploadAdoptionProof(
    @Param('id', ParseUUIDPipe) requestId: string,
    @Request() req,
    @Body() body: { imageUrl: string },
  ): Promise<AdoptionRequestResponseDto> {
    if (!body.imageUrl || body.imageUrl.trim() === '') {
      throw new BadRequestException('Image URL is required and cannot be empty');
    }

    // Basic URL validation
    try {
      new URL(body.imageUrl);
    } catch {
      throw new BadRequestException('Invalid image URL format');
    }

    return this.adoptionsService.uploadAdoptionProof(
      requestId,
      req.user.id,
      body.imageUrl.trim(),
    );
  }

  // ==================== INTERNAL ENDPOINTS ====================

  /**
   * Get adoption request email data (for notification service)
   * GET /adoptions/:id/email-data
   * 
   * Returns formatted data for email notifications to shelters
   * Includes complete user profile, donation history, and request details
   * Used internally by notification service (Phase 11)
   * Available to: All authenticated users (internal use)
   */
  @Get(':id/email-data')
  @HttpCode(HttpStatus.OK)
  async getAdoptionRequestEmailData(
    @Param('id', ParseUUIDPipe) requestId: string,
  ): Promise<AdoptionRequestEmailDataDto> {
    return this.adoptionsService.getAdoptionRequestEmailData(requestId);
  }

  // ==================== STATISTICS & ANALYTICS ====================

  /**
   * Get adoption statistics for authenticated user
   * GET /adoptions/stats
   * 
   * Returns adoption-related statistics based on user role:
   * - DONOR: Request history, success rate, PawPoints used
   * - SHELTER: Incoming requests, approval rate, completed adoptions
   */
  @Get('stats')
  @HttpCode(HttpStatus.OK)
  async getAdoptionStats(@Request() req) {
    const user = req.user;
    
    if (user.role === UserRole.DONOR) {
      return this.getDonerAdoptionStats(user.id);
    } else if (user.role === UserRole.SHELTER) {
      return this.getShelterAdoptionStats(user.id);
    }
    
    throw new BadRequestException('Invalid user role for adoption statistics');
  }

  /**
   * Get donor-specific adoption statistics
   */
  private async getDonerAdoptionStats(userId: string) {
    // This could be expanded in the future to include detailed stats
    const requests = await this.adoptionsService.getUserRequests(userId);
    
    const stats = {
      totalRequests: requests.length,
      pendingRequests: requests.filter(r => r.status === 'pending').length,
      approvedRequests: requests.filter(r => r.status === 'approved').length,
      deniedRequests: requests.filter(r => r.status === 'denied').length,
      cancelledRequests: requests.filter(r => r.status === 'cancelled').length,
      totalPawPointsUsed: requests.reduce((sum, r) => sum + r.pawPointsUsedForReduction, 0),
      totalFeeReduction: requests.reduce((sum, r) => sum + r.feeReduction, 0),
      successRate: requests.length > 0 ? 
        Math.round((requests.filter(r => r.status === 'approved').length / requests.length) * 100) : 0,
    };

    return stats;
  }

  /**
   * Get shelter-specific adoption statistics
   */
  private async getShelterAdoptionStats(userId: string) {
    const requests = await this.adoptionsService.getShelterRequests(userId);
    
    const stats = {
      totalRequests: requests.length,
      pendingRequests: requests.filter(r => r.status === 'pending').length,
      approvedRequests: requests.filter(r => r.status === 'approved').length,
      deniedRequests: requests.filter(r => r.status === 'denied').length,
      averageResponseTime: this.calculateAverageResponseTime(requests),
      approvalRate: requests.length > 0 ? 
        Math.round((requests.filter(r => r.status === 'approved').length / 
        requests.filter(r => r.status !== 'pending' && r.status !== 'cancelled').length) * 100) : 0,
    };

    return stats;
  }

  /**
   * Calculate average response time for shelter requests
   */
  private calculateAverageResponseTime(requests: AdoptionRequestResponseDto[]): number {
    const respondedRequests = requests.filter(r => 
      r.status === 'approved' || r.status === 'denied'
    );

    if (respondedRequests.length === 0) return 0;

    const totalResponseTime = respondedRequests.reduce((sum, request) => {
      const responseDate = request.approvedAt || request.deniedAt;
      if (responseDate) {
        return sum + (new Date(responseDate).getTime() - new Date(request.createdAt).getTime());
      }
      return sum;
    }, 0);

    // Return average response time in hours
    return Math.round((totalResponseTime / respondedRequests.length) / (1000 * 60 * 60));
  }

  // ==================== HELPER ENDPOINTS ====================

  /**
   * Get adoption request status by ID (lightweight)
   * GET /adoptions/:id/status
   * 
   * Returns just the status and basic info for a request
   * Useful for quick status checks without full request details
   */
  @Get(':id/status')
  @HttpCode(HttpStatus.OK)
  async getRequestStatus(
    @Param('id', ParseUUIDPipe) requestId: string,
    @Request() req,
  ) {
    const request = await this.adoptionsService.getRequestById(requestId, req.user.id);
    
    return {
      id: request.id,
      status: request.status,
      canBeCancelled: request.canBeCancelled,
      isExpired: request.isExpired,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
      expiresAt: request.expiresAt,
      petName: request.pet?.name,
      statusReason: request.statusReason,
    };
  }

  /**
   * Check if user can request adoption for specific pet
   * GET /adoptions/can-adopt/:petId
   * 
   * Quick check to see if user is eligible to adopt a specific pet
   * Available to: DONOR users only
   */
  @Get('can-adopt/:petId')
  @Roles(UserRole.DONOR)
  @HttpCode(HttpStatus.OK)
  async canAdoptPet(
    @Param('petId', ParseUUIDPipe) petId: string,
    @Request() req,
  ) {
    try {
      const eligiblePets = await this.adoptionsService.getEligiblePets(req.user.id);
      const canAdopt = eligiblePets.some(pet => pet.id === petId);
      
      return {
        petId,
        canAdopt,
        reason: canAdopt ? 'Eligible for adoption' : 'Not eligible - check requirements',
      };
    } catch (error) {
      return {
        petId,
        canAdopt: false,
        reason: error.message || 'Not eligible for adoption',
      };
    }
  }
}
