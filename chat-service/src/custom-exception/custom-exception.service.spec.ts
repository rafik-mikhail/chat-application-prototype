import { Test, TestingModule } from '@nestjs/testing';
import { CustomExceptionService } from './custom-exception.service';
import { ChatService } from '../chat/chat.service';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';

const moduleMocker = new ModuleMocker(global);

describe('CustomExceptionService', () => {
  let service: CustomExceptionService;
  let chatService: ChatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CustomExceptionService],
    })
      .useMocker((token) => {
        if (token === ChatService) {
          return {
            emitMessage: jest.fn().mockImplementation(() => {}),
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

    service = module.get<CustomExceptionService>(CustomExceptionService);
    chatService = module.get<ChatService>(ChatService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should report rpc exception by sending socket message', () => {
    service.reportRpcException({
      reportOnPattern: 'pattern',
      message: 'exception message',
      clientId: 'id',
    });
    expect(chatService.emitMessage).toHaveBeenCalledTimes(1);
    expect(chatService.emitMessage).toHaveBeenCalledWith({
      pattern: 'pattern',
      clientId: 'id',
      data: 'exception message',
    });
  });
});
