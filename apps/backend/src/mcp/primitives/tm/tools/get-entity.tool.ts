import { Injectable, Logger } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import type { Context } from '@rekog/mcp-nest';
import { z } from 'zod';
import { TMClientService } from '../../../../tm/index.js';

@Injectable()
export class GetEntityTool {
  private readonly logger = new Logger(GetEntityTool.name);

  constructor(private readonly tmClient: TMClientService) {}

  @Tool({
    name: 'tm_get_entity',
    description:
      'Get details of a specific entity by its ID or name. Returns full entity data including all attributes.',
    parameters: z.object({
      entityId: z.string().optional().describe('ID of the entity to retrieve'),
      entityName: z.string().optional().describe('Name of the entity to retrieve'),
    }),
  })
  async getEntity(input: any, context: Context) {
    try {
      if (!this.tmClient.isConnected()) {
        throw new Error(
          'TM modeling client is not connected. Make sure the TM modeling frontend is running with remote control enabled.',
        );
      }

      if (!input.entityId && !input.entityName) {
        throw new Error('At least one of entityId or entityName must be provided');
      }

      await context.reportProgress({ progress: 25, total: 100 });

      const entity = await this.tmClient.getEntity(input.entityId, input.entityName);

      await context.reportProgress({ progress: 100, total: 100 });

      this.logger.log('Entity retrieved successfully');

      return {
        success: true,
        message: 'Entity retrieved successfully',
        entity,
      };
    } catch (error) {
      this.logger.error('Failed to get entity', error);
      throw error;
    }
  }
}
