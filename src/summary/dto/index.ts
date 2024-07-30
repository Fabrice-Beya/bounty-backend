import { TipCategory, BountyCategory } from '../../common';

export class SummaryDto {
  totalBounties: number;
  totalTips: number;
  mostCommonTipCategory: TipCategory;
  mostCommonBountyCategory: BountyCategory;
  totalRevenue: number;
  totalVendors: number;
  totalShops: number;
}