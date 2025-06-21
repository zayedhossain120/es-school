import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ParticipantService } from './participant.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'generated/prisma';
import {
  CreateExamParticipantDto,
  UpdateExammParticipantDto,
} from './dto/exam-participant.dto';
import { Request } from 'express';
import { UserPayload } from 'src/interface/user-payload.interface';

@Controller('participant')
export class ParticipantController {
  constructor(private readonly participantService: ParticipantService) {}

  // student exam  participant
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.STUDENT)
  @Post('create')
  create(@Body() dto: CreateExamParticipantDto, @Req() req: Request) {
    const currentUser = req.user as UserPayload;
    return this.participantService.create(dto, currentUser);
  }

  // update a participant

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.STUDENT)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Req() req: Request,
    @Body() dto: UpdateExammParticipantDto,
  ) {
    const currentUserId = req.user?.id as string;

    return this.participantService.update(id, currentUserId, dto.answer);
  }

  // my participant
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.STUDENT)
  @Get('me')
  myParticipant(@Req() req: Request) {
    const currentUserId = req.user?.id as string;
    return this.participantService.myParticipant(currentUserId);
  }

  // get all participant for teacher
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.TEACHER)
  @Get('all')
  getAll() {
    return this.participantService.getAll();
  }

  // get all participant by course id
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.TEACHER)
  @Get(':id')
  getallParticipantByCourseId(@Param('id') id: string) {
    return this.participantService.getallParticipantByCourseId(id);
  }
}
