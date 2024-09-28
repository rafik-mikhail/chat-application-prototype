import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ChatDocument = HydratedDocument<Chat>;
@Schema()
export class Chat {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, default: false })
  escalated: boolean;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Message' }] })
  messages: Types.ObjectId[];
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
