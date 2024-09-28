import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { BotService } from './bot.service';
import { ChatMessageDto } from './dto/chat-message.dto';
import { Logger } from '../logger/logger';

@Controller()
export class BotController {
  constructor(
    private readonly botService: BotService,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(BotController.name);
  }

  @EventPattern('chat')
  handleMessage(@Payload() chatMessageDto: ChatMessageDto) {
    // tmp
    this.logger.debug(`chat event received`);
    return this.botService.handleMessage(chatMessageDto);
  }
}
