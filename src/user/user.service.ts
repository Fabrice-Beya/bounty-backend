import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UpdateUserProfileDto } from './dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getUserProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });
    return user.profile;
  }

  async updateUserProfile(userId: string, data: UpdateUserProfileDto) {
    await this.prisma.profile.update({
      where: { userId },
      data,
    });
  }

  formatUserResponse(user: any) {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
      lastLogin: user.lastLogin.toISOString(),
      profile: {
        username: user.profile.username,
        fullName: user.profile.fullName,
        notificationEmail: user.profile.notificationEmail,
        enableNotification: user.profile.enableNotification,
        bio: user.profile.bio,
        contactNumber: user.profile.contactNumber,
      },
    };
  }
}