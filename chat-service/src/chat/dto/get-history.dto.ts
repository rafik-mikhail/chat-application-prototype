import { IsNotEmpty, IsString } from 'class-validator';

export class GetHistoryDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}
