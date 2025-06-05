import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateResultDto } from './dto/result.dto';

@Injectable()
export class ResultService {
  constructor(private prisma: PrismaService) {}
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
}
