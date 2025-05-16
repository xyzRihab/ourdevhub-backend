/* eslint-disable */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;
    const body = request.body;
    const user = request.user?.id || 'Guest';

    const now = Date.now();

    return next.handle().pipe(
      tap((response) => {
        const delay = Date.now() - now;
        this.logger.log(
          `[${method}] ${url} | User: ${user} | ${delay}ms\nBody: ${JSON.stringify(
            body,
          )}`,
        );
      }),
    );
  }
}
