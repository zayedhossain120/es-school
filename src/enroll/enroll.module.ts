import { Module } from '@nestjs/common';
import { EnrollService } from './enroll.service';
import { EnrollController } from './enroll.controller';
import { ConfigModule } from '@nestjs/config';
import { JwtConfigModule } from 'src/common/modules/jwt-config.module';

@Module({
  imports: [ConfigModule, JwtConfigModule],
  providers: [EnrollService],
  controllers: [EnrollController],
})
export class EnrollModule {}
