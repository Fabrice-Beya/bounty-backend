import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { TipService } from './tip.service';
import { CreateTipDto, UpdateTipDto } from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Tip } from '@prisma/client';

@Controller('tips')
@UseGuards(JwtAuthGuard)
export class TipController {
  constructor(private readonly tipService: TipService) { }

  @Post()
  async createTip(@Request() req, @Body() createTipDto: CreateTipDto): Promise<Tip> {
    return this.tipService.createTip(req.user.userId, createTipDto);
  }

  @Get()
  async getAllTips(): Promise<Tip[]> {
    return this.tipService.getAllTips();
  }

  @Get('search')
  async searchTips(@Query('query') query: string): Promise<Tip[]> {
    return this.tipService.searchTips(query);
  }

  @Post(':id/notify')
  async notifyUser(@Param('id') id: string, @Body() updateData: Partial<UpdateTipDto>) {
    return this.tipService.notifyUser(id, updateData);
  }

  // @Get('bounty/:bountyId')
  // async getTipsByBountyId(@Param('bountyId') bountyId: string): Promise<Tip[]> {
  //   return this.tipService.getTipsByBountyId(bountyId);
  // }

  @Get(':id')
  async getTipById(@Param('id') id: string): Promise<Tip> {
    return this.tipService.getTipById(id);
  }

  @Put(':id')
  async updateTip(@Param('id') id: string, @Body() updateTipDto: UpdateTipDto): Promise<Tip> {
    return this.tipService.updateTip(id, updateTipDto);
  }

  @Delete(':id')
  async deleteTip(@Param('id') id: string): Promise<void> {
    return this.tipService.deleteTip(id);
  }
}