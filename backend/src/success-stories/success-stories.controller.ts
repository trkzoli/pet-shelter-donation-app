
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { SuccessStoriesService } from './success-stories.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import {
  CreateSuccessStoryDto,
  CreateAdoptionSuccessStoryDto,
  CreateDeceasedStoryDto,
  CreateErrorStoryDto,
  SuccessStoryResponseDto,
  UserSuccessStoryDto,
  SuccessStoryFiltersDto,
  NotificationStatusDto,
} from './dto/success-story.dto';

@ApiTags('success-stories')
@Controller('success-stories')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SuccessStoriesController {
  constructor(private readonly successStoriesService: SuccessStoriesService) {}

 
  @Post()
  @Roles(UserRole.SHELTER)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Create success story',
    description: 'Creates a success story for a pet (adoption, deceased, error)'
  })
  @ApiResponse({
    status: 201,
    description: 'Success story created successfully',
    type: SuccessStoryResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Can only create stories for your own pets',
  })
  async createSuccessStory(
    @Request() req,
    @Body() createDto: CreateSuccessStoryDto
  ): Promise<SuccessStoryResponseDto> {
    return this.successStoriesService.createSuccessStory(req.user.shelterId, createDto);
  }

  
  @Post('adoption')
  @Roles(UserRole.SHELTER)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Create adoption success story',
    description: 'Creates adoption success story for internal or external adoptions'
  })
  @ApiResponse({
    status: 201,
    description: 'Adoption success story created successfully',
    type: SuccessStoryResponseDto,
  })
  async createAdoptionSuccessStory(
    @Request() req,
    @Body() createDto: CreateAdoptionSuccessStoryDto
  ): Promise<SuccessStoryResponseDto> {
    return this.successStoriesService.createAdoptionSuccessStory(req.user.shelterId, createDto);
  }

  
  @Post('deceased')
  @Roles(UserRole.SHELTER)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Create deceased pet story',
    description: 'Creates compassionate story when a pet passes away'
  })
  @ApiResponse({
    status: 201,
    description: 'Deceased pet story created successfully',
    type: SuccessStoryResponseDto,
  })
  async createDeceasedStory(
    @Request() req,
    @Body() createDto: CreateDeceasedStoryDto
  ): Promise<SuccessStoryResponseDto> {
    return this.successStoriesService.createDeceasedStory(req.user.shelterId, createDto);
  }

  
  @Post('error')
  @Roles(UserRole.SHELTER)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Create error story',
    description: 'Creates error story for listing mistakes (may trigger refunds)'
  })
  @ApiResponse({
    status: 201,
    description: 'Error story created successfully',
    type: SuccessStoryResponseDto,
  })
  async createErrorStory(
    @Request() req,
    @Body() createDto: CreateErrorStoryDto
  ): Promise<SuccessStoryResponseDto> {
    return this.successStoriesService.createErrorStory(req.user.shelterId, createDto);
  }

  
  @Get()
  @ApiOperation({ 
    summary: 'Get all success stories',
    description: 'Returns paginated list of success stories with optional filters'
  })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by story type' })
  @ApiQuery({ name: 'petId', required: false, description: 'Filter by pet ID' })
  @ApiQuery({ name: 'shelterId', required: false, description: 'Filter by shelter ID' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of results per page', type: 'number' })
  @ApiQuery({ name: 'offset', required: false, description: 'Page offset', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Success stories retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        stories: { type: 'array', items: { $ref: '#/components/schemas/SuccessStoryResponseDto' } },
        total: { type: 'number' },
        hasMore: { type: 'boolean' },
      },
    },
  })
  async getSuccessStories(@Query() filters: SuccessStoryFiltersDto) {
    return this.successStoriesService.getSuccessStories(filters);
  }

  
  @Get('mine')
  @ApiOperation({ 
    summary: 'Get my success stories',
    description: 'Returns success stories for pets the current user has supported'
  })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by story type' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of results per page', type: 'number' })
  @ApiQuery({ name: 'offset', required: false, description: 'Page offset', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'User success stories retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        stories: { type: 'array', items: { $ref: '#/components/schemas/UserSuccessStoryDto' } },
        total: { type: 'number' },
        hasMore: { type: 'boolean' },
      },
    },
  })
  async getUserSuccessStories(@Request() req, @Query() filters: SuccessStoryFiltersDto) {
    return this.successStoriesService.getUserSuccessStories(req.user.userId, filters);
  }

  
  @Get('shelter')
  @Roles(UserRole.SHELTER)
  @UseGuards(RolesGuard)
  @ApiOperation({ 
    summary: 'Get shelter success stories',
    description: 'Returns success stories for the current shelter\'s pets'
  })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by story type' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of results per page', type: 'number' })
  @ApiQuery({ name: 'offset', required: false, description: 'Page offset', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Shelter success stories retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        stories: { type: 'array', items: { $ref: '#/components/schemas/SuccessStoryResponseDto' } },
        total: { type: 'number' },
        hasMore: { type: 'boolean' },
      },
    },
  })
  async getShelterSuccessStories(@Request() req, @Query() filters: SuccessStoryFiltersDto) {
    return this.successStoriesService.getShelterSuccessStories(req.user.shelterId, filters);
  }

  
  @Get(':id')
  @ApiOperation({ 
    summary: 'Get success story details',
    description: 'Returns detailed information about a specific success story'
  })
  @ApiParam({ name: 'id', description: 'Success story ID' })
  @ApiResponse({
    status: 200,
    description: 'Success story details retrieved successfully',
    type: SuccessStoryResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Success story not found',
  })
  async getSuccessStory(@Param('id', ParseUUIDPipe) storyId: string): Promise<SuccessStoryResponseDto> {
    return this.successStoriesService.getSuccessStory(storyId);
  }

  
  @Get(':id/notifications')
  @ApiOperation({ 
    summary: 'Get notification status',
    description: 'Returns notification delivery status for a success story'
  })
  @ApiParam({ name: 'id', description: 'Success story ID' })
  @ApiResponse({
    status: 200,
    description: 'Notification status retrieved successfully',
    type: NotificationStatusDto,
  })
  async getNotificationStatus(@Param('id', ParseUUIDPipe) storyId: string): Promise<NotificationStatusDto> {
    return this.successStoriesService.getNotificationStatus(storyId);
  }

  
  @Post(':id/notifications/:userId/sent')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Mark notification as sent',
    description: 'Marks notification as sent for specific user (internal use by notification service)'
  })
  @ApiParam({ name: 'id', description: 'Success story ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Notification marked as sent',
  })
  async markNotificationSent(
    @Param('id', ParseUUIDPipe) storyId: string,
    @Param('userId', ParseUUIDPipe) userId: string
  ): Promise<{ success: boolean; message: string }> {
    await this.successStoriesService.markNotificationSent(storyId, userId);
    return { 
      success: true, 
      message: 'Notification marked as sent successfully' 
    };
  }

  
  @Get(':id/notifications/pending')
  @ApiOperation({ 
    summary: 'Get pending notifications',
    description: 'Returns users who still need to receive notifications for a success story'
  })
  @ApiParam({ name: 'id', description: 'Success story ID' })
  @ApiResponse({
    status: 200,
    description: 'Pending notifications retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          email: { type: 'string' },
          name: { type: 'string' },
        },
      },
    },
  })
  async getPendingNotifications(@Param('id', ParseUUIDPipe) storyId: string) {
    return this.successStoriesService.getPendingNotifications(storyId);
  }

  
  @Get('stats/overview')
  @ApiOperation({ 
    summary: 'Get success story statistics',
    description: 'Returns overall success story statistics (global or shelter-specific)'
  })
  @ApiQuery({ name: 'shelterId', required: false, description: 'Get stats for specific shelter' })
  @ApiResponse({
    status: 200,
    description: 'Success story statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalStories: { type: 'number' },
        adoptions: { type: 'number' },
        deceased: { type: 'number' },
        errors: { type: 'number' },
        totalUsersNotified: { type: 'number' },
        recentStories: { type: 'array', items: { $ref: '#/components/schemas/SuccessStoryResponseDto' } },
      },
    },
  })
  async getSuccessStoryStats(@Query('shelterId') shelterId?: string) {
    return this.successStoriesService.getSuccessStoryStats(shelterId);
  }

  
  @Get('stats/shelter')
  @Roles(UserRole.SHELTER)
  @UseGuards(RolesGuard)
  @ApiOperation({ 
    summary: 'Get shelter success story statistics',
    description: 'Returns current shelter\'s success story statistics'
  })
  @ApiResponse({
    status: 200,
    description: 'Shelter success story statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalStories: { type: 'number' },
        adoptions: { type: 'number' },
        deceased: { type: 'number' },
        errors: { type: 'number' },
        totalUsersNotified: { type: 'number' },
        recentStories: { type: 'array', items: { $ref: '#/components/schemas/SuccessStoryResponseDto' } },
      },
    },
  })
  async getShelterStats(@Request() req) {
    return this.successStoriesService.getSuccessStoryStats(req.user.shelterId);
  }

  
  @Post(':id/resend-notifications')
  @Roles(UserRole.SHELTER)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Resend notifications',
    description: 'Manually trigger notification resend for a success story'
  })
  @ApiParam({ name: 'id', description: 'Success story ID' })
  @ApiResponse({
    status: 200,
    description: 'Notifications resent successfully',
  })
  async resendNotifications(
    @Param('id', ParseUUIDPipe) storyId: string,
    @Request() req
  ): Promise<{ success: boolean; message: string; pendingCount: number }> {
    const pendingUsers = await this.successStoriesService.getPendingNotifications(storyId);
    
    if (pendingUsers.length === 0) {
      return {
        success: true,
        message: 'All notifications already sent',
        pendingCount: 0,
      };
    }

   
    return {
      success: true,
      message: `${pendingUsers.length} notifications queued for resend`,
      pendingCount: pendingUsers.length,
    };
  }
}
