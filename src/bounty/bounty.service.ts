import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateBountyDto, UpdateBountyDto } from './dto';
import { Bounty } from '@prisma/client';

@Injectable()
export class BountyService {
  constructor(private prisma: PrismaService) {}

  async createBounty(userId: string, createBountyDto: CreateBountyDto): Promise<Bounty> {
    return this.prisma.bounty.create({
      data: {
        ...createBountyDto,
        user: { connect: { id: userId } },
      },
    });
  }

  async getAllBounties(): Promise<Bounty[]> {
    return this.prisma.bounty.findMany();
  }

  async getBountyById(id: string): Promise<Bounty> {
    const bounty = await this.prisma.bounty.findUnique({ where: { id } });
    if (!bounty) {
      throw new NotFoundException(`Bounty with ID ${id} not found`);
    }
    return bounty;
  }

  async updateBounty(id: string, updateBountyDto: UpdateBountyDto): Promise<Bounty> {
    const bounty = await this.prisma.bounty.findUnique({ where: { id } });
    if (!bounty) {
      throw new NotFoundException(`Bounty with ID ${id} not found`);
    }
    return this.prisma.bounty.update({
      where: { id },
      data: updateBountyDto,
    });
  }

  async deleteBounty(id: string): Promise<void> {
    const bounty = await this.prisma.bounty.findUnique({ where: { id } });
    if (!bounty) {
      throw new NotFoundException(`Bounty with ID ${id} not found`);
    }
    await this.prisma.bounty.delete({ where: { id } });
  }

  async searchBounties(query: string): Promise<Bounty[]> {
    return this.prisma.bounty.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
    });
  }
}