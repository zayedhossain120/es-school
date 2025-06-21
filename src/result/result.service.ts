import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateResultDto, UpdateResultDto } from './dto/result.dto';
import { UserPayload } from 'src/interface/user-payload.interface';

@Injectable()
export class ResultService {
  constructor(private prisma: PrismaService) {}
  // create a result
  async create(dto: CreateResultDto) {
    const isParticipant = await this.prisma.examParticipant.findUnique({
      where: {
        id: dto.exam_id,
      },
    });

    if (!isParticipant) {
      throw new NotFoundException('Participant not found');
    }

    return this.prisma.result.create({ data: { ...dto } });
  }

  // get all result for teacher
  async getAll() {
    return this.prisma.result.findMany();
  }

  // get a result by id for teacher
  async getResultById(resultId: string) {
    return this.prisma.result.findUnique({
      where: {
        id: resultId,
      },
    });
  }

  // update a result by teacher
  async updateResultById(dto: UpdateResultDto, resultId: string) {
    return this.prisma.result.update({
      where: {
        id: resultId,
      },
      data: {
        ...dto,
      },
    });
  }

  // my result for studnt
  async myResult(currentUser: UserPayload) {
    return this.prisma.result.findMany({
      where: { student_id: currentUser.id },
    });
  }
}
