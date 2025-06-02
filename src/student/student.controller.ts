import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { StudentService } from './student.service';
import { Role } from 'generated/prisma';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CreateUserDto } from 'src/auth/dto/create-user.dto';

@Controller('student')
export class StudentController {
  constructor(private studentService: StudentService) {}

  // create student
  @Roles(Role.TEACHER)
  @UseGuards(RoleGuard)
  @Post('create')
  create(@Body() dto: CreateUserDto) {
    return this.studentService.create(dto);
  }
}
