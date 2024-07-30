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

  async notifyUser(id: string, updateData: Partial<UpdateTipDto>) {
    const tip = await this.prisma.tip.findUnique({ where: { id } });
    if (!tip) {
      throw new NotFoundException(`Tip with ID ${id} not found`);
    }

    let message = '';
    if (updateData.priority) {
      message += ` Your tip has been updated: Priority changed to ${updateData.priority}.`;
    }
    if (updateData.status) {
      message += ` Your tip has been updated:Status changed to ${updateData.status}.`;
    }
    if (updateData.reward !== undefined) {
      message += ` Congratulations! A reward of R${updateData.reward} has been assigned to your tip. Please visit the Multichoice Piracy Bounty Portal and use your reference number ${tip.id.slice(0, 8).toUpperCase()} to claim your reward.`;
    }

    // Send notification to the user
    if (tip.telegramUserId) {
      await this.telegramService.sendMessage(tip.telegramUserId, message);
    }

    return { success: true, message };
  }

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