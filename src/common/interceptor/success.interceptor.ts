import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { Response } from 'express';

interface SuccessResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
}

@Injectable()
export class SuccessResponseInterceptor<T>
  implements NestInterceptor<unknown, SuccessResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<SuccessResponse<T>> {
    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map((data: T | { message?: string; data?: T }) => {
        let responseData: T;
        let message: string;

        if (typeof data === 'object' && data !== null && 'data' in data) {
          // @ts-expect-error - we ensure data has `data` and `message`
          responseData = data.data;
          message = data.message ?? 'Request successful';
        } else {
          responseData = data as T;
          message = 'Request successful';
        }

        return {
          statusCode: response.statusCode,
          success: true,
          message,
          data: responseData,
        };
      }),
    );
  }
}
