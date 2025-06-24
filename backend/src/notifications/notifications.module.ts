// src/notifications/notifications.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { NotificationsService } from './notifications.service';
import { MailConfigService } from './config/mail.config';

// Entity imports for notification data
import { User } from '../users/entities/user.entity';
import { Pet } from '../pets/entities/pet.entity';
import { Shelter } from '../shelters/entities/shelter.entity';
import { AdoptionRequest } from '../adoptions/entities/adoption-request.entity';
import { Donation } from '../donations/entities/donation.entity';
import { SuccessStory } from '../success-stories/entities/success-story.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Pet,
      Shelter,
      AdoptionRequest,
      Donation,
      SuccessStory,
    ]),
    ConfigModule, // For mail configuration
  ],
  providers: [
    NotificationsService,
    MailConfigService,
  ],
  exports: [
    NotificationsService, // Export for use in other modules (auth, adoptions, etc.)
    MailConfigService,    // Export for direct mail configuration access
  ],
})
export class NotificationsModule {}