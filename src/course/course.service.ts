import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCourseDto, UpdateCourseDto } from './dto/course.dto';
import { UserPayload } from 'src/interface/user-payload.interface';
import { Prisma, Role } from 'generated/prisma';
import { QueryEngine } from 'src/common/services/query.service';
import { GetCoursesQueryDto } from './dto/courses-query.dto';
import { CloudflareService } from 'src/cloudflare/cloudflare.service';

@Injectable()
export class CourseService {
  constructor(
    private prisma: PrismaService,
    private qe: QueryEngine,
    private readonly cloudflare: CloudflareService,
  ) {}
  // create course
  async createCourse(dto: CreateCourseDto, currentUser: UserPayload) {
    if (currentUser.role !== Role.TEACHER) {
      throw new UnauthorizedException('Only teachers can create courses');
    }

    /* ---------- optional thumbnail presign ------------------------ */
    let uploadUrl: string | undefined;
    let thumbnail: string | undefined;

    if (dto.course_thumbnail) {
      const { uploadUrl: url, fileName } = await this.cloudflare.getUploadUrl(
        dto.course_thumbnail,
      );
      uploadUrl = url;
      thumbnail = fileName; // store only the key
    }

    /* ---------- build data object --------------------------------- */
    const data: Prisma.CourseCreateInput = {
      title: dto.title,
      module: dto.module,
      teachers: { connect: { id: currentUser.id } },
      ...(thumbnail && { course_thumbnail: thumbnail }),
    };

    /* ---------- write to DB --------------------------------------- */
    const created = await this.prisma.course.create({
      data,
      select: {
        id: true,
        title: true,
        module: true,
        course_thumbnail: true,
      },
    });

    /* ---------- return consistent response ------------------------ */
    return uploadUrl ? { ...created, upload_url: uploadUrl } : created;
  }

  // get all course
  async getAllCourse(raw: GetCoursesQueryDto) {
    const q = this.qe.build<
      Prisma.CourseWhereInput,
      Prisma.CourseOrderByWithRelationInput
    >(raw, {
      searchable: ['title', 'module'],
      filterable: ['title', 'module', 'teacher_id'],
      defaultSort: 'created_at',
      defaultLimit: 10,
    });

    try {
      const [data, total] = await this.prisma.$transaction([
        this.prisma.course.findMany({
          where: q.where,
          orderBy: q.orderBy,
          skip: q.skip,
          take: q.take,
          select: {
            id: true,
            title: true,
            module: true,
            teacher_id: true,
            // _count: true,
          },
        }),
        this.prisma.course.count({ where: q.where }),
      ]);

      return this.qe.formatPaginatedResponse(data, total, q.page, q.limit);
    } catch (err) {
      console.error('CourseService.getAllCourse error ➜', err);
      throw err;
    }
  }

  // update course
  async updateCourse(
    id: string,
    dto: UpdateCourseDto,
    currentUser: UserPayload,
  ) {
    const course = await this.prisma.course.findUnique({ where: { id } });

    if (!course || course.teacher_id !== currentUser.id) {
      throw new UnauthorizedException('You can only update your own courses');
    }

    const { updatedPayload, uploadUrls } =
      await this.cloudflare.updateFilesFromPayload(
        {
          course_thumbnail: dto.course_thumbnail,
        },
        {
          course_thumbnail: course.course_thumbnail,
        },
        ['course_thumbnail'],
      );

    const data: Prisma.CourseUpdateInput = {
      ...dto,
      course_thumbnail: updatedPayload.course_thumbnail as string,
    };

    const updated = await this.prisma.course.update({
      where: { id },
      data: { ...data },
    });

    return uploadUrls.course_thumbnail
      ? { ...updated, upload_url: uploadUrls.course_thumbnail }
      : updated;
  }

  // get a course by id
  async getCourseById(id: string) {
    const course = await this.prisma.course.findUnique({
      where: {
        id: id,
      },
    });

    let coursetTumbnail: string | null = null;

    if (course?.course_thumbnail) {
      coursetTumbnail = await this.cloudflare.getDownloadUrl(
        course?.course_thumbnail,
      );
    }

    return { ...course, coursetTumbnail };
  }

  // delete course
  async deleteCourse(id: string, currentUser: UserPayload) {
    const course = await this.prisma.course.findUnique({ where: { id } });

    if (!course || course.teacher_id !== currentUser.id) {
      throw new UnauthorizedException('You can only delete your own courses');
    }

    return this.prisma.course.delete({ where: { id } });
  }
}
