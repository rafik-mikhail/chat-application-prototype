import { Test, TestingModule } from '@nestjs/testing';
import { BotController } from './bot.controller';
import { BotService } from './bot.service';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';

const moduleMocker = new ModuleMocker(global);

describe('BotController', () => {
  let controller: BotController;
  let service: BotService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BotController],
    })
      .useMocker((token) => {
        if (token === BotService) {
          return {
            handleMessage: jest.fn().mockImplementation(() => {}),
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

    controller = module.get<BotController>(BotController);
    service = module.get<BotService>(BotService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should handle message', () => {
    const input = { clientId: 'id', text: 'text', name: 'name' };
    controller.handleMessage(input);
    expect(service.handleMessage).toHaveBeenCalledTimes(1);
    expect(service.handleMessage).toHaveBeenCalledWith(input);
  });
});
