/* eslint-disable */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { ExceptionsFilter } from './common/filters/exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  app.useGlobalInterceptors(new LoggingInterceptor());
  const logger = new Logger('Routes');

  await app.init(); // Important: initialize the app before inspecting

  const server = app.getHttpServer();
  const router = server._router ?? server._events?.request?._router;

  if (!router) {
    logger.warn('Unable to detect router.');
  } else {
    const registeredRoutes: { path: string; methods: string }[] = [];

    router.stack.forEach((layer) => {
      if (layer.route && layer.route.path) {
        const path = layer.route.path;
        const methods = Object.keys(layer.route.methods)
          .map((method) => method.toUpperCase())
          .join(', ');
        registeredRoutes.push({ path, methods });
      }
    });

    logger.log('Registered Routes:');
    registeredRoutes.forEach((r) => logger.log(`[${r.methods}] ${r.path}`));
  }

  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new ExceptionsFilter());

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
