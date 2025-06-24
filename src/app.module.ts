import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { StudentModule } from './student/student.module';
import { CourseModule } from './course/course.module';
import { EnrollModule } from './enroll/enroll.module';
import { ExamModule } from './exam/exam.module';
import { ResultModule } from './result/result.module';
import { ParticipantModule } from './participant/participant.module';
import { CloudflareModule } from './cloudflare/cloudflare.module';
import { TestModule } from './test/test.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ConfigModule.forRoot(),
    StudentModule,
    CourseModule,
    EnrollModule,
    ExamModule,
    ResultModule,
    ParticipantModule,
    CloudflareModule,
    TestModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
