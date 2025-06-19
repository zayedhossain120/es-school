import { Module } from '@nestjs/common';
import { ParticipantService } from './participant.service';
import { ParticipantController } from './participant.controller';
import { JwtConfigModule } from 'src/common/modules/jwt-config.module';

@Module({
  providers: [ParticipantService],
  controllers: [ParticipantController],
  imports: [JwtConfigModule],
})
export class ParticipantModule {}
