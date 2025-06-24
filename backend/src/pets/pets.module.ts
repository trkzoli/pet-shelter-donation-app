// src/pets/pets.module.ts
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
import { AdoptionRequest } from '../adoptions/entities/adoption-request.entity';
import { UploadsModule } from '../uploads/uploads.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Pet,
      Shelter,
      User,
      SuccessStory,
      Donation,
      AdoptionRequest
    ]),
    ScheduleModule.forRoot(), // Enable cron jobs for monthly goal resets
    MulterModule.register({
      dest: './uploads', // Temporary storage before Cloudinary upload
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
        files: 10, // Max 10 files at once
      },
    }),
    UploadsModule, // Custom module for handling file uploads
  ],
  controllers: [PetsController],
  providers: [PetsService], // Include UploadsService for file handling
  exports: [PetsService], // Export for use in other modules (donations, adoptions)
})
export class PetsModule {}
