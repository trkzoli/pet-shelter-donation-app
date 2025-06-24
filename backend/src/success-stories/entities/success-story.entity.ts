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
  ADOPTED_INTERNAL = 'adopted_internal',  // Adopted through the app
  ADOPTED_EXTERNAL = 'adopted_external',  // Adopted outside the app
  DECEASED = 'deceased',                  // Pet passed away
  ERROR = 'error',                        // Shelter error/listing mistake
}

@Entity('success_stories')
@Index(['petId'])
@Index(['type'])
@Index(['createdAt'])
export class SuccessStory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Pet relation
  @ManyToOne(() => Pet)
  @JoinColumn()
  pet: Pet;

  @Column()
  petId: string;

  // Story type
  @Column({ type: 'enum', enum: SuccessStoryType })
  @IsEnum(SuccessStoryType)
  type: SuccessStoryType;

  // Users to be notified (donor IDs)
  @Column({ type: 'jsonb', default: [] })
  @IsArray()
  affectedUserIds: string[];

  // Adopter (for internal adoptions)
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn()
  adopter?: User;

  @Column({ nullable: true })
  adopterId?: string;

  // Related adoption request (for internal adoptions)
  @ManyToOne(() => AdoptionRequest, { nullable: true })
  @JoinColumn()
  adoptionRequest?: AdoptionRequest;

  @Column({ nullable: true })
  adoptionRequestId?: string;

  // Error details (for error type)
  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  errorReason?: string;

  // Notification tracking
  @Column({ type: 'jsonb', default: {} })
  notificationsSent: Record<string, boolean>; // userId -> sent status

  // Timestamp
  @CreateDateColumn()
  createdAt: Date;

  // Helper methods
  shouldNotifyUser(userId: string): boolean {
    return this.affectedUserIds.includes(userId) && !this.notificationsSent[userId];
  }

  markNotificationSent(userId: string): void {
    this.notificationsSent[userId] = true;
  }

  getBonusPoints(): number {
    // Adoption and compassion bonuses give 1 PawPoint
    // Error bonus also gives 1 PawPoint
    switch (this.type) {
      case SuccessStoryType.ADOPTED_EXTERNAL:
      case SuccessStoryType.DECEASED:
      case SuccessStoryType.ERROR:
        return 1;
      case SuccessStoryType.ADOPTED_INTERNAL:
        // Internal adoption: only non-adopters get bonus
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

  // Factory methods
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