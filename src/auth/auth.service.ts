import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateUserDto,
  LoginUserDto,
  UpdateUserDto,
} from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { User } from 'generated/prisma';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}
  //signup
  async signUp(dto: CreateUserDto) {
    const existUser = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (existUser) {
      throw new UnauthorizedException('User alreday exist');
    }

    const hashPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        ...dto,
        password: hashPassword,
        is_active: true,
      },
    });

    return this.generateToken(user);
  }

  //signin
  async signin(dto: LoginUserDto) {
    const existUser = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (
      !existUser ||
      !(await bcrypt.compare(dto.password, existUser.password))
    ) {
      throw new UnauthorizedException('invalid credentials');
    }

    return this.generateToken(existUser);
  }

  // get all
  async getAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        full_name: true,
        email: true,
        role: true,
        expert_in: true,
      },
    });
  }

  //update
  async update(id: string, dto: UpdateUserDto) {
    const existUser = await this.prisma.user.findUnique({
      where: {
        id: id,
      },
    });
    if (!existUser) {
      throw new UnauthorizedException('User not found');
    }
    return this.prisma.user.update({
      where: { id: id },
      data: {
        full_name: dto.full_name,
        expert_in: dto.expert_in,
      },
      select: {
        full_name: true,
        email: true,
        expert_in: true,
        role: true,
      },
    });
  }

  //delete
  async delete(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'User deleted successfully' };
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
