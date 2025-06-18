import { Module } from '@nestjs/common';
import { ResultService } from './result.service';
import { ResultController } from './result.controller';
import { ConfigModule } from '@nestjs/config';
import { JwtConfigModule } from 'src/common/modules/jwt-config.module';

@Module({
  imports: [ConfigModule, JwtConfigModule],
  providers: [ResultService],
  controllers: [ResultController],
})
export class ResultModule {}
