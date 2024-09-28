import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type MessageDocument = HydratedDocument<Message>;
@Schema()
export class Message {
  @Prop({ required: true })
  from: string;

  @Prop({ required: true })
  payload: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Chat' }] })
  chat: Types.ObjectId[];
}

export const MessageSchema = SchemaFactory.createForClass(Message);
