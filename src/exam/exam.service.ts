import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateExamDto } from './dto/exam.dto';
import { UserPayload } from 'src/interface/user-payload.interface';
import { CreateResultDto } from 'src/result/dto/result.dto';

@Injectable()
export class ExamService {
  constructor(private readonly prisma: PrismaService) {}
  // create exam
  async create(dto: CreateExamDto) {
    // check course availability
    const existCourse = await this.prisma.course.findUnique({
      where: {
        id: dto.course_id,
      },
    });
    if (!existCourse) {
      throw new NotFoundException('Course not found');
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
      throw new ConflictException('You are not enrolled in this course.');
    }

    // 2. Get exams for the course
    const courseExams = await this.prisma.exam.findMany({
      where: {
        course_id: courseId,
      },
    });

    if (courseExams.length === 0) {
      throw new NotFoundException('This course has no exams.');
    }

    return courseExams;
  }

  // exam participant for student
  async participant(dto: CreateResultDto) {
    const existingResult = await this.prisma.result.findFirst({
      where: {
        student_id: dto.student_id,
        exam_id: dto.exam_id,
      },
    });

    if (existingResult) {
      throw new Error('You have already participated in this exam.');
    }

    return this.prisma.result.create({
      data: {
        ...dto,
      },
    });
  }
}
