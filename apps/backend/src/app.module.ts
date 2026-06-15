import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { McpModule, McpTransportType } from '@rekog/mcp-nest';
import { McpPrimitivesTMModule } from './mcp/primitives/tm/index.js';
import { TMModule } from './tm/index.js';

function getServerName(): string {
  return process.env.MCP_SERVER_NAME || 'tm-modeling-mcp-server';
}

function getServerVersion(): string {
  return process.env.MCP_SERVER_VERSION || '0.1.0';
}

@Module({})
export class AppModule {
  /**
   * Creates AppModule configured for STDIO transport
   */
  static forStdio(): DynamicModule {
    const name = getServerName();

    return {
      module: AppModule,
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          cache: true,
          envFilePath: ['.env.local', '.env'],
        }),

        McpModule.forRoot({
          name,
          version: getServerVersion(),
          transport: McpTransportType.STDIO,
        }),

        McpPrimitivesTMModule.forRoot(name),
      ],
    };
  }

  /**
   * Creates AppModule configured for HTTP (Streamable HTTP) transport with WebSocket support
   */
  static forHttp(): DynamicModule {
    const name = getServerName();

    return {
      module: AppModule,
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          cache: true,
          envFilePath: ['.env.local', '.env'],
        }),

        McpModule.forRoot({
          name,
          version: getServerVersion(),
          transport: McpTransportType.STREAMABLE_HTTP,
          mcpEndpoint: '/',
        }),

        TMModule,

        McpPrimitivesTMModule.forRoot(name),
      ],
    };
  }
}
