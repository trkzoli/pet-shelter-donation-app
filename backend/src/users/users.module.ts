// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { PawPointTransaction } from '../donations/entities/pawpoint-transaction.entity';
import { Donation } from '../donations/entities/donation.entity';
import { AdoptionRequest } from '../adoptions/entities/adoption-request.entity';
import { UploadsModule } from '../uploads/uploads.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      PawPointTransaction,
      Donation,
      AdoptionRequest,
    ]),
    UploadsModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
