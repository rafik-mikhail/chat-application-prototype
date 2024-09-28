import { forwardRef, Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { LoggerModule } from '../logger/logger.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Chat, ChatSchema } from './schemas/chat.schema';
import { Message, MessageSchema } from './schemas/message.schema';
import { ChatRepository } from './chat.repository';
import { CustomExceptionModule } from '../custom-exception/custom-exception.module';
import { ChatGateway } from './chat.gateway';
import { MessageRepository } from './message.repository';

@Module({
  imports: [
    LoggerModule,
    MongooseModule.forFeature([
      { name: Chat.name, schema: ChatSchema },
      { name: Message.name, schema: MessageSchema },
    ]),
    forwardRef(() => CustomExceptionModule),
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatRepository, ChatGateway, MessageRepository],
  exports: [ChatService],
})
export class ChatModule {}
