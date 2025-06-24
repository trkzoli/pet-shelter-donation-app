// src/success-stories/success-stories.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { SuccessStoriesController } from './success-stories.controller';
import { SuccessStoriesService } from './success-stories.service';

// Entity imports
import { SuccessStory } from './entities/success-story.entity';
import { Pet } from '../pets/entities/pet.entity';
import { User } from '../users/entities/user.entity';
import { Shelter } from '../shelters/entities/shelter.entity';
import { Donation } from '../donations/entities/donation.entity';
import { PawPointTransaction } from '../donations/entities/pawpoint-transaction.entity';
import { AdoptionRequest } from '../adoptions/entities/adoption-request.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SuccessStory,
      Pet,
      User,
      Shelter,
      Donation,
      PawPointTransaction,
      AdoptionRequest,
    ]),
    ConfigModule, // For any future configuration needs
  ],
  controllers: [SuccessStoriesController],
  providers: [SuccessStoriesService],
  exports: [
    SuccessStoriesService, // Export for use in other modules (pets, adoptions, notifications)
  ],
})
export class SuccessStoriesModule {}