import { IsNotEmpty, IsString } from 'class-validator';

export class ErrorReportDto {
  @IsNotEmpty()
  @IsString()
  clientId: string;
  @IsNotEmpty()
  @IsString()
  error: string;
}
