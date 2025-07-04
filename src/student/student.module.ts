import { Module } from '@nestjs/common';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from 'src/common/common.module';
import { JwtConfigModule } from 'src/common/modules/jwt-config.module';
import { CloudflareModule } from 'src/cloudflare/cloudflare.module';

@Module({
  imports: [ConfigModule, CommonModule, JwtConfigModule, CloudflareModule],
  controllers: [StudentController],
  providers: [StudentService],
})
export class StudentModule {}
