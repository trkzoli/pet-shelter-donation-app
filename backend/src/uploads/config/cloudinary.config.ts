// src/uploads/config/cloudinary.config.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

export interface CloudinaryConfig {
  cloud_name: string;
  api_key: string;
  api_secret: string;
  secure: boolean;
}

@Injectable()
export class CloudinaryConfigService {
  private readonly logger = new Logger(CloudinaryConfigService.name);

  constructor(private readonly configService: ConfigService) {
    this.initializeCloudinary();
  }

  /**
   * Initialize Cloudinary with configuration
   */
  private initializeCloudinary(): void {
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error(
        'Cloudinary configuration missing. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.'
      );
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true, // Use HTTPS URLs
    });

    this.logger.log(`Cloudinary initialized with cloud: ${cloudName}`);
  }

  /**
   * Get Cloudinary instance
   */
  getCloudinary() {
    return cloudinary;
  }

  /**
   * Get upload presets for different content types
   */
  getUploadPresets() {
    return {
      // Pet images - optimized for viewing
      petImages: {
        folder: 'pets',
        transformation: [
          { width: 800, height: 600, crop: 'limit', quality: 'auto:good' },
          { format: 'auto' }, // Auto-select best format (WebP/AVIF when supported)
        ],
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      },
      // Profile images - circular crop optimized
      profileImages: {
        folder: 'profiles',
        transformation: [
          { width: 400, height: 400, crop: 'fill', gravity: 'face', quality: 'auto:good' },
          { radius: 'max' }, // Circular crop
          { format: 'auto' },
        ],
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      },
      // Campaign images - banner optimized
      campaignImages: {
        folder: 'campaigns',
        transformation: [
          { width: 1200, height: 400, crop: 'fill', quality: 'auto:good' },
          { format: 'auto' },
        ],
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      },
      // Documents - no transformation, preserve original
      documents: {
        folder: 'documents',
        resource_type: 'raw', // For PDFs and other documents
        allowed_formats: ['pdf', 'doc', 'docx'],
      },
      // Verification documents - secure folder
      verification: {
        folder: 'verification',
        resource_type: 'auto', // Auto-detect images vs documents
        access_mode: 'authenticated', // Secure access
        allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
      },
      // Adoption proof images
      adoptionProof: {
        folder: 'adoption-proof',
        transformation: [
          { width: 1000, height: 750, crop: 'limit', quality: 'auto:good' },
          { format: 'auto' },
        ],
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      },
    };
  }

  /**
   * Get transformation settings for different image sizes
   */
  getImageTransformations() {
    return {
      thumbnail: { width: 150, height: 150, crop: 'fill', quality: 'auto:low' },
      small: { width: 300, height: 225, crop: 'fill', quality: 'auto:good' },
      medium: { width: 600, height: 450, crop: 'fill', quality: 'auto:good' },
      large: { width: 1200, height: 900, crop: 'limit', quality: 'auto:good' },
      original: { quality: 'auto:best' },
    };
  }

  /**
   * Generate secure URLs with transformations
   */
  generateSecureUrl(publicId: string, transformation?: any): string {
    return cloudinary.url(publicId, {
      secure: true,
      transformation,
    });
  }

  /**
   * Generate multiple size variants of an image
   */
  generateImageVariants(publicId: string): Record<string, string> {
    const transformations = this.getImageTransformations();
    const variants: Record<string, string> = {};

    for (const [size, transformation] of Object.entries(transformations)) {
      variants[size] = this.generateSecureUrl(publicId, transformation);
    }

    return variants;
  }

  /**
   * Validate Cloudinary configuration
   */
  async validateConfiguration(): Promise<boolean> {
    try {
      // Test upload with a small data URI
      const testImage =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      const result = await cloudinary.uploader.upload(testImage, {
        folder: 'test',
        public_id: 'config-test',
      });

      // Clean up test image
      await cloudinary.uploader.destroy(result.public_id);
      this.logger.log('Cloudinary configuration validated successfully');
      return true;
    } catch (error) {
      this.logger.error('Cloudinary configuration validation failed:', error.message);
      return false;
    }
  }
}