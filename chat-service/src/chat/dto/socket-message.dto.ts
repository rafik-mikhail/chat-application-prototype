import { IsNotEmpty, IsString } from 'class-validator';

export class SocketMessageDto {
  // @IsNotEmpty()
  // @IsString()
  // clientId: string;
  @IsNotEmpty()
  @IsString()
  payload: string;
  @IsNotEmpty()
  @IsString()
  name: string;
}
