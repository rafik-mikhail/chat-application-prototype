import { Inject, Injectable } from '@nestjs/common';
import { ChatMessageDto } from './dto/chat-message.dto';
import { ClientProxy } from '@nestjs/microservices';
import { Logger } from '../logger/logger';
import { ChatResponseDto } from './dto/chat-response.dto';
import { LangchainChatService } from '../langchain-chat/langchain-chat.service';

@Injectable()
export class BotService {
  constructor(
    @Inject('CHAT_SERVICE') private chatClient: ClientProxy,
    private readonly logger: Logger,
    private readonly langchainChatService: LangchainChatService,
  ) {
    this.logger.setContext(BotService.name);
  }
  async handleMessage(chatMessageDto: ChatMessageDto) {
    // tmp
    this.logger.debug(
      `handling message "${chatMessageDto.text}" from client: ${chatMessageDto.clientId}`,
    );
    const response: ChatResponseDto = {
      clientId: chatMessageDto.clientId,
      name: chatMessageDto.name,
      escalated: false,
      result: null,
    };
    switch (chatMessageDto.text) {
      case 'escalate':
        response.result = `Escalated this chat. (please note that live chat is not yet implemented)`;
        response.escalated = true;
        break;
      default:
        response.result = await this.langchainChatService.chat(
          chatMessageDto.text,
        );
    }
    return this.chatClient.emit('chat_response', response);
  }
}
