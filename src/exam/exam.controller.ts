import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ExamService } from './exam.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'generated/prisma';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { CreateExamDto } from './dto/exam.dto';

@Controller('exam')
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  // create exam
  @Roles(Role.TEACHER)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Post('create')
  create(@Body() dto: CreateExamDto) {
    return this.examService.create(dto);
  }
}
