import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { ClientProxy } from '@nestjs/microservices';
import { ChatRepository } from './chat.repository';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';
import { MessageRepository } from './message.repository';

const moduleMocker = new ModuleMocker(global);

describe('ChatService', () => {
  let service: ChatService;
  let chatBotClient: ClientProxy;
  let chatRepository: ChatRepository;
  let messagesRepository: MessageRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatService],
    })
      .useMocker((token) => {
        if (token === 'CHATBOT_SERVICE') {
          return {
            emit: jest.fn().mockImplementation(() => {}),
          };
        }
        if (token === ChatRepository) {
          return {
            findOne: jest.fn().mockImplementation((input) => {
              if (input.name === 'no chat') {
                return undefined;
              } else if (input.name === 'ali')
                return {
                  escalated: true,
                };
              else return { name: input.name, _id: 'id' };
            }),
            create: jest.fn().mockResolvedValue({ _id: 'id' }),
            addMessage: jest.fn().mockResolvedValue(true),
            save: jest.fn().mockImplementation(() => {}),
          };
        }
        if (token === MessageRepository) {
          return {
            create: jest.fn().mockResolvedValue({ _id: 'id' }),
            find: jest.fn().mockResolvedValue([{}, {}]),
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

    service = module.get<ChatService>(ChatService);
    chatBotClient = module.get<ClientProxy>('CHATBOT_SERVICE');
    chatRepository = module.get<ChatRepository>(ChatRepository);
    messagesRepository = module.get<MessageRepository>(MessageRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('handle message should throw if chat is escalated', () => {
    expect(
      service.handleMessage({
        clientId: 'id',
        payload: 'payload',
        name: 'ali',
      }),
    ).rejects.toEqual(new Error('Live chat not implemented yet'));
  });

  it('should handle message by sending to chatbot client', async () => {
    await service.handleMessage({
      clientId: 'id',
      payload: 'payload',
      name: 'mona',
    });
    expect(chatBotClient.emit).toHaveBeenCalledTimes(1);
    expect(chatBotClient.emit).toHaveBeenCalledWith('chat', {
      clientId: 'id',
      text: 'payload',
      name: 'mona',
    });
  });

  it('should add, remove and get connection count', () => {
    service.addConnection({ client: { id: 'id' } });
    expect(service.getConnectionCount()).toEqual(1);
    service.removeConnection({ client: { id: 'id' } });
    expect(service.getConnectionCount()).toEqual(0);
  });

  it('should emit message to socket connection', () => {
    const client = {
      client: { id: 'id' },
      emit: jest.fn().mockImplementation(() => {}),
    };
    service.addConnection(client);
    service.emitMessage({
      clientId: 'id',
      pattern: 'chat',
      data: { from: 'tester', message: 'message' },
    });
    expect(client.emit).toHaveBeenCalledTimes(1);
  });

  it('should emit error to socket connection', () => {
    const client = {
      client: { id: 'id' },
      emit: jest.fn().mockImplementation(() => {}),
    };
    service.addConnection(client);
    service.emitMessage({
      clientId: 'id',
      pattern: 'chat',
      data: 'error',
    });
    expect(client.emit).toHaveBeenCalledTimes(1);
  });

  it('should handle get history if there is no existing chat', async () => {
    const client = {
      client: { id: 'id' },
      emit: jest.fn().mockImplementation(() => {}),
    };
    service.addConnection(client);
    await service.handleGetHistory({
      clientId: 'id',
      name: 'no chat',
    });
    expect(client.emit).toHaveBeenCalledTimes(0);
  });

  it('should handle get history by sending to chatbot client', async () => {
    const client = {
      client: { id: 'id' },
      emit: jest.fn().mockImplementation(() => {}),
    };
    service.addConnection(client);

    await service.handleGetHistory({
      clientId: 'id',
      name: 'mona',
    });
    expect(client.emit).toHaveBeenCalledTimes(2);
  });

  it('should handle response by saving message and sending to chatbot client', async () => {
    const client = {
      client: { id: 'id' },
      emit: jest.fn().mockImplementation(() => {}),
    };
    service.addConnection(client);

    await service.handleResponse({
      clientId: 'id',
      name: 'mona',
      result: 'result',
      escalated: false,
    });
    expect(messagesRepository.create).toHaveBeenCalledTimes(1);
    expect(chatRepository.addMessage).toHaveBeenCalledTimes(1);
    expect(client.emit).toHaveBeenCalledTimes(1);
    expect(chatRepository.save).toHaveBeenCalledTimes(0);
  });

  it('should handle escalated response by escalating chat, saving message and sending to chatbot client', async () => {
    const client = {
      client: { id: 'id' },
      emit: jest.fn().mockImplementation(() => {}),
    };
    service.addConnection(client);

    await service.handleResponse({
      clientId: 'id',
      name: 'mona',
      result: 'result',
      escalated: true,
    });
    expect(messagesRepository.create).toHaveBeenCalledTimes(1);
    expect(chatRepository.addMessage).toHaveBeenCalledTimes(1);
    expect(client.emit).toHaveBeenCalledTimes(1);
    expect(chatRepository.save).toHaveBeenCalledTimes(1);
    expect(chatRepository.save).toHaveBeenCalledWith({
      name: 'mona',
      _id: 'id',
      escalated: true,
    });
  });

  it('handle response should throw if no chat', async () => {
    expect(
      service.handleResponse({
        clientId: 'id',
        name: 'no chat',
        result: 'result',
        escalated: false,
      }),
    ).rejects.toEqual(new Error('Could not match bot response to chat'));
  });

  it('should handle error by sending to chatbot client', async () => {
    const client = {
      client: { id: 'id' },
      emit: jest.fn().mockImplementation(() => {}),
    };
    service.addConnection(client);

    service.handleError({
      clientId: 'id',
      error: 'error',
    });
    expect(client.emit).toHaveBeenCalledTimes(1);
    expect(client.emit).toHaveBeenCalledWith('errors', 'error');
  });
});
