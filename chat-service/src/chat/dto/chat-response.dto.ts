import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class ChatResponseDto {
  @IsNotEmpty()
  @IsString()
  clientId: string;
  @IsNotEmpty()
  @IsString()
  result: string;
  @IsNotEmpty()
  @IsString()
  name: string;
  @IsNotEmpty()
  @IsBoolean()
  escalated: boolean;
}
