import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from './logger/logger';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      bufferLogs: true,
      logger: ['log', 'error', 'warn', 'debug', 'verbose', 'fatal'],
      transport: Transport.TCP,
      options: {
        // host: process.env.CHATBOTSERVICE_HOSTNAME || 'localhost',
        host: '0.0.0.0',
        port: +process.env.CHATBOTSERVICE_PORT || 3001,
      },
    },
  );
  const logger = await app.resolve(Logger);
  app.useLogger(logger);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen();
}
bootstrap();
