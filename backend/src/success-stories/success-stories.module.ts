
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { SuccessStoriesController } from './success-stories.controller';
import { SuccessStoriesService } from './success-stories.service';

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
    ConfigModule,
  ],
  controllers: [SuccessStoriesController],
  providers: [SuccessStoriesService],
  exports: [
    SuccessStoriesService,
  ],
})
export class SuccessStoriesModule {}