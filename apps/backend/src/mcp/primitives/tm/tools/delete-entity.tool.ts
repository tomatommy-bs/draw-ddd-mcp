import { Injectable, Logger } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import type { Context } from '@rekog/mcp-nest';
import { z } from 'zod';
import { TMClientService } from '../../../../tm/index.js';

@Injectable()
export class DeleteEntityTool {
  private readonly logger = new Logger(DeleteEntityTool.name);

  constructor(private readonly tmClient: TMClientService) {}

  @Tool({
    name: 'tm_delete_entity',
    description:
      'Delete an entity (Resource or Event) from the TM diagram. This will also remove any references connected to this entity.',
    parameters: z.object({
      entityId: z.string().describe('ID of the entity to delete'),
    }),
  })
  async deleteEntity(input: any, context: Context) {
    try {
      if (!this.tmClient.isConnected()) {
        throw new Error(
          'TM modeling client is not connected. Make sure the TM modeling frontend is running with remote control enabled.',
        );
      }

      await context.reportProgress({ progress: 25, total: 100 });

      await this.tmClient.deleteEntity(input.entityId, true);

      await context.reportProgress({ progress: 100, total: 100 });

      this.logger.log(`Entity ${input.entityId} deleted successfully`);

      return {
        success: true,
        message: `Entity ${input.entityId} deleted successfully`,
        entityId: input.entityId,
      };
    } catch (error) {
      this.logger.error('Failed to delete entity', error);
      throw error;
    }
  }
}
