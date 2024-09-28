import { Module } from '@nestjs/common';
import { CustomExceptionService } from './custom-exception.service';

@Module({
  providers: [CustomExceptionService],
  exports: [CustomExceptionService],
})
export class CustomExceptionModule {}
