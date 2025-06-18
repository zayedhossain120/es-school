import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
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
import { GetStudentsQueryDto } from './dto/student-query.dto';

@Controller('student')
export class StudentController {
  constructor(private studentService: StudentService) {}

  // create student
  @Roles(Role.TEACHER)
  @UseGuards(JwtAuthGuard)
  @Post('signup')
  create(@Body() dto: CreateUserDto) {
    return this.studentService.signup(dto);
  }

  // login student
  @Post('signin')
  login(@Body() dto: LoginUserDto) {
    return this.studentService.signin(dto);
  }

  // get me
  @Roles(Role.STUDENT)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Get('me')
  getProfile(@Req() req: Request) {
    return req.user;
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

  //get all student
  @Roles(Role.TEACHER)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Get('all')
  getAllStudent(@Query() raw: GetStudentsQueryDto) {
    return this.studentService.getAllStudent(raw);
  }

  // get a student
  @Roles(Role.TEACHER)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Get(':id')
  getStudent(@Param('id') id: string) {
    return this.studentService.getStudent(id);
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
  // delete student
  @Roles(Role.TEACHER)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.studentService.delete(id);
  }
}
