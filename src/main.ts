import { LogLevel, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: (process.env.LOG_LEVELS ?? 'fatal,error,log,info,debug').split(
      ',',
    ) as LogLevel[],
  });
  app.setGlobalPrefix('api');
  app.use(compression());
  app.enableCors({ origin: '*' });
  app.useGlobalPipes(
    new ValidationPipe({      
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
