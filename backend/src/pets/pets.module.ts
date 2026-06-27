
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { MulterModule } from '@nestjs/platform-express';
import { PetsController } from './pets.controller';
import { PetsService } from './pets.service';
import { Pet } from './entities/pet.entity';
import { Shelter } from '../shelters/entities/shelter.entity';
import { User } from '../users/entities/user.entity';
import { SuccessStory } from '../success-stories/entities/success-story.entity';
import { Donation } from '../donations/entities/donation.entity';
import { PawPointTransaction } from '../donations/entities/pawpoint-transaction.entity';
import { AdoptionRequest } from '../adoptions/entities/adoption-request.entity';
import { UploadsModule } from '../uploads/uploads.module';
import { SuccessStoriesModule } from '../success-stories/success-stories.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Pet,
      Shelter,
      User,
      SuccessStory,
      Donation,
      PawPointTransaction,
      AdoptionRequest
    ]),
    ScheduleModule.forRoot(),
    MulterModule.register({
      dest: './uploads',
      limits: {
        fileSize: 10 * 1024 * 1024,
        files: 10,
      },
    }),
    UploadsModule,
    SuccessStoriesModule,
  ],
  controllers: [PetsController],
  providers: [PetsService],
  exports: [PetsService],
})
export class PetsModule {}
