import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { BigIntInterceptor } from './common/interceptors/bigint.interceptor';
import cookieParser from 'cookie-parser';
import { AuthGuard } from './auth/auth.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const corsOrigins = (process.env.CORS_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(
    new BigIntInterceptor(),
  );

  app.useGlobalGuards(
    app.get(AuthGuard),
  );

  app.use(cookieParser());

  await app.listen(process.env.PORT ?? 3001);
}

bootstrap();