// src/payments/payments.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { Donation } from '../donations/entities/donation.entity';
import { PawPointTransaction } from '../donations/entities/pawpoint-transaction.entity';
import { User } from '../users/entities/user.entity';
import { Pet } from '../pets/entities/pet.entity';
import { Campaign } from '../campaigns/entities/campaign.entity';
import { Shelter } from '../shelters/entities/shelter.entity';

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
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService], // Export for use in donations module
})
export class PaymentsModule {}
