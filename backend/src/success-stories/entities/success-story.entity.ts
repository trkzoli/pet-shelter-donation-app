import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import {
  IsEnum,
  IsArray,
  IsOptional,
  IsString,
} from 'class-validator';
import { Pet } from '../../pets/entities/pet.entity';
import { User } from '../../users/entities/user.entity';
import { AdoptionRequest } from '../../adoptions/entities/adoption-request.entity';

export enum SuccessStoryType {
  ADOPTED_INTERNAL = 'adopted_internal',
  ADOPTED_EXTERNAL = 'adopted_external',
  DECEASED = 'deceased',
  ERROR = 'error',
}

@Entity('success_stories')
@Index(['petId'])
@Index(['type'])
@Index(['createdAt'])
export class SuccessStory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Pet)
  @JoinColumn()
  pet: Pet;

  @Column()
  petId: string;

  @Column({ type: 'enum', enum: SuccessStoryType })
  @IsEnum(SuccessStoryType)
  type: SuccessStoryType;

  @Column({ type: 'jsonb', default: [] })
  @IsArray()
  affectedUserIds: string[];

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn()
  adopter?: User;

  @Column({ nullable: true })
  adopterId?: string;

  @ManyToOne(() => AdoptionRequest, { nullable: true })
  @JoinColumn()
  adoptionRequest?: AdoptionRequest;

  @Column({ nullable: true })
  adoptionRequestId?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  errorReason?: string;

  
  @Column({ type: 'jsonb', default: {} })
  notificationsSent: Record<string, boolean>;

  @CreateDateColumn()
  createdAt: Date;

  shouldNotifyUser(userId: string): boolean {
    return this.affectedUserIds.includes(userId) && !this.notificationsSent[userId];
  }

  markNotificationSent(userId: string): void {
    this.notificationsSent[userId] = true;
  }

  getBonusPoints(): number {
    switch (this.type) {
      case SuccessStoryType.ADOPTED_EXTERNAL:
      case SuccessStoryType.DECEASED:
      case SuccessStoryType.ERROR:
        return 1;
      case SuccessStoryType.ADOPTED_INTERNAL:
        return 1;
      default:
        return 0;
    }
  }

  getStoryTitle(): string {
    switch (this.type) {
      case SuccessStoryType.ADOPTED_INTERNAL:
      case SuccessStoryType.ADOPTED_EXTERNAL:
        return 'Adoption Success!';
      case SuccessStoryType.DECEASED:
        return 'In Loving Memory';
      case SuccessStoryType.ERROR:
        return 'Update from Shelter';
      default:
        return 'Pet Update';
    }
  }

  getStoryMessage(petName: string, shelterName: string): string {
    switch (this.type) {
      case SuccessStoryType.ADOPTED_INTERNAL:
        return `Great news! ${petName} has found their forever home through Pawner. Thank you for your support in making this possible!`;
      case SuccessStoryType.ADOPTED_EXTERNAL:
        return `Wonderful news! ${petName} has been adopted and found their forever home. Your support helped care for them until they found their family!`;
      case SuccessStoryType.DECEASED:
        return `We're sad to share that ${petName} has passed away. ${shelterName} thanks you for your compassion and support during their time at the shelter.`;
      case SuccessStoryType.ERROR:
        return `${shelterName} has reported an error with ${petName}'s listing. ${this.errorReason || 'The listing has been removed.'} We apologize for any inconvenience.`;
      default:
        return `Update about ${petName} from ${shelterName}.`;
    }
  }

  static createAdoptionStory(
    petId: string,
    affectedUserIds: string[],
    adopterId?: string,
    adoptionRequestId?: string
  ): SuccessStory {
    const story = new SuccessStory();
    story.petId = petId;
    story.type = adopterId ? SuccessStoryType.ADOPTED_INTERNAL : SuccessStoryType.ADOPTED_EXTERNAL;
    story.affectedUserIds = affectedUserIds;
    story.adopterId = adopterId;
    story.adoptionRequestId = adoptionRequestId;
    return story;
  }

  static createDeceasedStory(
    petId: string,
    affectedUserIds: string[]
  ): SuccessStory {
    const story = new SuccessStory();
    story.petId = petId;
    story.type = SuccessStoryType.DECEASED;
    story.affectedUserIds = affectedUserIds;
    return story;
  }

  static createErrorStory(
    petId: string,
    affectedUserIds: string[],
    errorReason: string
  ): SuccessStory {
    const story = new SuccessStory();
    story.petId = petId;
    story.type = SuccessStoryType.ERROR;
    story.affectedUserIds = affectedUserIds;
    story.errorReason = errorReason;
    return story;
  }
}