import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateExamDto } from './dto/exam.dto';
import { UserPayload } from 'src/interface/user-payload.interface';

@Injectable()
export class ExamService {
  constructor(private readonly prisma: PrismaService) {}
  // create exam
  async create(dto: CreateExamDto) {
    // check course availabity
    const existCourse = await this.prisma.course.findUnique({
      where: {
        id: dto.course_id,
      },
    });
    if (!existCourse) {
      throw new UnauthorizedException('Course not found');
    }
    return this.prisma.exam.create({
      data: {
        ...dto,
      },
    });
  }

  //get all exam for teacher
  async getAll() {
    return this.prisma.exam.findMany();
  }

  // get my exam for student
  async getMyExam(currentUser: UserPayload, courseId: string) {
    // 1. Check if the user is enrolled in the course
    const isEnrolled = await this.prisma.enroll.findFirst({
      where: {
        student_id: currentUser.id,
        course_id: courseId,
      },
    });

    if (!isEnrolled) {
      throw new UnauthorizedException('You are not enrolled in this course.');
    }

    // 2. Get exams for the course
    const courseExams = await this.prisma.exam.findMany({
      where: {
        course_id: courseId,
      },
    });

    if (courseExams.length === 0) {
      throw new UnauthorizedException('This course has no exams.');
    }

    return courseExams;
  }
}
