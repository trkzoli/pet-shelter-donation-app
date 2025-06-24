// src/adoptions/adoptions.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AdoptionsController } from './adoptions.controller';
import { AdoptionsService } from './adoptions.service';
import { AdoptionRequest } from './entities/adoption-request.entity';
import { User } from '../users/entities/user.entity';
import { Pet } from '../pets/entities/pet.entity';
import { Shelter } from '../shelters/entities/shelter.entity';
import { Donation } from '../donations/entities/donation.entity';
import { PawPointTransaction } from '../donations/entities/pawpoint-transaction.entity';
import { SuccessStory } from '../success-stories/entities/success-story.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { SuccessStoriesModule } from '../success-stories/success-stories.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AdoptionRequest,
      User,
      Pet,
      Shelter,
      Donation,
      PawPointTransaction,
      SuccessStory,
    ]),
    ConfigModule, // For any future configuration needs
    NotificationsModule,
    SuccessStoriesModule,
  ],
  controllers: [AdoptionsController],
  providers: [AdoptionsService],
  exports: [AdoptionsService], // Export for use in other modules (notifications, success stories)
})
export class AdoptionsModule {}
