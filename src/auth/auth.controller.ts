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
import { AuthService } from './auth.service';
import {
  CreateUserDto,
  LoginUserDto,
  UpdateUserDto,
} from './dto/create-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Roles } from './decorators/roles.decorator';
import { Role } from 'generated/prisma';
import { RoleGuard } from './guards/role.guard';
import { Request } from 'express';
import { UserPayload } from 'src/interface/user-payload.interface';
import { GetStudentsQueryDto } from 'src/student/dto/student-query.dto';

declare module 'express' {
  interface Request {
    user?: UserPayload;
  }
}

@Controller('administrator')
export class AuthController {
  constructor(private authService: AuthService) {}
  // signup
  @Post('signup')
  signup(@Body() dto: CreateUserDto) {
    return this.authService.signUp(dto);
  }

  // signin
  @Post('signin')
  signin(@Body() dto: LoginUserDto) {
    return this.authService.signin(dto);
  }

  // get me
  @Roles(Role.TEACHER)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Get('me')
  getMyProfile(@Req() req: Request) {
    const currentUserId = req.user?.id as string;
    return this.authService.getMyProfile(currentUserId);
  }

  //updata
  @Roles(Role.TEACHER)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.authService.update(id, dto);
  }

  // get all user
  @Roles(Role.TEACHER)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Get('all')
  @Get('all')
  getAll(@Query() raw: GetStudentsQueryDto) {
    return this.authService.getAllUsers(raw);
  }

  @Roles(Role.TEACHER)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.authService.delete(id);
  }
}
