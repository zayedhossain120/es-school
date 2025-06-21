import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ResultService } from './result.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'generated/prisma';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { CreateResultDto, UpdateResultDto } from './dto/result.dto';
import { Request } from 'express';
import { UserPayload } from 'src/interface/user-payload.interface';

@Controller('result')
export class ResultController {
  constructor(private resultService: ResultService) {}

  // create result
  @Roles(Role.TEACHER)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Post('create')
  create(@Body() dto: CreateResultDto) {
    return this.resultService.create(dto);
  }

  // get all result
  @Roles(Role.TEACHER)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Get('all')
  getAll() {
    return this.resultService.getAll();
  }

  // update result by id
  @Roles(Role.STUDENT)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Get('me')
  myResult(@Req() req: Request) {
    const currentUser = req.user as UserPayload;
    return this.resultService.myResult(currentUser);
  }

  // get a single result by id
  @Roles(Role.TEACHER)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Get(':id')
  getResultById(@Param('id') resultId: string) {
    return this.resultService.getResultById(resultId);
  }

  // update result by id
  @Roles(Role.TEACHER)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Patch(':id')
  updateResultById(
    @Body() dto: UpdateResultDto,
    @Param('id') resultId: string,
  ) {
    return this.resultService.updateResultById(dto, resultId);
  }

  // delete a result for teacher
  @Roles(Role.TEACHER)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.resultService.delete(id);
  }
}
