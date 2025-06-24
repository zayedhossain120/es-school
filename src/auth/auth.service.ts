import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateUserDto,
  LoginUserDto,
  UpdateUserDto,
} from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { Prisma, User } from 'generated/prisma';
import { CloudflareService } from 'src/cloudflare/cloudflare.service';
import { GetStudentsQueryDto } from 'src/student/dto/student-query.dto';
import { QueryEngine } from 'src/common/services/query.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly cloudflare: CloudflareService,
    private qe: QueryEngine,
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

  // get all
  async getAllUsers(raw: GetStudentsQueryDto) {
    const q = this.qe.build<
      Prisma.UserWhereInput,
      Prisma.UserOrderByWithRelationInput
    >(raw, {
      searchable: ['full_name', 'email'],
      filterable: ['full_name', 'email', 'is_active'],
      defaultSort: 'created_at',
      defaultLimit: 10,
    });

    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where: { ...q.where, role: 'TEACHER' },
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

  //update
  async update(id: string, dto: UpdateUserDto) {
    const existUser = await this.prisma.user.findUnique({ where: { id } });
    if (!existUser) throw new UnauthorizedException('User not found');

    const { updatedPayload: hello, uploadUrls } =
      await this.cloudflare.updateFilesFromPayload(
        { profile_photo: dto.profile_photo },
        { profile_photo: existUser.profile_photo },
        ['profile_photo'],
      );

    const data: Prisma.UserUpdateInput = {
      full_name: dto.full_name,
      profile_photo: hello.profile_photo as string,
    };

    const updated = await this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        full_name: true,
        profile_photo: true,
      },
    });

    return uploadUrls?.['profile_photo']
      ? { ...updated, upload_url: uploadUrls['profile_photo'] }
      : updated;
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
