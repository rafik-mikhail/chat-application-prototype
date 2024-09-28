import { Inject, Injectable } from '@nestjs/common';
import { ChatResponseDto } from './dto/chat-response.dto';
import { Logger } from '../logger/logger';
import { ErrorReportDto } from './dto/error-report.dto';
import { ClientProxy } from '@nestjs/microservices';
import { ChatRepository } from './chat.repository';
import { SocketMessage } from './types/socketMessage.type';
import { SocketMessageDto } from './dto/socket-message.dto';
import { GetHistoryDto } from './dto/get-history.dto';
import { MessageRepository } from './message.repository';

@Injectable()
export class ChatService {
  private connections: { [id: string]: any } = {};

  constructor(
    private readonly logger: Logger,
    @Inject('CHATBOT_SERVICE') private chatbotClient: ClientProxy,
    private readonly chatRepository: ChatRepository,
    private readonly messageRepository: MessageRepository,
  ) {
    this.logger.setContext(ChatService.name);
  }

  getConnectionCount() {
    return Object.keys(this.connections).length;
  }

  addConnection(client: any) {
    this.logger.debug(`new connection: ${client.client.id}`);
    this.connections[client.client.id] = client;
  }

  removeConnection(client: any) {
    this.logger.debug(`connection remoced: ${client.client.id}`);
    delete this.connections[client.client.id];
  }

  emitMessage(socketMessage: SocketMessage) {
    if (typeof socketMessage.data === 'object')
      this.logger.debug(
        `forwarding message "${socketMessage.data.message}" from: ${socketMessage.data.from} to client: ${socketMessage.clientId}`,
      );
    else
      this.logger.debug(
        `forwarding error "${socketMessage.data}" to client: ${socketMessage.clientId}`,
      );
    this.connections[socketMessage.clientId]?.emit(
      socketMessage.pattern,
      socketMessage.data,
    );
  }

  async handleMessage(socketMessage: SocketMessageDto & { clientId: string }) {
    this.logger.debug(
      `handling message "${socketMessage.payload}" from client: ${socketMessage.clientId}`,
    );
    let chat = await this.chatRepository.findOne({
      name: socketMessage.name,
    });
    if (!chat) {
      chat = await this.chatRepository.create({ name: socketMessage.name });
    } else if (chat.escalated) {
      throw new Error('Live chat not implemented yet');
    }

    const message = await this.messageRepository.create({
      from: chat.name,
      payload: socketMessage.payload,
      chat: chat._id,
    });

    await this.chatRepository.addMessage(chat, message._id);

    return this.chatbotClient.emit('chat', {
      clientId: socketMessage.clientId,
      text: socketMessage.payload,
      name: chat.name,
    });
  }

  async handleGetHistory(getHistory: GetHistoryDto & { clientId: string }) {
    this.logger.debug(
      `sending chat history for "${getHistory.name}" to client: ${getHistory.clientId}`,
    );
    const chat = await this.chatRepository.findOne({
      name: getHistory.name,
    });
    if (!chat) return true;

    const messages = await this.messageRepository.find({ chat: chat._id });
    for (const message of messages) {
      this.emitMessage({
        clientId: getHistory.clientId,
        pattern: 'messages',
        data: {
          from: message.from,
          message: message.payload,
        },
      });
    }
    return true;
  }

  async handleResponse(chatResponseDto: ChatResponseDto) {
    // tmp
    this.logger.debug(
      `sending response ${chatResponseDto.result} to socket client: ${chatResponseDto.clientId}`,
    );
    const chat = await this.chatRepository.findOne({
      name: chatResponseDto.name,
    });
    if (!chat) throw new Error('Could not match bot response to chat');

    if (chatResponseDto.escalated && !chat.escalated) {
      chat.escalated = true;
      await this.chatRepository.save(chat);
    }

    const message = await this.messageRepository.create({
      from: 'Smart Chatbot',
      payload: chatResponseDto.result,
      chat: chat._id,
    });

    await this.chatRepository.addMessage(chat, message._id);

    this.emitMessage({
      clientId: chatResponseDto.clientId,
      pattern: 'messages',
      data: {
        from: message.from,
        message: message.payload,
      },
    });
  }

  handleError(error: ErrorReportDto) {
    // tmp
    this.logger.debug(
      `propagating error through to socket client: ${error.clientId}`,
    );
    this.emitMessage({
      clientId: error.clientId,
      pattern: 'errors',
      data: error.error,
    });
  }
}
