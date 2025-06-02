import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { StudentModule } from './student/student.module';

@Module({
  imports: [PrismaModule, AuthModule, ConfigModule.forRoot(), StudentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
