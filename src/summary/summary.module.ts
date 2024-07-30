import { Module } from '@nestjs/common';
import { SummaryService } from './summary.service';
import { SummaryController } from './summary.controller';
import { PrismaService } from '../prisma.service';

@Module({
  providers: [SummaryService, PrismaService],
  controllers: [SummaryController],
  exports: [SummaryService],
})
export class SummaryModule {}