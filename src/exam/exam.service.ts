import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateExamDto, UpdateExamDto } from './dto/exam.dto';
import { UserPayload } from 'src/interface/user-payload.interface';
import { ExamQueryDto } from './dto/exam-query.dto';
import { QueryEngine } from 'src/common/services/query.service';
import { Prisma } from 'generated/prisma';

@Injectable()
export class ExamService {
  constructor(
    private readonly prisma: PrismaService,
    private qe: QueryEngine,
  ) {}
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
  async getAll(raw: ExamQueryDto) {
    const q = this.qe.build<
      Prisma.ExamWhereInput,
      Prisma.ExamOrderByWithRelationInput
    >(raw, {
      searchable: ['title', 'description'],
      filterable: ['title', 'description', 'course_id'],
      defaultSort: 'created_at',
      defaultLimit: 10,
    });

    try {
      const [data, total] = await this.prisma.$transaction([
        this.prisma.exam.findMany({
          where: q.where,
          orderBy: q.orderBy,
          skip: q.skip,
          take: q.take,
          select: {
            id: true,
            title: true,
            description: true,
            course_id: true,
          },
        }),
        this.prisma.exam.count({ where: q.where }),
      ]);

      console.log(data);

      return this.qe.formatPaginatedResponse(data, total, q.page, q.limit);
    } catch (err) {
      console.error('Exam error ➜', err);
      throw err;
    }
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
