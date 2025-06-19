import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ExamService } from './exam.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'generated/prisma';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { CreateExamDto } from './dto/exam.dto';
import { Request } from 'express';
import { UserPayload } from 'src/interface/user-payload.interface';

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

  // get all exam
  @Roles(Role.TEACHER)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Get('all')
  getAll() {
    return this.examService.getAll();
  }

  // exam by course id for student
  @Roles(Role.STUDENT)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Get(':id')
  getMyExam(@Req() req: Request, @Param('id') courseId: string) {
    const currentUser = req.user as UserPayload;
    return this.examService.getMyExam(currentUser, courseId);
  }
}
