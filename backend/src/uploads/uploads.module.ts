// src/uploads/uploads.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';
import { CloudinaryConfigService } from './config/cloudinary.config';

@Module({
  imports: [
    ConfigModule, // For Cloudinary configuration
    MulterModule.register({
      dest: './temp-uploads', // Temporary storage before Cloudinary upload
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit per file
        files: 10, // Max 10 files at once for multiple uploads
      },
      fileFilter: (req, file, cb) => {
        // Allow only image files for most uploads
        const allowedImageTypes = [
          'image/jpeg',
          'image/jpg', 
          'image/png',
          'image/webp',
          'image/gif'
        ];
        // Allow document types for vet records and verification docs
        const allowedDocTypes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];

        const allAllowedTypes = [...allowedImageTypes, ...allowedDocTypes];  
        if (allAllowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Invalid file type. Only images (JPEG, PNG, WebP, GIF) and documents (PDF, DOC, DOCX) are allowed.'), false);
        }
      },
    }),
  ],
  controllers: [UploadsController],
  providers: [UploadsService, CloudinaryConfigService],
  exports: [UploadsService], // Export for use in other modules (pets, users, shelters)
})
export class UploadsModule {}
