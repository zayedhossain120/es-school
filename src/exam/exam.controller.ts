import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ExamService } from './exam.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'generated/prisma';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { CreateExamDto, UpdateExamDto } from './dto/exam.dto';
import { Request } from 'express';
import { UserPayload } from 'src/interface/user-payload.interface';
import { ExamQueryDto } from './dto/exam-query.dto';

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
  // update exam
  @Roles(Role.TEACHER)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Patch(':id')
  update(@Body() dto: UpdateExamDto, @Param('id') id: string) {
    return this.examService.update(dto, id);
  }

  // get all exam
  @Roles(Role.TEACHER)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Get('all')
  getAll(@Query() raw: ExamQueryDto) {
    return this.examService.getAll(raw);
  }

  // exam by course id for student
  @Roles(Role.STUDENT, Role.TEACHER)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Get(':id')
  getExamById(@Req() req: Request, @Param('id') courseId: string) {
    const currentUser = req.user as UserPayload;
    return this.examService.getExamById(currentUser, courseId);
  }
}
