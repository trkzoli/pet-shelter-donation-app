// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

// Import all modules
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

// Import all entities for TypeORM configuration
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
    // ==================== CONFIGURATION ====================
    
    /**
     * Global configuration module
     * Loads environment variables and makes them available throughout the app
     */
    ConfigModule.forRoot({
      isGlobal: true, // Make config available in all modules
      envFilePath: [
        '.env.local',   // Override for local development
        '.env',         // Default environment file
      ],
      cache: true, // Cache environment variables for better performance
      expandVariables: true, // Allow variable expansion (${VAR} syntax)
      validationOptions: {
        allowUnknown: true, // Allow unknown environment variables
        abortEarly: true,   // Stop on first validation error
      },
    }),

    // ==================== DATABASE ====================
    
    /**
     * TypeORM configuration
     * Configures PostgreSQL database connection with all entities
     */
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
          
          // Entity configuration
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
          
          // Development settings
          synchronize: !isProduction, // Auto-create/update tables (only in dev)
          logging: configService.get<boolean>('DB_LOGGING', !isProduction),
          
          // Connection pool settings
          extra: {
            connectionLimit: configService.get<number>('DB_CONNECTION_LIMIT', 10),
            acquireTimeout: configService.get<number>('DB_ACQUIRE_TIMEOUT', 60000),
            timeout: configService.get<number>('DB_TIMEOUT', 60000),
          },
          
          // SSL configuration for production
          ssl: isProduction
            ? {
                rejectUnauthorized: false, // For managed databases like Heroku Postgres
              }
            : false,
          
          // Migration settings (for production)
          migrations: ['dist/migrations/*.js'],
          migrationsRun: isProduction, // Auto-run migrations in production
          
          // Additional TypeORM options
          retryAttempts: configService.get<number>('DB_RETRY_ATTEMPTS', 3),
          retryDelay: configService.get<number>('DB_RETRY_DELAY', 3000),
          autoLoadEntities: true, // Automatically load entities
          keepConnectionAlive: true, // Keep connection alive between hot reloads
        };
      },
      inject: [ConfigService],
    }),

    // ==================== BACKGROUND JOBS ====================
    
    /**
     * Schedule module for cron jobs
     * Used for monthly goal resets, campaign expiration, etc.
     * Only configure once at the root level
     */
    ScheduleModule.forRoot(),

    // ==================== RATE LIMITING ====================
    
    /**
     * Throttler for rate limiting
     * Protects against abuse and DDoS attacks
     */
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        ttl: configService.get<number>('THROTTLE_TTL', 60),
        limit: configService.get<number>('THROTTLE_LIMIT', 100),
      }),
      inject: [ConfigService],
    }),

    // ==================== FEATURE MODULES ====================
    
    /**
     * Authentication & Authorization
     * Handles user registration, login, JWT tokens, password reset
     */
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

  // ==================== GLOBAL PROVIDERS ====================
  
  providers: [
    /**
     * Global validation pipe
     * Validates all incoming requests using class-validator
     */
    {
      provide: APP_PIPE,
      useFactory: () => new ValidationPipe({
        // Transform incoming data to match DTO types
        transform: true,
        transformOptions: {
          enableImplicitConversion: true, // Convert string numbers to actual numbers
        },
        
        // Validation options
        whitelist: true, // Strip properties not in DTO
        forbidNonWhitelisted: true, // Throw error for extra properties
        disableErrorMessages: false, // Show detailed validation errors
        
        // Validation behavior
        validationError: {
          target: false, // Don't expose the target object in errors
          value: false,  // Don't expose the invalid value in errors
        },
        
        // Stop on first error for better performance
        stopAtFirstError: false,
        
        // Skip missing properties (useful for PATCH requests)
        skipMissingProperties: false,
        
        // Skip undefined properties
        skipUndefinedProperties: false,
        
        // Skip null properties
        skipNullProperties: false,
      }),
    },

    /**
     * Global throttling guard
     * Applies rate limiting to all endpoints
     */
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    AppService,
  ],

  // No controllers at app level - all handled by feature modules
  controllers: [AppController],
})
export class AppModule {
  constructor(private configService: ConfigService) {
    // Log important configuration on startup
    this.logConfiguration();
  }

  /**
   * Log important configuration details on startup
   */
  private logConfiguration(): void {
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');
    const port = this.configService.get<number>('PORT', 3000);
    const dbHost = this.configService.get<string>('DB_HOST', 'localhost');
    const dbName = this.configService.get<string>('DB_NAME', 'project_eden');
    
    console.log('\nPROJECT EDEN BACKEND CONFIGURATION');
    console.log('=====================================');
    console.log(`Environment: ${nodeEnv}`);
    console.log(`Port: ${port}`);
    console.log(`Database: ${dbHost}/${dbName}`);
    
    // Log feature flags
    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    const stripeKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    const cloudinaryName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const mailUser = this.configService.get<string>('MAIL_USER');
    
    console.log('\nSERVICE CONFIGURATION:');
    console.log(`JWT: ${jwtSecret ? ' Configured' : ' Missing JWT_SECRET'}`);
    console.log(`Stripe: ${stripeKey ? ' Configured' : ' Missing STRIPE_SECRET_KEY'}`);
    console.log(`Cloudinary: ${cloudinaryName ? ' Configured' : ' Missing CLOUDINARY_CLOUD_NAME'}`);
    console.log(`Email: ${mailUser ? ' Configured' : ' Missing MAIL_USER'}`);
    
    // Warning for missing critical configs
    if (!jwtSecret || !stripeKey || !cloudinaryName || !mailUser) {
      console.log('\n  WARNING: Some services are not configured and may not work properly.');
      console.log('   Please check your .env file and ensure all required variables are set.\n');
    } else {
      console.log('\nAll core services configured successfully!\n');
    }
  }
}