// import {
//   Catch,
//   ExceptionFilter,
//   ArgumentsHost,
//   HttpException,
// } from '@nestjs/common';
// import { Response } from 'express';

// @Catch(HttpException)
// export class HttpExceptionFilter implements ExceptionFilter {
//   catch(exception: HttpException, host: ArgumentsHost) {
//     const context = host.switchToHttp();
//     const response = context.getResponse<Response>();
//     const status = exception.getStatus();
//     const message = exception.message || 'Internal server error';

//     response.status(status).json({
//       status: false,
//       message,
//       data: null,
//     });
//   }
// }
/* eslint-disable */
// all-exceptions.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class ExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(ExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string = 'Internal server error';
    let errorDetails: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();

      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        message = (exceptionResponse as any).message || exception.message;
        errorDetails = exceptionResponse;
      } else {
        message = exceptionResponse as string;
      }
    } else {
      this.logger.error(exception);
      message = (exception as any).message || message;
    }

    response.status(status).json({
      status: false,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
      data: errorDetails,
    });
  }
}
