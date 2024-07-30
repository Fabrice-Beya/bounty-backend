import { Module } from '@nestjs/common';
import { TipService } from './tip.service';
import { TipController } from './tip.controller';
import { PrismaService } from '../prisma.service';
import { TelegramModule } from 'src/telegram/telegram.module';

@Module({
  imports: [TelegramModule],
  providers: [TipService, PrismaService],
  controllers: [TipController],
  exports: [TipService],
})
export class TipModule {}