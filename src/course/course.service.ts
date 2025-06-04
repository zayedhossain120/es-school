import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCourseDto, UpdateCourseDto } from './dto/course.dto';
import { UserPayload } from 'src/interface/user-payload.interface';
import { Role } from 'generated/prisma';

@Injectable()
export class CourseService {
  constructor(private prisma: PrismaService) {}
  // create course
  async createCourse(dto: CreateCourseDto, currentUser: UserPayload) {
    if (currentUser.role !== Role.TEACHER) {
      throw new UnauthorizedException('Only teachers can create courses');
    }

    return this.prisma.course.create({
      data: {
        ...dto,
        teacher_id: currentUser.id!,
      },
    });
  }

  //get all course
  async getAllCourse() {
    return this.prisma.course.findMany({
      select: {
        id: true,
        title: true,
        teacher_id: true,
        _count: true,
      },
    });
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

    return this.prisma.course.update({
      where: { id },
      data: dto,
    });
  }

  // get a course by id
  async getCourseById(id: string) {
    return this.prisma.course.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        title: true,
        module: true,
        teacher_id: true,
        created_at: true,
        updated_at: true,
        _count: true,
      },
    });
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
