import { Injectable } from '@nestjs/common';
import { ChatService } from '../chat/chat.service';

@Injectable()
export class CustomExceptionService {
  constructor(private readonly chatService: ChatService) {}
  reportRpcException(exception: {
    reportOnPattern: any;
    message: string;
    clientId: string;
  }) {
    this.chatService.emitMessage({
      pattern: exception.reportOnPattern,
      clientId: exception.clientId,
      data: exception.message,
    });
  }
}
