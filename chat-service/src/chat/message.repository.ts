import { Repository } from '../repository';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Message, MessageDocument } from './schemas/message.schema';

@Injectable()
export class MessageRepository extends Repository<MessageDocument> {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
  ) {
    super(messageModel);
  }
}
