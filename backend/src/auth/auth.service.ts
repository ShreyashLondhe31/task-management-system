import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
      },
    });

    return this.generateToken(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateToken(user);
  }

  async guestLogin() {
    const guestId = `guest_${Math.random().toString(36).substring(2, 9)}`;
    const guestEmail = `${guestId}@guest.local`;

    const user = await this.prisma.user.create({
      data: {
        email: guestEmail,
        name: 'Guest User',
        isGuest: true,
        role: 'GUEST',
      },
    });

    return this.generateToken(user);
  }

  async googleLogin(req: any) {
    if (!req.user) {
      return null;
    }
    
    const { email, name } = req.user;
    
    let user = await this.prisma.user.findUnique({
      where: { email },
    });
    
    if (!user) {
      // Automatically register user if they login with Google for the first time
      user = await this.prisma.user.create({
        data: {
          email,
          name,
          role: 'USER',
          // Optionally, generate a random username from email
          username: email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '') + Math.floor(Math.random() * 1000),
        },
      });
    }
    
    return this.generateToken(user);
  }

  private generateToken(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role, isGuest: user.isGuest };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isGuest: user.isGuest,
        theme: user.theme
      }
    };
  }
}
