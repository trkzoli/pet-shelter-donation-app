
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
  ParseUUIDPipe,
  SetMetadata,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { PetsService } from './pets.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/user.decorator';
import { UserRole } from '../users/entities/user.entity';
import { Pet } from './entities/pet.entity';
import { CreatePetDto, RemovePetDto, ConfirmAdoptionDto } from './dto/create-pet.dto';
import { SetMonthlyGoalsDto } from './dto/monthly-goals.dto';
import { UpdatePetDto, PetFiltersDto } from './dto/update-pet.dto';
import { PetDetailDto, ShelterPetDto } from './dto/pet-response.dto';
import { UploadsService, UploadType } from '../uploads/uploads.service';
import { Public } from '../auth/decorators/public.decorator';


@ApiTags('pets')
@Controller('pets')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.SHELTER)
  @ApiOperation({ summary: 'Create a new pet (draft status)' })
  @ApiResponse({ status: 201, description: 'Pet created successfully', type: Pet })
  async createPet(
    @GetUser('id') userId: string,
    @Body() createPetDto: CreatePetDto,
  ): Promise<Pet> {
    return this.petsService.createPet(userId, createPetDto);
  }

  
  @Get()
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all published pets with filters and pagination' })
  @ApiResponse({ status: 200, description: 'Pets retrieved successfully' })
  async getPets(@Query() filters: PetFiltersDto) {
    return this.petsService.getPets(filters);
  }

  
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get pet details by ID' })
  @ApiResponse({ status: 200, description: 'Pet details retrieved successfully', type: Pet })
  async getPetById(@Param('id', ParseUUIDPipe) id: string): Promise<PetDetailDto> {
    return this.petsService.getPetById(id);
  }

  
  @Get('shelter/my-pets')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.SHELTER)
  @ApiOperation({ summary: 'Get all pets for the current shelter' })
  @ApiResponse({ status: 200, description: 'Shelter pets retrieved successfully' })
  async getShelterPets(@GetUser('id') userId: string): Promise<ShelterPetDto[]> {
    return this.petsService.getShelterPets(userId);
  }

  
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.SHELTER)
  @ApiOperation({ summary: 'Update pet (24-hour edit window applies)' })
  @ApiResponse({ status: 200, description: 'Pet updated successfully', type: Pet })
  async updatePet(
    @GetUser('id') userId: string,
    @Param('id', ParseUUIDPipe) petId: string,
    @Body() updatePetDto: UpdatePetDto,
  ): Promise<Pet> {
    return this.petsService.updatePet(userId, petId, updatePetDto);
  }

  
  @Post(':id/goals')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.SHELTER)
  @ApiOperation({ summary: 'Set or update monthly goals for a pet' })
  @ApiResponse({ status: 200, description: 'Monthly goals set successfully', type: Pet })
  async setMonthlyGoals(
    @GetUser('id') userId: string,
    @Param('id', ParseUUIDPipe) petId: string,
    @Body() setGoalsDto: SetMonthlyGoalsDto,
  ): Promise<Pet> {
    return this.petsService.setMonthlyGoals(userId, petId, setGoalsDto);
  }

  
  @Post(':id/publish')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.SHELTER)
  @ApiOperation({ summary: 'Publish a pet (make it available for adoption)' })
  @ApiResponse({ status: 200, description: 'Pet published successfully', type: Pet })
  async publishPet(
    @GetUser('id') userId: string,
    @Param('id', ParseUUIDPipe) petId: string,
  ): Promise<Pet> {
    return this.petsService.publishPet(userId, petId);
  }

  
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.SHELTER)
  @ApiOperation({ summary: 'Remove a pet (with reason)' })
  @ApiResponse({ status: 200, description: 'Pet removed successfully' })
  async removePet(
    @GetUser('id') userId: string,
    @Param('id', ParseUUIDPipe) petId: string,
    @Body() removeDto: RemovePetDto,
  ): Promise<{ message: string }> {
    return this.petsService.removePet(userId, petId, removeDto);
  }

  
  @Post(':id/adopt')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.SHELTER)
  @ApiOperation({ summary: 'Confirm pet adoption' })
  @ApiResponse({ status: 200, description: 'Adoption confirmed successfully', type: Pet })
  async confirmAdoption(
    @GetUser('id') userId: string,
    @Param('id', ParseUUIDPipe) petId: string,
    @Body() confirmDto: ConfirmAdoptionDto,
  ): Promise<Pet> {
    return this.petsService.confirmAdoption(userId, petId, confirmDto);
  }

  
  @Post(':id/images/main')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.SHELTER)
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload main image for a pet' })
  @ApiResponse({ status: 200, description: 'Main image uploaded successfully' })
  async uploadMainImage(
    @GetUser('id') userId: string,
    @Param('id', ParseUUIDPipe) petId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ message: string; imageUrl: string }> {
    const { imageUrl } = await this.petsService.uploadMainImage(userId, petId, file);
    return { message: 'Main image uploaded successfully', imageUrl };
  }

  
  @Post(':id/images/additional')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.SHELTER)
  @UseInterceptors(FilesInterceptor('images', 10)) // Max 10 additional images
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload additional images for a pet (max 10)' })
  @ApiResponse({ status: 200, description: 'Additional images uploaded successfully' })
  async uploadAdditionalImages(
    @GetUser('id') userId: string,
    @Param('id', ParseUUIDPipe) petId: string,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<{ message: string; imageUrls: string[] }> {
    const { imageUrls } = await this.petsService.uploadAdditionalImages(userId, petId, files);
    return { message: `${imageUrls.length} additional images uploaded successfully`, imageUrls };
  }

  
  @Post(':id/vet-records')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.SHELTER)
  @UseInterceptors(FileInterceptor('document'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload veterinary records for a pet' })
  @ApiResponse({ status: 200, description: 'Veterinary records uploaded successfully' })
  async uploadVetRecords(
    @GetUser('id') userId: string,
    @Param('id', ParseUUIDPipe) petId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ message: string; documentUrl: string }> {
    const { documentUrl } = await this.petsService.uploadVetRecord(userId, petId, file);
    return { message: 'Veterinary records uploaded successfully', documentUrl };
  }

  
  @Post(':id/images/main-base64')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.SHELTER)
  @ApiOperation({ summary: 'Upload main pet image using base64' })
  @ApiResponse({ status: 200, description: 'Main image uploaded successfully' })
  async uploadMainImageBase64(
    @GetUser('id') userId: string,
    @Param('id', ParseUUIDPipe) petId: string,
    @Body() body: { image: string },
  ): Promise<{ message: string; imageUrl: string }> {
    const { imageUrl } = await this.petsService.uploadMainImageBase64(userId, petId, body.image);
    return { message: 'Main image uploaded successfully', imageUrl };
  }

  
  @Post(':id/images/additional-base64')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.SHELTER)
  @ApiOperation({ summary: 'Upload additional pet images using base64' })
  @ApiResponse({ status: 200, description: 'Additional images uploaded successfully' })
  async uploadAdditionalImagesBase64(
    @GetUser('id') userId: string,
    @Param('id', ParseUUIDPipe) petId: string,
    @Body() body: { images: string[] },
  ): Promise<{ message: string; imageUrls: string[] }> {
    const { imageUrls } = await this.petsService.uploadAdditionalImagesBase64(userId, petId, body.images);
    return { message: 'Additional images uploaded successfully', imageUrls };
  }
}
