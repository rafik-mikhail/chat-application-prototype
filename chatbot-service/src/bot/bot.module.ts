import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { BotController } from './bot.controller';
import { LoggerModule } from '../logger/logger.module';
import { LangchainChatModule } from '../langchain-chat/langchain-chat.module';

@Module({
  imports: [LoggerModule, LangchainChatModule],
  controllers: [BotController],
  providers: [BotService],
})
export class BotModule {}
