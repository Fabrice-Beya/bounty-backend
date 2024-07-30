import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { RegisterDto, LoginDto } from './dto';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private userService: UserService
  ) { }

  async register(data: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        profile: {
          create: {
            username: data.username,
            fullName: 'New User',
            notificationEmail: data.email,
            enableNotification: true,
            bio: '',
            contactNumber: '',
          },
        },
      },
      include: { profile: true },
    });

    const token = this.jwtService.sign({ userId: user.id, email: user.email }, { expiresIn: '1h' });

    return {
      token,
      user: this.userService.formatUserResponse(user),
    };
  }

  async login(data: LoginDto) {
    console.log("Login Data", data);
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
      include: { profile: true },
    });

    if (!user || !(await bcrypt.compare(data.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.jwtService.sign({ userId: user.id, email: user.email }, { expiresIn: '1h' });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    return {
      token,
      user: this.userService.formatUserResponse(user),
    };
  }

  async validateUser(token: string) {
    try {
      const decoded = this.jwtService.verify(token);
      const userId = decoded.userId;

      if (!userId) {
        throw new UnauthorizedException('Invalid token');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}