import { Test, TestingModule } from '@nestjs/testing';
import { CustomExceptionService } from './custom-exception.service';
import { ClientsModule, Transport } from '@nestjs/microservices';

describe('CustomExceptionService', () => {
  let service: CustomExceptionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ClientsModule.register({
          clients: [
            {
              name: 'CHAT_SERVICE',
              transport: Transport.TCP,
              options: {
                port: +process.env.CHATSERVICE_PORT || 3003,
                host: process.env.CHATSERVICE_HOSTNAME || '0.0.0.0',
              },
            },
          ],
          isGlobal: true,
        }),
      ],
      providers: [CustomExceptionService],
    }).compile();

    service = module.get<CustomExceptionService>(CustomExceptionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
