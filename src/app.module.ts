import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { StudentModule } from './student/student.module';
import { CourseModule } from './course/course.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ConfigModule.forRoot(),
    StudentModule,
    CourseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
