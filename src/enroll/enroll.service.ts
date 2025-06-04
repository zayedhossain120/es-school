import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEnrollDto } from './dto/enroll.dto';
import { UserPayload } from 'src/interface/user-payload.interface';

@Injectable()
export class EnrollService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateEnrollDto, currentUser: UserPayload) {
    if (dto.student_id !== currentUser.id) {
      throw new UnauthorizedException(
        'You are not authorized to enroll in a course for another student.',
      );
    }
    return this.prisma.enroll.create({
      data: {
        student_id: dto.student_id,
        course_id: dto.course_id,
        enrolled_at: new Date(),
      },
    });
  }
}
