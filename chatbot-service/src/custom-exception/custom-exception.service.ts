import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class CustomExceptionService {
  constructor(@Inject('CHAT_SERVICE') private client: ClientProxy) {}
  reportRpcException(exception: {
    reportOnPattern: any;
    message: string;
    clientId: string;
  }) {
    this.client.emit(exception.reportOnPattern, {
      clientId: exception.clientId,
      error: `Chatbot: ${exception.message}`,
    });
  }
}
