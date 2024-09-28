import { IsNotEmpty, IsString } from 'class-validator';

export class ChatMessageDto {
  @IsNotEmpty()
  @IsString()
  clientId: string;
  @IsNotEmpty()
  @IsString()
  text: string;
  @IsNotEmpty()
  @IsString()
  name: string;
}
