import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateTipDto, UpdateTipDto } from './dto';
import { Tip, TipCategory } from '@prisma/client';
import { TelegramService } from 'src/telegram/telegram.service';

@Injectable()
export class TipService {
  constructor(
    private prisma: PrismaService,
    private telegramService: TelegramService
  ) { }

  async createTip(userId: string, createTipDto: CreateTipDto): Promise<Tip> {
    let user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      user = await this.prisma.user.create({
        data: { id: userId, email: `telegram_${userId}@example.com`, password: 'telegram_user' }
      });
    }
    const { ...tipData } = createTipDto;
    return this.prisma.tip.create({
      data: {
        ...tipData,
        user: { connect: { id: userId } },
      },
    });
  }

  // async createTelegramTip(telegramUserId: string, createTipDto: CreateTipDto): Promise<Tip> {
  //   let telegramUser = await this.prisma.telegramUser.findUnique({ where: { id: telegramUserId } });
  //   if (!telegramUser) {
  //     telegramUser = await this.prisma.telegramUser.create({
  //       data: { id: telegramUserId }
  //     });
  //   }

  //   const { ...tipData } = createTipDto;
  //   return this.prisma.tip.create({
  //     data: {
  //       ...tipData,
  //       telegramUser: { connect: { id: telegramUserId } },
  //     },
  //   });
  // }

  async notifyUser(id: string, updateData: Partial<UpdateTipDto>) {
    const tip = await this.prisma.tip.findUnique({ where: { id } });
    if (!tip) {
      throw new NotFoundException(`Tip with ID ${id} not found`);
    }

    let message = 'Your tip has been updated:';
    if (updateData.priority) {
      message += ` Priority changed to ${updateData.priority}.`;
    }
    if (updateData.status) {
      message += ` Status changed to ${updateData.status}.`;
    }
    if (updateData.reward !== undefined) {
      message += ` Reward updated to $${updateData.reward}.`;
    }

    // Send notification to the user
    if (tip.telegramUserId) {
      await this.telegramService.sendMessage(tip.telegramUserId, message);
    }

    return { success: true, message };
  }

  // private mapCategory(category: string): TipCategory {
  //   switch (category.toLowerCase()) {
  //     case 'general':
  //       return TipCategory.GENERAL;
  //     case 'location':
  //       return TipCategory.LOCATION;
  //     case 'person':
  //       return TipCategory.PERSON;
  //     case 'event':
  //       return TipCategory.EVENT;
  //     default:
  //       return TipCategory.OTHER;
  //   }
  // }

  async getAllTips(): Promise<Tip[]> {
    return this.prisma.tip.findMany();
  }

  async getTipById(id: string): Promise<Tip> {
    const tip = await this.prisma.tip.findUnique({ where: { id } });
    if (!tip) {
      throw new NotFoundException(`Tip with ID ${id} not found`);
    }
    return tip;
  }

  async updateTip(id: string, updateTipDto: UpdateTipDto): Promise<Tip> {
    const tip = await this.prisma.tip.findUnique({ where: { id } });
    if (!tip) {
      throw new NotFoundException(`Tip with ID ${id} not found`);
    }
    return this.prisma.tip.update({
      where: { id },
      data: updateTipDto,
    });
  }

  async deleteTip(id: string): Promise<void> {
    const tip = await this.prisma.tip.findUnique({ where: { id } });
    if (!tip) {
      throw new NotFoundException(`Tip with ID ${id} not found`);
    }
    await this.prisma.tip.delete({ where: { id } });
  }

  // async getTipsByBountyId(bountyId: string): Promise<Tip[]> {
  //   return this.prisma.tip.findMany({
  //     where: { bountyId },
  //   });
  // }

  async searchTips(query: string): Promise<Tip[]> {
    return this.prisma.tip.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
    });
  }
}