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
import { CourseService } from './course.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'generated/prisma';
import { CreateCourseDto, UpdateCourseDto } from './dto/course.dto';
import { UserPayload } from 'src/interface/user-payload.interface';
import { Request } from 'express';

@Controller('course')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}
  // create course
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.TEACHER)
  @Post('create')
  create(@Body() dto: CreateCourseDto, @Req() req: Request) {
    const currentUser = req.user as UserPayload;
    return this.courseService.createCourse(dto, currentUser);
  }

  //get all course
  @Get('all')
  getAllCourse(@Query() raw: Record<string, any>) {
    // console.log(raw);
    return this.courseService.getAllCourse(raw);
  }

  //get a course
  @Get(':id')
  getCourseById(@Param('id') id: string) {
    return this.courseService.getCourseById(id);
  }

  //update course
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.TEACHER)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCourseDto,
    @Req() req: Request,
  ) {
    const currentUser = req.user as UserPayload;
    return this.courseService.updateCourse(id, dto, currentUser);
  }

  //delete course
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.TEACHER)
  @Delete(':id')
  delete(@Param('id') id: string, @Req() req: Request) {
    const currentUser = req.user as UserPayload;
    return this.courseService.deleteCourse(id, currentUser);
  }
}
