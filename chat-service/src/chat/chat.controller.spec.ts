import { Test, TestingModule } from '@nestjs/testing';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';

const moduleMocker = new ModuleMocker(global);

describe('ChatController', () => {
  let controller: ChatController;
  let service: ChatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatController],
    })
      .useMocker((token) => {
        if (token === ChatService) {
          return {
            handleResponse: jest.fn().mockResolvedValue(undefined),
            handleError: jest.fn().mockResolvedValue(undefined),
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

    controller = module.get<ChatController>(ChatController);
    service = module.get<ChatService>(ChatService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should handle response by passing to service', () => {
    controller.receiveResponse({
      clientId: 'id',
      name: 'name',
      result: 'result',
      escalated: false,
    });
    expect(service.handleResponse).toHaveBeenCalledTimes(1);
  });

  it('should handle error by passing to service', () => {
    controller.error({
      clientId: 'id',
      error: 'error',
    });
    expect(service.handleError).toHaveBeenCalledTimes(1);
  });
});
