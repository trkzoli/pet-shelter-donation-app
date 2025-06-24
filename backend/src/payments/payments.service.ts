// src/payments/payments.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { plainToClass } from 'class-transformer';
import { Donation, DonationStatus, DonationType } from '../donations/entities/donation.entity';
import { PawPointTransaction, TransactionType } from '../donations/entities/pawpoint-transaction.entity';
import { User } from '../users/entities/user.entity';
import { Pet, PetStatus } from '../pets/entities/pet.entity';
import { Campaign, CampaignStatus } from '../campaigns/entities/campaign.entity';
import { Shelter } from '../shelters/entities/shelter.entity';
import {
  CreatePaymentIntentDto,
  ConfirmPaymentDto,
  RefundPaymentDto,
  PaymentIntentResponseDto,
  PaymentSuccessDto,
  RefundResponseDto,
} from './dto/payment.dto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
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
    @InjectRepository(Shelter)
    private readonly shelterRepository: Repository<Shelter>,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {
    this.initializeStripe();
  }

  /**
   * Initialize Stripe with configuration
   */
  private initializeStripe(): void {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');

    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is required');
    }

    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-05-28.basil',
      typescript: true,
      maxNetworkRetries: 3,
      timeout: 20000,
      telemetry: nodeEnv === 'production',
    });

    this.logger.log(`Stripe initialized in ${nodeEnv} mode`);
  }

  /**
   * Create payment intent for donation
   */
  async createPaymentIntent(
    userId: string,
    createPaymentIntentDto: CreatePaymentIntentDto,
  ): Promise<PaymentIntentResponseDto> {
    const { amount, type, petId, campaignId, paymentMethod } = createPaymentIntentDto;

    try {
      // Validate user exists
      const user = await this.userRepository.findOne({
        where: { id: userId },
        select: ['id', 'email', 'name'],
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Validate target and calculate fees
      const { targetEntity, platformFeePercentage, shelterAmount } = 
        await this.validateTargetAndCalculateFees(type, amount, petId, campaignId);

      // Calculate PawPoints
      const pawPointsToEarn = Math.floor(amount / 25);
      const platformFee = (amount * platformFeePercentage) / 100;

      // Create Stripe payment intent
      const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        automatic_payment_methods: { enabled: true },
        metadata: {
          userId,
          type,
          targetId: petId || campaignId || null,
          targetName: this.getTargetName(targetEntity),
          pawPointsToEarn: pawPointsToEarn.toString(),
          platformFee: platformFee.toFixed(2),
          shelterAmount: shelterAmount.toFixed(2),
        },
        description: this.generatePaymentDescription(type, targetEntity, amount),
      };

      const paymentIntent = await this.stripe.paymentIntents.create(paymentIntentParams);

      // Create pending donation record
      const donation = this.donationRepository.create({
        userId,
        petId: type === 'pet' ? petId : undefined,
        campaignId: type === 'campaign' ? campaignId : undefined,
        amount,
        type: type as unknown as DonationType,
        paymentIntentId: paymentIntent.id,
        status: DonationStatus.PENDING,
        pawPointsEarned: pawPointsToEarn,
        platformFee,
        platformFeePercentage,
      });

      await this.donationRepository.save(donation);

      return plainToClass(PaymentIntentResponseDto, {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount,
        platformFee,
        shelterAmount,
        pawPointsToEarn,
        publishableKey: this.configService.get<string>('STRIPE_PUBLISHABLE_KEY'),
      });
    } catch (error) {
      this.logger.error('Error creating payment intent:', error);
      
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      
      throw new InternalServerErrorException('Failed to create payment intent');
    }
  }

  /**
   * Confirm payment after successful payment
   */
  async confirmPayment(
    userId: string,
    confirmPaymentDto: ConfirmPaymentDto,
  ): Promise<PaymentSuccessDto> {
    const { paymentIntentId } = confirmPaymentDto;

    return await this.dataSource.transaction(async manager => {
      // Find pending donation without locking first
      const donation = await manager.findOne(Donation, {
        where: {
          paymentIntentId,
          userId,
          status: DonationStatus.PENDING,
        },
        relations: ['user', 'pet', 'pet.shelter', 'campaign', 'campaign.shelter'],
      });

      if (!donation) {
        throw new NotFoundException('Donation not found or already processed');
      }

      // Lock the donation row specifically to prevent concurrent processing
      await manager.query(
        'SELECT id FROM donations WHERE id = $1 FOR UPDATE',
        [donation.id]
      );

      try {
        // Verify payment with Stripe
        const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status !== 'succeeded') {
          throw new BadRequestException('Payment not completed successfully');
        }

        // Update donation status
        donation.status = DonationStatus.COMPLETED;
        donation.stripeChargeId = paymentIntent.latest_charge as string;
        await manager.save(donation);

        // Award PawPoints
        if (donation.pawPointsEarned > 0) {
          await this.awardPawPoints(manager, userId, donation);
        }

        // Update target progress
        await this.updateTargetProgress(manager, donation);

        // Get target and shelter names for response
        const targetName = donation.pet?.name || donation.campaign?.title || 'Unknown';
        const shelterName = donation.pet?.shelter?.shelterName || 
                          donation.campaign?.shelter?.shelterName || 'Unknown Shelter';

        this.logger.log(`Payment confirmed: $${donation.amount} donation to ${targetName}`);

        return plainToClass(PaymentSuccessDto, {
          donationId: donation.id,
          transactionId: paymentIntentId,
          amount: donation.amount,
          pawPointsEarned: donation.pawPointsEarned,
          targetName,
          shelterName,
        });

      } catch (error) {
        this.logger.error('Error confirming payment:', error);
        throw new InternalServerErrorException('Failed to confirm payment');
      }
    });
  }

  /**
   * Process refund for donation
   */
  async processRefund(
    donationId: string,
    refundDto: RefundPaymentDto,
  ): Promise<RefundResponseDto> {
    const { amount: refundAmount, reason } = refundDto;

    return await this.dataSource.transaction(async manager => {
      const donation = await manager.findOne(Donation, {
        where: { id: donationId, status: DonationStatus.COMPLETED },
        relations: ['user'],
      });

      if (!donation) {
        throw new NotFoundException('Donation not found or cannot be refunded');
      }

      // Determine refund amount (full or partial)
      const finalRefundAmount = refundAmount || donation.amount;
      
      if (finalRefundAmount > donation.amount) {
        throw new BadRequestException('Refund amount cannot exceed original donation');
      }

      try {
        // Process Stripe refund
        const refund = await this.stripe.refunds.create({
          payment_intent: donation.paymentIntentId,
          amount: Math.round(finalRefundAmount * 100), // Convert to cents
          reason: 'requested_by_customer',
          metadata: {
            originalDonationId: donationId,
            refundReason: reason,
          },
        });

        // Update donation status
        if (finalRefundAmount === donation.amount) {
          donation.status = DonationStatus.REFUNDED;
        }
        await manager.save(donation);

        // Reverse PawPoints if full refund
        if (finalRefundAmount === donation.amount && donation.pawPointsEarned > 0) {
          await this.reversePawPoints(manager, donation.userId, donation, reason);
        }

        // Add bonus PawPoint for shelter error
        if (reason.toLowerCase().includes('shelter error') || reason.toLowerCase().includes('mistake')) {
          await this.awardBonusPawPoint(manager, donation.userId, 'error_bonus', reason);
        }

        this.logger.log(`Refund processed: $${finalRefundAmount} for donation ${donationId}`);

        // Calculate expected availability (typically 5-10 business days)
        const expectedDate = new Date();
        expectedDate.setDate(expectedDate.getDate() + 7);

        return plainToClass(RefundResponseDto, {
          refundId: refund.id,
          amount: finalRefundAmount,
          status: refund.status,
          expectedAvailability: expectedDate.toISOString().split('T')[0],
        });

      } catch (error) {
        this.logger.error('Error processing refund:', error);
        throw new InternalServerErrorException('Failed to process refund');
      }
    });
  }

  /**
   * Handle Stripe webhook events (OPTIONAL - for production use)
   */
  async handleWebhook(signature: string, payload: Buffer): Promise<void> {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    
    // Make webhook functionality optional
    if (!webhookSecret) {
      this.logger.warn('Webhook secret not configured - webhook handling disabled');
      return;
    }

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (error) {
      this.logger.error('Webhook signature verification failed:', error);
      throw new BadRequestException('Invalid webhook signature');
    }

    this.logger.log(`Processing webhook event: ${event.type}`);

    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
          break;
        
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
          break;
        
        case 'charge.dispute.created':
          await this.handleChargeDispute(event.data.object as Stripe.Dispute);
          break;
        
        default:
          this.logger.log(`Unhandled webhook event type: ${event.type}`);
      }
    } catch (error) {
      this.logger.error(`Error processing webhook ${event.type}:`, error);
      throw new InternalServerErrorException('Failed to process webhook');
    }
  }

  /**
   * Get Stripe publishable key
   */
  getPublishableKey(): string {
    const publishableKey = this.configService.get<string>('STRIPE_PUBLISHABLE_KEY');
    if (!publishableKey) {
      throw new InternalServerErrorException('Stripe publishable key not configured');
    }
    return publishableKey;
  }

  // Private helper methods

  private async validateTargetAndCalculateFees(
    type: string,
    amount: number,
    petId?: string,
    campaignId?: string,
  ): Promise<{
    targetEntity: Pet | Campaign;
    platformFeePercentage: number;
    shelterAmount: number;
  }> {
    let targetEntity: Pet | Campaign;
    let platformFeePercentage: number;

    if (type === 'pet') {
      const pet = await this.petRepository.findOne({
        where: { id: petId, status: PetStatus.PUBLISHED },
        relations: ['shelter'],
      });

      if (!pet) {
        throw new NotFoundException('Pet not found or not available for donation');
      }

      targetEntity = pet;
      platformFeePercentage = 10; // Fixed 10% for pet donations
    } else {
      const campaign = await this.campaignRepository.findOne({
        where: { id: campaignId, status: CampaignStatus.ACTIVE },
        relations: ['shelter'],
      });

      if (!campaign) {
        throw new NotFoundException('Campaign not found or not active');
      }

      // Check if campaign hasn't expired
      if (campaign.endsAt < new Date()) {
        throw new BadRequestException('Campaign has expired');
      }

      targetEntity = campaign;
      platformFeePercentage = campaign.platformFeePercentage;
    }

    const platformFee = (amount * platformFeePercentage) / 100;
    const shelterAmount = amount - platformFee;

    return { targetEntity, platformFeePercentage, shelterAmount };
  }

  private getTargetName(target: Pet | Campaign): string {
    if ('name' in target) {
      return target.name; // Pet
    }
    return target.title; // Campaign
  }

  private generatePaymentDescription(type: string, target: Pet | Campaign, amount: number): string {
    const targetName = this.getTargetName(target);
    const formattedAmount = amount.toFixed(2);
    
    if (type === 'pet') {
      return `Donation of $${formattedAmount} to support ${targetName}`;
    }
    return `Donation of $${formattedAmount} to campaign: ${targetName}`;
  }

  private async awardPawPoints(
    manager: any,
    userId: string,
    donation: Donation,
  ): Promise<void> {
    // Update user's PawPoints balance and total donated
    await manager.increment(User, { id: userId }, 'pawPoints', donation.pawPointsEarned);
    await manager.increment(User, { id: userId }, 'totalDonated', donation.amount);

    // Get user's updated balance
    const user = await manager.findOne(User, {
      where: { id: userId },
      select: ['pawPoints'],
    });

    // Create transaction record
    const transaction = manager.create(PawPointTransaction, {
      userId,
      points: donation.pawPointsEarned,
      type: TransactionType.DONATION,
      relatedDonationId: donation.id,
      description: `Earned ${donation.pawPointsEarned} PawPoints for $${donation.amount} donation`,
      balanceAfter: user.pawPoints,
    });

    await manager.save(transaction);
  }

  private async reversePawPoints(
    manager: any,
    userId: string,
    donation: Donation,
    reason: string,
  ): Promise<void> {
    // Deduct PawPoints from user
    await manager.decrement(User, { id: userId }, 'pawPoints', donation.pawPointsEarned);

    // Get user's updated balance
    const user = await manager.findOne(User, {
      where: { id: userId },
      select: ['pawPoints'],
    });

    // Create reversal transaction record
    const transaction = manager.create(PawPointTransaction, {
      userId,
      points: -donation.pawPointsEarned,
      type: TransactionType.REFUND,
      relatedDonationId: donation.id,
      description: `Reversed ${donation.pawPointsEarned} PawPoints due to refund: ${reason}`,
      balanceAfter: user.pawPoints,
    });

    await manager.save(transaction);
  }

  private async awardBonusPawPoint(
    manager: any,
    userId: string,
    type: string,
    reason: string,
  ): Promise<void> {
    // Award 1 bonus PawPoint
    await manager.increment(User, { id: userId }, 'pawPoints', 1);

    // Get user's updated balance
    const user = await manager.findOne(User, {
      where: { id: userId },
      select: ['pawPoints'],
    });

    // Create transaction record
    const transaction = manager.create(PawPointTransaction, {
      userId,
      points: 1,
      type: TransactionType.BONUS,
      description: `Bonus PawPoint awarded: ${reason}`,
      balanceAfter: user.pawPoints,
    });

    await manager.save(transaction);
  }

  private async updateTargetProgress(
    manager: any,
    donation: Donation,
  ): Promise<void> {
    if (donation.type === DonationType.PET) {
      // Get fresh pet data to avoid stale values
      const pet = await manager.findOne(Pet, {
        where: { id: donation.petId },
        select: [
          'id', 'name', 'totalDonationsReceived', 'currentMonthDonations', 
          'currentMonthDistribution', 'monthlyGoals', 'goalsLastReset'
        ],
      });

      if (!pet) {
        throw new Error(`Pet not found: ${donation.petId}`);
      }

      // Log current state and donation amounts for debugging
      this.logger.log(`🔍 DONATION PROCESSING DEBUG:`);
      this.logger.log(`  Pet: ${pet.name} (${pet.id})`);
      this.logger.log(`  Donation amount: $${donation.amount}`);
      this.logger.log(`  Platform fee: $${donation.platformFee}`);
      this.logger.log(`  Shelter amount: $${donation.getShelterAmount()}`);
      this.logger.log(`  Current pet totalDonationsReceived: $${pet.totalDonationsReceived}`);
      this.logger.log(`  Current pet currentMonthDonations: $${pet.currentMonthDonations}`);

      // Validate donation amount is reasonable
      if (donation.amount > 100000) {
        throw new Error(`Suspicious donation amount detected: $${donation.amount} - preventing database corruption`);
      }

      // Distribute donation across monthly goal categories
      if (pet.monthlyGoals) {
        const totalGoals: number = (Object.values(pet.monthlyGoals) as number[]).reduce(
          (sum: number, goal: number) => sum + goal,
          0,
        );

        if (totalGoals > 0) {
          // Use shelter amount (after platform fee) for distribution, not full donation amount
          const shelterAmount = donation.getShelterAmount();
          const distribution = {
            vaccination: (shelterAmount * pet.monthlyGoals.vaccination) / totalGoals,
            food: (shelterAmount * pet.monthlyGoals.food) / totalGoals,
            medical: (shelterAmount * pet.monthlyGoals.medical) / totalGoals,
            other: (shelterAmount * pet.monthlyGoals.other) / totalGoals,
          };

          // Update pet's current month distribution
          if (!pet.currentMonthDistribution) {
            pet.currentMonthDistribution = { vaccination: 0, food: 0, medical: 0, other: 0 };
          }

          pet.currentMonthDistribution.vaccination = (parseFloat(pet.currentMonthDistribution.vaccination?.toString() || '0')) + distribution.vaccination;
          pet.currentMonthDistribution.food = (parseFloat(pet.currentMonthDistribution.food?.toString() || '0')) + distribution.food;
          pet.currentMonthDistribution.medical = (parseFloat(pet.currentMonthDistribution.medical?.toString() || '0')) + distribution.medical;
          pet.currentMonthDistribution.other = (parseFloat(pet.currentMonthDistribution.other?.toString() || '0')) + distribution.other;
        }
      }

      // Update pet totals - use shelter amount for currentMonthDonations since that's what goes to pet care
      const currentTotal = parseFloat(pet.totalDonationsReceived?.toString() || '0');
      const currentMonth = parseFloat(pet.currentMonthDonations?.toString() || '0');
      
      const newTotalDonationsReceived = currentTotal + donation.amount; // Keep full amount for total tracking
      const newCurrentMonthDonations = currentMonth + donation.getShelterAmount(); // Use shelter amount for monthly progress

      // Validate new totals are reasonable
      if (newTotalDonationsReceived > 1000000) {
        this.logger.error(`SUSPICIOUS CALCULATION DETECTED:`);
        this.logger.error(`  Current total: $${currentTotal}`);
        this.logger.error(`  Donation amount: $${donation.amount}`);
        this.logger.error(`  New total would be: $${newTotalDonationsReceived}`);
        throw new Error(`Preventing database corruption - calculated total is unreasonably high: $${newTotalDonationsReceived}`);
      }

      this.logger.log(`📊 CALCULATION RESULTS:`);
      this.logger.log(`  New totalDonationsReceived: $${currentTotal} + $${donation.amount} = $${newTotalDonationsReceived}`);
      this.logger.log(`  New currentMonthDonations: $${currentMonth} + $${donation.getShelterAmount()} = $${newCurrentMonthDonations}`);

      // Save the updated pet using update instead of save to avoid INSERT issues
      await manager.update(Pet, { id: donation.petId }, {
        totalDonationsReceived: newTotalDonationsReceived,
        currentMonthDonations: newCurrentMonthDonations,
        currentMonthDistribution: pet.currentMonthDistribution,
        goalsLastReset: pet.goalsLastReset,
      });

      this.logger.log(`Pet donation totals updated successfully`);

    } else if (donation.type === DonationType.CAMPAIGN) {
      // Update campaign progress with shelter amount (after platform fees)
      const shelterAmount = donation.getShelterAmount();
      await manager.increment(
        Campaign,
        { id: donation.campaignId },
        'currentAmount',
        shelterAmount,
      );

      // Check if campaign goal is reached
      const campaign = await manager.findOne(Campaign, {
        where: { id: donation.campaignId },
        select: ['currentAmount', 'goalAmount', 'status'],
      });

      if (campaign && campaign.currentAmount >= campaign.goalAmount && 
          campaign.status === CampaignStatus.ACTIVE) {
        await manager.update(
          Campaign,
          { id: donation.campaignId },
          { status: CampaignStatus.COMPLETED },
        );
      }
    }
  }

  // Webhook event handlers

  private async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const donation = await this.donationRepository.findOne({
      where: { paymentIntentId: paymentIntent.id },
    });

    if (!donation) {
      this.logger.warn(`No donation found for payment intent: ${paymentIntent.id}`);
      return;
    }

    if (donation.status === DonationStatus.COMPLETED) {
      this.logger.log(`Payment already processed for donation: ${donation.id} - skipping webhook processing`);
      return;
    }

    // Only update the Stripe charge ID from webhook, don't reprocess the entire donation
    // The frontend confirmPayment call should handle all the business logic
    try {
      await this.donationRepository.update(
        { id: donation.id },
        { 
          stripeChargeId: paymentIntent.latest_charge as string,
          // Don't change status here - let the frontend confirmPayment handle it
        }
      );
      this.logger.log(`Webhook: Updated Stripe charge ID for donation ${donation.id}`);
    } catch (error) {
      this.logger.error(`Error processing webhook payment success:`, error);
    }
  }

  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const donation = await this.donationRepository.findOne({
      where: { paymentIntentId: paymentIntent.id },
    });

    if (!donation) {
      this.logger.warn(`No donation found for failed payment intent: ${paymentIntent.id}`);
      return;
    }

    // Update donation status to failed
    await this.donationRepository.update(
      { id: donation.id },
      { status: DonationStatus.FAILED },
    );

    this.logger.log(`Webhook: Payment failed for donation ${donation.id}`);
  }

  private async handleChargeDispute(dispute: Stripe.Dispute): Promise<void> {
    const chargeId = dispute.charge as string;
    
    // Find donation by charge ID
    const donation = await this.donationRepository.findOne({
      where: { stripeChargeId: chargeId },
      relations: ['user'],
    });

    if (!donation) {
      this.logger.warn(`No donation found for disputed charge: ${chargeId}`);
      return;
    }

    // Handle dispute based on reason
    this.logger.warn(`Dispute created for donation ${donation.id}: ${dispute.reason}`);
    
    // Could implement additional dispute handling logic here
    // For example, notifying admins, flagging user accounts, etc.
  }

  /**
   * Fix corrupted donation data by recalculating from actual donation records
   * This should be called after fixing the duplicate processing bug
   */
  async fixCorruptedDonationData(petId: string): Promise<void> {
    return await this.dataSource.transaction(async manager => {
      // Get all completed donations for this pet
      const donations = await manager.find(Donation, {
        where: {
          petId,
          status: DonationStatus.COMPLETED,
        },
        order: { createdAt: 'ASC' },
      });

      // Get the pet
      const pet = await manager.findOne(Pet, {
        where: { id: petId },
      });

      if (!pet) {
        throw new Error(`Pet not found: ${petId}`);
      }

      // Calculate correct totals
      let totalDonationsReceived = 0;
      let currentMonthDonations = 0;
      const currentMonthDistribution = { vaccination: 0, food: 0, medical: 0, other: 0 };

      // Sum up all donations
      for (const donation of donations) {
        totalDonationsReceived += donation.amount;
        
        // Calculate shelter amount (90% of donation)
        const shelterAmount = donation.getShelterAmount();
        currentMonthDonations += shelterAmount;

        // Distribute across categories if monthly goals exist
        if (pet.monthlyGoals) {
          const totalGoals = Object.values(pet.monthlyGoals).reduce((sum, goal) => sum + goal, 0);
          if (totalGoals > 0) {
            currentMonthDistribution.vaccination += (shelterAmount * pet.monthlyGoals.vaccination) / totalGoals;
            currentMonthDistribution.food += (shelterAmount * pet.monthlyGoals.food) / totalGoals;
            currentMonthDistribution.medical += (shelterAmount * pet.monthlyGoals.medical) / totalGoals;
            currentMonthDistribution.other += (shelterAmount * pet.monthlyGoals.other) / totalGoals;
          }
        }
      }

      // Update pet with correct values
      await manager.update(Pet, { id: petId }, {
        totalDonationsReceived,
        currentMonthDonations,
        currentMonthDistribution,
        goalsLastReset: pet.goalsLastReset || new Date(),
      });

      this.logger.log(`Fixed donation data for pet ${petId}: Total: $${totalDonationsReceived}, Current Month: $${currentMonthDonations}`);
    });
  }

  /**
   * Clean up corrupted donation data by resetting pet totals and optionally deleting records
   */
  async cleanupCorruptedData(petId: string, deleteDonations: boolean = false): Promise<{ deletedRecords: number }> {
    return await this.dataSource.transaction(async manager => {
      // Get the pet
      const pet = await manager.findOne(Pet, {
        where: { id: petId },
      });

      if (!pet) {
        throw new Error(`Pet not found: ${petId}`);
      }

      let deletedRecords = 0;

      // Optionally delete donation records
      if (deleteDonations) {
        const result = await manager.delete(Donation, {
          petId,
          status: DonationStatus.COMPLETED,
        });
        deletedRecords = result.affected || 0;
        this.logger.log(`Deleted ${deletedRecords} donation records for pet ${petId}`);
      }

      // Reset pet donation totals to zero
      await manager.update(Pet, { id: petId }, {
        totalDonationsReceived: 0,
        currentMonthDonations: 0,
        currentMonthDistribution: { vaccination: 0, food: 0, medical: 0, other: 0 },
        goalsLastReset: new Date(),
      });

      this.logger.log(`Reset donation totals for pet ${petId}`);

      return { deletedRecords };
    });
  }
}
