
import { Injectable, Logger } from '@nestjs/common';
import { MailConfigService } from './config/mail.config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Pet } from '../pets/entities/pet.entity';
import { Shelter } from '../shelters/entities/shelter.entity';
import { AdoptionRequest } from '../adoptions/entities/adoption-request.entity';
import { Donation } from '../donations/entities/donation.entity';
import { SuccessStory } from '../success-stories/entities/success-story.entity';

export interface VerificationEmailData {
  userName: string;
  verificationCode: string;
  frontendUrl: string;
}

export interface PasswordResetEmailData {
  userName: string;
  resetToken: string;
  frontendUrl: string;
  expiryHours: number;
}

export interface AdoptionRequestEmailData {
  shelterName: string;
  contactPerson: string;
  petName: string;
  petBreed: string;
  petAge: string;
  requesterName: string;
  requesterEmail: string;
  requesterPhone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  housing: {
    type: string;
    ownership: string;
    hasYard: boolean;
    isFenced: boolean;
  };
  petExperience: {
    currentPets: string;
    experienceLevel: string;
  };
  lifestyle: {
    occupation: string;
    workSchedule: string;
    whyAdopt: string;
  };
  donationHistory: {
    totalAmountToPet: number;
    donationCount: number;
    recentDonations: Array<{
      amount: number;
      date: string;
    }>;
  };
  pawPoints: {
    totalPoints: number;
    pointsForReduction: number;
    feeReduction: number;
  };
  requestMessage?: string;
  requestId: string;
  frontendUrl: string;
}

