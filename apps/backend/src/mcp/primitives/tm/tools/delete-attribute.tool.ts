import { Injectable, Logger } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import type { Context } from '@rekog/mcp-nest';
import { z } from 'zod';
import { TMClientService } from '../../../../tm/index.js';

@Injectable()
export class DeleteAttributeTool {
  private readonly logger = new Logger(DeleteAttributeTool.name);

  constructor(private readonly tmClient: TMClientService) {}

  @Tool({
    name: 'tm_delete_attribute',
    description:
      'Delete an attribute from an entity in the TM diagram. This permanently removes the attribute from the entity.',
    parameters: z.object({
      entityId: z.string().describe('The ID of the entity that owns the attribute'),
      attributeId: z.string().describe('The ID of the attribute to delete'),
    }),
  })
  async run(
    params: {
      entityId: string;
      attributeId: string;
    },
    context: Context,
  ) {
    this.logger.log(`Deleting attribute ${params.attributeId} from entity ${params.entityId}`);

    if (!this.tmClient.isConnected()) {
      return {
        success: false,
        message:
          'TM modeling client is not connected. Make sure the TM modeling frontend is running with remote control enabled.',
      };
    }

    await context.reportProgress({ progress: 0, total: 1 });

    try {
      await this.tmClient.deleteAttribute(params.entityId, params.attributeId);

      await context.reportProgress({ progress: 1, total: 1 });

      return {
        success: true,
        message: `Attribute ${params.attributeId} deleted from entity ${params.entityId}`,
        entityId: params.entityId,
        attributeId: params.attributeId,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to delete attribute: ${errorMessage}`);
      return {
        success: false,
        message: `Failed to delete attribute: ${errorMessage}`,
        entityId: params.entityId,
        attributeId: params.attributeId,
      };
    }
  }
}
