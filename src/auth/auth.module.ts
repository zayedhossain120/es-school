import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule } from '@nestjs/config';
import { JwtConfigModule } from 'src/common/modules/jwt-config.module';
import { CloudflareModule } from 'src/cloudflare/cloudflare.module';

@Module({
  controllers: [AuthController],
  exports: [AuthService],
  imports: [ConfigModule, JwtConfigModule, CloudflareModule],
  providers: [AuthService],
})
export class AuthModule {}
