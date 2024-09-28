import { Module } from '@nestjs/common';
import { LangchainChatService } from './langchain-chat.service';

@Module({
  providers: [LangchainChatService],
  exports: [LangchainChatService],
})
export class LangchainChatModule {}
