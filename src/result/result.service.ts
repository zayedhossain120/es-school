import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateResultDto, UpdateResultDto } from './dto/result.dto';
import { UserPayload } from 'src/interface/user-payload.interface';
import { QueryEngine } from 'src/common/services/query.service';

@Injectable()
export class ResultService {
  constructor(
    private prisma: PrismaService,
    private qe: QueryEngine,
  ) {}
  // create a result
  async create(dto: CreateResultDto) {
    const isParticipant = await this.prisma.examParticipant.findUnique({
      where: {
        id: dto.participant_id,
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

  // my result for studnt
  async myResult(currentUser: UserPayload) {
    return this.prisma.result.findMany({
      where: { student_id: currentUser.id },
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

  // delete result for teacher

  async delete(id: string) {
    const isResult = await this.prisma.result.findUnique({
      where: {
        id: id,
      },
    });

    if (!isResult) {
      throw new NotFoundException('Result not found');
    }
    return this.prisma.result.delete({
      where: { id: id },
    });
  }
}
