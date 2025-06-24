import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateExamParticipantDto } from './dto/exam-participant.dto';
import { UserPayload } from 'src/interface/user-payload.interface';
import { ParticipantQueryDto } from './dto/participant-query.dto';
import { QueryEngine } from 'src/common/services/query.service';
import { Prisma } from 'generated/prisma';

@Injectable()
export class ParticipantService {
  constructor(
    private readonly prisma: PrismaService,
    private qe: QueryEngine,
  ) {}
  // create participant
  async create(dto: CreateExamParticipantDto, currentUser: UserPayload) {
    // check user
    if (currentUser.id !== dto.student_id) {
      throw new UnauthorizedException(
        'You are not authorized to access this exam.',
      );
    }
    // check enrollment
    const isEnroll = await this.prisma.enroll.findFirst({
      where: {
        student_id: dto.student_id,
        course_id: dto.course_id,
      },
    });

    if (!isEnroll) {
      throw new NotFoundException('Participation not permitted.');
    }

    return this.prisma.examParticipant.create({ data: { ...dto } });
  }

  // update
  async update(id: string, currentUserId: string, answer: string) {
    const isParticipant = await this.prisma.examParticipant.findUnique({
      where: {
        id: id,
        student_id: currentUserId,
      },
    });

    if (!isParticipant) {
      throw new UnauthorizedException('You are not permitted to update');
    }

    return this.prisma.examParticipant.update({
      where: { id: id },
      data: {
        answer: answer,
      },
    });
  }

  // my participant for student
  async myParticipant(currentUserId: string) {
    return this.prisma.examParticipant.findMany({
      where: {
        student_id: currentUserId,
      },
      select: {
        id: true,
        answer: true,
        result: true,
      },
    });
  }

  // get all
  async getAll(raw: ParticipantQueryDto) {
    const q = this.qe.build<
      Prisma.ExamParticipantWhereInput,
      Prisma.ExamParticipantOrderByWithRelationInput
    >(raw, {
      searchable: ['answer'],
      filterable: ['answer'],
      defaultSort: 'created_at',
      defaultLimit: 10,
    });

    try {
      const [data, total] = await this.prisma.$transaction([
        this.prisma.examParticipant.findMany({
          where: q.where,
          orderBy: q.orderBy,
          skip: q.skip,
          take: q.take,
        }),
        this.prisma.examParticipant.count({ where: q.where }),
      ]);

      return this.qe.formatPaginatedResponse(data, total, q.page, q.limit);
    } catch (err) {
      console.error('CourseService.getAllCourse error ➜', err);
      throw err;
    }
  }

  // get all participant by course id
  async getallParticipantByCourseId(id: string) {
    return this.prisma.examParticipant.findMany({
      where: {
        course_id: id,
      },
    });
  }
}
