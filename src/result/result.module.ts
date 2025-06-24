import { Module } from '@nestjs/common';
import { ResultService } from './result.service';
import { ResultController } from './result.controller';
import { ConfigModule } from '@nestjs/config';
import { JwtConfigModule } from 'src/common/modules/jwt-config.module';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [ConfigModule, JwtConfigModule, CommonModule],
  providers: [ResultService],
  controllers: [ResultController],
})
export class ResultModule {}
