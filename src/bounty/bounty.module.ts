import { Module } from '@nestjs/common';
import { BountyService } from './bounty.service';
import { BountyController } from './bounty.controller';
import { PrismaService } from '../prisma.service';

@Module({
  providers: [BountyService, PrismaService],
  controllers: [BountyController],
  exports: [BountyService],
})
export class BountyModule {}