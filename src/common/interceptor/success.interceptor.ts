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

interface ResponseWithOptionalMeta<T> {
  data: T;
  message?: string;
  meta?: Meta;
}

@Injectable()
export class SuccessResponseInterceptor<T>
  implements NestInterceptor<unknown, SuccessResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T | ResponseWithOptionalMeta<T>>,
  ): Observable<SuccessResponse<T>> {
    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map((result): SuccessResponse<T> => {
        let data: T;
        let message = 'Request successful';
        let meta: Meta | undefined;

        if (result && typeof result === 'object' && 'data' in result) {
          data = result.data;
          message = result.message ? result.message : message;
          meta = result.meta;
        } else {
          data = result;
        }

        return {
          statusCode: response.statusCode,
          success: true,
          message,
          ...(meta && { meta }),
          data,
        };
      }),
    );
  }
}
