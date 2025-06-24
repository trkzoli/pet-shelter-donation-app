// src/donations/donations.module.ts (Updated for Payments Integration)
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { DonationsController } from './donations.controller';
import { DonationsService } from './donations.service';
import { Donation } from './entities/donation.entity';
import { PawPointTransaction } from './entities/pawpoint-transaction.entity';
import { User } from '../users/entities/user.entity';
import { Pet } from '../pets/entities/pet.entity';
import { Campaign } from '../campaigns/entities/campaign.entity';
import { Shelter } from '../shelters/entities/shelter.entity';
import { CampaignsModule } from '../campaigns/campaigns.module';
import { PaymentsModule } from '../payments/payments.module'; // New integration

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Donation,
      PawPointTransaction,
      User,
      Pet,
      Campaign,
      Shelter,
    ]),
    ConfigModule, // For Stripe configuration
    forwardRef(() => CampaignsModule), // For campaign donation integration
    forwardRef(() => PaymentsModule), // For payment processing integration
  ],
  controllers: [DonationsController],
  providers: [DonationsService],
  exports: [DonationsService], // Export for use in other modules
})
export class DonationsModule {}
