import { Test, TestingModule } from '@nestjs/testing';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';

const moduleMocker = new ModuleMocker(global);

describe('ChatGateway', () => {
  let gateway: ChatGateway;
  let service: ChatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatGateway],
    })
      .useMocker((token) => {
        if (token === ChatService) {
          return {
            addConnection: jest.fn().mockResolvedValue(undefined),
            removeConnection: jest.fn().mockResolvedValue(undefined),
            emitMessage: jest.fn().mockResolvedValue(undefined),
            handleMessage: jest.fn().mockResolvedValue(undefined),
            handleGetHistory: jest.fn().mockResolvedValue(true),
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

    gateway = module.get<ChatGateway>(ChatGateway);
    service = module.get<ChatService>(ChatService);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
  it('should handle connection by passing to service', () => {
    gateway.handleConnection('');
    expect(service.addConnection).toHaveBeenCalledTimes(1);
  });

  it('should handle disconnect by passing to service', () => {
    gateway.handleDisconnect('');
    expect(service.removeConnection).toHaveBeenCalledTimes(1);
  });

  it('should handle message by passing to service', () => {
    gateway.handleMessage(
      { client: { id: 'id' } },
      { payload: 'payload', name: 'name' },
    );
    expect(service.handleMessage).toHaveBeenCalledTimes(1);
  });

  it('should handle get history by passing to service', () => {
    gateway.handleGetHistory({ client: { id: 'id' } }, { name: 'name' });
    expect(service.handleGetHistory).toHaveBeenCalledTimes(1);
  });
});
