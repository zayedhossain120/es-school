import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEnrollDto } from './dto/enroll.dto';
import { UserPayload } from 'src/interface/user-payload.interface';
import { Role } from 'generated/prisma';

@Injectable()
export class EnrollService {
  constructor(private prisma: PrismaService) {}
  // enroll course by studnet
  async create(dto: CreateEnrollDto, currentUser: UserPayload) {
    if (dto.student_id !== currentUser.id) {
      throw new UnauthorizedException(
        'You are not authorized to enroll in a course for another student.',
      );
    }
    // check course availabity
    const existCourse = await this.prisma.course.findUnique({
      where: {
        id: dto.course_id,
      },
    });
    if (!existCourse) {
      throw new NotFoundException('Course not found');
    }

    // check if alreday enrolled
    const alreadyEnrolled = await this.prisma.enroll.findFirst({
      where: {
        student_id: dto.student_id,
        course_id: dto.course_id,
      },
    });

    if (alreadyEnrolled) {
      throw new UnauthorizedException(
        'You are already enrolled in this course',
      );
    }

    return this.prisma.enroll.create({
      data: {
        student_id: dto.student_id,
        course_id: dto.course_id,
      },
    });
  }

  // get all course by teacher
  async getAll() {
    return this.prisma.enroll.findMany();
  }

  // get my enroll for student
  async getMyEnroll(currentUser: UserPayload) {
    return this.prisma.enroll.findMany({
      where: {
        student_id: currentUser.id,
      },
      select: {
        id: true,
        student_id: true,
        course_id: true,
        created_at: true,
        courses: true,
      },
    });
  }

  // get a single enroll by id (Teacher only)
  async getById(id: string) {
    return this.prisma.enroll.findUnique({
      where: {
        id: id,
      },
    });
  }

  // delete a enrollment

  async delete(id: string, currentUser: UserPayload) {
    // check availability
    const enrollment = await this.prisma.enroll.findUnique({ where: { id } });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    if (
      currentUser.role === Role.STUDENT &&
      enrollment.student_id !== currentUser.id
    ) {
      throw new ForbiddenException('You cannot delete this enrollment');
    }

    return this.prisma.enroll.delete({ where: { id } });
  }
}
