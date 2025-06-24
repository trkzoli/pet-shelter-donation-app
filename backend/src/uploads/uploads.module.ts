import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';
import { CloudinaryConfigService } from './config/cloudinary.config';

@Module({
  imports: [
    ConfigModule,
    MulterModule.register({
      dest: './temp-uploads',
      limits: {
        fileSize: 10 * 1024 * 1024,
        files: 10,
      },
      fileFilter: (req, file, cb) => {
        const allowedImageTypes = [
          'image/jpeg',
          'image/jpg', 
          'image/png',
          'image/webp',
          'image/gif'
        ];
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
  exports: [UploadsService],
})
export class UploadsModule {}
