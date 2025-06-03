import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SuccessResponseInterceptor } from './common/interceptor/success.interceptor';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // prefix
  app.setGlobalPrefix('/api');
  // validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  // suceess interceptor
  app.useGlobalInterceptors(new SuccessResponseInterceptor());
  // exeption filters
  app.useGlobalFilters(new AllExceptionsFilter());
  // listen app
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
