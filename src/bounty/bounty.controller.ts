import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { BountyService } from './bounty.service';
import { CreateBountyDto, UpdateBountyDto } from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Bounty } from '@prisma/client';

@Controller('bounties')
@UseGuards(JwtAuthGuard)
export class BountyController {
  constructor(private readonly bountyService: BountyService) {}

  @Post()
  async createBounty(@Request() req, @Body() createBountyDto: CreateBountyDto): Promise<Bounty> {
    return this.bountyService.createBounty(req.user.userId, createBountyDto);
  }

  @Get()
  async getAllBounties(): Promise<Bounty[]> {
    return this.bountyService.getAllBounties();
  }

  @Get('search')
  async searchBounties(@Query('query') query: string): Promise<Bounty[]> {
    return this.bountyService.searchBounties(query);
  }

  @Get(':id')
  async getBountyById(@Param('id') id: string): Promise<Bounty> {
    return this.bountyService.getBountyById(id);
  }

  @Put(':id')
  async updateBounty(@Param('id') id: string, @Body() updateBountyDto: UpdateBountyDto): Promise<Bounty> {
    return this.bountyService.updateBounty(id, updateBountyDto);
  }

  @Delete(':id')
  async deleteBounty(@Param('id') id: string): Promise<void> {
    return this.bountyService.deleteBounty(id);
  }
}