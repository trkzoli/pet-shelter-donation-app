
import { Injectable, BadRequestException, Logger, InternalServerErrorException } from '@nestjs/common';
import { CloudinaryConfigService } from './config/cloudinary.config';
import { UploadApiResponse, UploadApiErrorResponse, v2 as cloudinary } from 'cloudinary';
import * as fs from 'fs/promises';
import { unlinkSync } from 'fs';
import * as path from 'path';
import * as pLimit from 'p-limit';

export interface CloudinaryResponse {
  publicId: string;
  secureUrl: string;
  width?: number;
  height?: number;
  format: string;
  bytes: number;
}

export interface UploadResult {
  publicId: string;
  secureUrl: string;
  originalUrl: string;
  thumbnailUrl?: string;
  variants?: Record<string, string>;
  format: string;
  size: number;
  width?: number;
  height?: number;
}

export interface MultipleUploadResult {
  success: UploadResult[];
  failed: Array<{ filename: string; error: string }>;
  totalUploaded: number;
  totalFailed: number;
}

export enum UploadType {
  PET_IMAGE = 'pet_image',
  PROFILE_IMAGE = 'profile_image',
  CAMPAIGN_IMAGE = 'campaign_image',
  VERIFICATION_DOCUMENT = 'verification_document',
  VET_RECORDS = 'vet_records',
  ADOPTION_PROOF = 'adoption_proof',
}

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);

  constructor(private readonly cloudinaryConfig: CloudinaryConfigService) {}

  
  private getCloudinaryFolder(type: UploadType): string {
    const folderMap = {
      [UploadType.PET_IMAGE]: 'pets',
      [UploadType.PROFILE_IMAGE]: 'profiles',
      [UploadType.CAMPAIGN_IMAGE]: 'campaigns',
      [UploadType.VERIFICATION_DOCUMENT]: 'verification',
      [UploadType.VET_RECORDS]: 'vet-records',
      [UploadType.ADOPTION_PROOF]: 'adoption-proof',
    };
    return folderMap[type] || 'misc';
  }

  
  private getTransformation(type: UploadType): any {
    const transformationMap = {
      [UploadType.PET_IMAGE]: [
        { width: 800, height: 600, crop: 'limit', quality: 'auto:good' },
        { format: 'auto' },
      ],
      [UploadType.PROFILE_IMAGE]: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face', quality: 'auto:good' },
        { format: 'auto' },
      ],
      [UploadType.CAMPAIGN_IMAGE]: [
        { width: 1200, height: 400, crop: 'fill', quality: 'auto:good' },
        { format: 'auto' },
      ],
      [UploadType.VET_RECORDS]: [
        { width: 1000, height: 750, crop: 'limit', quality: 'auto:good' },
        { format: 'auto' },
      ],
      [UploadType.ADOPTION_PROOF]: [
        { width: 1000, height: 750, crop: 'limit', quality: 'auto:good' },
        { format: 'auto' },
      ],
      [UploadType.VERIFICATION_DOCUMENT]: undefined, 
    };
    return transformationMap[type];
  }

  
  async uploadSingleImage(
    file: Express.Multer.File,
    type: UploadType,
    userId?: string,
    entityId?: string
  ): Promise<UploadResult> {
    try {
      const uploadResult = await cloudinary.uploader.upload(file.path, {
        folder: this.getCloudinaryFolder(type),
        transformation: this.getTransformation(type),
        resource_type: 'image',
        tags: [type, userId, entityId].filter(Boolean),
      });

      unlinkSync(file.path);

      return {
        publicId: uploadResult.public_id,
        secureUrl: uploadResult.secure_url,
        originalUrl: uploadResult.secure_url,
        width: uploadResult.width,
        height: uploadResult.height,
        format: uploadResult.format,
        size: uploadResult.bytes,
      };
    } catch (error) {
      this.logger.error(`Failed to upload ${type}:`, error.message);
      if (error.http_code === 400) {
        throw new BadRequestException(`Upload failed: ${error.message}`);
      }
      throw new InternalServerErrorException('Upload failed');
    }
  }

  async uploadMultipleImages(
    files: Express.Multer.File[],
    type: UploadType,
    userId?: string,
    entityId?: string
  ): Promise<MultipleUploadResult> {
    const limit = pLimit(3);
    const results: UploadResult[] = [];
    const failed: Array<{ filename: string; error: string }> = [];
    
    const uploadPromises = files.map(file =>
      limit(async () => {
        try {
          const uploadResult = await cloudinary.uploader.upload(file.path, {
            folder: this.getCloudinaryFolder(type),
            transformation: this.getTransformation(type),
            resource_type: 'image',
            tags: [type, userId, entityId].filter(Boolean),
          });

          unlinkSync(file.path);

          results.push({
            publicId: uploadResult.public_id,
            secureUrl: uploadResult.secure_url,
            originalUrl: uploadResult.secure_url,
            width: uploadResult.width,
            height: uploadResult.height,
            format: uploadResult.format,
            size: uploadResult.bytes,
          });
        } catch (error) {
          this.logger.error(`Failed to upload ${type}:`, error.message);
          failed.push({
            filename: file.originalname,
            error: error.message
          });
        }
      })
    );

    await Promise.all(uploadPromises);

    return {
      success: results,
      failed,
      totalUploaded: results.length,
      totalFailed: failed.length
    };
  }

  async deleteImage(publicId: string): Promise<boolean> {
    try {
      const cloudinary = this.cloudinaryConfig.getCloudinary();
      
      const result = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader.destroy(publicId, (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        });
      });

      const success = result.result === 'ok';
      
      if (success) {
        this.logger.log(`Successfully deleted image: ${publicId}`);
      } else {
        this.logger.warn(`Failed to delete image: ${publicId} - ${result.result}`);
      }

      return success;
    } catch (error) {
      this.logger.error(`Error deleting image ${publicId}:`, error.message);
      return false;
    }
  }

  async deleteMultipleImages(publicIds: string[]): Promise<{ deleted: string[]; failed: string[] }> {
    const deleted: string[] = [];
    const failed: string[] = [];

    const deletePromises = publicIds.map(async (publicId) => {
      const success = await this.deleteImage(publicId);
      if (success) {
        deleted.push(publicId);
      } else {
        failed.push(publicId);
      }
    });

    await Promise.allSettled(deletePromises);

    return { deleted, failed };
  }

  getOptimizedImageUrl(publicId: string, size: 'thumbnail' | 'small' | 'medium' | 'large' = 'medium'): string {
    const transformations = this.cloudinaryConfig.getImageTransformations();
    return this.cloudinaryConfig.generateSecureUrl(publicId, transformations[size]);
  }

  private validateImageFile(file: Express.Multer.File): void {
    const allowedImageTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
    ];

    if (!allowedImageTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type: ${file.mimetype}. Only JPEG, PNG, WebP, and GIF images are allowed.`
      );
    }

    
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException(
        `File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum allowed size of 10MB`
      );
    }

  }

  private getUploadConfig(uploadType: UploadType, userId?: string, entityId?: string): any {
    const presets = this.cloudinaryConfig.getUploadPresets();
    const timestamp = Date.now();

    switch (uploadType) {
      case UploadType.PET_IMAGE:
        const petPath = entityId ? `pets/${entityId}` : `pets/temp/${userId}`;
        return {
          ...presets.petImages,
          public_id: `${petPath}/${timestamp}`,
          context: {
            type: 'pet_image',
            pet_id: entityId || 'temp',
            uploaded_by: userId,
          },
        };

      case UploadType.PROFILE_IMAGE:
        return {
          ...presets.profileImages,
          public_id: `profiles/${userId}/${timestamp}`,
          context: {
            type: 'profile_image',
            user_id: userId,
          },
        };

      case UploadType.CAMPAIGN_IMAGE:
        const campaignPath = entityId ? `campaigns/${entityId}` : `campaigns/temp/${userId}`;
        return {
          ...presets.campaignImages,
          public_id: `${campaignPath}/${timestamp}`,
          context: {
            type: 'campaign_image',
            campaign_id: entityId || 'temp',
            uploaded_by: userId,
          },
        };

      case UploadType.VERIFICATION_DOCUMENT:
        return {
          ...presets.verification,
          public_id: `verification/${userId}/${timestamp}`,
          context: {
            type: 'verification_document',
            user_id: userId,
          },
        };

      case UploadType.VET_RECORDS:
        return {
          ...presets.documents,
          public_id: `vet-records/${entityId}/${timestamp}`,
          context: {
            type: 'vet_records',
            pet_id: entityId,
            uploaded_by: userId,
          },
        };

      case UploadType.ADOPTION_PROOF:
        return {
          ...presets.adoptionProof,
          public_id: `adoption-proof/${entityId}/${timestamp}`,
          context: {
            type: 'adoption_proof',
            request_id: entityId,
            uploaded_by: userId,
          },
        };

      default:
        throw new BadRequestException(`Unknown upload type: ${uploadType}`);
    }
  }

  private async cleanupTempFile(filePath: string): Promise<void> {
    try {
      await fs.access(filePath);
      await fs.unlink(filePath);
    } catch (error) {
      this.logger.debug(`Temp file cleanup: ${filePath} - ${error.message}`);
    }
  }

  async healthCheck(): Promise<{ status: string; cloudinary: boolean; timestamp: Date }> {
    try {
      const cloudinaryOk = await this.cloudinaryConfig.validateConfiguration();
      
      return {
        status: cloudinaryOk ? 'healthy' : 'degraded',
        cloudinary: cloudinaryOk,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error('Upload service health check failed:', error.message);
      return {
        status: 'unhealthy',
        cloudinary: false,
        timestamp: new Date(),
      };
    }
  }

  async uploadBase64Image(
    base64Data: string,
    uploadType: UploadType,
    filename: string,
    mimeType: string,
    userId?: string,
    entityId?: string,
  ): Promise<UploadResult> {
    try {
      if (!base64Data) {
        throw new BadRequestException('Base64 data is required but was not provided');
      }

      const allowedImageTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'image/gif',
      ];

      if (!allowedImageTypes.includes(mimeType)) {
        throw new BadRequestException(
          `Invalid file type: ${mimeType}. Only JPEG, PNG, WebP, and GIF images are allowed.`
        );
      }

      const buffer = Buffer.from(base64Data, 'base64');
      const maxSize = 10 * 1024 * 1024;
      if (buffer.length > maxSize) {
        throw new BadRequestException(
          `File size too large: ${(buffer.length / 1024 / 1024).toFixed(2)}MB. Maximum allowed: 10MB`
        );
      }

      const uploadConfig = this.getUploadConfig(uploadType, userId, entityId);

      const dataUri = `data:${mimeType};base64,${base64Data}`;

      const cloudinary = this.cloudinaryConfig.getCloudinary();
      const result: UploadApiResponse = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload(
          dataUri,
          uploadConfig,
          (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
            if (error) {
              reject(error);
            } else if (result) {
              resolve(result);
            } else {
              reject(new Error('Upload failed - no result returned'));
            }
          },
        );
      });

      
      const variants = uploadType !== UploadType.VERIFICATION_DOCUMENT && uploadType !== UploadType.VET_RECORDS
        ? this.cloudinaryConfig.generateImageVariants(result.public_id)
        : undefined;

      const uploadResult: UploadResult = {
        publicId: result.public_id,
        secureUrl: result.secure_url,
        originalUrl: result.url,
        thumbnailUrl: variants?.thumbnail,
        variants,
        format: result.format,
        size: result.bytes,
        width: result.width,
        height: result.height,
      };

      this.logger.log(`Successfully uploaded ${uploadType} via base64: ${result.public_id}`);
      return uploadResult;
    } catch (error) {
      this.logger.error(`Failed to upload ${uploadType} via base64:`, error.message);
      if (error.http_code === 400) {
        throw new BadRequestException(`Upload failed: ${error.message}`);
      }
      throw new InternalServerErrorException('Upload service temporarily unavailable');
    }
  }
}
