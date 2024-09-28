import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { BotModule } from './bot/bot.module';
import { LoggerModule } from './logger/logger.module';
import { APP_FILTER } from '@nestjs/core';
import { CustomExceptionFilter } from './custom-exception/custom-exception.filter';
import { CustomExceptionModule } from './custom-exception/custom-exception.module';
import { LangchainChatModule } from './langchain-chat/langchain-chat.module';

@Module({
  imports: [
    ClientsModule.register({
      clients: [
        {
          name: 'CHAT_SERVICE',
          transport: Transport.TCP,
          options: {
            port: +process.env.CHATSERVICE_PORT || 3003,
            host: process.env.CHATSERVICE_HOSTNAME || '0.0.0.0',
          },
        },
      ],
      isGlobal: true,
    }),
    BotModule,
    LoggerModule,
    CustomExceptionModule,
    LangchainChatModule,
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
