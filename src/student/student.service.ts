import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role, User } from 'generated/prisma';
import {
  CreateUserDto,
  LoginUserDto,
  UpdateUserDto,
} from 'src/auth/dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UserPayload } from 'src/interface/user-payload.interface';

@Injectable()
export class StudentService {
  constructor(
    private prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  //create student
  async signup(dto: CreateUserDto) {
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

  //signin student
  async signin(dto: LoginUserDto) {
    const existUser = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (
      !existUser ||
      (await bcrypt.compare(existUser.password, dto.password))
    ) {
      throw new UnauthorizedException('Credetial not match');
    }
    return this.generateToken(existUser);
  }

  // update student
  async update(id: string, dto: UpdateUserDto, currentUser: UserPayload) {
    const existUser = await this.prisma.user.findUnique({
      where: { id: id },
    });
    if (!existUser) {
      throw new UnauthorizedException('User not found');
    }
    // role-base access togic
    if (currentUser.role === Role.STUDENT) {
      if (currentUser.id !== id) {
        throw new UnauthorizedException('You can just update your own profile');
      }
    }

    return this.prisma.user.update({
      where: {
        id: id,
      },
      data: {
        full_name: dto.full_name,
      },
    });
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
