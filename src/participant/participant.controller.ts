import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ParticipantService } from './participant.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'generated/prisma';
import { CreateExamParticipantDto } from './dto/exam-participant.dto';
import { Request } from 'express';
import { UserPayload } from 'src/interface/user-payload.interface';

@Controller('participant')
export class ParticipantController {
  constructor(private readonly participantService: ParticipantService) {}

  // student participant
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.STUDENT)
  @Post('create')
  create(@Body() dto: CreateExamParticipantDto, @Req() req: Request) {
    const currentUser = req.user as UserPayload;
    return this.participantService.create(dto, currentUser);
  }
  // get all participant for teacher
  //   @UseGuards(JwtAuthGuard, RoleGuard)
  //   @Roles(Role.TEACHER)
  //   @Post('all')
  //   getAll(@Body() dto: CreateExamParticipantDto, @Req() req: Request) {
  //     const currentUser = req.user as UserPayload;
  //     return this.participantService.getAll(dto, currentUser);
  //   }
}
