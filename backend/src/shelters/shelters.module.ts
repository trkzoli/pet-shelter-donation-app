// src/shelters/shelters.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SheltersController } from './shelters.controller';
import { SheltersService } from './shelters.service';
import { Shelter } from './entities/shelter.entity';
import { User } from '../users/entities/user.entity';
import { Pet } from '../pets/entities/pet.entity';
import { Campaign } from '../campaigns/entities/campaign.entity';
import { Donation } from '../donations/entities/donation.entity';
import { AdoptionRequest } from '../adoptions/entities/adoption-request.entity';
import { UploadsModule } from '../uploads/uploads.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Shelter,
      User,
      Pet,
      Campaign,
      Donation,
      AdoptionRequest,
    ]),
    UploadsModule,
  ],
  controllers: [SheltersController],
  providers: [SheltersService],
  exports: [SheltersService],
})
export class SheltersModule {}
