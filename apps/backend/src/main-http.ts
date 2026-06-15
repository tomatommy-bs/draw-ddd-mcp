import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { createPinoLogger, createLoggerService } from './bootstrap.js';
import { WsAdapter } from '@nestjs/platform-ws';

async function bootstrap() {
  const port = parseInt(process.env.PORT || '3000', 10);
  const host = process.env.HOST || '127.0.0.1';

  // Create logger that writes to stdout (fd 1) for HTTP mode
  const pinoLogger = createPinoLogger(1);
  const loggerService = createLoggerService(pinoLogger);

  // HTTP mode - create NestJS HTTP application with WebSocket support
  const app = await NestFactory.create(AppModule.forHttp(), {
    logger: loggerService,
    bufferLogs: true,
  });

  // Configure WebSocket adapter
  app.useWebSocketAdapter(new WsAdapter(app));

  pinoLogger.info(`TM Modeling MCP Server starting on ${host}:${port}`);
  pinoLogger.info(`MCP endpoint: http://${host}:${port}/`);
  pinoLogger.info(`WebSocket endpoint: ws://${host}:${port}/remote-control`);

  await app.listen(port, host);
}

bootstrap().catch((err) => {
  console.error('Failed to start TM Modeling MCP HTTP server:', err);
  process.exit(1);
});
