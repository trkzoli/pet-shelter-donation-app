// src/campaigns/campaigns.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { CampaignsController } from './campaigns.controller';
import { CampaignsService } from './campaigns.service';
import { Campaign } from './entities/campaign.entity';
import { Shelter } from '../shelters/entities/shelter.entity';
import { Donation } from '../donations/entities/donation.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Campaign,
      Shelter,
      Donation,
      User,
    ]),
    ScheduleModule.forRoot(), // For cron jobs (auto-complete/expire campaigns)
    ConfigModule, // For any future configuration needs
  ],
  controllers: [CampaignsController],
  providers: [CampaignsService],
  exports: [CampaignsService], // Export for use in donations module
})
export class CampaignsModule {}