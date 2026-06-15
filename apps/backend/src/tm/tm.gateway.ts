import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server } from 'ws';
import { TMClientService } from './tm-client.service.js';

/**
 * WebSocket Gateway for TM modeling client connections
 * Listens on /remote-control path
 */
@WebSocketGateway({
  path: '/remote-control',
  cors: {
    origin: '*',
  },
})
export class TMGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(TMGateway.name);

  constructor(private readonly tmClient: TMClientService) {}

  async handleConnection(client: any) {
    this.logger.log('TM modeling client attempting to connect...');
    await this.tmClient.setConnection(client);
  }

  handleDisconnect() {
    this.logger.log('TM modeling client disconnected');
  }
}
