// src/notifications/notifications.controller.ts
import { Controller, Get, Post, Body, Param, UseGuards, Request, HttpCode, HttpStatus, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

// DTOs for API requests
export class TestEmailDto {
  email: string;
  type: 'verification' | 'password-reset' | 'adoption-request' | 'success-story';
}

export class SendSuccessStoryDto {
  petId: string;
  storyType: 'adopted_internal' | 'adopted_external' | 'deceased' | 'error';
  adopter?: {
    name: string;
    city: string;
  };
}

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // ==================== HEALTH CHECK ====================

  /**
   * Health check for notification service
   * GET /notifications/health
   * 
   * Tests mail configuration and connectivity
   * Available to: All authenticated users
   */
  @Get('health')
  @ApiOperation({ 
    summary: 'Check notification service health',
    description: 'Verifies mail configuration and service connectivity'
  })
  @ApiResponse({
    status: 200,
    description: 'Health check completed',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['healthy', 'unhealthy'] },
        mail: {
          type: 'object',
          properties: {
            configured: { type: 'boolean' },
            config: { type: 'object' },
          },
        },
        lastError: { type: 'string' },
      },
    },
  })
  async healthCheck() {
    return this.notificationsService.healthCheck();
  }

  // ==================== EMAIL VERIFICATION ====================

  /**
   * Send verification email (internal use)
   * POST /notifications/verification
   * 
   * Sends verification code email to user
   * Used internally by auth service
   * Available to: System/Internal use only
   */
  @Post('verification')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Send verification email',
    description: 'Sends email verification code (internal use by auth service)'
  })
  @ApiResponse({
    status: 200,
    description: 'Verification email sent successfully',
  })
  async sendVerificationEmail(@Body() body: { email: string; userName: string; verificationCode: string }) {
    await this.notificationsService.sendVerificationEmail(
      body.email,
      body.userName,
      body.verificationCode
    );
    
    return { 
      success: true, 
      message: 'Verification email sent successfully' 
    };
  }

  // ==================== PASSWORD RESET ====================

  /**
   * Send password reset email (internal use)
   * POST /notifications/password-reset
   * 
   * Sends password reset link to user
   * Used internally by auth service
   * Available to: System/Internal use only
   */
  @Post('password-reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Send password reset email',
    description: 'Sends password reset link (internal use by auth service)'
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset email sent successfully',
  })
  async sendPasswordResetEmail(@Body() body: { email: string; userName: string; resetToken: string }) {
    await this.notificationsService.sendPasswordResetEmail(
      body.email,
      body.userName,
      body.resetToken
    );
    
    return { 
      success: true, 
      message: 'Password reset email sent successfully' 
    };
  }

  // ==================== ADOPTION REQUESTS ====================

  /**
   * Send adoption request email to shelter (internal use)
   * POST /notifications/adoption-request/:requestId
   * 
   * Sends detailed adoption request email to shelter
   * Used internally by adoption service
   * Available to: System/Internal use only
   */
  @Post('adoption-request/:requestId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Send adoption request email',
    description: 'Sends adoption request notification to shelter (internal use)'
  })
  @ApiResponse({
    status: 200,
    description: 'Adoption request email sent successfully',
  })
  async sendAdoptionRequestEmail(@Param('requestId', ParseUUIDPipe) requestId: string) {
    await this.notificationsService.sendAdoptionRequestEmail(requestId);
    
    return { 
      success: true, 
      message: 'Adoption request email sent successfully' 
    };
  }

  // ==================== SUCCESS STORIES ====================

  /**
   * Send success story notification (shelter only)
   * POST /notifications/success-story
   * 
   * Sends success story notification to all pet supporters
   * Available to: Shelter admins only
   */
  @Post('success-story')
  @Roles(UserRole.SHELTER)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Send success story notifications',
    description: 'Sends success story notification to all supporters of a pet'
  })
  @ApiResponse({
    status: 200,
    description: 'Success story notifications sent successfully',
  })
  async sendSuccessStoryNotifications(@Body() body: SendSuccessStoryDto) {
    await this.notificationsService.sendBulkSuccessStoryNotifications(
      body.petId,
      body.storyType,
      body.adopter
    );
    
    return { 
      success: true, 
      message: 'Success story notifications sent to all supporters' 
    };
  }

  /**
   * Send individual success story notification (internal use)
   * POST /notifications/success-story/individual
   * 
   * Sends success story notification to specific user
   * Used internally by other services
   * Available to: System/Internal use only
   */
  @Post('success-story/individual')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Send individual success story notification',
    description: 'Sends success story notification to specific user (internal use)'
  })
  @ApiResponse({
    status: 200,
    description: 'Success story notification sent successfully',
  })
  async sendIndividualSuccessStory(@Body() body: {
    userId: string;
    petId: string;
    storyType: 'adopted_internal' | 'adopted_external' | 'deceased' | 'error';
    adopter?: { name: string; city: string };
  }) {
    await this.notificationsService.sendSuccessStoryNotification(
      body.userId,
      body.petId,
      body.storyType,
      body.adopter
    );
    
    return { 
      success: true, 
      message: 'Individual success story notification sent successfully' 
    };
  }

  // ==================== TESTING ENDPOINTS (Development Only) ====================

  /**
   * Test email templates (development only)
   * POST /notifications/test
   * 
   * Sends test emails for template verification
   * Available to: All authenticated users in development
   */
  @Post('test')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Test email templates',
    description: 'Sends test emails for template verification (development only)'
  })
  @ApiResponse({
    status: 200,
    description: 'Test email sent successfully',
  })
  async sendTestEmail(@Body() testEmailDto: TestEmailDto, @Request() req) {
    const { email, type } = testEmailDto;

    switch (type) {
      case 'verification':
        await this.notificationsService.sendVerificationEmail(
          email,
          'Test User',
          '1234'
        );
        break;

      case 'password-reset':
        await this.notificationsService.sendPasswordResetEmail(
          email,
          'Test User',
          'test-reset-token-123'
        );
        break;

      case 'success-story':
        await this.notificationsService.sendSuccessStoryNotification(
          req.user.userId,
          'test-pet-id',
          'adopted_external',
          { name: 'John Doe', city: 'New York' }
        );
        break;

      default:
        return { 
          success: false, 
          message: 'Invalid test email type' 
        };
    }

    return { 
      success: true, 
      message: `Test ${type} email sent to ${email}` 
    };
  }
}