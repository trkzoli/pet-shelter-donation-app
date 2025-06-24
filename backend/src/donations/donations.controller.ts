// src/donations/donations.controller.ts (Updated for Payments Integration)
import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/user.decorator';
import { UserRole } from '../users/entities/user.entity';
import { DonationsService } from './donations.service';
import { PaymentsService } from '../payments/payments.service';
import { CreateDonationDto, ConfirmDonationDto, RefundDonationDto } from './dto/create-donation.dto';
import {
  DonationResponseDto,
  SupportedPetDto,
  DonationStatsDto,
  PaymentIntentDto,
} from './dto/donation-response.dto';
import {
  CreatePaymentIntentDto,
  ConfirmPaymentDto,
  PaymentIntentResponseDto,
  PaymentSuccessDto,
} from '../payments/dto/payment.dto';

@ApiTags('Donations')
@Controller('donations')
@UseGuards(JwtAuthGuard)
export class DonationsController {
  private readonly logger = new Logger(DonationsController.name);

  constructor(
    private readonly donationsService: DonationsService,
    private readonly paymentsService: PaymentsService,
  ) {}

  /**
   * Create payment intent for donation (Updated to use PaymentsService)
   * POST /donations/create-intent
   */
  @Post('create-intent')
  @UseGuards(RolesGuard)
  @Roles(UserRole.DONOR)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Create payment intent for donation',
    description: 'Creates a Stripe payment intent for pet or campaign donation'
  })
  @ApiResponse({
    status: 200,
    description: 'Payment intent created successfully',
    type: PaymentIntentResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid donation parameters',
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required',
  })
  @ApiResponse({
    status: 404,
    description: 'Pet or campaign not found',
  })
  @HttpCode(HttpStatus.OK)
  async createPaymentIntent(
    @GetUser('id') userId: string,
    @Body() createDonationDto: CreateDonationDto,
  ): Promise<PaymentIntentResponseDto> {
    this.logger.log(`Creating payment intent for user ${userId}: $${createDonationDto.amount}`);
    // Transform donations DTO to payments DTO
    const createPaymentIntentDto: CreatePaymentIntentDto = {
      amount: createDonationDto.amount,
      currency: 'usd',
      type: createDonationDto.type as any, // Type is compatible
      petId: createDonationDto.petId,
      campaignId: createDonationDto.campaignId,
      paymentMethod: 'card',
    };

    return await this.paymentsService.createPaymentIntent(userId, createPaymentIntentDto);
  }

  /**
   * Confirm donation after successful payment (Updated to use PaymentsService)
   * POST /donations/confirm
   */
  @Post('confirm')
  @UseGuards(RolesGuard)
  @Roles(UserRole.DONOR)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Confirm donation after payment',
    description: 'Confirms a successful payment and processes the donation'
  })
  @ApiResponse({
    status: 200,
    description: 'Donation confirmed successfully',
    type: PaymentSuccessDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Payment not completed or already processed',
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required',
  })
  @ApiResponse({
    status: 404,
    description: 'Payment intent not found',
  })
  @HttpCode(HttpStatus.OK)
  async confirmDonation(
    @GetUser('id') userId: string,
    @Body() confirmDto: ConfirmDonationDto,
  ): Promise<PaymentSuccessDto> {
    this.logger.log(`Confirming donation for user ${userId}: ${confirmDto.paymentIntentId}`);
    
    // Transform donations DTO to payments DTO
    const confirmPaymentDto: ConfirmPaymentDto = {
      paymentIntentId: confirmDto.paymentIntentId,
    };

    return await this.paymentsService.confirmPayment(userId, confirmPaymentDto);
  }

  /**
   * Get user's donation history
   * GET /donations/history?page=1&limit=20
   */
  @Get('history')
  @UseGuards(RolesGuard)
  @Roles(UserRole.DONOR)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get donation history',
    description: 'Returns paginated list of user donations'
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 20, max: 50)' })
  @ApiResponse({
    status: 200,
    description: 'Donation history retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        donations: {
          type: 'array',
          items: { $ref: '#/components/schemas/DonationResponseDto' },
        },
        total: { type: 'number' },
        pages: { type: 'number' },
        currentPage: { type: 'number' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required',
  })
  async getDonationHistory(
    @GetUser('id') userId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
  ): Promise<{
    donations: DonationResponseDto[];
    total: number;
    pages: number;
    currentPage: number;
  }> {
    // Validate pagination parameters
    const validPage = Math.max(1, page);
    const validLimit = Math.min(Math.max(1, limit), 50);

    const result = await this.donationsService.getDonationHistory(
      userId,
      validPage,
      validLimit,
    );

    return {
      donations: result.donations,
      total: result.total,
      pages: Math.ceil(result.total / validLimit),
      currentPage: validPage,
    };
  }

  /**
   * Get pets supported by user
   * GET /donations/supported-pets
   */
  @Get('supported-pets')
  @UseGuards(RolesGuard)
  @Roles(UserRole.DONOR)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get supported pets',
    description: 'Returns all pets the user has donated to'
  })
  @ApiResponse({
    status: 200,
    description: 'Supported pets retrieved successfully',
    type: [SupportedPetDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required',
  })
  async getSupportedPets(
    @GetUser('id') userId: string,
  ): Promise<SupportedPetDto[]> {
    return await this.donationsService.getSupportedPets(userId);
  }

  /**
   * Get success stories for user's supported pets
   * GET /donations/success-stories
   */
  @Get('success-stories')
  @UseGuards(RolesGuard)
  @Roles(UserRole.DONOR)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get success stories',
    description: 'Returns success stories for pets the user has supported that were adopted'
  })
  @ApiResponse({
    status: 200,
    description: 'Success stories retrieved successfully',
    type: Array,
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required',
  })
  async getUserSuccessStories(
    @GetUser('id') userId: string,
  ): Promise<any[]> {
    return await this.donationsService.getUserSuccessStories(userId);
  }

  /**
   * Get user donations for a specific pet
   * GET /donations/user/pet/:petId
   */
  @Get('user/pet/:petId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.DONOR)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get user donations for specific pet',
    description: 'Returns all donations made by user to a specific pet'
  })
  @ApiParam({ name: 'petId', description: 'Pet ID' })
  @ApiResponse({
    status: 200,
    description: 'Pet donations retrieved successfully',
    type: [DonationResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required',
  })
  @ApiResponse({
    status: 404,
    description: 'Pet not found or no donations made',
  })
  async getUserPetDonations(
    @GetUser('id') userId: string,
    @Param('petId', ParseUUIDPipe) petId: string,
  ): Promise<DonationResponseDto[]> {
    return await this.donationsService.getUserPetDonations(userId, petId);
  }

  /**
   * Get user's donation statistics
   * GET /donations/stats
   */
  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles(UserRole.DONOR)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get donation statistics',
    description: 'Returns user donation stats and PawPoints summary'
  })
  @ApiResponse({
    status: 200,
    description: 'Donation statistics retrieved successfully',
    type: DonationStatsDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required',
  })
  async getDonationStats(
    @GetUser('id') userId: string,
  ): Promise<DonationStatsDto> {
    return await this.donationsService.getDonationStats(userId);
  }

  /**
   * Get specific donation details
   * GET /donations/:id
   */
  @Get(':id')
  @ApiOperation({ 
    summary: 'Get donation details',
    description: 'Returns details of a specific donation'
  })
  @ApiParam({ name: 'id', description: 'Donation ID' })
  @ApiResponse({
    status: 200,
    description: 'Donation details retrieved successfully',
    type: DonationResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required',
  })
  @ApiResponse({
    status: 404,
    description: 'Donation not found',
  })
  async getDonationById(
    @GetUser('id') userId: string,
    @Param('id', ParseUUIDPipe) donationId: string,
  ): Promise<DonationResponseDto> {
    return await this.donationsService.getDonationById(userId, donationId);
  }

  /**
   * Request refund for donation (Admin/Support only)
   * POST /donations/:id/refund
   */
  @Post(':id/refund')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SHELTER) // Only shelters can process refunds
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Request donation refund',
    description: 'Processes a refund for a completed donation (Admin only)'
  })
  @ApiParam({ name: 'id', description: 'Donation ID' })
  @ApiResponse({
    status: 200,
    description: 'Refund processed successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Donation cannot be refunded',
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required',
  })
  @ApiResponse({
    status: 403,
    description: 'Admin role required',
  })
  @ApiResponse({
    status: 404,
    description: 'Donation not found',
  })
  async requestRefund(
    @Param('id', ParseUUIDPipe) donationId: string,
    @Body() refundDto: RefundDonationDto,
  ): Promise<{ success: boolean; message: string }> {
    this.logger.log(`Processing refund request for donation ${donationId}`);
    
    await this.donationsService.refundDonation(donationId, refundDto);
    
    return {
      success: true,
      message: 'Refund processed successfully',
    };
  }
}
