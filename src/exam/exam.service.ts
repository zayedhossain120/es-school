import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateExamDto } from './dto/exam.dto';

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
}
