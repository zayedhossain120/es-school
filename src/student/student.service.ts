import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'generated/prisma';
import { CreateUserDto } from 'src/auth/dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class StudentService {
  constructor(
    private prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  //create student
  async create(dto: CreateUserDto) {
    const existUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existUser) {
      throw new UnauthorizedException('User alreday exist');
    }
    const hashPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        ...dto,
        password: hashPassword,
      },
    });

    return this.generateToken(user);
  }

  // generate access token by user details
  private generateToken(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        ...payload,
        id: user.id,
      },
    };
  }
}
