import { Injectable, Logger } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import type { Context } from '@rekog/mcp-nest';
import { z } from 'zod';
import { TMClientService } from '../../../../tm/index.js';

@Injectable()
export class UpdateAttributeTool {
  private readonly logger = new Logger(UpdateAttributeTool.name);

  constructor(private readonly tmClient: TMClientService) {}

  @Tool({
    name: 'tm_update_attribute',
    description:
      'Update properties of an existing attribute on an entity in the TM diagram. Only the provided fields will be updated; omitted fields remain unchanged.',
    parameters: z.object({
      entityId: z.string().describe('The ID of the entity that owns the attribute'),
      attributeId: z.string().describe('The ID of the attribute to update'),
      name: z.string().optional().describe('The new name for the attribute'),
      dataType: z.string().optional().describe('The new data type for the attribute'),
      isIdentifier: z
        .boolean()
        .optional()
        .describe('Whether this attribute is part of the entity identifier'),
      identifierOrder: z
        .number()
        .nullable()
        .optional()
        .describe('The order of this attribute in a composite identifier'),
      isRequired: z
        .boolean()
        .optional()
        .describe('Whether this attribute is required (NOT NULL)'),
      default: z.string().optional().describe('The new default value for the attribute'),
      comment: z.string().optional().describe('The new comment or description for the attribute'),
    }),
  })
  async run(
    params: {
      entityId: string;
      attributeId: string;
      name?: string;
      dataType?: string;
      isIdentifier?: boolean;
      identifierOrder?: number | null;
      isRequired?: boolean;
      default?: string;
      comment?: string;
    },
    context: Context,
  ) {
    this.logger.log(`Updating attribute ${params.attributeId} on entity ${params.entityId}`);

    if (!this.tmClient.isConnected()) {
      return {
        success: false,
        message:
          'TM modeling client is not connected. Make sure the TM modeling frontend is running with remote control enabled.',
      };
    }

    await context.reportProgress({ progress: 0, total: 1 });

    const updates: Record<string, unknown> = {};
    if (params.name !== undefined) updates.name = params.name;
    if (params.dataType !== undefined) updates.dataType = params.dataType;
    if (params.isIdentifier !== undefined) updates.isIdentifier = params.isIdentifier;
    if (params.identifierOrder !== undefined) updates.identifierOrder = params.identifierOrder;
    if (params.isRequired !== undefined) updates.isRequired = params.isRequired;
    if (params.default !== undefined) updates.default = params.default;
    if (params.comment !== undefined) updates.comment = params.comment;

    try {
      await this.tmClient.updateAttribute(params.entityId, params.attributeId, updates);

      await context.reportProgress({ progress: 1, total: 1 });

      return {
        success: true,
        message: `Attribute ${params.attributeId} updated on entity ${params.entityId}`,
        entityId: params.entityId,
        attributeId: params.attributeId,
        updates,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to update attribute: ${errorMessage}`);
      return {
        success: false,
        message: `Failed to update attribute: ${errorMessage}`,
        entityId: params.entityId,
        attributeId: params.attributeId,
        updates,
      };
    }
  }
}
