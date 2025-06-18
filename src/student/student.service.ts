import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma, Role, User } from 'generated/prisma';
import {
  CreateUserDto,
  LoginUserDto,
  UpdatePasswordDto,
  UpdateUserDto,
} from 'src/auth/dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UserPayload } from 'src/interface/user-payload.interface';
import { QueryEngine } from 'src/common/services/query.service';
import { GetStudentsQueryDto } from './dto/student-query.dto';

@Injectable()
export class StudentService {
  constructor(
    private prisma: PrismaService,
    private readonly jwtService: JwtService,
    private qe: QueryEngine,
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
        is_active: true,
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
      !(await bcrypt.compare(dto.password, existUser.password))
    ) {
      throw new UnauthorizedException('Credetial not match');
    }
    return this.generateToken(existUser);
  }

  // get all student
  async getAllStudent(raw: GetStudentsQueryDto) {
    const q = this.qe.build<
      Prisma.UserWhereInput,
      Prisma.UserOrderByWithRelationInput
    >(raw, {
      searchable: ['full_name', 'email'],
      filterable: ['full_name', 'email', 'role', 'is_active'],
      defaultSort: 'created_at',
      defaultLimit: 10,
    });

    return this.prisma.user.findMany({
      where: { ...q.where, role: Role.STUDENT },
      orderBy: q.orderBy,
      skip: q.skip,
      take: q.take,
      select: {
        id: true,
        full_name: true,
        email: true,
        role: true,
        is_active: true,
      },
    });
  }

  //get student
  async getStudent(id: string) {
    return this.prisma.user.findMany({
      where: {
        id: id,
      },
      select: {
        id: true,
        full_name: true,
        email: true,
        role: true,
        expert_in: true,
        _count: true,
        created_at: true,
        enrollments: true,
        techer_courses: true,
        results: true,
        is_active: true,
      },
    });
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
      return this.prisma.user.update({
        where: {
          id: id,
        },
        data: {
          full_name: dto.full_name,
        },
        select: {
          full_name: true,
          email: true,
          id: true,
        },
      });
    }

    if (currentUser.role === Role.TEACHER) {
      return this.prisma.user.update({
        where: {
          id: id,
        },
        data: {
          full_name: dto.full_name,
        },
        select: {
          full_name: true,
          email: true,
          id: true,
        },
      });
    }
  }

  // update password
  async updatePassword(
    id: string,
    dto: UpdatePasswordDto,
    currentUser: UserPayload,
  ) {
    const existUser = await this.prisma.user.findUnique({
      where: { id: id },
    });
    if (currentUser.role === Role.STUDENT) {
      if (currentUser.id !== id) {
        throw new UnauthorizedException('You can just update your profile');
      }
      if (
        !existUser ||
        (await bcrypt.compare(dto.old_password, existUser.password))
      ) {
        throw new UnauthorizedException('Credential not match');
      }

      const hashPassword = await bcrypt.hash(dto.new_password, 10);
      await this.prisma.user.update({
        where: {
          id: id,
        },
        data: {
          password: hashPassword,
        },
      });
      return {
        message: 'Update password successfully',
      };
    }

    if (currentUser.role === Role.TEACHER) {
      if (!existUser) {
        throw new UnauthorizedException('Credential not match');
      }
      const hashPassword = await bcrypt.hash(dto.new_password, 10);
      await this.prisma.user.update({
        where: {
          id: id,
        },
        data: {
          password: hashPassword,
        },
      });
      return {
        message: 'Update password successfully',
      };
    }
  }

  async delete(id: string) {
    const existUser = await this.prisma.user.delete({
      where: { id: id },
    });
    if (!existUser) {
      throw new UnauthorizedException('User not found');
    }
    return await this.prisma.user.delete({
      where: { id: id },
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
