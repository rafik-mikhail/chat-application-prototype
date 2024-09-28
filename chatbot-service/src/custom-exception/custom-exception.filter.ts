import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Logger } from '../logger/logger';
import { ErrorMessages } from './error-messages.enum';
import { throwError } from 'rxjs';
import { CustomExceptionService } from './custom-exception.service';

@Catch()
export class CustomExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly logger: Logger,
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly customExceptionService: CustomExceptionService,
  ) {
    this.logger.setContext(CustomExceptionFilter.name);
  }
  catch(exception: unknown, host: ArgumentsHost) {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;

    const message = exception instanceof Error ? exception.message : undefined;

    if (host.getType() === 'ws') {
      const ctx = host.switchToWs();
      const client = ctx.getClient();
      const event = ctx.getPattern();

      this.logger.error(message || `event: ${event}`);
      client.emit('errors', message);
    } else if (host.getType() === 'http') {
      const ctx = host.switchToHttp();
      const path = httpAdapter.getRequestUrl(ctx.getRequest());

      this.logger.error(message || `path: ${path}`);

      const httpStatus =
        exception instanceof HttpException
          ? exception.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;

      const responseBody = {
        statusCode: httpStatus,
        timestamp: new Date().toISOString(),
        path: path,
        message: message,
      };

      httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
    } else if (host.getType() === 'rpc') {
      this.logger.error(message || ErrorMessages.NO_ERROR_MESSAGE);
      this.customExceptionService.reportRpcException({
        reportOnPattern: 'error',
        message: (exception as Error).message,
        clientId: host.switchToRpc().getData().clientId,
      });
      return throwError(() => message);
    } else {
      this.logger.error(message || ErrorMessages.NO_ERROR_MESSAGE);
    }
  }
}
