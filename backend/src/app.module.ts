import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SheltersModule } from './shelters/shelters.module';
import { PetsModule } from './pets/pets.module';
import { DonationsModule } from './donations/donations.module';
import { AdoptionsModule } from './adoptions/adoptions.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { PaymentsModule } from './payments/payments.module';
import { UploadsModule } from './uploads/uploads.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SuccessStoriesModule } from './success-stories/success-stories.module';

import { User } from './users/entities/user.entity';
import { Shelter } from './shelters/entities/shelter.entity';
import { Pet } from './pets/entities/pet.entity';
import { Donation } from './donations/entities/donation.entity';
import { PawPointTransaction } from './donations/entities/pawpoint-transaction.entity';
import { AdoptionRequest } from './adoptions/entities/adoption-request.entity';
import { Campaign } from './campaigns/entities/campaign.entity';
import { SuccessStory } from './success-stories/entities/success-story.entity';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    
    ConfigModule.forRoot({
      isGlobal: true, 
      envFilePath: [
        '.env.local',   
        '.env',         
      ],
      cache: true, 
      expandVariables: true, 
      validationOptions: {
        allowUnknown: true, 
        abortEarly: true,  
      },
    }),

   
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const isProduction = configService.get<string>('NODE_ENV') === 'production';
        
        return {
          type: 'postgres',
          host: configService.get<string>('DB_HOST', 'localhost'),
          port: configService.get<number>('DB_PORT', 5432),
          username: configService.get<string>('DB_USERNAME', 'postgres'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_NAME', 'project_eden'),
          
          
          entities: [
            User,
            Shelter,
            Pet,
            Donation,
            PawPointTransaction,
            AdoptionRequest,
            Campaign,
            SuccessStory,
          ],
          
          
          synchronize: !isProduction, 
          logging: configService.get<boolean>('DB_LOGGING', !isProduction),
          
          
          extra: {
            connectionLimit: configService.get<number>('DB_CONNECTION_LIMIT', 10),
            acquireTimeout: configService.get<number>('DB_ACQUIRE_TIMEOUT', 60000),
            timeout: configService.get<number>('DB_TIMEOUT', 60000),
          },
          
         
          ssl: isProduction
            ? {
                rejectUnauthorized: false, 
              }
            : false,
          
         
          migrations: ['dist/migrations/*.js'],
          migrationsRun: isProduction, 
          
          
          retryAttempts: configService.get<number>('DB_RETRY_ATTEMPTS', 3),
          retryDelay: configService.get<number>('DB_RETRY_DELAY', 3000),
          autoLoadEntities: true, 
          keepConnectionAlive: true, 
        };
      },
      inject: [ConfigService],
    }),

    
    
    
    ScheduleModule.forRoot(),

    
    
    
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        ttl: configService.get<number>('THROTTLE_TTL', 60),
        limit: configService.get<number>('THROTTLE_LIMIT', 100),
      }),
      inject: [ConfigService],
    }),

    
    
    AuthModule,

    /**
     * User Profile Management
     * Handles donor profiles, PawPoints, adoption eligibility
     */
    UsersModule,

    /**
     * Shelter Management
     * Handles shelter profiles, verification, statistics
     */
    SheltersModule,

    /**
     * Pet Management System
     * Handles pet CRUD, monthly goals, 24-hour edit window
     */
    PetsModule,

    /**
     * Donation & PawPoints System
     * Handles donations, PawPoint calculations, distribution
     */
    DonationsModule,

    /**
     * Adoption Request System
     * Handles adoption eligibility, requests, email notifications
     */
    AdoptionsModule,

    /**
     * Banner Campaign System
     * Handles fundraising campaigns with priority and fees
     */
    CampaignsModule,

    /**
     * Payment Processing
     * Handles Stripe integration for donations
     */
    PaymentsModule,

    /**
     * File Upload Management
     * Handles Cloudinary integration for images and documents
     */
    UploadsModule,

    /**
     * Email Notification System
     * Handles NodeMailer for verification, adoption requests, etc.
     */
    NotificationsModule,

    /**
     * Success Stories Module
     * Handles pet adoption outcomes and donor notifications
     */
    SuccessStoriesModule,
  ],

 
  
  providers: [
    
    {
      provide: APP_PIPE,
      useFactory: () => new ValidationPipe({
        
        transform: true,
        transformOptions: {
          enableImplicitConversion: true, 
        },
        
       
        whitelist: true, 
        forbidNonWhitelisted: true, 
        disableErrorMessages: false, 
        
        
        validationError: {
          target: false, 
          value: false,  
        },
        
        
        stopAtFirstError: false,
        
        
        skipMissingProperties: false,
        
        
        skipUndefinedProperties: false,
        
        
        skipNullProperties: false,
      }),
    },

    
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    AppService,
  ],

  
  controllers: [AppController],
})
export class AppModule {
  constructor(private configService: ConfigService) {
    
    this.logConfiguration();
  }

  
  private logConfiguration(): void {
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');
    const port = this.configService.get<number>('PORT', 3000);
    const dbHost = this.configService.get<string>('DB_HOST', 'localhost');
    const dbName = this.configService.get<string>('DB_NAME', 'project_eden');
    
    console.log('\nPROJECT EDEN BACKEND CONFIGURATION');
    console.log(`Environment: ${nodeEnv}`);
    console.log(`Port: ${port}`);
    console.log(`Database: ${dbHost}/${dbName}`);
    
    
    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    const stripeKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    const cloudinaryName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const mailUser = this.configService.get<string>('MAIL_USER');
    
    console.log('\nSERVICE CONFIGURATION:');
    console.log(`JWT: ${jwtSecret ? ' Configured' : ' Missing JWT_SECRET'}`);
    console.log(`Stripe: ${stripeKey ? ' Configured' : ' Missing STRIPE_SECRET_KEY'}`);
    console.log(`Cloudinary: ${cloudinaryName ? ' Configured' : ' Missing CLOUDINARY_CLOUD_NAME'}`);
    console.log(`Email: ${mailUser ? ' Configured' : ' Missing MAIL_USER'}`);
    
    
    if (!jwtSecret || !stripeKey || !cloudinaryName || !mailUser) {
      console.log('\n  WARNING: Some services are not configured and may not work properly.');
      console.log('   Please check your .env file and ensure all required variables are set.\n');
    } else {
      console.log('\nAll core services configured successfully!\n');
    }
  }
}