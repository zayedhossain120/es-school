import { Module } from '@nestjs/common';
import { ExamService } from './exam.service';
import { ExamController } from './exam.controller';
import { ConfigModule } from '@nestjs/config';
import { JwtConfigModule } from 'src/common/modules/jwt-config.module';

@Module({
  imports: [ConfigModule, JwtConfigModule],
  providers: [ExamService],
  controllers: [ExamController],
})
export class ExamModule {}
