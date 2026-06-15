import { Injectable, Logger } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import type { Context } from '@rekog/mcp-nest';
import { z } from 'zod';
import { TMClientService } from '../../../../tm/index.js';

@Injectable()
export class SetIdentifierTool {
  private readonly logger = new Logger(SetIdentifierTool.name);

  constructor(private readonly tmClient: TMClientService) {}

  @Tool({
    name: 'tm_set_identifier',
    description:
      'Bulk set the identifier attributes for an entity in the TM diagram. The order of attribute IDs determines the composite identifier order. This replaces any existing identifier configuration on the entity.',
    parameters: z.object({
      entityId: z.string().describe('The ID of the entity to set identifiers for'),
      attributeIds: z
        .array(z.string())
        .describe(
          'Ordered array of attribute IDs that form the entity identifier. Order matters for composite identifiers.',
        ),
    }),
  })
  async run(
    params: {
      entityId: string;
      attributeIds: string[];
    },
    context: Context,
  ) {
    this.logger.log(
      `Setting identifier for entity ${params.entityId} with attributes: [${params.attributeIds.join(', ')}]`,
    );

    if (!this.tmClient.isConnected()) {
      return {
        success: false,
        message:
          'TM modeling client is not connected. Make sure the TM modeling frontend is running with remote control enabled.',
      };
    }

    await context.reportProgress({ progress: 0, total: 1 });

    try {
      await this.tmClient.sendCommand('setIdentifier', {
        entityId: params.entityId,
        attributeIds: params.attributeIds,
      });

      await context.reportProgress({ progress: 1, total: 1 });

      return {
        success: true,
        message: `Identifier set for entity ${params.entityId} with ${params.attributeIds.length} attribute(s)`,
        entityId: params.entityId,
        attributeIds: params.attributeIds,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to set identifier: ${errorMessage}`);
      return {
        success: false,
        message: `Failed to set identifier: ${errorMessage}`,
        entityId: params.entityId,
        attributeIds: params.attributeIds,
      };
    }
  }
}
