import { Module } from '@nestjs/common';
import { ParticipantService } from './participant.service';
import { ParticipantController } from './participant.controller';
import { JwtConfigModule } from 'src/common/modules/jwt-config.module';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [JwtConfigModule, CommonModule],
  providers: [ParticipantService],
  controllers: [ParticipantController],
})
export class ParticipantModule {}
