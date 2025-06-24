
import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
  ParseUUIDPipe,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Query,
  Body,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { UploadsService, UploadType, UploadResult, MultipleUploadResult } from './uploads.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/user.decorator';

@ApiTags('File Uploads')
@ApiBearerAuth()
@Controller('uploads')
@UseGuards(JwtAuthGuard)
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  
  @Post('image')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ 
    summary: 'Upload single image',
    description: 'Upload a single image with automatic optimization and transformation based on upload type'
  })
  @ApiResponse({
    status: 200,
    description: 'Image uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        publicId: { type: 'string', example: 'pets/uuid/1234567890' },
        secureUrl: { type: 'string', example: 'https://res.cloudinary.com/...' },
        thumbnailUrl: { type: 'string', example: 'https://res.cloudinary.com/...' },
        variants: {
          type: 'object',
          additionalProperties: { type: 'string' },
          example: {
            thumbnail: 'https://res.cloudinary.com/...',
            small: 'https://res.cloudinary.com/...',
            medium: 'https://res.cloudinary.com/...',
            large: 'https://res.cloudinary.com/...'
          }
        },
        format: { type: 'string', example: 'jpg' },
        size: { type: 'number', example: 1048576 },
        width: { type: 'number', example: 800 },
        height: { type: 'number', example: 600 }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid file or missing parameters' })
  async uploadSingleImage(
    @UploadedFile() file: Express.Multer.File,
    @Query('type') type: string,
    @Query('entityId') entityId?: string,
    @GetUser('id') userId?: string,
  ): Promise<UploadResult> {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    if (!type || !Object.values(UploadType).includes(type as UploadType)) {
      throw new BadRequestException(
        `Invalid upload type. Must be one of: ${Object.values(UploadType).join(', ')}`
      );
    }

    const uploadType = type as UploadType;

    
    if ([UploadType.VET_RECORDS, UploadType.ADOPTION_PROOF].includes(uploadType)) {
      if (!entityId) {
        throw new BadRequestException(`Entity ID is required for upload type: ${uploadType}`);
      }
    }
    
    

    return this.uploadsService.uploadSingleImage(file, uploadType, userId, entityId);
  }

  
  @Post('images')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FilesInterceptor('images', 10)) // Max 10 files
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ 
    summary: 'Upload multiple images',
    description: 'Upload multiple images at once with batch processing and error handling'
  })
  @ApiResponse({
    status: 200,
    description: 'Images uploaded successfully (some may have failed)',
    schema: {
      type: 'object',
      properties: {
        success: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              publicId: { type: 'string' },
              secureUrl: { type: 'string' },
              variants: { type: 'object' },
              format: { type: 'string' },
              size: { type: 'number' }
            }
          }
        },
        failed: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              filename: { type: 'string' },
              error: { type: 'string' }
            }
          }
        },
        totalUploaded: { type: 'number', example: 8 },
        totalFailed: { type: 'number', example: 2 }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid files or missing parameters' })
  async uploadMultipleImages(
    @UploadedFiles() files: Express.Multer.File[],
    @Query('type') type: string,
    @Query('entityId') entityId?: string,
    @GetUser('id') userId?: string,
  ): Promise<MultipleUploadResult> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No image files provided');
    }

    if (!type || !Object.values(UploadType).includes(type as UploadType)) {
      throw new BadRequestException(
        `Invalid upload type. Must be one of: ${Object.values(UploadType).join(', ')}`
      );
    }

    const uploadType = type as UploadType;

    
    if ([UploadType.VET_RECORDS, UploadType.ADOPTION_PROOF].includes(uploadType)) {
      if (!entityId) {
        throw new BadRequestException(`Entity ID is required for upload type: ${uploadType}`);
      }
    }

    return this.uploadsService.uploadMultipleImages(files, uploadType, userId, entityId);
  }

  
  @Post('base64-image')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Upload base64 image',
    description: 'Upload an image from base64 data with automatic optimization'
  })
  @ApiResponse({
    status: 200,
    description: 'Base64 image uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        publicId: { type: 'string', example: 'pets/uuid/1234567890' },
        secureUrl: { type: 'string', example: 'https://res.cloudinary.com/...' },
        thumbnailUrl: { type: 'string', example: 'https://res.cloudinary.com/...' },
        variants: {
          type: 'object',
          additionalProperties: { type: 'string' },
        },
        format: { type: 'string', example: 'jpg' },
        size: { type: 'number', example: 1048576 },
        width: { type: 'number', example: 800 },
        height: { type: 'number', example: 600 }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid base64 data or missing parameters' })
  async uploadBase64Image(
    @Body() body: { image: string; mimeType: string; filename: string },
    @Query('type') type: string,
    @Query('entityId') entityId?: string,
    @GetUser('id') userId?: string,
  ): Promise<UploadResult> {
    if (!body.image) {
      throw new BadRequestException('No image data provided');
    }

    if (!type || !Object.values(UploadType).includes(type as UploadType)) {
      throw new BadRequestException(
        `Invalid upload type. Must be one of: ${Object.values(UploadType).join(', ')}`
      );
    }

    const uploadType = type as UploadType;

    
    if ([UploadType.VET_RECORDS, UploadType.ADOPTION_PROOF].includes(uploadType)) {
      if (!entityId) {
        throw new BadRequestException(`Entity ID is required for upload type: ${uploadType}`);
      }
    }
    


    return this.uploadsService.uploadBase64Image(
      body.image, 
      uploadType, 
      body.filename,
      body.mimeType,
      userId || '',
      entityId
    );
  }

  
  @Post('pet/:petId/main-image')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ 
    summary: 'Upload pet main image',
    description: 'Upload main image for a specific pet with pet-optimized transformations'
  })
  @ApiResponse({ status: 200, description: 'Pet main image uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid image file' })
  async uploadPetMainImage(
    @Param('petId', ParseUUIDPipe) petId: string,
    @UploadedFile() file: Express.Multer.File,
    @GetUser('id') userId: string,
  ): Promise<UploadResult> {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    return this.uploadsService.uploadSingleImage(file, UploadType.PET_IMAGE, userId, petId);
  }

  
  @Post('pet/:petId/additional-images')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FilesInterceptor('images', 10))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ 
    summary: 'Upload pet additional images',
    description: 'Upload up to 10 additional images for a pet'
  })
  @ApiResponse({ status: 200, description: 'Pet additional images uploaded' })
  @ApiResponse({ status: 400, description: 'Invalid image files' })
  async uploadPetAdditionalImages(
    @Param('petId', ParseUUIDPipe) petId: string,
    @UploadedFiles() files: Express.Multer.File[],
    @GetUser('id') userId: string,
  ): Promise<MultipleUploadResult> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No image files provided');
    }

    return this.uploadsService.uploadMultipleImages(files, UploadType.PET_IMAGE, userId, petId);
  }

  
  @Post('profile-image')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ 
    summary: 'Upload user profile image',
    description: 'Upload profile image with automatic circular crop and optimization'
  })
  @ApiResponse({ status: 200, description: 'Profile image uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid image file' })
  async uploadProfileImage(
    @UploadedFile() file: Express.Multer.File,
    @GetUser('id') userId: string,
  ): Promise<UploadResult> {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    return this.uploadsService.uploadSingleImage(file, UploadType.PROFILE_IMAGE, userId);
  }

  
  @Post('campaign/:campaignId/banner')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ 
    summary: 'Upload campaign banner image',
    description: 'Upload banner image for a campaign with banner-optimized transformations'
  })
  @ApiResponse({ status: 200, description: 'Campaign banner uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid image file' })
  async uploadCampaignBanner(
    @Param('campaignId', ParseUUIDPipe) campaignId: string,
    @UploadedFile() file: Express.Multer.File,
    @GetUser('id') userId: string,
  ): Promise<UploadResult> {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    return this.uploadsService.uploadSingleImage(file, UploadType.CAMPAIGN_IMAGE, userId, campaignId);
  }

  
  @Post('verification-document')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('document'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ 
    summary: 'Upload verification document',
    description: 'Upload verification document for shelter verification process'
  })
  @ApiResponse({ status: 200, description: 'Verification document uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid document file' })
  async uploadVerificationDocument(
    @UploadedFile() file: Express.Multer.File,
    @GetUser('id') userId: string,
  ): Promise<UploadResult> {
    if (!file) {
      throw new BadRequestException('No document file provided');
    }

    
    const allowedTypes = [
      'image/jpeg',
      'image/png', 
      'image/jpg',
      'application/pdf'
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only JPEG, PNG, and PDF files are allowed for verification documents');
    }

    return this.uploadsService.uploadSingleImage(file, UploadType.VERIFICATION_DOCUMENT, userId);
  }

  
  @Post('pet/:petId/vet-records')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('document'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ 
    summary: 'Upload veterinary records',
    description: 'Upload veterinary records and medical documents for a pet'
  })
  @ApiResponse({ status: 200, description: 'Veterinary records uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid document file' })
  async uploadVetRecords(
    @Param('petId', ParseUUIDPipe) petId: string,
    @UploadedFile() file: Express.Multer.File,
    @GetUser('id') userId: string,
  ): Promise<UploadResult> {
    if (!file) {
      throw new BadRequestException('No document file provided');
    }

    
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only images, PDF, and Word documents are allowed for veterinary records');
    }

    return this.uploadsService.uploadSingleImage(file, UploadType.VET_RECORDS, userId, petId);
  }

  
  @Post('adoption/:requestId/proof')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ 
    summary: 'Upload adoption proof image',
    description: 'Upload proof of adoption image for completed adoption requests'
  })
  @ApiResponse({ status: 200, description: 'Adoption proof uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid image file' })
  async uploadAdoptionProof(
    @Param('requestId', ParseUUIDPipe) requestId: string,
    @UploadedFile() file: Express.Multer.File,
    @GetUser('id') userId: string,
  ): Promise<UploadResult> {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    return this.uploadsService.uploadSingleImage(file, UploadType.ADOPTION_PROOF, userId, requestId);
  }

  
  @Delete('image/:publicId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Delete single image',
    description: 'Delete an image from Cloudinary using its public ID'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Image deletion result',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        publicId: { type: 'string', example: 'pets/uuid/1234567890' },
        message: { type: 'string', example: 'Image deleted successfully' }
      }
    }
  })
  async deleteImage(
    @Param('publicId') publicId: string,
  ): Promise<{ success: boolean; publicId: string; message: string }> {
    
    const decodedPublicId = decodeURIComponent(publicId);
    
    const success = await this.uploadsService.deleteImage(decodedPublicId);
    
    return {
      success,
      publicId: decodedPublicId,
      message: success ? 'Image deleted successfully' : 'Failed to delete image'
    };
  }

  
  @Delete('images')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Delete multiple images',
    description: 'Delete multiple images from Cloudinary in batch'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Batch deletion result',
    schema: {
      type: 'object',
      properties: {
        deleted: { 
          type: 'array', 
          items: { type: 'string' },
          example: ['pets/uuid1/123', 'pets/uuid2/456']
        },
        failed: { 
          type: 'array', 
          items: { type: 'string' },
          example: ['pets/uuid3/789']
        },
        totalDeleted: { type: 'number', example: 2 },
        totalFailed: { type: 'number', example: 1 }
      }
    }
  })
  async deleteMultipleImages(
    @Request() req,
  ): Promise<{ deleted: string[]; failed: string[]; totalDeleted: number; totalFailed: number }> {
    const publicIds = req.body?.publicIds;
    
    if (!publicIds || !Array.isArray(publicIds) || publicIds.length === 0) {
      throw new BadRequestException('Array of public IDs is required');
    }

    const result = await this.uploadsService.deleteMultipleImages(publicIds);
    
    return {
      ...result,
      totalDeleted: result.deleted.length,
      totalFailed: result.failed.length,
    };
  }

  
  @Get('optimize/:publicId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get optimized image URL',
    description: 'Get optimized image URL with specific size transformations'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Optimized image URLs',
    schema: {
      type: 'object',
      properties: {
        publicId: { type: 'string', example: 'pets/uuid/1234567890' },
        urls: {
          type: 'object',
          properties: {
            thumbnail: { type: 'string' },
            small: { type: 'string' },
            medium: { type: 'string' },
            large: { type: 'string' }
          }
        }
      }
    }
  })
  async getOptimizedImageUrl(
    @Param('publicId') publicId: string,
    @Query('size') size?: 'thumbnail' | 'small' | 'medium' | 'large',
  ): Promise<{ publicId: string; urls: Record<string, string> }> {
    const decodedPublicId = decodeURIComponent(publicId);
    
    if (size) {
      const url = this.uploadsService.getOptimizedImageUrl(decodedPublicId, size);
      return {
        publicId: decodedPublicId,
        urls: { [size]: url }
      };
    }

    
    const sizes: Array<'thumbnail' | 'small' | 'medium' | 'large'> = ['thumbnail', 'small', 'medium', 'large'];
    const urls: Record<string, string> = {};
    
    for (const sizeOption of sizes) {
      urls[sizeOption] = this.uploadsService.getOptimizedImageUrl(decodedPublicId, sizeOption);
    }

    return {
      publicId: decodedPublicId,
      urls
    };
  }

  
  @Get('health')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Health check for uploads service' })
  async healthCheck(): Promise<{ status: string; cloudinary: boolean; timestamp: Date }> {
    return this.uploadsService.healthCheck();
  }
}