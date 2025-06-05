import { Module } from '@nestjs/common';
import { ResultService } from './result.service';
import { ResultController } from './result.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '24h',
        },
      }),
    }),
  ],
  providers: [ResultService],
  controllers: [ResultController],
})
export class ResultModule {}
