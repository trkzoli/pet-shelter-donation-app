
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Headers,
  RawBodyRequest,
  Req,
  Get,
  Param,
  HttpCode,
  HttpStatus,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiHeader,
  ApiParam,
} from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/user.decorator';
import { UserRole } from '../users/entities/user.entity';
import { PaymentsService } from './payments.service';
import {
  CreatePaymentIntentDto,
  PaymentIntentResponseDto,
  ConfirmPaymentDto,
  PaymentSuccessDto,
  RefundPaymentDto,
  RefundResponseDto,
} from './dto/payment.dto';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly configService: ConfigService,
  ) {}

  @Post('create-intent')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DONOR)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create payment intent',
    description: 'Creates a Stripe payment intent for donation processing',
  })
  @ApiResponse({
    status: 201,
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
    description: 'Target pet or campaign not found',
  })
  @HttpCode(HttpStatus.CREATED)
  async createPaymentIntent(
    @GetUser('id') userId: string,
    @Body() createPaymentIntentDto: CreatePaymentIntentDto,
  ): Promise<PaymentIntentResponseDto> {
    this.logger.log(
      `Creating payment intent for user ${userId}: $${createPaymentIntentDto.amount}`,
    );
    return await this.paymentsService.createPaymentIntent(
      userId,
      createPaymentIntentDto,
    );
  }

  @Post('confirm')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DONOR)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Confirm payment',
    description: 'Confirms a successful payment and processes the donation',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment confirmed successfully',
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
  async confirmPayment(
    @GetUser('id') userId: string,
    @Body() confirmPaymentDto: ConfirmPaymentDto,
  ): Promise<PaymentSuccessDto> {
    this.logger.log(
      `Confirming payment for user ${userId}: ${confirmPaymentDto.paymentIntentId}`,
    );
    return await this.paymentsService.confirmPayment(userId, confirmPaymentDto);
  }

  @Post('refund')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SHELTER) // Only shelters can process refunds
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Process refund for donation',
    description: 'Processes a refund for a completed donation (Admin only)'
  })
  @ApiResponse({
    status: 200,
    description: 'Refund processed successfully',
    type: RefundResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid refund parameters or donation cannot be refunded',
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
  async processRefund(
    @Body() refundPaymentDto: RefundPaymentDto,
  ): Promise<RefundResponseDto> {
    this.logger.log(`Processing refund for donation ${refundPaymentDto.donationId}`);
    
    return await this.paymentsService.processRefund(
      refundPaymentDto.donationId,
      refundPaymentDto,
    );
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Stripe webhook endpoint (Optional)',
    description: 'Handles Stripe webhook events for automatic payment processing'
  })
  @ApiHeader({
    name: 'stripe-signature',
    description: 'Stripe webhook signature for verification',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook processed successfully or webhook not configured',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid webhook signature or payload',
  })
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ): Promise<{ received: boolean; message?: string }> {
    // Check if webhook is configured
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      this.logger.warn('Webhook endpoint called but webhook secret not configured');
      return { 
        received: false, 
        message: 'Webhook not configured - use manual payment confirmation instead' 
      };
    }

    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    if (!req.rawBody) {
      throw new BadRequestException('Missing raw body for webhook verification');
    }

    this.logger.log('Processing Stripe webhook event');

    await this.paymentsService.handleWebhook(signature, req.rawBody);

    return { received: true };
  }

  @Get('config')
  @ApiOperation({ 
    summary: 'Get payment configuration',
    description: 'Returns public configuration needed for frontend payment integration'
  })
  @ApiResponse({
    status: 200,
    description: 'Payment configuration retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        publishableKey: {
          type: 'string',
          description: 'Stripe publishable key for frontend',
          example: 'pk_test_1234567890',
        },
      },
    },
  })
  getPaymentConfig(): { publishableKey: string } {
    return {
      publishableKey: this.paymentsService.getPublishableKey(),
    };
  }

  @Get('health')
  @ApiOperation({ 
    summary: 'Payment service health check',
    description: 'Checks if payment service is properly configured and operational'
  })
  @ApiResponse({
    status: 200,
    description: 'Payment service is healthy',
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          example: 'healthy',
        },
        stripe: {
          type: 'object',
          properties: {
            configured: { type: 'boolean' },
            testMode: { type: 'boolean' },
          },
        },
        timestamp: {
          type: 'string',
          format: 'date-time',
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Payment service configuration error',
  })
  getHealthStatus(): {
    status: string;
    stripe: { configured: boolean; testMode: boolean };
    timestamp: string;
  } {
    try {
      const publishableKey = this.paymentsService.getPublishableKey();
      const isTestMode = publishableKey.startsWith('pk_test_');

      return {
        status: 'healthy',
        stripe: {
          configured: true,
          testMode: isTestMode,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Payment service health check failed:', error);
      throw error;
    }
  }

  @Get('methods')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get saved payment methods',
    description: 'Returns saved payment methods for the authenticated user (future feature)'
  })
  @ApiResponse({
    status: 200,
    description: 'Payment methods retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        methods: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              type: { type: 'string' },
              last4: { type: 'string' },
              brand: { type: 'string' },
              expiryMonth: { type: 'number' },
              expiryYear: { type: 'number' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required',
  })
  async getPaymentMethods(
    @GetUser('id') userId: string,
  ): Promise<{ methods: any[] }> {
    
    this.logger.log(`Getting payment methods for user ${userId} (not implemented yet)`);
    
    return {
      methods: [],
    };
  }

  @Post('methods')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Save payment method',
    description: 'Saves a payment method for future use (future feature)'
  })
  @ApiResponse({
    status: 201,
    description: 'Payment method saved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required',
  })
  async savePaymentMethod(
    @GetUser('id') userId: string,
    @Body() saveMethodDto: { paymentMethodId: string },
  ): Promise<{ success: boolean; message: string }> {
    
    this.logger.log(`Saving payment method for user ${userId}: ${saveMethodDto.paymentMethodId} (not implemented yet)`);
    return {
      success: false,
      message: 'Saved payment methods feature coming soon',
    };
  }

  
  @Post('fix-pet-donations/:petId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SHELTER) 
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Fix corrupted donation data for a pet',
    description: 'Recalculates donation totals from actual donation records (Debug only)'
  })
  @ApiParam({
    name: 'petId',
    description: 'ID of the pet to fix donation data for',
  })
  @ApiResponse({
    status: 200,
    description: 'Donation data fixed successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required',
  })
  @ApiResponse({
    status: 403,
    description: 'Shelter role required',
  })
  @ApiResponse({
    status: 404,
    description: 'Pet not found',
  })
  async fixPetDonations(
    @Param('petId') petId: string,
  ): Promise<{ success: boolean; message: string }> {
    this.logger.log(`Fixing donation data for pet ${petId}`);
    
    try {
      await this.paymentsService.fixCorruptedDonationData(petId);
      return {
        success: true,
        message: `Donation data fixed successfully for pet ${petId}`,
      };
    } catch (error) {
      this.logger.error(`Error fixing donation data for pet ${petId}:`, error);
      throw new BadRequestException(`Failed to fix donation data: ${error.message}`);
    }
  }

  
  @Post('cleanup-donations/:petId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SHELTER)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Clean up corrupted donation data',
    description: 'Resets pet donation totals and optionally deletes donation records (Debug only)'
  })
  @ApiParam({
    name: 'petId',
    description: 'ID of the pet to clean donation data for',
  })
  @ApiResponse({
    status: 200,
    description: 'Donation data cleaned successfully',
  })
  async cleanupDonations(
    @Param('petId') petId: string,
    @Body() options: { deleteDonations?: boolean; recalculateFromScratch?: boolean } = {},
  ): Promise<{ success: boolean; message: string; deletedRecords?: number }> {
    try {
      if (options.recalculateFromScratch) {
        
        await this.paymentsService.fixCorruptedDonationData(petId);
        return {
          success: true,
          message: 'Pet donation data recalculated from actual donation records',
        };
      } else {

        const result = await this.paymentsService.cleanupCorruptedData(
          petId, 
          options.deleteDonations || false
        );
        return {
          success: true,
          message: `Pet donation data cleaned. ${options.deleteDonations ? 'Donation records deleted.' : 'Totals reset to zero.'}`,
          deletedRecords: result.deletedRecords,
        };
      }
    } catch (error) {
      throw new InternalServerErrorException(`Failed to cleanup donation data: ${error.message}`);
    }
  }
}
