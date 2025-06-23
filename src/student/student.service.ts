import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
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
import { CloudflareService } from 'src/cloudflare/cloudflare.service';

@Injectable()
export class StudentService {
  constructor(
    private prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly cloudflare: CloudflareService,
    private qe: QueryEngine,
  ) {}

  //create student
  async signup(dto: CreateUserDto) {
    const existUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existUser) {
      throw new ConflictException('User alreday exist');
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
      throw new UnauthorizedException('Credential not match');
    }
    return this.generateToken(existUser);
  }

  // get me
  async getMyProfile(currentUserId: string) {
    const currentUser = await this.prisma.user.findUnique({
      where: { id: currentUserId },
      omit: {
        password: true,
      },
    });
    if (!currentUser) throw new NotFoundException('User not found');

    let profile_photo_url: string | null = null;

    if (currentUser.profile_photo) {
      profile_photo_url = await this.cloudflare.getDownloadUrl(
        currentUser.profile_photo,
      );
    }

    return { ...currentUser, profile_photo_url: profile_photo_url };
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

    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where: q.where,
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
      }),
      this.prisma.user.count({ where: q.where }),
    ]);

    return this.qe.formatPaginatedResponse(data, total, q.page, q.limit);
  }

  //get student
  async getStudent(id: string) {
    return this.prisma.user.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        full_name: true,
        email: true,
        role: true,
        created_at: true,
        enrollments: true,
        results: true,
        is_active: true,
        _count: true,
      },
    });
  }

  //update student
  async update(id: string, dto: UpdateUserDto, currentUser: UserPayload) {
    /* ----------  Make sure the target user exists ---------------- */
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    /* ----------  Role-based access guard ------------------------- */
    if (currentUser.role === Role.STUDENT && currentUser.id !== id) {
      throw new ForbiddenException('You may update only your own profile.');
    }

    /* ----------  Build update data ------------------------------- */
    const data: Prisma.UserUpdateInput = {};
    if (dto.full_name) data.full_name = dto.full_name;

    /* ----------  Optional presigned upload URL ------------------- */
    let uploadUrl: string | undefined;
    if (dto.profile_photo) {
      const { uploadUrl: url, fileName } = await this.cloudflare.getUploadUrl(
        `users/${dto.profile_photo}`,
      );
      uploadUrl = url;
      data.profile_photo = fileName;
    }

    /* ----------  Execute update ---------------------------------- */
    const updated = await this.prisma.user.update({
      where: { id },
      data,
      omit: { password: true },
    });

    /* ----------  Return consistent response ---------------------- */
    return uploadUrl ? { ...updated, upload_url: uploadUrl } : updated;
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
        throw new ConflictException('You can just update your profile');
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

  // delete student
  async delete(id: string) {
    const existUser = await this.prisma.user.delete({
      where: { id: id },
    });
    if (!existUser) {
      throw new NotFoundException('User not found');
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
      user: {
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        id: user.id,
        is_active: user.is_active,
      },
      access_token: this.jwtService.sign(payload),
    };
  }
}
