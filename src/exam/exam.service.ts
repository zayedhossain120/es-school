import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateExamDto, UpdateExamDto } from './dto/exam.dto';
import { UserPayload } from 'src/interface/user-payload.interface';

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

  // update exam

  async update(dto: UpdateExamDto, id: string) {
    const isExam = await this.prisma.exam.findUnique({
      where: { id: id },
    });
    if (!isExam) {
      throw new NotFoundException('Exam not found');
    }
    return this.prisma.exam.update({
      where: { id: id },
      data: { ...dto },
    });
  }

  //get all exam for teacher
  async getAll() {
    return this.prisma.exam.findMany();
  }

  // get exam by id
  async getExamById(currentUser: UserPayload, courseId: string) {
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
}
