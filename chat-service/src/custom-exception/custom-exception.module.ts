import { forwardRef, Module } from '@nestjs/common';
import { CustomExceptionService } from './custom-exception.service';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [forwardRef(() => ChatModule)],
  providers: [CustomExceptionService],
  exports: [CustomExceptionService],
})
export class CustomExceptionModule {}
