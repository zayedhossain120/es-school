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

  // get all
}
