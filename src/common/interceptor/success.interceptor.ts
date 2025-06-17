import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { Response } from 'express';

interface Meta {
  total: number;
  page: number;
  lastPage?: number;
  limit: number;
}

interface SuccessResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  meta?: Meta;
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
      map<T, SuccessResponse<T>>((data) => {
        let responseData: T;
        let message = 'Request successful';
        let meta: Meta | undefined;

        if (typeof data === 'object' && data !== null) {
          if ('data' in data) {
            responseData = (data as any).data;
            message = (data as any).message ?? message;
          } else {
            responseData = data as T;
          }

          if ('meta' in data) {
            meta = (data as any).meta;
          }
        } else {
          responseData = data as T;
        }

        return {
          statusCode: response.statusCode,
          success: true,
          message,
          ...(meta ? { meta } : {}),
          data: responseData,
        };
      }),
    );
  }
}
