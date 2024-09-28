import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { LoggerModule } from './logger/logger.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { APP_FILTER } from '@nestjs/core';
import { CustomExceptionFilter } from './custom-exception/custom-exception.filter';
import { ChatModule } from './chat/chat.module';
import { CustomExceptionModule } from './custom-exception/custom-exception.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    LoggerModule,
    ChatModule,
    CustomExceptionModule,
    ClientsModule.register({
      clients: [
        {
          name: 'CHATBOT_SERVICE',
          transport: Transport.TCP,
          options: {
            port: +process.env.CHATBOTSERVICE_PORT || 3001,
            host: process.env.CHATBOTSERVICE_HOSTNAME || '0.0.0.0',
          },
        },
      ],
      isGlobal: true,
    }),
    MongooseModule.forRoot(
      `mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME || 'user'}:${process.env.MONGO_INITDB_ROOT_PASSWORD || 'passwd'}@${process.env.MONGO_IP || 'localhost'}:27017`,
    ),
  ],
  controllers: [],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: CustomExceptionFilter,
    },
  ],
})
export class AppModule {}
