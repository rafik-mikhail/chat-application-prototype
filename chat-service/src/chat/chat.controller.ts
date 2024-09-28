import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { ChatService } from './chat.service';
import { ChatResponseDto } from './dto/chat-response.dto';
import { Logger } from '../logger/logger';
import { ErrorReportDto } from './dto/error-report.dto';

@Controller()
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(ChatController.name);
  }

  @EventPattern('chat_response')
  receiveResponse(@Payload() chatResponseDto: ChatResponseDto) {
    // tmp
    this.logger.debug(`chat response event received`);
    return this.chatService.handleResponse(chatResponseDto);
  }

  @EventPattern('error')
  error(@Payload() errorReportDto: ErrorReportDto) {
    // tmp
    this.logger.debug(
      `received error report with message "${errorReportDto.error}" from chatbat service to client: ${errorReportDto.clientId}`,
    );
    return this.chatService.handleError(errorReportDto);
  }
}
