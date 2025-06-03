import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { StudentService } from './student.service';
import { Role } from 'generated/prisma';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import {
  CreateUserDto,
  LoginUserDto,
  UpdatePasswordDto,
  UpdateUserDto,
} from 'src/auth/dto/create-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { UserPayload } from 'src/interface/user-payload.interface';

@Controller('student')
export class StudentController {
  constructor(private studentService: StudentService) {}

  // create student
  @Roles(Role.TEACHER)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Post('signup')
  create(@Body() dto: CreateUserDto) {
    return this.studentService.signup(dto);
  }

  // login student
  @Post('signin')
  login(@Body() dto: LoginUserDto) {
    return this.studentService.signin(dto);
  }

  //update student
  @Roles(Role.TEACHER, Role.STUDENT)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Patch(':id')
  update(
    @Body() dto: UpdateUserDto,
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    const currentUser = req.user as UserPayload;
    return this.studentService.update(id, dto, currentUser);
  }

  // update password
  @Roles(Role.TEACHER, Role.STUDENT)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Patch('password/:id')
  updatePassword(
    @Body() dto: UpdatePasswordDto,
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    const currentUser = req.user as UserPayload;
    return this.studentService.updatePassword(id, dto, currentUser);
  }
}
