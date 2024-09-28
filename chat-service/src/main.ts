import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from './logger/logger';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      bufferLogs: true,
      logger: ['log', 'error', 'warn', 'debug', 'verbose', 'fatal'],
      transport: Transport.TCP,
      options: {
        // host: process.env.CHATSERVICE_HOSTNAME || 'localhost',
        host: '0.0.0.0',
        port: +process.env.CHATSERVICE_PORT || 3003,
      },
    },
  );
  const logger = await app.resolve(Logger);
  app.useLogger(logger);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen();
}
bootstrap();
