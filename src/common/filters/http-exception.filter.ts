import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    let errorMessage: string;

    if (typeof message === 'string') {
      errorMessage = message;
    } else if (
      typeof message === 'object' &&
      message !== null &&
      'message' in message
    ) {
      const msg = (message as { message: string | string[] }).message;
      errorMessage = Array.isArray(msg) ? msg.join(', ') : msg;
    } else {
      errorMessage = 'Unexpected error';
    }

    response.status(status).json({
      statusCode: status,
      success: false,
      path: request.url,
      timestamp: new Date().toISOString(),
      message: errorMessage,
    });
  }
}
