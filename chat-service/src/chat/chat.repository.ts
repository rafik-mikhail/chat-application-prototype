import { Repository } from '../repository';
import { Chat, ChatDocument } from './schemas/chat.schema';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ChatRepository extends Repository<ChatDocument> {
  constructor(@InjectModel(Chat.name) private chatModel: Model<ChatDocument>) {
    super(chatModel);
  }

  async addMessage(chat: ChatDocument, id: Types.ObjectId) {
    chat.messages.push(id);
    chat.save();
  }
}
