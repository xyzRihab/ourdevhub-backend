import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  status: boolean;
  message: string;
  data: T;
}

@Injectable()
export class ResponseInterceptor<T>
  implements
    NestInterceptor<
      { status?: boolean; data: T; message?: string },
      Response<T>
    >
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<{ status?: boolean; data: T; message?: string }>,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map(({ status, data, message }) => ({
        status: status || true,
        message: message || 'Operation successful',
        data,
      })),
    );
  }
}
