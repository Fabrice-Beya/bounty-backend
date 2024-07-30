import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateUserProfileDto } from './dto';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  async getProfile(@Request() req) {
    return this.userService.getUserProfile(req.user.userId);
  }

  @Put('profile')
  async updateProfile(@Request() req, @Body() updateProfileDto: UpdateUserProfileDto) {
    await this.userService.updateUserProfile(req.user.userId, updateProfileDto);
    return this.userService.getUserProfile(req.user.userId);
  }
}