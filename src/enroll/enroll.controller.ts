import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { EnrollService } from './enroll.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'generated/prisma';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { CreateEnrollDto } from './dto/enroll.dto';
import { Request } from 'express';
import { UserPayload } from 'src/interface/user-payload.interface';

@Controller('enroll')
export class EnrollController {
  constructor(private readonly enrollService: EnrollService) {}

  // enroll a course by student
  @Roles(Role.STUDENT)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Post('create')
  create(@Body() dto: CreateEnrollDto, @Req() req: Request) {
    const currentUser = req.user as UserPayload;
    return this.enrollService.create(dto, currentUser);
  }

  // get my enrolled for student
  @Roles(Role.STUDENT)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Get('me')
  getMyEnroll(@Req() req: Request) {
    const currentUser = req.user as UserPayload;
    return this.enrollService.getMyEnroll(currentUser);
  }

  // get all enroll by teache
  @Roles(Role.TEACHER)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Get('all')
  getAll() {
    return this.enrollService.getAll();
  }

  // get a enroll
  @Roles(Role.TEACHER, Role.STUDENT)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Get(':id')
  getById(@Param('id') id: string) {
    return this.enrollService.getById(id);
  }

  // delete enrollment
  @Roles(Role.TEACHER, Role.STUDENT)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Delete(':id')
  delete(@Param('id') id: string, @Req() req: Request) {
    const currentUser = req.user as UserPayload;
    return this.enrollService.delete(id, currentUser);
  }
}
