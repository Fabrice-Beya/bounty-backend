import { IsString, IsNumber, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { BountyPriority, BountyCategory, BountyStatus } from '@prisma/client';

export class CreateBountyDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsNumber()
  reward: number;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsEnum(BountyCategory)
  category: BountyCategory;

  @IsEnum(BountyPriority)
  priority: BountyPriority;
}


export class UpdateBountyDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  reward?: number;

  @IsOptional()
  @IsEnum(BountyStatus)
  status?: BountyStatus;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsEnum(BountyCategory)
  category?: BountyCategory;

  @IsOptional()
  @IsEnum(BountyPriority)
  priority?: BountyPriority;
}