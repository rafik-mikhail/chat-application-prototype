export type SocketMessage = {
  clientId: string;
  pattern: string;
  data: MessageData | ErrorData;
};

type ErrorData = string;

type MessageData = {
  from: string;
  message: string;
};
