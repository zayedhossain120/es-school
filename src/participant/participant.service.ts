import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateExamParticipantDto } from './dto/exam-participant.dto';
import { UserPayload } from 'src/interface/user-payload.interface';

@Injectable()
export class ParticipantService {
  constructor(private readonly prisma: PrismaService) {}
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
    });
  }

  // get all
  async getAll() {
    return this.prisma.examParticipant.findMany();
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