export interface SuccessStoryEmailData {
  userName: string;
  petName: string;
  petImage: string;
  storyType: 'adopted_internal' | 'adopted_external' | 'deceased' | 'error';
  pawPointsEarned: number;
  adopter?: {
    name: string;
    city: string;
  };
  message: string;
  frontendUrl: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly mailConfigService: MailConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Pet)
    private readonly petRepository: Repository<Pet>,
    @InjectRepository(Shelter)
    private readonly shelterRepository: Repository<Shelter>,
    @InjectRepository(AdoptionRequest)
    private readonly adoptionRequestRepository: Repository<AdoptionRequest>,
    @InjectRepository(Donation)
    private readonly donationRepository: Repository<Donation>,
  ) {}

  async sendVerificationEmail(email: string, userName: string, verificationCode: string): Promise<void> {
    const emailData: VerificationEmailData = {
      userName,
      verificationCode,
      frontendUrl: this.mailConfigService.getFrontendUrl(),
    };

    const subject = 'Verify Your Pawner Account';
    const html = this.generateVerificationEmailTemplate(emailData);

    await this.sendEmail(email, subject, html);
    this.logger.log(`Verification email sent to ${email}`);
  }

  private generateVerificationEmailTemplate(data: VerificationEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #493628; }
          .logo { font-size: 28px; font-weight: bold; color: #493628; }
          .content { padding: 30px 0; }
          .code-container { text-align: center; margin: 30px 0; }
          .verification-code { font-size: 36px; font-weight: bold; color: ##493628; letter-spacing: 8px; padding: 20px; background: #f8f9fa; border-radius: 10px; display: inline-block; }
          .footer { text-align: center; padding: 20px 0; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
          .highlight { color: #493628; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">Pawner</div>
        </div>
        
        <div class="content">
          <h2>Welcome to Pawner, ${data.userName}!</h2>
          
          <p>Thank you for joining our mission to help shelter pets find loving homes. To complete your registration, please verify your email address using the code below:</p>
          
          <div class="code-container">
            <div class="verification-code">${data.verificationCode}</div>
          </div>
          
          <p>This verification code will expire in <span class="highlight">15 minutes</span>.</p>
          
          <p>If you didn't create an account with Pawner, please ignore this email.</p>
          
          <p>Welcome to our community of pet lovers!</p>
          
          <p>Best regards,<br>The Pawner Team</p>
        </div>
        
        <div class="footer">
          <p>This is an automated message from Pawner.<br>
          Visit us at <a href="${data.frontendUrl}" style="color: #493628;">${data.frontendUrl}</a></p>
        </div>
      </body>
      </html>
    `;
  }

  async sendPasswordResetEmail(email: string, userName: string, resetToken: string): Promise<void> {
    const emailData: PasswordResetEmailData = {
      userName,
      resetToken,
      frontendUrl: this.mailConfigService.getFrontendUrl(),
      expiryHours: 1,
    };

    const subject = 'Reset Your Pawner Password';
    const html = this.generatePasswordResetEmailTemplate(emailData);

    await this.sendEmail(email, subject, html);
    this.logger.log(`Password reset email sent to ${email}`);
  }

  async sendPasswordResetNotification(email: string, userName: string): Promise<void> {
    const subject = 'Password Reset Request - Pawner';
    const html = this.generatePasswordResetNotificationTemplate(userName);

    await this.sendEmail(email, subject, html);
    this.logger.log(`Password reset notification sent to ${email}`);
  }

  private generatePasswordResetEmailTemplate(data: PasswordResetEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #493628; }
          .logo { font-size: 28px; font-weight: bold; color: #493628; }
          .content { padding: 30px 0; }
          .reset-button { text-align: center; margin: 30px 0; }
          .button { display: inline-block; padding: 15px 30px; background-color: #493628; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; }
          .footer { text-align: center; padding: 20px 0; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
          .highlight { color: #493628; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">Pawner</div>
        </div>
        
        <div class="content">
          <h2>Password Reset Request</h2>
          
          <p>Hello ${data.userName},</p>
          
          <p>We received a request to reset the password for your Pawner account. Click the button below to reset your password:</p>
          
          <div class="reset-button">
            <a href="${data.frontendUrl}/reset-password?token=${data.resetToken}" class="button">Reset Password</a>
          </div>
          
          <p>This link will expire in <span class="highlight">${data.expiryHours} hour${data.expiryHours !== 1 ? 's' : ''}</span>.</p>
          
          <p>If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
          
          <p>Best regards,<br>The Pawner Team</p>
        </div>
        
        <div class="footer">
          <p>This is an automated message from Pawner.<br>
          Visit us at <a href="${data.frontendUrl}" style="color: #493628;">${data.frontendUrl}</a></p>
        </div>
      </body>
      </html>
    `;
  }

  private generatePasswordResetNotificationTemplate(userName: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset Request</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #493628; }
          .logo { font-size: 28px; font-weight: bold; color: #493628; }
          .content { padding: 30px 0; }
          .notice-box { background-color: #f8f9fa; border-left: 4px solid #493628; padding: 20px; margin: 30px 0; }
          .footer { text-align: center; padding: 20px 0; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
          .highlight { color: #493628; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">Pawner</div>
        </div>
        
        <div class="content">
          <h2>Password Reset Request Received</h2>
          
          <p>Hello ${userName},</p>
          
          <p>We received a request to reset the password for your Pawner account.</p>
          
          <div class="notice-box">
            <h3>🔧 Password Reset Feature Coming Soon!</h3>
            <p>We're currently working on implementing the password reset functionality. In the meantime, if you need to reset your password, please contact our support team.</p>
          </div>
          
          <p>If you didn't request a password reset, you can safely ignore this email.</p>
          
          <p><strong>Need help?</strong> Contact our support team for assistance with your account.</p>
          
          <p>Thank you for your patience as we continue to improve Pawner!</p>
          
          <p>Best regards,<br>The Pawner Team</p>
        </div>
        
        <div class="footer">
          <p>This is an automated message from Pawner.<br>
          We're working hard to help shelter pets find loving homes.</p>
        </div>
      </body>
      </html>
    `;
  }

  async sendAdoptionRequestEmail(adoptionRequestId: string): Promise<void> {
    const adoptionRequest = await this.adoptionRequestRepository.findOne({
      where: { id: adoptionRequestId },
      relations: ['user', 'pet', 'pet.shelter', 'pet.shelter.user'],
    });

    if (!adoptionRequest) {
      throw new Error(`Adoption request ${adoptionRequestId} not found`);
    }

    const donations = await this.donationRepository.find({
      where: {
        userId: adoptionRequest.user.id,
        petId: adoptionRequest.pet.id,
      },
      order: { createdAt: 'DESC' },
    });

    const totalAmountToPet = donations.reduce((sum, donation) => sum + donation.amount, 0);
    const recentDonations = donations.slice(0, 5).map(donation => ({
      amount: donation.amount,
      date: donation.createdAt.toLocaleDateString(),
    }));

    const emailData: AdoptionRequestEmailData = {
      shelterName: adoptionRequest.pet.shelter.shelterName,
      contactPerson: adoptionRequest.pet.shelter.contactPerson,
      petName: adoptionRequest.pet.name,
      petBreed: adoptionRequest.pet.breed,
      petAge: adoptionRequest.pet.age,
      requesterName: adoptionRequest.user.name,
      requesterEmail: adoptionRequest.user.email,
      requesterPhone: adoptionRequest.user.phone || 'Not provided',
      address: {
        street: adoptionRequest.user.street || 'Not provided',
        city: adoptionRequest.user.city || 'Not provided',
        state: adoptionRequest.user.state || 'Not provided',
        zip: adoptionRequest.user.zip || 'Not provided',
        country: adoptionRequest.user.country || 'Not provided',
      },
      housing: {
        type: adoptionRequest.user.housingType || 'Not specified',
        ownership: adoptionRequest.user.ownershipStatus || 'Not specified',
        hasYard: adoptionRequest.user.hasYard === 'yes',
        isFenced: adoptionRequest.user.isFenced === 'yes',
      },
      petExperience: {
        currentPets: adoptionRequest.user.currentPets || 'Not specified',
        experienceLevel: adoptionRequest.user.experienceLevel || 'Not specified',
      },
      lifestyle: {
        occupation: adoptionRequest.user.occupation || 'Not specified',
        workSchedule: adoptionRequest.user.workSchedule || 'Not specified',
        whyAdopt: adoptionRequest.user.whyAdopt || 'Not provided',
      },
      donationHistory: {
        totalAmountToPet,
        donationCount: donations.length,
        recentDonations,
      },
      pawPoints: {
        totalPoints: adoptionRequest.user.pawPoints,
        pointsForReduction: adoptionRequest.pawPointsUsedForReduction,
        feeReduction: adoptionRequest.feeReduction,
      },
      requestMessage: adoptionRequest.message,
      requestId: adoptionRequest.id,
      frontendUrl: this.mailConfigService.getFrontendUrl(),
    };

    const subject = `New Adoption Request for ${adoptionRequest.pet.name}`;
    const html = this.generateAdoptionRequestEmailTemplate(emailData);

    await this.sendEmail(adoptionRequest.pet.shelter.user.email, subject, html);
    this.logger.log(`Adoption request email sent for pet ${adoptionRequest.pet.name} to ${adoptionRequest.pet.shelter.user.email}`);
  }

  private generateAdoptionRequestEmailTemplate(data: AdoptionRequestEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Adoption Request</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 700px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #493628; }
          .logo { font-size: 28px; font-weight: bold; color: #493628; }
          .content { padding: 30px 0; }
          .section { margin: 25px 0; padding: 20px; background: #f8f9fa; border-left: 4px solid #493628; }
          .section h3 { margin-top: 0; color: #493628; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 15px 0; }
          .info-item { padding: 8px 0; }
          .label { font-weight: bold; color: #495057; }
          .value { color: #333; }
          .highlight { color: #493628; font-weight: bold; }
          .warning { background: #fff3cd; border-left-color: #ffc107; }
          .donation-list { background: white; padding: 15px; border-radius: 5px; margin: 10px 0; }
          .footer { text-align: center; padding: 20px 0; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
          .contact-info { background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .message-box { background: white; padding: 20px; border-radius: 5px; border: 1px solid #ddd; margin: 15px 0; font-style: italic; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">Pawner</div>
        </div>
        
        <div class="content">
          <h2> New Adoption Request for ${data.petName}!</h2>
          
          <p>Dear ${data.contactPerson} at ${data.shelterName},</p>
          
          <p>Great news! Someone wants to adopt <span class="highlight">${data.petName}</span> (${data.petBreed}, ${data.petAge}) and has submitted a formal adoption request through Pawner.</p>

          <div class="section">
            <h3>Adopter Information</h3>
            <div class="contact-info">
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">Name:</span> ${data.requesterName}
                </div>
                <div class="info-item">
                  <span class="label">Email:</span> ${data.requesterEmail}
                </div>
                <div class="info-item">
                  <span class="label">Phone:</span> ${data.requesterPhone}
                </div>
              </div>
            </div>

            <h4>Address</h4>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">Street:</span> ${data.address.street}
              </div>
              <div class="info-item">
                <span class="label">City:</span> ${data.address.city}
              </div>
              <div class="info-item">
                <span class="label">State:</span> ${data.address.state}
              </div>
              <div class="info-item">
                <span class="label">ZIP:</span> ${data.address.zip}
              </div>
              <div class="info-item">
                <span class="label">Country:</span> ${data.address.country}
              </div>
            </div>
          </div>

          <div class="section">
            <h3>Housing Information</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">Housing Type:</span> ${data.housing.type}
              </div>
              <div class="info-item">
                <span class="label">Ownership:</span> ${data.housing.ownership}
              </div>
              <div class="info-item">
                <span class="label">Has Yard:</span> ${data.housing.hasYard ? 'Yes' : 'No'}
              </div>
              <div class="info-item">
                <span class="label">Fenced:</span> ${data.housing.isFenced ? 'Yes' : 'No'}
              </div>
            </div>
          </div>

          <div class="section">
            <h3>Pet Experience</h3>
            <div class="info-item">
              <span class="label">Current Pets:</span> ${data.petExperience.currentPets}
            </div>
            <div class="info-item">
              <span class="label">Experience Level:</span> ${data.petExperience.experienceLevel}
            </div>
          </div>

          <div class="section">
            <h3>Lifestyle Information</h3>
            <div class="info-item">
              <span class="label">Occupation:</span> ${data.lifestyle.occupation}
            </div>
            <div class="info-item">
              <span class="label">Work Schedule:</span> ${data.lifestyle.workSchedule}
            </div>
            <div class="info-item">
              <span class="label">Why Adopt:</span> ${data.lifestyle.whyAdopt}
            </div>
          </div>

          <div class="section">
            <h3>Donation History & PawPoints</h3>
            <div class="info-item">
              <span class="label">Total Donated to ${data.petName}:</span> <span class="highlight">$${data.donationHistory.totalAmountToPet.toFixed(2)}</span>
            </div>
            <div class="info-item">
              <span class="label">Number of Donations:</span> ${data.donationHistory.donationCount}
            </div>
            <div class="info-item">
              <span class="label">Current PawPoints:</span> <span class="highlight">${data.pawPoints.totalPoints}</span>
            </div>
            ${data.pawPoints.feeReduction > 0 ? `
            <div class="info-item">
              <span class="label">Fee Reduction:</span> <span class="highlight">$${data.pawPoints.feeReduction.toFixed(2)} (${data.pawPoints.pointsForReduction} PawPoints used)</span>
            </div>
            ` : ''}

            ${data.donationHistory.recentDonations.length > 0 ? `
            <div class="donation-list">
              <h4>Recent Donations:</h4>
              ${data.donationHistory.recentDonations.map(donation => 
                `<div>• $${donation.amount.toFixed(2)} on ${donation.date}</div>`
              ).join('')}
            </div>
            ` : ''}
          </div>

          ${data.requestMessage ? `
          <div class="section">
            <h3>Personal Message</h3>
            <div class="message-box">
              "${data.requestMessage}"
            </div>
          </div>
          ` : ''}

          <div class="section warning">
            <h3>Important Notes</h3>
            <ul>
              <li>This adopter has met all Pawner requirements (5+ PawPoints and 100% profile completion)</li>
              <li>They have already donated <span class="highlight">$${data.donationHistory.totalAmountToPet.toFixed(2)}</span> to support ${data.petName}</li>
              <li>Please contact them directly to discuss the adoption process</li>
              <li>Once adoption is confirmed, please update the status in your shelter dashboard</li>
            </ul>
          </div>

          <p><strong>Next Steps:</strong> Please reach out to ${data.requesterName} at ${data.requesterEmail} or ${data.requesterPhone} to discuss the adoption. When you're ready to proceed, you can confirm the adoption in your Pawner dashboard.</p>

          <p>Thank you for helping pets find loving homes!</p>
          
          <p>Best regards,<br>The Pawner Team</p>
        </div>
        
        <div class="footer">
          <p>This adoption request was generated automatically from Pawner.<br>
          Request ID: ${data.requestId}<br>
          Visit your dashboard at <a href="${data.frontendUrl}" style="color: #493628;">${data.frontendUrl}</a></p>
        </div>
      </body>
      </html>
    `;
  }

  
  async sendSuccessStoryNotification(
    userId: string,
    petId: string,
    storyType: 'adopted_internal' | 'adopted_external' | 'deceased' | 'error',
    adopter?: { name: string; city: string }
  ): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const pet = await this.petRepository.findOne({ where: { id: petId } });

    if (!user || !pet) {
      throw new Error(`User ${userId} or Pet ${petId} not found`);
    }

    const emailData: SuccessStoryEmailData = {
      userName: user.name,
      petName: pet.name,
      petImage: pet.mainImage,
      storyType,
      pawPointsEarned: 1, // Always 1 PawPoint for success stories
      adopter,
      message: this.getSuccessStoryMessage(storyType, pet.name, adopter),
      frontendUrl: this.mailConfigService.getFrontendUrl(),
    };

    const subject = this.getSuccessStorySubject(storyType, pet.name);
    const html = this.generateSuccessStoryEmailTemplate(emailData);

    await this.sendEmail(user.email, subject, html);
    this.logger.log(`Success story email sent to ${user.email} for pet ${pet.name} (${storyType})`);
  }


  private getSuccessStoryMessage(
    storyType: 'adopted_internal' | 'adopted_external' | 'deceased' | 'error',
    petName: string,
    adopter?: { name: string; city: string }
  ): string {
    switch (storyType) {
      case 'adopted_internal':
        return adopter 
          ? `${petName} has found a loving home with ${adopter.name} in ${adopter.city}! Your support made this happy ending possible.`
          : `${petName} has been adopted through Pawner! Your support made this happy ending possible.`;
      
      case 'adopted_external':
        return `${petName} has found a loving home! While this adoption happened outside of Pawner, your donations helped provide the care that made this possible.`;
      
      case 'deceased':
        return `We're sorry to share that ${petName} has passed away. Your donations provided comfort and care during their time at the shelter. Thank you for your compassion.`;
      
      case 'error':
        return `Due to an administrative error, your donation to ${petName} has been refunded. We apologize for any inconvenience and appreciate your understanding.`;
      
      default:
        return `Thank you for supporting ${petName}!`;
    }
  }


  private getSuccessStorySubject(
    storyType: 'adopted_internal' | 'adopted_external' | 'deceased' | 'error',
    petName: string
  ): string {
    switch (storyType) {
      case 'adopted_internal':
      case 'adopted_external':
        return `Great News! ${petName} Found a Home`;
      
      case 'deceased':
        return `Update About ${petName}`;
      
      case 'error':
        return `Donation Refund for ${petName}`;
      
      default:
        return `Update About ${petName}`;
    }
  }


  private generateSuccessStoryEmailTemplate(data: SuccessStoryEmailData): string {
    const isHappyNews = data.storyType.includes('adopted');
    const iconEmoji = '';
    const headerColor = isHappyNews ? '#51CF66' : data.storyType === 'deceased' ? '#4DABF7' : '#FFD43B';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Update About ${data.petName}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 20px 0; border-bottom: 2px solid ${headerColor}; }
          .logo { font-size: 28px; font-weight: bold; color: ${headerColor}; }
          .content { padding: 30px 0; }
          .pet-card { text-align: center; margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 15px; }
          .pet-image { width: 200px; height: 200px; border-radius: 50%; object-fit: cover; margin: 0 auto 15px; display: block; }
          .pet-name { font-size: 24px; font-weight: bold; color: ${headerColor}; margin: 10px 0; }
          .story-message { font-size: 18px; margin: 20px 0; text-align: center; }
          .pawpoints-earned { background: ${headerColor}; color: white; padding: 15px; border-radius: 10px; text-align: center; margin: 25px 0; }
          .adopter-info { background: #e8f5e8; padding: 15px; border-radius: 10px; margin: 20px 0; text-align: center; }
          .footer { text-align: center; padding: 20px 0; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
          .highlight { color: ${headerColor}; font-weight: bold; }
          .thank-you { background: white; padding: 20px; border-left: 4px solid ${headerColor}; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">Pawner</div>
        </div>
        
        <div class="content">
          <h2>Dear ${data.userName},</h2>
          
          <div class="pet-card">
            <img src="${data.petImage}" alt="${data.petName}" class="pet-image" onerror="this.style.display='none'">
            <div class="pet-name">${data.petName}</div>
          </div>

          <div class="story-message">
            ${data.message}
          </div>

          ${data.adopter && data.storyType === 'adopted_internal' ? `
          <div class="adopter-info">
            <h3>New Home Details</h3>
            <p><strong>${data.adopter.name}</strong> in <strong>${data.adopter.city}</strong> has welcomed ${data.petName} into their family!</p>
          </div>
          ` : ''}

          <div class="pawpoints-earned">
            <h3>PawPoints Earned: +${data.pawPointsEarned}</h3>
            <p>You've received ${data.pawPointsEarned} bonus PawPoint${data.pawPointsEarned !== 1 ? 's' : ''} ${
              data.storyType === 'adopted_internal' || data.storyType === 'adopted_external' 
                ? 'for helping with this successful adoption!'
                : data.storyType === 'deceased'
                  ? 'as a compassion bonus for your support.'
                  : 'due to the administrative error.'
            }</p>
          </div>

          <div class="thank-you">
            ${data.storyType === 'adopted_internal' || data.storyType === 'adopted_external' 
              ? `<h3>Thank You for Making This Possible! </h3>
                <p>Your donation made a real difference in ${data.petName}'s life. Thanks to supporters like you, pets find loving homes every day through Pawner.</p>`
              : data.storyType === 'deceased'
                ? `<h3>Your Compassion Made a Difference </h3>
                  <p>While we're sad to lose ${data.petName}, your support provided comfort and care during their time at the shelter. Your kindness will always be remembered.</p>`
                : `<h3>Thank You for Your Understanding </h3>
                  <p>We sincerely apologize for this error. Your refund has been processed and you've received a bonus PawPoint. Thank you for your patience and continued support.</p>`
            }
          </div>

          <p>Your continued support helps more pets find the love and care they deserve. Thank you for being part of the Pawner community!</p>
          
          <p>With gratitude,<br>The Pawner Team</p>
        </div>
        
        <div class="footer">
          <p>Continue supporting pets at <a href="${data.frontendUrl}" style="color: ${headerColor};">${data.frontendUrl}</a><br>
          This is an automated message from Pawner.</p>
        </div>
      </body>
      </html>
    `;
  }


  private async sendEmail(to: string, subject: string, html: string): Promise<void> {
    if (!this.mailConfigService.isConfigured()) {
      this.logger.error('Mail service not configured - skipping email send');
      return;
    }

    const transporter = this.mailConfigService.getTransporter();
    const sender = this.mailConfigService.getDefaultSender();

    const mailOptions = {
      from: `"${sender.name}" <${sender.email}>`,
      to,
      subject,
      html,
    };

    try {
      const result = await transporter.sendMail(mailOptions);
      this.logger.log(`Email sent successfully: ${result.messageId}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}:`, error.message);
      throw new Error(`Email delivery failed: ${error.message}`);
    }
  }


  async sendBulkSuccessStoryNotifications(
    petId: string,
    storyType: 'adopted_internal' | 'adopted_external' | 'deceased' | 'error',
    adopter?: { name: string; city: string }
  ): Promise<void> {
    const donations = await this.donationRepository.find({
      where: { petId },
      relations: ['user'],
      select: ['userId'],
    });

    const uniqueUserIds = [...new Set(donations.map(d => d.userId))];

    this.logger.log(`Sending ${storyType} notifications to ${uniqueUserIds.length} users for pet ${petId}`);

    const notifications = uniqueUserIds.map(userId =>
      this.sendSuccessStoryNotification(userId, petId, storyType, adopter)
    );

    try {
      await Promise.allSettled(notifications);
      this.logger.log(`Bulk notifications sent for pet ${petId}`);
    } catch (error) {
      this.logger.error(`Some notifications failed for pet ${petId}:`, error.message);
    }
  }


  async healthCheck(): Promise<{ 
    status: 'healthy' | 'unhealthy'; 
    mail: { configured: boolean; config: any };
    lastError?: string;
  }> {
    try {
      const mailConfigured = this.mailConfigService.isConfigured();
      const config = this.mailConfigService.getConfig();

      if (!mailConfigured) {
        return {
          status: 'unhealthy',
          mail: { configured: false, config },
          lastError: 'Mail service not configured',
        };
      }

      
      const transporter = this.mailConfigService.getTransporter();
      await transporter.verify();

      return {
        status: 'healthy',
        mail: { configured: true, config },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        mail: { configured: this.mailConfigService.isConfigured(), config: this.mailConfigService.getConfig() },
        lastError: error.message,
      };
    }
  }
}