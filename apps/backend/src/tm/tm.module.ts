import { Module } from '@nestjs/common';
import { TMGateway } from './tm.gateway.js';
import { TMClientService } from './tm-client.service.js';

@Module({
  providers: [TMGateway, TMClientService],
  exports: [TMClientService],
})
export class TMModule {}
