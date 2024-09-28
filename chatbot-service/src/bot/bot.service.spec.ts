import { Test, TestingModule } from '@nestjs/testing';
import { BotService } from './bot.service';
import { ClientProxy } from '@nestjs/microservices';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';
import { LangchainChatService } from '../langchain-chat/langchain-chat.service';

const moduleMocker = new ModuleMocker(global);

describe('BotService', () => {
  let service: BotService;
  let chatClient: ClientProxy;
  let langchainChatService: LangchainChatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BotService],
    })
      .useMocker((token) => {
        if (token === 'CHAT_SERVICE') {
          return {
            emit: jest.fn().mockImplementation(() => {}),
          };
        }
        if (token === LangchainChatService) {
          return {
            chat: jest.fn().mockImplementation((chatMessage) => {
              return chatMessage;
            }),
          };
        }
        if (typeof token === 'function') {
          const mockMetadata = moduleMocker.getMetadata(
            token,
          ) as MockFunctionMetadata<any, any>;
          const Mock = moduleMocker.generateFromMetadata(mockMetadata);
          return new Mock();
        }
      })
      .compile();

    service = module.get<BotService>(BotService);
    chatClient = module.get<ClientProxy>('CHAT_SERVICE');
    langchainChatService =
      module.get<LangchainChatService>(LangchainChatService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should handle "escalate" message', async () => {
    const chatMessage = { clientId: 'id', name: 'name', text: 'escalate' };
    await service.handleMessage(chatMessage);
    expect(langchainChatService.chat).toHaveBeenCalledTimes(0);
    expect(chatClient.emit).toHaveBeenCalledTimes(1);
    expect(chatClient.emit).toHaveBeenCalledWith('chat_response', {
      clientId: chatMessage.clientId,
      name: chatMessage.name,
      escalated: true,
      result:
        'Escalated this chat. (please note that live chat is not yet implemented)',
    });
  });

  it('should handle non-escalate messages', async () => {
    const chatMessage = {
      clientId: 'id',
      name: 'name',
      text: 'this is not an escalate',
    };
    await service.handleMessage(chatMessage);
    expect(langchainChatService.chat).toHaveBeenCalledTimes(1);
    expect(langchainChatService.chat).toHaveBeenCalledWith(chatMessage.text);
    expect(chatClient.emit).toHaveBeenCalledTimes(1);
    expect(chatClient.emit).toHaveBeenCalledWith('chat_response', {
      clientId: chatMessage.clientId,
      name: chatMessage.name,
      escalated: false,
      result: chatMessage.text,
    });
  });
});
