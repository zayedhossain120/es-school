import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
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

  // enroll a course
  @Roles(Role.STUDENT)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Post('create')
  create(@Body() dto: CreateEnrollDto, @Req() req: Request) {
    const currentUser = req.user as UserPayload;
    return this.enrollService.create(dto, currentUser);
  }
}
