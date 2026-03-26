import { LogLevel, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import compression from 'compression';
import { Environment } from './infra/environment/environment.service';
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

  const env = app.get(Environment);

  // Configuração do microserviço NATS
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.NATS,
    options: {
      servers: env.nats.url,
      queue: 'radix', // Garante que apenas um nó processe a mensagem por vez
    },
  });

  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap().catch((error) => {
  console.error('Erro ao iniciar aplicação', error);
  process.exit(1);
});
