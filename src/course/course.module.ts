import { Module } from '@nestjs/common';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from 'src/common/common.module';
import { JwtConfigModule } from 'src/common/modules/jwt-config.module';
import { CloudflareModule } from 'src/cloudflare/cloudflare.module';

@Module({
  imports: [ConfigModule, CommonModule, JwtConfigModule, CloudflareModule],
  providers: [CourseService],
  controllers: [CourseController],
})
export class CourseModule {}
