import {
  WebSocketGateway,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { CustomExceptionFilter } from '../custom-exception/custom-exception.filter';
import { Logger } from '../logger/logger';
import { SocketMessageDto } from './dto/socket-message.dto';
import { GetHistoryDto } from './dto/get-history.dto';

@WebSocketGateway(+process.env.WEBSOCKET_PORT || 3002, {
  cors: {
    origin: '*',
  },
})
@UsePipes(ValidationPipe)
@UseFilters(CustomExceptionFilter)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly ChatService: ChatService,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(ChatGateway.name);
  }

  handleConnection(client: any) {
    this.ChatService.addConnection(client);
  }
  handleDisconnect(client: any) {
    this.ChatService.removeConnection(client);
  }

  @SubscribeMessage('message')
  handleMessage(client: any, data: SocketMessageDto) {
    this.logger.debug(
      `message "${data.toString()}" received from client: ${client.client.id}`,
    );
    return this.ChatService.handleMessage({
      payload: data.payload,
      clientId: client.client.id,
      name: data.name,
    });
  }

  @SubscribeMessage('get_history')
  handleGetHistory(client: any, data: GetHistoryDto) {
    this.logger.debug(
      `get history request for chat with name '${data.toString()}' received from client: ${client.client.id}`,
    );
    return this.ChatService.handleGetHistory({
      clientId: client.client.id,
      name: data.name,
    });
  }
}
