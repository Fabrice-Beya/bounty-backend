import { IsString, IsEnum, IsDateString, IsOptional, IsNumber, Min } from 'class-validator';
import { TipCategory, TipStatus, TipPriority } from '@prisma/client';

export class CreateTipDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsEnum(TipCategory)
  category: TipCategory;

  @IsDateString()
  datetime: string;

  @IsString()
  location: string;

  @IsEnum(TipPriority)
  priority: TipPriority;

  @IsNumber()
  @Min(0)
  reward: number;
}

export class UpdateTipDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(TipCategory)
  category?: TipCategory;

  @IsOptional()
  @IsDateString()
  datetime?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsEnum(TipStatus)
  status?: TipStatus;

  @IsOptional()
  @IsEnum(TipPriority)
  priority?: TipPriority;

  @IsOptional()
  @IsNumber()
  @Min(0)
  reward?: number;
}