import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { SummaryDto } from './dto';
import { TipCategory, BountyCategory } from '../common';

@Injectable()
export class SummaryService {
  constructor(private prisma: PrismaService) {}

  async getSummary(): Promise<SummaryDto> {
    const [
      totalBounties,
      totalTips,
      mostCommonTipCategory,
      mostCommonBountyCategory,
      totalRevenue,
    ] = await Promise.all([
      this.prisma.bounty.count(),
      this.prisma.tip.count(),
      this.getMostCommonTipCategory(),
      this.getMostCommonBountyCategory(),
      this.getTotalRevenue(),
    ]);

    // Note: totalVendors and totalShops are not part of our current schema
    // You might need to add these to your schema or calculate them differently
    const totalVendors = 0;
    const totalShops = 0;

    return {
      totalBounties,
      totalTips,
      mostCommonTipCategory,
      mostCommonBountyCategory,
      totalRevenue,
      totalVendors,
      totalShops,
    };
  }

  private async getMostCommonTipCategory(): Promise<TipCategory> {
    const categoryCounts = await this.prisma.tip.groupBy({
      by: ['category'],
      _count: {
        category: true,
      },
      orderBy: {
        _count: {
          category: 'desc',
        },
      },
      take: 1,
    });

    return categoryCounts[0]?.category as TipCategory || TipCategory.GENERAL;
  }

  private async getMostCommonBountyCategory(): Promise<BountyCategory> {
    const categoryCounts = await this.prisma.bounty.groupBy({
      by: ['category'],
      _count: {
        category: true,
      },
      orderBy: {
        _count: {
          category: 'desc',
        },
      },
      take: 1,
    });

    return categoryCounts[0]?.category as BountyCategory || BountyCategory.OTHER;
  }

  private async getTotalRevenue(): Promise<number> {
    const result = await this.prisma.bounty.aggregate({
      _sum: {
        reward: true,
      },
    });

    return result._sum.reward || 0;
  }
}